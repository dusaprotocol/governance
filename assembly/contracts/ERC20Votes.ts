import {
  Address,
  Context,
  createEvent,
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { _balance } from '@massalabs/sc-standards/assembly/contracts/FT/token-internals';
import {
  Checkpoint,
  checkpoints,
  createCheckpointKey,
  delegates,
  getCheckpoint,
  getNumCheckpoints,
  numCheckpoints,
} from './storage/ERC20Votes';
import { SafeMath } from '@massalabs/as-types';

// ========================================================
// ====================== ERC20Votes ======================
// ========================================================

export * from '@massalabs/sc-standards/assembly/contracts/FT/token';
export * from './utils/Votes';

export function delegate(address: Address): void {
  _delegate(Context.caller().toString(), address.toString());
}

function _delegate(delegator: string, delegatee: string): void {
  const currentDelegate = delegates.getSome(delegator);
  const delegatorBalance = _balance(new Address(delegator));
  delegates.set(delegator, delegatee);

  generateEvent(
    createEvent('DelegateChanged', [delegator, currentDelegate, delegatee]),
  );
}

function _moveDelegates(srcRep: string, dstRep: string, amount: u64): void {
  if (srcRep == dstRep || amount <= 0) return;
  if (srcRep != new Address('0').toString()) {
    const srcRepNum = getNumCheckpoints(srcRep);
    const srcRepOld = getCheckpoint(srcRep, srcRepNum - 1).votes;
    const srcRepNew = SafeMath.sub(srcRepOld, amount);
    _writeCheckpoint(srcRep, srcRepNum, srcRepOld, srcRepNew);
  }
  if (dstRep != new Address('0').toString()) {
    const dstRepNum = getNumCheckpoints(dstRep);
    const dstRepOld = getCheckpoint(dstRep, dstRepNum - 1).votes;
    const dstRepNew = SafeMath.add(dstRepOld, amount);
    _writeCheckpoint(dstRep, dstRepNum, dstRepOld, dstRepNew);
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
  const timestamp = Context.timestamp();
  const checkpoint = getCheckpoint(delegatee, nCheckpoints - 1);
  if (nCheckpoints > 0 && checkpoint.from == timestamp) {
    checkpoint.votes = newVotes;
  } else {
    checkpoints.set(
      createCheckpointKey(delegatee, nCheckpoints),
      new Checkpoint(timestamp, newVotes),
    );
    numCheckpoints.set(delegatee, nCheckpoints + 1);
  }

  generateEvent(
    createEvent('DelegateVotesChanged', [
      delegatee,
      oldVotes.toString(),
      newVotes.toString(),
    ]),
  );
}
