import { Args, stringToBytes, u256ToBytes } from '@massalabs/as-types';
import {
  canPropose,
  canVote,
  constructor,
  hasVoted,
  propose,
  vote,
} from '../contracts/MyGovernor';
import {
  Context,
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
  it('should allow voting on an active proposal when balance > 0', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(100))); // total supply
    mockScCall(u256ToBytes(u256.from(10))); // balance of
    propose(new Args().add('description').add(0).add(0).serialize());

    mockScCall(u256ToBytes(u256.from(10))); // balance of
    expect(canVote(1)).toBe(true);
  });
  it('should not allow voting on an active proposal when balance = 0', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(100))); // total supply
    mockScCall(u256ToBytes(u256.from(10))); // balance of
    propose(new Args().add('description').add(0).add(0).serialize());

    mockScCall(u256ToBytes(u256.from(0))); // balance of
    expect(canVote(1)).toBe(false);
  });
  it('should not allow voting on a inactive proposal', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(10))); // balance of
    expect(canVote(666)).toBe(false);
  });
  it('should register the vote', () => {
    constructor(new Args().add('VOTE_TOKEN').serialize());

    mockScCall(u256ToBytes(u256.from(100))); // total supply
    mockScCall(u256ToBytes(u256.from(10))); // balance of
    propose(new Args().add('description').add(0).add(0).serialize());

    mockScCall(u256ToBytes(u256.from(10))); // balance of
    mockScCall(u256ToBytes(u256.from(10))); // balance of
    mockScCall(u256ToBytes(u256.from(0))); // decimals
    vote(new Args().add(1).add(true).serialize());
    expect(hasVoted(1, Context.caller().toString())).toBe(true);
  });
});
