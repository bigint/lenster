import type {
  ChatSendOptionsType,
  IFeeds,
  IMessageIPFS
} from '@pushprotocol/restapi';
import type { MessageType } from '@pushprotocol/restapi/src/lib/constants';

import { chat } from '@pushprotocol/restapi';
import * as PushAPI from '@pushprotocol/restapi';
import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import usePushClient from 'src/hooks/messaging/push/usePushClient';
import useProfileStore from 'src/store/persisted/useProfileStore';
import {
  PUSH_ENV,
  usePushChatStore
} from 'src/store/persisted/usePushChatStore';
import { useMutation, useWalletClient } from 'wagmi';

import Composer from './Composer';
import { getAccountFromProfile, getProfileIdFromDID } from './helper';
import InitialConversation from './InitialConversation';
import Message from './Message';

interface MessageBodyProps {
  selectedChat: IMessageIPFS[];
}

export default function MessageBody({ selectedChat }: MessageBodyProps) {
  const listInnerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const requestsFeed = usePushChatStore((state) => state.requestsFeed);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const recepientProfie = usePushChatStore((state) => state.recipientProfile);
  const { data: signer } = useWalletClient();

  const approvalRequired = requestsFeed?.find((item) =>
    item.did.includes(recepientProfie?.id)
  );
  const deleteRequestFeed = usePushChatStore(
    (state) => state.deleteRequestFeed
  );

  const pgpPrivateKey = usePushChatStore((state) => state.pgpPrivateKey);
  const setRecipientChat = usePushChatStore((state) => state.setRecipientChat);
  const pushClient = usePushClient();

  const approveUser = async (item: IFeeds) => {
    const profileId = getProfileIdFromDID(item.did!);
    const senderAddress = getAccountFromProfile(profileId);
    const account = getAccountFromProfile(currentProfile?.id);

    try {
      await PushAPI.chat.approve({
        account: account,
        env: PUSH_ENV,
        pgpPrivateKey: pgpPrivateKey,
        senderAddress: senderAddress,
        signer: signer,
        status: 'Approved'
      });

      deleteRequestFeed(item.did);
      setRecipientChat(item.msg);
    } catch (error) {
      console.log(`[ERROR]: REJECT CHAT USER FAILED:`, error);
    }
  };

  const rejectUser = async (item: IFeeds) => {
    try {
      await pushClient?.chat.reject(item.did);
      deleteRequestFeed(item.did);
    } catch (error) {
      console.log(`[ERROR]: REJECT CHAT USER FAILED:`, error);
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (args: ChatSendOptionsType) => {
      const response = await chat.send({
        account: args.account,
        env: args.env,
        // @ts-ignore
        message: {
          content: args.message?.content as string,
          type: args.message?.type
        },
        pgpPrivateKey: args.pgpPrivateKey,
        to: args.to
      });
      return response;
    },
    mutationKey: ['sendMessage']
  });

  const sendMessage = async (messageType: MessageType, content: string) => {
    try {
      const sentMessage = await sendMessageMutation.mutateAsync({
        account: getAccountFromProfile(currentProfile?.id),
        env: PUSH_ENV,
        message: {
          content: content,
          // @ts-ignore
          type: messageType
        },
        pgpPrivateKey: pgpPrivateKey!,
        to: getAccountFromProfile(recepientProfie?.id)
      });

      setRecipientChat({
        ...sentMessage,
        messageContent: content
      });
    } catch (error) {
      toast.error(`Failed sending message: ${(error as Error).message}`);
    }
  };

  return (
    <section className="relative flex h-full flex-col p-3 pb-3">
      <div className="flex-grow overflow-auto px-2" ref={listInnerRef}>
        {selectedChat.length > 0 ? (
          selectedChat?.map?.((chat, index) => {
            return <Message key={index} message={chat} />;
          })
        ) : (
          <div>You have no messaging history this user. Say Hi 👋</div>
        )}
        <div ref={bottomRef} />
      </div>

      {approvalRequired && (
        <InitialConversation
          approveUser={approveUser}
          rejectUser={rejectUser}
          user={approvalRequired}
        />
      )}
      <Composer
        disabledInput={sendMessageMutation.isLoading}
        listRef={listInnerRef}
        sendMessage={sendMessage}
      />
    </section>
  );
}
