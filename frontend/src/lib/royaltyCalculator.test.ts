import { describe, expect, it } from 'vitest';
import { calculateRoyaltyAllocations, isValidRoyaltySplit, totalRoyaltyPercentage } from './royaltyCalculator';

describe('royalty calculator', () => {
  const split = [
    { id: 'a', name: 'Creator', percentage: 70 },
    { id: 'b', name: 'Producer', percentage: 30 },
  ];

  it('calculates allocations without creating a payment', () => {
    expect(calculateRoyaltyAllocations(125.5, split)).toEqual([
      { ...split[0], amount: 87.85 },
      { ...split[1], amount: 37.65 },
    ]);
  });

  it('requires exactly 100 percent and valid collaborator names', () => {
    expect(totalRoyaltyPercentage(split)).toBe(100);
    expect(isValidRoyaltySplit(split)).toBe(true);
    expect(isValidRoyaltySplit([{ id: 'a', name: '', percentage: 100 }])).toBe(false);
    expect(isValidRoyaltySplit([{ id: 'a', name: 'Creator', percentage: 99.99 }])).toBe(false);
  });

  it('rejects a negative amount', () => {
    expect(() => calculateRoyaltyAllocations(-1, split)).toThrow(/non-negative/);
  });
});
