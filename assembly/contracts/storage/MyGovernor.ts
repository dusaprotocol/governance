import { stringToBytes } from '@massalabs/as-types';
import { keccak256 } from '@massalabs/massa-as-sdk';
import { PersistentMap } from '@massalabs/massa-as-sdk/assembly/collections';
import { Checkpoint } from './ERC20Votes';
import { u256 } from 'as-bignum/assembly/integer/u256';

export const _DELEGATION_TYPEHASH = keccak256(
  stringToBytes('Delegation(address delegatee,uint256 nonce,uint256 expiry)'),
);

export const _delegation = new PersistentMap<string, string>('delegation');

/// @custom:oz-retyped-from mapping(address => Checkpoints.History)
export const _delegateCheckpoints = new PersistentMap<string, Checkpoint>(
  '_delegateCheckpoints',
);

/// @custom:oz-retyped-from Checkpoints.History
export const _totalCheckpoints = new Checkpoint();

export const _nonces = new PersistentMap<string, u256>('_nonces');
