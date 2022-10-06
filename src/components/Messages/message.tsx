import MessagesList from '@components/Shared/MessagesList';
import { Card } from '@components/UI/Card';
import { GridItemEight, GridItemFour, GridLayout } from '@components/UI/GridLayout';
import MetaTags from '@components/utils/MetaTags';
import isFeatureEnabled from '@lib/isFeatureEnabled';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { APP_NAME } from 'src/constants';
import Custom404 from 'src/pages/404';
import { useAppStore } from 'src/store/app';
import { useMessageStore } from 'src/store/message';

const Message: FC = () => {
  const router = useRouter();
  const address = router.query.address as string;
  const messageState = useMessageStore((state) => state);
  const { messages, conversations } = messageState;
  const currentProfile = useAppStore((state) => state.currentProfile);

  const onConversationSelected = (address: string) => {
    router.push(address ? `/messages/${address}` : '/messages/');
  };

  if (!isFeatureEnabled('messages', currentProfile?.id)) {
    return <Custom404 />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Conversation • ${APP_NAME}`} />
      <GridItemFour>
        <Card className="h-[86vh] px-2 pt-3">
          <div className="flex justify-between">
            <div className="font-black text-lg">Messages</div>
            <div>
              <button className="text-xs border border-p-100 p-1 rounded">New Message</button>
            </div>
          </div>
          <div className="flex justify-between p-4">
            <div className="text-xs">Lens profiles</div>
            <div className="text-xs">All messages</div>
          </div>
          <div>
            {Array.from(conversations.keys()).map((address: string) => {
              return (
                <div
                  onClick={() => onConversationSelected(address)}
                  key={`convo_${address}`}
                  className="border p-5 text-xs"
                >
                  {address}
                </div>
              );
            })}
          </div>
        </Card>
      </GridItemFour>
      <GridItemEight>
        <Card className="h-[86vh] overflow-y-auto">
          <MessagesList address={address} messages={messages.get(address) ?? []} />
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default Message;
