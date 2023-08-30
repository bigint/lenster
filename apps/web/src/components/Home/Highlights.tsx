import QueuedPublication from '@components/Publication/QueuedPublication';
import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { LightBulbIcon } from '@heroicons/react/outline';
import type { FeedHighlightsRequest, Publication } from '@lenster/lens';
import { useFeedHighlightsQuery } from '@lenster/lens';
import { Card, EmptyState, ErrorMessage } from '@lenster/ui';
import { t } from '@lingui/macro';
import { For } from 'million/react';
import type { FC } from 'react';
import { useInView } from 'react-cool-inview';
import { OptmisticPublicationType } from 'src/enums';
import { useAppStore } from 'src/store/app';
import { useTimelineStore } from 'src/store/timeline';
import { useTransactionPersistStore } from 'src/store/transaction';

const Highlights: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);
  const seeThroughProfile = useTimelineStore(
    (state) => state.seeThroughProfile
  );

  // Variables
  const request: FeedHighlightsRequest = {
    profileId: seeThroughProfile?.id ?? currentProfile?.id,
    limit: 10
  };
  const reactionRequest = currentProfile
    ? { profileId: currentProfile?.id }
    : null;

  const { data, loading, error, fetchMore } = useFeedHighlightsQuery({
    variables: { request, reactionRequest, profileId: currentProfile?.id }
  });

  const publications = data?.feedHighlights?.items;
  const pageInfo = data?.feedHighlights?.pageInfo;
  const hasMore = pageInfo?.next;

  const { observe } = useInView({
    onChange: async ({ inView }) => {
      if (!inView || !hasMore) {
        return;
      }

      await fetchMore({
        variables: {
          request: { ...request, cursor: pageInfo?.next },
          reactionRequest,
          profileId: currentProfile?.id
        }
      });
    }
  });

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (publications?.length === 0) {
    return (
      <EmptyState
        message={t`No posts yet!`}
        icon={<LightBulbIcon className="text-brand h-8 w-8" />}
      />
    );
  }

  if (error) {
    return <ErrorMessage title={t`Failed to load highlights`} error={error} />;
  }

  const optimisticTxnQueue = txnQueue.filter(
    (txn) => txn?.type === OptmisticPublicationType.NewPost
  );

  return (
    <Card className="[&>*]:divide-y-[1px] dark:[&>*]:divide-gray-700">
      {optimisticTxnQueue ? (
        <For each={optimisticTxnQueue} as="div">
          {(txn) => (
            <div key={txn.id}>
              <QueuedPublication txn={txn} />
            </div>
          )}
        </For>
      ) : null}
      {publications ? (
        <For each={publications}>
          {(publication, index) => (
            <SinglePublication
              key={`${publication?.id}_${index}`}
              isFirst={index === 0}
              isLast={index === publications.length - 1}
              publication={publication as Publication}
            />
          )}
        </For>
      ) : null}
      {hasMore ? <span ref={observe} /> : null}
    </Card>
  );
};

export default Highlights;
