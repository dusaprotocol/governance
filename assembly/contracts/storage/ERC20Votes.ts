import { PersistentMap } from '@dusalabs/core';
import { Args, Result, Serializable } from '@massalabs/as-types';

/// @notice A record of each accounts delegate
export const delegates = new PersistentMap<string, string>('delegates');

/// @notice A checkpoint for marking number of votes from a given block
export class Checkpoint implements Serializable {
  constructor(
    public from: u64 = 0, // timestamp
    public votes: u64 = 0,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args().add(this.from).add(this.votes).serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);
    this.from = args.nextU64().unwrap();
    this.votes = args.nextU64().unwrap();
    return new Result(args.offset);
  }
}

/// @notice A record of votes checkpoints for each account, by index
/// @dev key is a combination of account address and checkpoint index
export const checkpoints = new PersistentMap<string, Checkpoint>('checkpoints');
export const createCheckpointKey = (account: string, index: u64): string =>
  `${account}-${index.toString()}`;
export const getCheckpoint = (account: string, index: u64): Checkpoint =>
  checkpoints.getSome(createCheckpointKey(account, index));

/// @notice The number of checkpoints for each account
export const numCheckpoints = new PersistentMap<string, u64>('numCheckpoints');
export const getNumCheckpoints = (account: string): u64 =>
  numCheckpoints.contains(account) ? numCheckpoints.getSome(account) : 0;
