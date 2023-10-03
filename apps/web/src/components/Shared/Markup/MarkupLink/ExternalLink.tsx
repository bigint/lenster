import { Regex } from '@hey/data/regex';
import stopEventPropagation from '@hey/lib/stopEventPropagation';
import type { MarkupLinkProps } from '@hey/types/misc';
import Link from 'next/link';
import type { FC } from 'react';

const ExternalLink: FC<MarkupLinkProps> = ({ href, title = href }) => {
  if (!href) {
    return null;
  }

  let link = href;
  if (!link.startsWith('https://') && !link.startsWith('http://')) {
    link = `https://${href}`;
  }

  if (!Regex.url.test(link)) {
    return null;
  }

  return (
    <Link
      href={link}
      onClick={stopEventPropagation}
      target={href.includes(location.host) ? '_self' : '_blank'}
      rel="noopener"
    >
      {title}
    </Link>
  );
};

export default ExternalLink;
