import New from '@components/Shared/Badges/New';
import {
  MinusCircleIcon,
  PencilSquareIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { APP_NAME } from '@lenster/data/constants';
import { ONBOARDING } from '@lenster/data/tracking';
import { Card } from '@lenster/ui';
import cn from '@lenster/ui/cn';
import { Leafwatch } from '@lib/leafwatch';
import { t, Trans } from '@lingui/macro';
import Link from 'next/link';
import type { FC } from 'react';
import { useAppStore } from 'src/store/app';

interface StatusProps {
  finished: boolean;
  title: string;
}

const Status: FC<StatusProps> = ({ finished, title }) => (
  <div className="flex items-center space-x-1.5">
    {finished ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <MinusCircleIcon className="h-5 w-5 text-yellow-500" />
    )}
    <div className={cn(finished ? 'text-green-500' : 'text-yellow-500')}>
      {title}
    </div>
  </div>
);

const SetProfile: FC = () => {
  const profiles = useAppStore((state) => state.profiles);
  const currentProfile = useAppStore((state) => state.currentProfile);
  const hasDefaultProfile = Boolean(profiles.find((o) => o.isDefault));
  const doneSetup =
    Boolean(currentProfile?.metadata?.displayName) &&
    Boolean(currentProfile?.metadata?.bio) &&
    Boolean(currentProfile?.picture) &&
    Boolean(currentProfile?.interests?.length);

  if (!hasDefaultProfile || doneSetup) {
    return null;
  }

  return (
    <Card
      as="aside"
      className="mb-4 space-y-4 !border-green-600 !bg-green-50 p-5 text-green-600 dark:bg-green-900"
    >
      <div className="flex items-center space-x-2 font-bold">
        <PhotoIcon className="h-5 w-5" />
        <p>
          <Trans>Setup your {APP_NAME} profile</Trans>
        </p>
      </div>
      <div className="space-y-1 text-sm leading-[22px]">
        <Status
          finished={Boolean(currentProfile?.metadata?.displayName)}
          title={t`Set profile name`}
        />
        <Status
          finished={Boolean(currentProfile?.metadata?.bio)}
          title={t`Set profile bio`}
        />
        <Status
          finished={Boolean(currentProfile?.picture)}
          title={t`Set your avatar`}
        />
        <div>
          <Link
            className="flex items-center space-x-2"
            onClick={() =>
              Leafwatch.track(ONBOARDING.NAVIGATE_UPDATE_PROFILE_INTERESTS)
            }
            href="/settings/interests"
          >
            <Status
              finished={Boolean(currentProfile?.interests?.length)}
              title={t`Select profile interests`}
            />
            <New />
          </Link>
        </div>
      </div>
      <div className="flex items-center space-x-1.5 text-sm font-bold">
        <PencilSquareIcon className="h-4 w-4" />
        <Link
          onClick={() => Leafwatch.track(ONBOARDING.NAVIGATE_UPDATE_PROFILE)}
          href="/settings"
        >
          <Trans>Update profile now</Trans>
        </Link>
      </div>
    </Card>
  );
};

export default SetProfile;
