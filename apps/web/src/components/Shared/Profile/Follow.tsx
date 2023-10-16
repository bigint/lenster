import { UserPlusIcon } from '@heroicons/react/24/outline';
import { LensHub } from '@hey/abis';
import { LENSHUB_PROXY } from '@hey/data/constants';
import { PROFILE } from '@hey/data/tracking';
import type { Profile } from '@hey/lens';
import {
  useBroadcastOnchainMutation,
  useCreateFollowTypedDataMutation,
  useFollowMutation
} from '@hey/lens';
import type { ApolloCache } from '@hey/lens/apollo';
import getSignature from '@hey/lib/getSignature';
import { Button, Spinner } from '@hey/ui';
import errorToast from '@lib/errorToast';
import { Leafwatch } from '@lib/leafwatch';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useAppStore } from 'src/store/app';
import { useGlobalModalStateStore } from 'src/store/modals';
import { useNonceStore } from 'src/store/nonce';
import { useContractWrite, useSignTypedData } from 'wagmi';

interface FollowProps {
  profile: Profile;
  setFollowing: (following: boolean) => void;
  showText?: boolean;
  outline?: boolean;

  // For data analytics
  followUnfollowPosition?: number;
  followUnfollowSource?: string;
}

const Follow: FC<FollowProps> = ({
  profile,
  showText = false,
  setFollowing,
  outline = true,
  followUnfollowSource,
  followUnfollowPosition
}) => {
  const { pathname } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);
  const userSigNonce = useNonceStore((state) => state.userSigNonce);
  const setUserSigNonce = useNonceStore((state) => state.setUserSigNonce);
  const setShowAuthModal = useGlobalModalStateStore(
    (state) => state.setShowAuthModal
  );
  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();

  const updateCache = (cache: ApolloCache<any>) => {
    cache.modify({
      id: `Profile:${profile?.id}`,
      fields: { isFollowedByMe: () => true }
    });
  };

  const onCompleted = (
    __typename?: 'RelayError' | 'RelaySuccess' | 'LensProfileManagerRelayError'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return;
    }

    setIsLoading(false);
    setFollowing(true);
    toast.success('Followed successfully!');
    Leafwatch.track(PROFILE.FOLLOW, {
      path: pathname,
      ...(followUnfollowSource && { source: followUnfollowSource }),
      ...(followUnfollowPosition && { position: followUnfollowPosition }),
      target: profile?.id
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
    functionName: 'follow',
    onSuccess: () => onCompleted(),
    onError
  });

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });
  const [createFollowTypedData] = useCreateFollowTypedDataMutation({
    onCompleted: async ({ createFollowTypedData }) => {
      const { id, typedData } = createFollowTypedData;
      // TODO: Replace deep clone with right helper
      const signature = await signTypedDataAsync(
        getSignature(JSON.parse(JSON.stringify(typedData)))
      );
      setUserSigNonce(userSigNonce + 1);
      const { data } = await broadcastOnchain({
        variables: { request: { id, signature } }
      });
      if (data?.broadcastOnchain.__typename === 'RelayError') {
        const {
          followerProfileId,
          idsOfProfilesToFollow,
          followTokenIds,
          datas
        } = typedData.value;
        return write?.({
          args: [
            followerProfileId,
            idsOfProfilesToFollow,
            followTokenIds,
            datas
          ]
        });
      }
    },
    onError,
    update: updateCache
  });

  const [follow] = useFollowMutation({
    onCompleted: ({ follow }) => onCompleted(follow.__typename),
    onError,
    update: updateCache
  });

  const createFollow = async () => {
    if (!currentProfile) {
      setShowAuthModal(true);
      return;
    }

    if (handleWrongNetwork()) {
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await follow({
        variables: { request: { follow: [{ profileId: profile?.id }] } }
      });

      if (!data?.follow) {
        return await createFollowTypedData({
          variables: {
            request: { follow: [{ profileId: profile?.id }] },
            options: { overrideSigNonce: userSigNonce }
          }
        });
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Button
      className="!px-3 !py-1.5 text-sm"
      outline={outline}
      onClick={createFollow}
      aria-label="Follow"
      disabled={isLoading}
      icon={
        isLoading ? <Spinner size="xs" /> : <UserPlusIcon className="h-4 w-4" />
      }
    >
      {showText ? 'Follow' : null}
    </Button>
  );
};

export default Follow;
