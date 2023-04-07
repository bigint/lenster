import UserProfilesShimmer from '@components/Shared/Shimmer/UserProfilesShimmer';
import UserProfile from '@components/Shared/UserProfile';
import { UsersIcon } from '@heroicons/react/outline';
import { t, Trans } from '@lingui/macro';
import type { Profile, ProfileSearchResult, SearchQueryRequest } from 'lens';
import { CustomFiltersTypes, SearchRequestTypes, useSearchProfilesQuery } from 'lens';
import type { FC } from 'react';
import { useState } from 'react';
import { useInView } from 'react-cool-inview';
import type { AutoSizerProps, ListProps, WindowScrollerProps } from 'react-virtualized';
import { AutoSizer as _AutoSizer, List as _List, WindowScroller as _WindowScroller } from 'react-virtualized';
import { Card, EmptyState, ErrorMessage } from 'ui';

interface ProfilesProps {
  query: string | string[];
}

const Profiles: FC<ProfilesProps> = ({ query }) => {
  const [hasMore, setHasMore] = useState(true);

  // Variables
  const request: SearchQueryRequest = {
    query,
    type: SearchRequestTypes.Profile,
    customFilters: [CustomFiltersTypes.Gardeners],
    limit: 10
  };

  const { data, loading, error, fetchMore } = useSearchProfilesQuery({
    variables: { request },
    skip: !query
  });

  const search = data?.search as ProfileSearchResult;
  const profiles = search?.items;
  const pageInfo = search?.pageInfo;

  const AutoSizer = _AutoSizer as unknown as FC<AutoSizerProps>;
  const List = _List as unknown as FC<ListProps>;
  const WindowScroller = _WindowScroller as unknown as FC<WindowScrollerProps>;

  const { observe } = useInView({
    onChange: async ({ inView }) => {
      if (!inView || !hasMore) {
        return;
      }

      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      }).then(({ data }) => {
        const search = data?.search as ProfileSearchResult;
        setHasMore(search?.items?.length > 0);
      });
    }
  });

  if (loading) {
    return <UserProfilesShimmer isBig />;
  }

  if (profiles?.length === 0) {
    return (
      <EmptyState
        message={
          <Trans>
            No profiles for <b>&ldquo;{query}&rdquo;</b>
          </Trans>
        }
        icon={<UsersIcon className="text-brand h-8 w-8" />}
      />
    );
  }

  if (error) {
    return <ErrorMessage title={t`Failed to load profiles`} error={error} />;
  }

  return (
    <AutoSizer disableHeight disableWidth>
      {() => (
        <WindowScroller>
          {({ height, isScrolling, onChildScroll, scrollTop, width }) => (
            <List
              autoHeight
              autoWidth
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              rowCount={profiles?.length || 0}
              rowHeight={height}
              rowRenderer={() => (
                <div className="space-y-3">
                  {profiles?.map((profile: Profile) => (
                    <Card key={profile?.id} className="p-5">
                      <UserProfile profile={profile} showBio isBig />
                    </Card>
                  ))}
                  {hasMore && <span ref={observe} />}
                </div>
              )}
              scrollTop={scrollTop}
              width={width}
            />
          )}
        </WindowScroller>
      )}
    </AutoSizer>
  );
};

export default Profiles;
