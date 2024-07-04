import type { Club } from '@hey/types/club';
import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import Cover from '@components/Shared/Cover';
import getClubApiHeaders from '@helpers/getClubApiHeaders';
import { Leafwatch } from '@helpers/leafwatch';
import {
  APP_NAME,
  CLUBS_API_URL,
  STATIC_IMAGES_URL
} from '@hey/data/constants';
import { PAGEVIEW } from '@hey/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@hey/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import ClubPageShimmer from './Shimmer';

const ViewClub: NextPage = () => {
  const {
    isReady,
    pathname,
    query: { handle }
  } = useRouter();
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();

  const showMembers = pathname === '/c/[handle]/members';

  useEffect(() => {
    if (isReady) {
      Leafwatch.track(PAGEVIEW, {
        page: 'club',
        subpage: pathname.replace('/c/[handle]', '')
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  const getClub = async (handle: string): Promise<Club | null> => {
    try {
      const response = await axios.post(
        `${CLUBS_API_URL}/fetch-clubs`,
        { club_handle: handle },
        { headers: getClubApiHeaders() }
      );

      return response.data.items?.[0];
    } catch {
      return null;
    }
  };

  const {
    data: club,
    error,
    isLoading: profileLoading
  } = useQuery({
    queryFn: () => getClub(handle as string),
    queryKey: ['getClub', handle]
  });

  if (!isReady || profileLoading) {
    return <ClubPageShimmer profileList={showMembers} />;
  }

  if (!club) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  return (
    <>
      <MetaTags
        description={club.description}
        title={`${club.name} (/${club.handle}) • ${APP_NAME}`}
      />
      <Cover cover={club.cover || `${STATIC_IMAGES_URL}/patterns/2.svg`} />
      <GridLayout>
        <GridItemFour>gm</GridItemFour>
        <GridItemEight className="space-y-5">
          {showMembers ? <div>Members</div> : <>FEED WIP</>}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewClub;
