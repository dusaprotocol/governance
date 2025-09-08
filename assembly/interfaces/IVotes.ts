import { Address } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';

/**
 * @dev Common interface for {ERC20Votes}, {ERC721Votes}, and other {Votes}-enabled contracts.
 */
export abstract class IVotes {
  /**
   * @dev Returns the current amount of votes that `account` has.
   */
  getVotes(account: Address): u256 {
    throw new Error('Not implemented');
  }

  /**
   * @dev Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is
   * configured to use block numbers, this will return the value at the end of the corresponding block.
   */
  getPastVotes(account: Address, timepoint: u256): u256 {
    throw new Error('Not implemented');
  }

  /**
   * @dev Returns the total supply of votes available at a specific moment in the past. If the `clock()` is
   * configured to use block numbers, this will return the value at the end of the corresponding block.
   *
   * NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes.
   * Votes that have not been delegated are still part of total supply, even though they would not participate in a
   * vote.
   */
  getPastTotalSupply(timepoint: u256): u256 {
    throw new Error('Not implemented');
  }

  /**
   * @dev Returns the delegate that `account` has chosen.
   */
  delegates(account: Address): Address {
    throw new Error('Not implemented');
  }

  /**
   * @dev Delegates votes from the sender to `delegatee`.
   */
  delegate(delegatee: Address): void {}

  /**
   * @dev Delegates votes from signer to `delegatee`.
   */
  delegateBySig(
    delegatee: Address,
    nonce: u256,
    expiry: u256,
    v: u8,
    r: StaticArray<u8>,
    s: StaticArray<u8>,
  ): void {}
}
