import useEthersWalletClient from '@components/utils/hooks/useEthersWalletClient';
import { UserRemoveIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import splitSignature from '@lib/splitSignature';
import { t } from '@lingui/macro';
import { FollowNft } from 'abis';
import Errors from 'data/errors';
import { Contract } from 'ethers';
import type { CreateBurnEip712TypedData, Profile } from 'lens';
import { useBroadcastMutation, useCreateUnfollowTypedDataMutation } from 'lens';
import getSignature from 'lib/getSignature';
import type { Dispatch, FC } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/app';
import { PROFILE } from 'src/tracking';
import { Button, Spinner } from 'ui';
import { useSignTypedData } from 'wagmi';

interface UnfollowProps {
  profile: Profile;
  setFollowing: Dispatch<boolean>;
  showText?: boolean;
}

const Unfollow: FC<UnfollowProps> = ({
  profile,
  showText = false,
  setFollowing
}) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { data: walletClient } = useEthersWalletClient();

  const onError = (error: any) => {
    toast.error(
      error?.data?.message ?? error?.message ?? Errors.SomethingWentWrong
    );
  };

  const { signTypedDataAsync } = useSignTypedData({ onError });
  const burnWithSig = async (
    signature: string,
    typedData: CreateBurnEip712TypedData
  ) => {
    const { tokenId, deadline } = typedData.value;
    const { v, r, s } = splitSignature(signature);
    const sig = { v, r, s, deadline };

    const followNftContract = new Contract(
      typedData.domain.verifyingContract,
      FollowNft,
      walletClient as any
    );

    const tx = await followNftContract.burnWithSig(tokenId, sig);
    if (tx) {
      setFollowing(false);
    }
  };

  const [broadcast] = useBroadcastMutation({
    onCompleted: () => {
      setFollowing(false);
    }
  });

  const [createUnfollowTypedData] = useCreateUnfollowTypedDataMutation({
    onCompleted: async ({ createUnfollowTypedData }) => {
      const { typedData, id } = createUnfollowTypedData;
      const signature = await signTypedDataAsync(getSignature(typedData));

      try {
        const { data } = await broadcast({
          variables: { request: { id, signature } }
        });
        if (data?.broadcast.__typename === 'RelayError') {
          await burnWithSig(signature, typedData);
        }
        toast.success(t`Unfollowed successfully!`);
        Mixpanel.track(PROFILE.UNFOLLOW);
      } catch (error) {
        onError(error);
      }
    },
    onError
  });

  const createUnfollow = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);
      await createUnfollowTypedData({
        variables: { request: { profile: profile?.id } }
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Button
      className="!px-3 !py-1.5 text-sm"
      outline
      onClick={createUnfollow}
      disabled={isLoading}
      variant="danger"
      aria-label="Unfollow"
      icon={
        isLoading ? (
          <Spinner variant="danger" size="xs" />
        ) : (
          <UserRemoveIcon className="h-4 w-4" />
        )
      }
    >
      {showText && t`Unfollow`}
    </Button>
  );
};

export default Unfollow;
