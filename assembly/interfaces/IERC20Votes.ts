import { IVotes } from './IVotes';
import { Address, call } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';
import {
  Args,
  bytesToString,
  bytesToU256,
  u256ToBytes,
} from '@massalabs/as-types';
import { IERC20 } from '@dusalabs/core';

export class IERC20Votes extends IERC20 implements IVotes {
  getVotes(account: Address): u256 {
    return bytesToU256(
      call(this._origin, 'getVotes', new Args().add(account), 0),
    );
  }
  getPastVotes(account: Address, timepoint: u256): u256 {
    return bytesToU256(
      call(
        this._origin,
        'getPastVotes',
        new Args().add(account).add(u256ToBytes(timepoint)),
        0,
      ),
    );
  }

  getPastTotalSupply(timepoint: u256): u256 {
    return bytesToU256(
      call(
        this._origin,
        'getPastTotalSupply',
        new Args().add(u256ToBytes(timepoint)),
        0,
      ),
    );
  }

  delegates(account: Address): Address {
    return new Address(
      bytesToString(
        call(this._origin, 'delegates', new Args().add(account), 0),
      ),
    );
  }

  delegate(delegatee: Address): void {
    call(this._origin, 'delegate', new Args().add(delegatee), 0);
  }

  delegateBySig(
    delegatee: Address,
    nonce: u256,
    expiry: u256,
    v: number,
    r: StaticArray<number>,
    s: StaticArray<number>,
  ): void {
    call(
      this._origin,
      'delegateBySig',
      new Args().add(delegatee).add(nonce).add(expiry).add(v).add(r).add(s),
      0,
    );
  }
}
