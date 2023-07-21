import {
  Address,
  Context,
  createEvent,
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { PersistentMap } from '@massalabs/massa-as-sdk/assembly/collections';
import { _balance } from '@massalabs/sc-standards/assembly/contracts/FT/token-commons';

// ========================================================
// ====================== ERC20Votes ======================
// ========================================================

export * from '@massalabs/sc-standards/assembly/contracts/FT/token';
export * from './utils/Votes';

/// @notice A record of each accounts delegate
const delegates = new PersistentMap<string, string>('delegates');

/// @notice A checkpoint for marking number of votes from a given block
class Checkpoint {
  constructor(public fromBlock: u32, votes: u64) {}
}

/// @notice A record of votes checkpoints for each account, by index
const checkpoints = new PersistentMap<string, PersistentMap<u32, Checkpoint>>(
  'checkpoints',
);

/// @notice The number of checkpoints for each account
const numCheckpoints = new PersistentMap<string, u32>('numCheckpoints');

export function delegate(address: Address): void {
  _delegate(Context.caller().toString(), address.toString());
}

function _delegate(delegator: string, delegatee: string): void {
  const currentDelegate = delegates.getSome(delegator).unwrap();
  const delegatorBalance = _balance(new Address(delegator));
  delegates.set(delegator, delegatee);

  generateEvent(
    createEvent('DelegateChanged', [delegator, currentDelegate, delegatee]),
  );
}

function _moveDelegates(srcRep: string, dstRep: string, amount: u64): void {
  if (srcRep != dstRep && amount > 0) {
    // if (srcRep != new Address(0)) {
    // const srcRepNum = numCheckpoints.get(srcRep, 0);
    // const srcRepOld = srcRepNum > 0 ? checkpoints.get(srcRep)[srcRepNum - 1].votes : 0;
    // const srcRepNew = sub96(srcRepOld, amount, "Uni::_moveVotes: vote amount underflows");
    // _writeCheckpoint(srcRep, srcRepNum, srcRepOld, srcRepNew);
    // }
    // if (dstRep != address(0)) {
    // const dstRepNum = numCheckpoints[dstRep];
    // const dstRepOld = dstRepNum > 0 ? checkpoints.get(dstRep)[dstRepNum - 1].votes : 0;
    // const dstRepNew = add96(dstRepOld, amount, "Uni::_moveVotes: vote amount overflows");
    // _writeCheckpoint(dstRep, dstRepNum, dstRepOld, dstRepNew);
    // }
  }
}

function _writeCheckpoint(
  delegatee: string,
  nCheckpoints: u32,
  oldVotes: u64,
  newVotes: u64,
): void {
  assert(
    Context.currentPeriod() < 2 ** 32,
    'Uni::_writeCheckpoint: block number exceeds 32 bits',
  );
  const blockNumber: u32 = Context.currentPeriod();

  // if (nCheckpoints > 0 && checkpoints[delegatee][nCheckpoints - 1].fromBlock == blockNumber) {
  //     checkpoints[delegatee][nCheckpoints - 1].votes = newVotes;
  // } else {
  //     checkpoints.set(delegatee, nCheckpoints] = Checkpoint(blockNumber, newVotes);
  //     numCheckpoints.set(delegatee, nCheckpoints + 1);
  // }

  generateEvent(
    createEvent('DelegateVotesChanged', [
      delegatee,
      oldVotes.toString(),
      newVotes.toString(),
    ]),
  );
}
