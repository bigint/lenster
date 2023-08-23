import { Menu } from '@headlessui/react';
import { AnnotationIcon } from '@heroicons/react/outline';
import { type Publication } from '@lenster/lens';
import { Trans } from '@lingui/macro';
import clsx from 'clsx';
import type { FC } from 'react';
import { NewPublicationTypes } from 'src/enums';
import { useGlobalModalStateStore } from 'src/store/modals';
import { usePublicationStore } from 'src/store/publication';

interface QuoteProps {
  publication: Publication;
}

const Quote: FC<QuoteProps> = ({ publication }) => {
  const isMirror = publication.__typename === 'Mirror';
  const publicationType = isMirror
    ? publication.mirrorOf.__typename
    : publication.__typename;

  const setShowNewPublicationModal = useGlobalModalStateStore(
    (state) => state.setShowNewPublicationModal
  );
  const setQuotedPublication = usePublicationStore(
    (state) => state.setQuotedPublication
  );

  return (
    <Menu.Item
      as="div"
      className={({ active }) =>
        clsx(
          { 'dropdown-active': active },
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
        )
      }
      onClick={() => {
        setQuotedPublication(publication);
        setShowNewPublicationModal(true, NewPublicationTypes.Post);
      }}
    >
      <div className="flex items-center space-x-2">
        <AnnotationIcon className="h-4 w-4" />
        <div>
          {publicationType === 'Comment' ? (
            <Trans>Quote comment</Trans>
          ) : (
            <Trans>Quote post</Trans>
          )}
        </div>
      </div>
    </Menu.Item>
  );
};

export default Quote;
