import {
  Args,
  Result,
  Serializable,
  byteToU8,
  stringToBytes,
  u32ToBytes,
  u8toByte,
} from '@massalabs/as-types';
import {
  Address,
  Context,
  Storage,
  createEvent,
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { PersistentMap, IERC20 } from '@dusalabs/core';
import { u256 } from 'as-bignum/assembly/integer/u256';
import {
  setOwner,
  onlyOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

// STORAGE

class Proposal implements Serializable {
  constructor(
    public proposer: string = '',
    public title: string = '',
    public description: string = '',
    public startBlock: u64 = 0,
    public endBlock: u64 = 0,
    public forVotes: u64 = 0,
    public againstVotes: u64 = 0,
    public canceled: bool = false,
    public executed: bool = false,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.proposer)
      .add(this.title)
      .add(this.description)
      .add(this.startBlock)
      .add(this.endBlock)
      .add(this.forVotes)
      .add(this.againstVotes)
      .add(this.canceled)
      .add(this.executed)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);
    this.proposer = args.nextString().unwrap();
    this.title = args.nextString().unwrap();
    this.description = args.nextString().unwrap();
    this.startBlock = args.nextU64().unwrap();
    this.endBlock = args.nextU64().unwrap();
    this.forVotes = args.nextU64().unwrap();
    this.againstVotes = args.nextU64().unwrap();
    this.canceled = args.nextBool().unwrap();
    this.executed = args.nextBool().unwrap();
    return new Result(args.offset);
  }
}

export const PROPOSALS = new PersistentMap<u32, Proposal>('p');
export const PROPOSAL_COUNT = stringToBytes('PROPOSAL_COUNT');
export const VOTE_TOKEN = 'VOTE_TOKEN';
export const PROPOSE_THRESHOLD = stringToBytes('PROPOSE_THRESHOLD');
/// @dev Receipts of ballots for the entire voting period
/// key is a combination of proposalId-address
export const HAS_VOTED = new PersistentMap<string, bool>('v');

// CONSTRUCTOR

export function constructor(bs: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), 'already init');

  const voteToken = new Args(bs).nextString().unwrap();
  Storage.set(VOTE_TOKEN, voteToken);
  Storage.set(PROPOSE_THRESHOLD, u8toByte(10)); // 10%
  Storage.set(PROPOSAL_COUNT, u8toByte(0));

  setOwner(new Args().add(Context.transactionCreator()).serialize());
}

// OWNER

export function updateProposeThreshold(bs: StaticArray<u8>): void {
  onlyOwner();

  const newThreshold = new Args(bs).nextU8().unwrap();
  assert(newThreshold < 100, 'invalid threshold');
  Storage.set(PROPOSE_THRESHOLD, u8toByte(newThreshold));
}

export function propose(bs: StaticArray<u8>): void {
  assert(canPropose(), 'NOT_ENOUGH_VOTING_POWER');

  const args = new Args(bs);
  const title = args.nextString().unwrap();
  const description = args.nextString().unwrap();
  const startBlock = args.nextU64().unwrap();
  const endBlock = args.nextU64().unwrap();
  const proposer = Context.caller().toString();
  const currProposalCount = proposalCount();
  const proposal = new Proposal(
    proposer,
    title,
    description,
    startBlock,
    endBlock,
  );
  PROPOSALS.set(currProposalCount, proposal);
  Storage.set(PROPOSAL_COUNT, u32ToBytes(currProposalCount + 1));

  const event = createEvent('PROPOSE', [
    currProposalCount.toString(),
    proposer,
  ]);
  generateEvent(event);
}

export function vote(bs: StaticArray<u8>): void {
  const args = new Args(bs);
  const proposalId = args.nextU32().unwrap();
  const support = args.nextBool().unwrap();
  const proposal = PROPOSALS.get(proposalId, new Proposal());

  assert(canVote(proposalId), 'CANNOT VOTE');
  assert(proposal.startBlock <= Context.currentPeriod(), 'NOT STARTED');
  assert(proposal.endBlock >= Context.currentPeriod(), 'ENDED');

  const voter = Context.caller();
  const votes = voteToken().balanceOf(voter);
  const votingPower = u256.div(
    votes,
    u256.from(u64(10) ** u64(voteToken().decimals())),
  );
  if (support) {
    proposal.forVotes += votingPower.toU64();
  } else {
    proposal.againstVotes += votingPower.toU64();
  }
  PROPOSALS.set(proposalId, proposal);
  HAS_VOTED.set(createKey(proposalId, voter.toString()), true);

  const event = createEvent('VOTE', [
    proposalId.toString(),
    voter.toString(),
    support.toString(),
  ]);
  generateEvent(event);
}

// HELPERS

export function canVote(proposalId: u32): bool {
  return (
    voteToken().balanceOf(Context.caller()) > u256.Zero &&
    !hasVoted(proposalId, Context.caller().toString()) &&
    proposalId <= proposalCount()
  );
}

export function canPropose(): bool {
  const totalSupply = voteToken().totalSupply();
  const threshold = u256.div(
    u256.mul(totalSupply, u256.from(byteToU8(Storage.get(PROPOSE_THRESHOLD)))),
    u256.from(100),
  );
  return voteToken().balanceOf(Context.caller()) >= threshold;
}

function createKey(proposalId: u32, voter: string): string {
  return proposalId.toString() + voter;
}

export function hasVoted(proposalId: u32, voter: string): bool {
  const key = createKey(proposalId, voter);
  return HAS_VOTED.contains(key) ? true : false;
}

function voteToken(): IERC20 {
  return new IERC20(new Address(Storage.get(VOTE_TOKEN)));
}

function proposalCount(): u8 {
  return byteToU8(Storage.get(PROPOSAL_COUNT));
}
