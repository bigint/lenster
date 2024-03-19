import type {
  AnyPublication,
  UnknownOpenActionModuleSettings
} from '@hey/lens';
import type { FC } from 'react';

import EasPoll from '@components/Publication/Poll/eas';
import Attachments from '@components/Shared/Attachments';
import Quote from '@components/Shared/Embed/Quote';
import Markup from '@components/Shared/Markup';
import Oembed from '@components/Shared/Oembed';
import Video from '@components/Shared/Video';
import { EyeIcon } from '@heroicons/react/24/outline';
import { VerifiedOpenActionModules } from '@hey/data/verified-openaction-modules';
import getPublicationAttribute from '@hey/lib/getPublicationAttribute';
import getPublicationData from '@hey/lib/getPublicationData';
import getURLs from '@hey/lib/getURLs';
import isPublicationMetadataTypeAllowed from '@hey/lib/isPublicationMetadataTypeAllowed';
import { isMirrorPublication } from '@hey/lib/publicationHelpers';
import cn from '@hey/ui/cn';
import Link from 'next/link';
import { memo } from 'react';
import { isIOS, isMobile } from 'react-device-detect';

import EncryptedPublication from './EncryptedPublication';
import Metadata from './Metadata';
import NotSupportedPublication from './NotSupportedPublication';
import SnapshotPoll from './Poll/snapshot';

interface PublicationBodyProps {
  contentClassName?: string;
  publication: AnyPublication;
  quoted?: boolean;
  showMore?: boolean;
}

const PublicationBody: FC<PublicationBodyProps> = ({
  contentClassName = '',
  publication,
  quoted = false,
  showMore = false
}) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { id, metadata } = targetPublication;

  const filteredContent = getPublicationData(metadata)?.content || '';
  const filteredAttachments = getPublicationData(metadata)?.attachments || [];
  const filteredAsset = getPublicationData(metadata)?.asset;

  const canShowMore = filteredContent?.length > 450 && showMore;
  const urls = getURLs(filteredContent);
  const hasURLs = urls.length > 0;

  let content = filteredContent;

  if (isIOS && isMobile && canShowMore) {
    const truncatedContent = content?.split('\n')?.[0];
    if (truncatedContent) {
      content = truncatedContent;
    }
  }

  if (targetPublication.isEncrypted) {
    return <EncryptedPublication publication={targetPublication} />;
  }

  if (!isPublicationMetadataTypeAllowed(metadata.__typename)) {
    return <NotSupportedPublication type={metadata.__typename} />;
  }

  // Show live if it's there
  const showLive = metadata.__typename === 'LiveStreamMetadataV3';
  // Show attachments if it's there
  const showAttachments = filteredAttachments.length > 0 || filteredAsset;
  // Show snapshot poll
  const snapshotPollId = getPublicationAttribute(metadata.attributes, 'pollId');
  const showSnapshotPoll = Boolean(snapshotPollId);
  // Show Open Action Poll
  const pollOpenActionModule = targetPublication.openActionModules.find(
    (module) => module.contract.address === VerifiedOpenActionModules.Poll
  );
  const showOpenActionPoll = Boolean(pollOpenActionModule);
  // Show sharing link
  const showSharingLink = metadata.__typename === 'LinkMetadataV3';
  // Show oembed if no NFT, no attachments, no quoted publication
  const showOembed =
    !showSharingLink && hasURLs && !showLive && !showAttachments && !quoted;

  return (
    <div className="break-words">
      <Markup
        className={cn(
          { 'line-clamp-5': canShowMore },
          'markup linkify text-md break-words',
          contentClassName
        )}
        mentions={targetPublication.profilesMentioned}
      >
        {content}
      </Markup>
      {canShowMore ? (
        <div className="ld-text-gray-500 mt-4 flex items-center space-x-1 text-sm font-bold">
          <EyeIcon className="size-4" />
          <Link href={`/posts/${id}`}>Show more</Link>
        </div>
      ) : null}
      {/* Attachments and Quotes */}
      {showAttachments ? (
        <Attachments asset={filteredAsset} attachments={filteredAttachments} />
      ) : null}
      {/* Poll */}
      {showSnapshotPoll ? <SnapshotPoll id={snapshotPollId} /> : null}
      {showOpenActionPoll ? (
        <EasPoll
          module={pollOpenActionModule as UnknownOpenActionModuleSettings}
          publicationId={id}
        />
      ) : null}
      {showLive ? (
        <div className="mt-3">
          <Video src={metadata.liveURL || metadata.playbackURL} />
        </div>
      ) : null}
      {showOembed ? (
        <Oembed publicationId={publication.id} url={urls[0]} />
      ) : null}
      {showSharingLink ? (
        <Oembed publicationId={publication.id} url={metadata.sharingLink} />
      ) : null}
      {targetPublication.__typename === 'Quote' && (
        <Quote publication={targetPublication.quoteOn} />
      )}
      <Metadata metadata={targetPublication.metadata} />
    </div>
  );
};

export default memo(PublicationBody);
