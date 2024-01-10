import { Args, stringToBytes, u256ToBytes } from '@massalabs/as-types';
import { canPropose, constructor } from '../contracts/MyGovernor';
import {
  generateEvent,
  mockScCall,
  resetStorage,
} from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';

describe('MyGovernor', () => {
  beforeEach(() => {
    resetStorage();
  });

  it('should allow creating a proposal when balance > threshold', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(100))); // total supply
    mockScCall(u256ToBytes(u256.from(10))); // balance of

    expect(canPropose()).toBe(true);
  });
  it('should not allow creating a proposal when balance < threshold', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(100))); // total supply
    mockScCall(u256ToBytes(u256.from(1))); // balance of

    expect(canPropose()).toBe(false);
  });
});
