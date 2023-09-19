import DismissRecommendedProfile from '@components/Shared/DismissRecommendedProfile';
import Loader from '@components/Shared/Loader';
import UserProfile from '@components/Shared/UserProfile';
import { UsersIcon } from '@heroicons/react/24/outline';
import { FollowUnfollowSource } from '@lenster/data/tracking';
import type { Profile } from '@lenster/lens';
import { useProfileRecommendationsQuery } from '@lenster/lens';
import { EmptyState, ErrorMessage } from '@lenster/ui';
import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useAppStore } from 'src/store/app';

const Suggested: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const { data, loading, error } = useProfileRecommendationsQuery({
    variables: { request: { for: currentProfile?.id } }
  });

  if (loading) {
    return <Loader message={t`Loading suggested`} />;
  }

  if (data?.profileRecommendations.items.length === 0) {
    return (
      <EmptyState
        message={t`Nothing to suggest`}
        icon={<UsersIcon className="text-brand h-8 w-8" />}
        hideCard
      />
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <ErrorMessage title={t`Failed to load recommendations`} error={error} />
      <Virtuoso
        className="virtual-profile-list"
        data={data?.profileRecommendations.items}
        itemContent={(index, profile) => {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3 p-5"
            >
              <div className="w-full">
                <UserProfile
                  profile={profile as Profile}
                  isFollowing={profile.operations.isFollowedByMe.value}
                  followUnfollowPosition={index + 1}
                  followUnfollowSource={
                    FollowUnfollowSource.WHO_TO_FOLLOW_MODAL
                  }
                  showBio
                  showFollow
                  showUserPreview={false}
                />
              </div>
              <DismissRecommendedProfile
                profile={profile as Profile}
                dismissPosition={index + 1}
                dismissSource={FollowUnfollowSource.WHO_TO_FOLLOW_MODAL}
              />
            </motion.div>
          );
        }}
      />
    </div>
  );
};

export default Suggested;
