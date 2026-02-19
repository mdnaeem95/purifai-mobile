import { create } from 'zustand';
import { FamilyMember, FamilyState, Relationship } from '../types/family';
import {
  saveData,
  loadData,
  saveMemberData,
  loadMemberData,
  clearAllMemberData,
} from '../services/storage';

interface FamilyStore extends FamilyState {
  loadFamily: () => Promise<void>;
  migrateIfNeeded: (userName: string) => Promise<void>;
  addMember: (name: string, relationship: Relationship) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  renameMember: (memberId: string, name: string) => Promise<void>;
  updateRelationship: (memberId: string, relationship: Relationship) => Promise<void>;
  switchMember: (memberId: string) => Promise<void>;
  getCurrentMember: () => FamilyMember | undefined;
  getSelfMember: () => FamilyMember | undefined;
}

const persist = async (state: FamilyState) => {
  await saveData('family', state);
};

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  members: [],
  currentMemberId: '',
  migrated: false,

  loadFamily: async () => {
    const family = await loadData<FamilyState>('family');
    if (family) {
      set({
        members: family.members,
        currentMemberId: family.currentMemberId,
        migrated: family.migrated,
      });
    }
  },

  migrateIfNeeded: async (userName: string) => {
    const { migrated, members } = get();
    if (migrated || members.length > 0) return;

    const selfId = `self_${Date.now()}`;
    const selfMember: FamilyMember = {
      id: selfId,
      name: userName || 'Self',
      relationship: 'self',
      createdAt: new Date().toISOString(),
    };

    // Read existing legacy data (non-scoped keys)
    const existingCalculators = await loadData('calculators');
    const existingSelected = await loadData('selectedCalculators');
    const existingCalculated = await loadData('calculatedCalculators');
    const existingPayments = await loadData('payments');

    // Write to new scoped keys
    if (existingCalculators) {
      await saveMemberData('calculators', selfId, existingCalculators);
    }
    if (existingSelected) {
      await saveMemberData('selectedCalculators', selfId, existingSelected);
    }
    if (existingCalculated) {
      await saveMemberData('calculatedCalculators', selfId, existingCalculated);
    }
    if (existingPayments) {
      await saveMemberData('payments', selfId, existingPayments);
    }

    // Save family state
    const newState: FamilyState = {
      members: [selfMember],
      currentMemberId: selfId,
      migrated: true,
    };

    await persist(newState);
    set(newState);
  },

  addMember: async (name: string, relationship: Relationship) => {
    const newMember: FamilyMember = {
      id: `member_${Date.now()}`,
      name,
      relationship,
      createdAt: new Date().toISOString(),
    };

    const members = [...get().members, newMember];
    const newState: FamilyState = { ...get(), members };
    await persist(newState);
    set({ members });
  },

  removeMember: async (memberId: string) => {
    const { members, currentMemberId } = get();
    const member = members.find((m) => m.id === memberId);

    // Cannot remove self
    if (!member || member.relationship === 'self') return;

    // Clear all storage data for this member
    await clearAllMemberData(memberId);

    const newMembers = members.filter((m) => m.id !== memberId);
    const selfMember = newMembers.find((m) => m.relationship === 'self');

    // If removing the active member, switch to self
    const newCurrentId = currentMemberId === memberId
      ? (selfMember?.id || newMembers[0]?.id || '')
      : currentMemberId;

    const newState: FamilyState = {
      members: newMembers,
      currentMemberId: newCurrentId,
      migrated: true,
    };
    await persist(newState);
    set(newState);
  },

  renameMember: async (memberId: string, name: string) => {
    const members = get().members.map((m) =>
      m.id === memberId ? { ...m, name } : m,
    );
    const newState: FamilyState = { ...get(), members };
    await persist(newState);
    set({ members });
  },

  updateRelationship: async (memberId: string, relationship: Relationship) => {
    const members = get().members.map((m) =>
      m.id === memberId ? { ...m, relationship } : m,
    );
    const newState: FamilyState = { ...get(), members };
    await persist(newState);
    set({ members });
  },

  switchMember: async (memberId: string) => {
    const newState: FamilyState = { ...get(), currentMemberId: memberId };
    await persist(newState);
    set({ currentMemberId: memberId });
  },

  getCurrentMember: () => {
    const { members, currentMemberId } = get();
    return members.find((m) => m.id === currentMemberId);
  },

  getSelfMember: () => {
    return get().members.find((m) => m.relationship === 'self');
  },
}));
