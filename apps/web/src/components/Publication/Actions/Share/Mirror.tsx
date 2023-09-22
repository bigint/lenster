import { Menu } from '@headlessui/react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { LensHub } from '@lenster/abis';
import { LENSHUB_PROXY } from '@lenster/data/constants';
import { Errors } from '@lenster/data/errors';
import { PUBLICATION } from '@lenster/data/tracking';
import {
  type AnyPublication,
  useBroadcastOnchainMutation
} from '@lenster/lens';
import { useApolloClient } from '@lenster/lens/apollo';
import { publicationKeyFields } from '@lenster/lens/apollo/lib';
import getSignature from '@lenster/lib/getSignature';
import { isMirrorPublication } from '@lenster/lib/publicationHelpers';
import cn from '@lenster/ui/cn';
import errorToast from '@lib/errorToast';
import { Leafwatch } from '@lib/leafwatch';
import { t, Trans } from '@lingui/macro';
import type { FC } from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useAppStore } from 'src/store/app';
import { useNonceStore } from 'src/store/nonce';
import { useContractWrite, useSignTypedData } from 'wagmi';

interface MirrorProps {
  publication: AnyPublication;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const Mirror: FC<MirrorProps> = ({ publication, setIsLoading, isLoading }) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;
  const userSigNonce = useNonceStore((state) => state.userSigNonce);
  const setUserSigNonce = useNonceStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [mirrored, setMirrored] = useState(
    isMirrorPublication(publication)
      ? publication?.mirrorOn?.mirrors?.length > 0
      : // @ts-expect-error
        publication?.mirrors?.length > 0
  );
  const handleWrongNetwork = useHandleWrongNetwork();
  const { cache } = useApolloClient();

  // Dispatcher
  const canUseRelay = currentProfile?.lensManager;
  const isSponsored = currentProfile?.sponsor;

  const updateCache = () => {
    cache.modify({
      id: publicationKeyFields(targetPublication),
      fields: {
        mirrors: (mirrors) => [...mirrors, currentProfile?.id],
        stats: (stats) => ({
          ...stats,
          totalAmountOfMirrors: stats.totalAmountOfMirrors + 1
        })
      }
    });
  };

  const onCompleted = (
    __typename?:
      | 'RelayError'
      | 'RelaySuccess'
      | 'CreateDataAvailabilityPublicationResult'
  ) => {
    if (__typename === 'RelayError') {
      return;
    }

    updateCache();
    setIsLoading(false);
    setMirrored(true);
    toast.success(t`Post has been mirrored!`);
    Leafwatch.track(PUBLICATION.MIRROR, {
      publication_id: publication.id
    });
  };

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { signTypedDataAsync } = useSignTypedData({ onError });

  const { write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: 'mirror',
    onSuccess: () => {
      onCompleted();
      setUserSigNonce(userSigNonce + 1);
    },
    onError: (error) => {
      onError(error);
      setUserSigNonce(userSigNonce - 1);
    }
  });

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });

  const [createMirrorTypedData] = useCreateMirrorTypedDataMutation({
    onCompleted: async ({ createMirrorTypedData }) => {
      const { id, typedData } = createMirrorTypedData;
      const signature = await signTypedDataAsync(getSignature(typedData));
      const { data } = await broadcastOnchain({
        variables: { request: { id, signature } }
      });
      if (data?.broadcastOnchain.__typename === 'RelayError') {
        return write?.({ args: [typedData.value] });
      }
    },
    onError
  });

  const [createDataAvailabilityMirrorViaDispatcher] =
    useCreateDataAvailabilityMirrorViaDispatcherMutation({
      onCompleted: ({ createDataAvailabilityMirrorViaDispatcher }) =>
        onCompleted(createDataAvailabilityMirrorViaDispatcher.__typename),
      onError
    });

  const [createMirrorViaDispatcher] = useCreateMirrorViaDispatcherMutation({
    onCompleted: ({ createMirrorViaDispatcher }) =>
      onCompleted(createMirrorViaDispatcher.__typename),
    onError
  });

  const createViaDataAvailablityDispatcher = async (
    request: CreateDataAvailabilityMirrorRequest
  ) => {
    await createDataAvailabilityMirrorViaDispatcher({
      variables: { request }
    });
  };

  const createViaDispatcher = async (request: CreateMirrorRequest) => {
    const { data } = await createMirrorViaDispatcher({
      variables: { request }
    });

    if (data?.createMirrorViaDispatcher.__typename === 'RelayError') {
      return await createMirrorTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request
        }
      });
    }
  };

  const createMirror = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (handleWrongNetwork()) {
      return;
    }

    if (publication.momoka?.proof && !isSponsored) {
      return toast.error(
        t`Momoka is currently in beta - during this time certain actions are not available to all profiles.`
      );
    }

    try {
      setIsLoading(true);
      const request: CreateMirrorRequest = {
        profileId: currentProfile?.id,
        publicationId: publication?.id,
        referenceModule: {
          followerOnlyReferenceModule: false
        }
      };

      // Payload for the data availability mirror
      const dataAvailablityRequest = {
        from: currentProfile?.id,
        mirror: publication?.id
      };

      if (canUseRelay) {
        if (publication.momoka?.proof && isSponsored) {
          return await createViaDataAvailablityDispatcher(
            dataAvailablityRequest
          );
        }

        return await createViaDispatcher(request);
      }

      return await createMirrorTypedData({
        variables: {
          options: { overrideSigNonce: userSigNonce },
          request
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Menu.Item
      as="div"
      className={({ active }) =>
        cn(
          { 'dropdown-active': active },
          mirrored ? 'text-green-500' : '',
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
        )
      }
      onClick={createMirror}
      disabled={isLoading}
    >
      <div className="flex items-center space-x-2">
        <ArrowsRightLeftIcon className="h-4 w-4" />
        <div>{mirrored ? <Trans>Unmirror</Trans> : <Trans>Mirror</Trans>}</div>
      </div>
    </Menu.Item>
  );
};

export default Mirror;
