import { Message } from '@xmtp/xmtp-js';
import React, { ReactNode } from 'react';

export type MessageListProps = {
  messages: Message[];
  address: string;
};

type MessageTileProps = {
  message: Message;
  address: string;
};

interface Props {
  children: ReactNode;
}

const formatTime = (d: Date | undefined): string =>
  d
    ? d.toLocaleTimeString(undefined, {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      })
    : '';

const isOnSameDay = (d1?: Date, d2?: Date): boolean => {
  return d1?.toDateString() === d2?.toDateString();
};

const formatDate = (d?: Date) =>
  d?.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const MessageTile = ({ message, address }: MessageTileProps): JSX.Element => (
  <div
    className={`flex flex-col ${
      address === message.senderAddress ? 'items-end' : 'items-start'
    } mx-auto mb-4`}
  >
    {/* <Avatar peerAddress={message.senderAddress as string} /> */}
    <div
      className={`px-4 py-2 rounded-lg ${
        address === message.senderAddress ? 'bg-brand-500' : 'bg-gray-100'
      } `}
    >
      <span
        className={`block text-md font-normal ${
          address === message.senderAddress ? 'text-white' : 'text-black'
        } `}
      >
        {message.error ? `Error: ${message.error?.message}` : message.content ?? ''}
      </span>
    </div>
    <div>
      <span className="text-xs font-normal place-self-end text-gray-400 uppercase">
        {formatTime(message.sent)}
      </span>
    </div>
  </div>
);

const DateDividerBorder: React.FC<Props> = ({ children }) => (
  <>
    <div className="grow h-0.5 bg-gray-300/25" />
    {children}
    <div className="grow h-0.5 bg-gray-300/25" />
  </>
);

const DateDivider = ({ date }: { date?: Date }): JSX.Element => (
  <div className="flex align-items-center items-center pb-8 pt-4">
    <DateDividerBorder>
      <span className="mx-11 flex-none text-gray-300 text-sm font-bold">{formatDate(date)}</span>
    </DateDividerBorder>
  </div>
);

const ConversationBeginningNotice = (): JSX.Element => (
  <div className="flex align-items-center justify-center pb-4">
    <span className="text-gray-300 text-sm font-semibold">This is the beginning of the conversation</span>
  </div>
);

const MessagesList = ({ messages, address }: MessageListProps): JSX.Element => {
  let lastMessageDate: Date | undefined;

  return (
    <div className="flex-grow flex">
      <div className="pb-6 md:pb-0 w-full flex flex-col self-end">
        <div className="max-h-[80vh] relative w-full bg-white px-4 pt-6 overflow-y-auto flex">
          <div className="w-full">
            {messages && messages.length ? <ConversationBeginningNotice /> : null}
            {messages?.map((msg: Message) => {
              const dateHasChanged = !isOnSameDay(lastMessageDate, msg.sent);
              lastMessageDate = msg.sent;
              return (
                <>
                  {dateHasChanged ? <DateDivider key={msg.id + 'divider'} date={msg.sent} /> : null}
                  <MessageTile address={address} message={msg} key={msg.id} />
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MessagesList);
