import type { Profile } from '@generated/types';
import getUniqueMessages from '@lib/getUniqueMessages';
import type { Client, Conversation, Message } from '@xmtp/xmtp-js';
import create from 'zustand';

interface MessageState {
  client: Client | undefined;
  setClient: (client: Client | undefined) => void;
  conversations: Map<string, Conversation>;
  setConversations: (conversations: Map<string, Conversation>) => void;
  messages: Map<string, Message[]>;
  setMessages: (messages: Map<string, Message[]>) => void;
  addMessages: (key: string, newMessages: Message[]) => number;
  messageProfiles: Map<string, Profile>;
  setMessageProfiles: (messageProfiles: Map<string, Profile>) => void;
  previewMessages: Map<string, Message>;
  setPreviewMessages: (previewMessages: Map<string, Message>) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  client: undefined,
  setClient: (client) => set(() => ({ client })),
  conversations: new Map(),
  setConversations: (conversations) => set(() => ({ conversations })),
  messages: new Map(),
  setMessages: (messages) => set(() => ({ messages })),
  addMessages: (key: string, newMessages: Message[]) => {
    let numAdded = 0;
    set((state) => {
      const messages = new Map(state.messages);
      const existing = state.messages.get(key) || [];
      const updated = getUniqueMessages([...existing, ...newMessages]);
      numAdded = updated.length - existing.length;
      messages.set(key, updated);
      return { messages };
    });
    return numAdded;
  },
  messageProfiles: new Map(),
  setMessageProfiles: (messageProfiles) => set(() => ({ messageProfiles })),
  previewMessages: new Map(),
  setPreviewMessages: (previewMessages) => set(() => ({ previewMessages }))
}));
