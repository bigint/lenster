import type { Profile } from '@hey/lens';

import { createTrackedSelector } from 'react-tracked';
import { create } from 'zustand';

export type AuthModalType = 'login' | 'signup';

interface State {
  authModalType: AuthModalType;
  reportingProfile: null | Profile;
  reportingPublicationId: null | string;
  setShowAuthModal: (
    showAuthModal: boolean,
    authModalType?: AuthModalType
  ) => void;
  setShowDiscardModal: (showDiscardModal: boolean) => void;
  setShowMobileDrawer: (showMobileDrawer: boolean) => void;
  setShowOptimisticTransactionsModal: (
    showOptimisticTransactionsModal: boolean
  ) => void;
  setShowProfileSwitchModal: (showProfileSwitchModal: boolean) => void;
  setShowPublicationReportModal: (
    showPublicationReportModal: boolean,
    reportingPublicationId: null | string
  ) => void;
  setShowReportProfileModal: (
    reportProfileModal: boolean,
    reportingProfile: null | Profile
  ) => void;
  showAuthModal: boolean;
  showDiscardModal: boolean;
  showMobileDrawer: boolean;
  showOptimisticTransactionsModal: boolean;
  showProfileSwitchModal: boolean;
  showPublicationReportModal: boolean;
  showReportProfileModal: boolean;
}

const store = create<State>((set) => ({
  authModalType: 'login',
  reportingProfile: null,
  reportingPublicationId: null,
  setShowAuthModal: (showAuthModal, authModalType) => {
    set(() => ({ authModalType, showAuthModal }));
  },
  setShowDiscardModal: (showDiscardModal) => set(() => ({ showDiscardModal })),
  setShowMobileDrawer: (showMobileDrawer) => set(() => ({ showMobileDrawer })),
  setShowOptimisticTransactionsModal: (showOptimisticTransactionsModal) =>
    set(() => ({ showOptimisticTransactionsModal })),
  setShowProfileSwitchModal: (showProfileSwitchModal) =>
    set(() => ({ showProfileSwitchModal })),
  setShowPublicationReportModal: (
    showPublicationReportModal,
    reportingPublicationId
  ) =>
    set(() => ({
      reportingPublicationId,
      showPublicationReportModal
    })),
  setShowReportProfileModal: (showReportProfileModal, reportingProfile) =>
    set(() => ({ reportingProfile, showReportProfileModal })),
  showAuthModal: false,
  showDiscardModal: false,
  showMobileDrawer: false,
  showOptimisticTransactionsModal: false,
  showProfileSwitchModal: false,
  showPublicationReportModal: false,
  showReportProfileModal: false
}));

export const useGlobalModalStateStore = createTrackedSelector(store);
