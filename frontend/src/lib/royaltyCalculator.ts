export type RoyaltyCollaborator = {
  id: string;
  name: string;
  percentage: number;
};

export type RoyaltyAllocation = RoyaltyCollaborator & {
  amount: number;
};

export function calculateRoyaltyAllocations(amount: number, collaborators: RoyaltyCollaborator[]): RoyaltyAllocation[] {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Amount must be a non-negative number.');
  return collaborators.map((collaborator) => ({
    ...collaborator,
    amount: (amount * collaborator.percentage) / 100,
  }));
}

export function totalRoyaltyPercentage(collaborators: RoyaltyCollaborator[]): number {
  return collaborators.reduce((total, collaborator) => total + (Number.isFinite(collaborator.percentage) ? collaborator.percentage : 0), 0);
}

export function isValidRoyaltySplit(collaborators: RoyaltyCollaborator[]): boolean {
  return collaborators.length > 0 && collaborators.every((collaborator) => collaborator.name.trim() && collaborator.percentage >= 0) && Math.abs(totalRoyaltyPercentage(collaborators) - 100) < 0.000001;
}
