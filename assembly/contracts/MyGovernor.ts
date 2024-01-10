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
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { PersistentMap, IERC20 } from '@dusalabs/core';
import { u256 } from 'as-bignum/assembly/integer/u256';

// STORAGE

class Proposal implements Serializable {
  constructor(
    public proposer: string = '',
    public description: string = '',
    public startBlock: u32 = 0,
    public endBlock: u32 = 0,
    public forVotes: u64 = 0,
    public againstVotes: u64 = 0,
    public canceled: bool = false,
    public executed: bool = false,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.proposer)
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
    this.description = args.nextString().unwrap();
    this.startBlock = args.nextU32().unwrap();
    this.endBlock = args.nextU32().unwrap();
    this.forVotes = args.nextU64().unwrap();
    this.againstVotes = args.nextU64().unwrap();
    this.canceled = args.nextBool().unwrap();
    this.executed = args.nextBool().unwrap();
    return new Result(args.offset);
  }
}
const PROPOSALS = new PersistentMap<u32, Proposal>('p');
const PROPOSAL_COUNT = stringToBytes('PROPOSAL_COUNT');
const VOTE_TOKEN = 'VOTE_TOKEN';
const PROPOSE_THRESHOLD = stringToBytes('PROPOSE_THRESHOLD');
/// @dev Receipts of ballots for the entire voting period
/// key is a combination of proposalId-address
const HAS_VOTED = new PersistentMap<string, bool>('v');

// CONSTRUCTOR

export function constructor(bs: StaticArray<u8>): void {
  // assert(Context.isDeployingContract());
  const voteToken = new Args(bs).nextString().unwrap();
  Storage.set(VOTE_TOKEN, voteToken);
  Storage.set(PROPOSE_THRESHOLD, u8toByte(3)); // 3%
  Storage.set(PROPOSAL_COUNT, u32ToBytes(0));
}

export function propose(bs: StaticArray<u8>): void {
  assert(canPropose(), 'NOT_ENOUGH_VOTING_POWER');

  const args = new Args(bs);
  const description = args.nextString().unwrap();
  const startBlock = args.nextU32().unwrap();
  const endBlock = args.nextU32().unwrap();
  const proposer = Context.caller().toString();
  const proposalCount = byteToU8(Storage.get(PROPOSAL_COUNT));
  const proposal = new Proposal(proposer, description, startBlock, endBlock);
  PROPOSALS.set(proposalCount, proposal);
  Storage.set(PROPOSAL_COUNT, u32ToBytes(proposalCount + 1));
}

export function vote(bs: StaticArray<u8>): void {
  const args = new Args(bs);
  const proposalId = args.nextU32().unwrap();
  const support = args.nextBool().unwrap();
  assert(!hasVoted(proposalId, Context.caller().toString()), 'VOTED');
  assert(
    proposalId < byteToU8(Storage.get(PROPOSAL_COUNT)),
    'INVALID_PROPOSAL_ID',
  );
  const proposal = PROPOSALS.get(proposalId, new Proposal());
  assert(proposal.startBlock < Context.currentPeriod(), 'NOT_STARTED');
  assert(proposal.endBlock > Context.currentPeriod(), 'ENDED');
  const voter = Context.caller();
  const votes = voteToken().balanceOf(voter);
  const votingPower = u256.div(votes, u256.from(voteToken().decimals()));
  if (support) {
    proposal.forVotes += votingPower.toU64();
  } else {
    proposal.againstVotes += votingPower.toU64();
  }
  PROPOSALS.set(proposalId, proposal);
}

// HELPERS

export function canPropose(): bool {
  const totalSupply = voteToken().totalSupply();
  const threshold = u256.div(
    u256.mul(totalSupply, u256.from(byteToU8(Storage.get(PROPOSE_THRESHOLD)))),
    u256.from(100),
  );
  return voteToken().balanceOf(Context.caller()) > threshold;
}

function createKey(proposalId: u32, voter: string): string {
  return proposalId.toString() + voter;
}

export function hasVoted(proposalId: u32, voter: string): bool {
  const key = createKey(proposalId, voter);
  return HAS_VOTED.contains(key) ? HAS_VOTED.getSome(key) : false;
}

function voteToken(): IERC20 {
  return new IERC20(new Address(Storage.get(VOTE_TOKEN)));
}
