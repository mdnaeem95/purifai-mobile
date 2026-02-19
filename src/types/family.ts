// Family member types

export type Relationship =
  | 'self'
  | 'wife'
  | 'husband'
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: Relationship;
  createdAt: string;
}

export interface FamilyState {
  members: FamilyMember[];
  currentMemberId: string;
  migrated: boolean;
}

export const RELATIONSHIP_OPTIONS: { label: string; value: Relationship }[] = [
  { label: 'Self', value: 'self' },
  { label: 'Wife', value: 'wife' },
  { label: 'Husband', value: 'husband' },
  { label: 'Son', value: 'son' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Brother', value: 'brother' },
  { label: 'Sister', value: 'sister' },
  { label: 'Other', value: 'other' },
];

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: 'Self',
  wife: 'Wife',
  husband: 'Husband',
  son: 'Son',
  daughter: 'Daughter',
  father: 'Father',
  mother: 'Mother',
  brother: 'Brother',
  sister: 'Sister',
  other: 'Other',
};
