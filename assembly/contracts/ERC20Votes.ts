import {
  Args,
  boolToByte,
  byteToBool,
  stringToBytes,
} from '@massalabs/as-types';
import { Storage } from '@massalabs/massa-as-sdk';
import * as FT from '@massalabs/sc-standards/assembly/contracts/FT/token';
import { onlyOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { u256 } from 'as-bignum/assembly/integer';
export * from '@massalabs/sc-standards/assembly/contracts/FT/token';

const IS_TRANSFER_PAUSED = stringToBytes('isTransferPaused');

export function pauseTransfer(_: StaticArray<u8>): void {
  onlyOwner();
  setTransferPaused(true);
}
export function unpauseTransfer(_: StaticArray<u8>): void {
  onlyOwner();
  setTransferPaused(false);
}
function setTransferPaused(paused: bool): void {
  Storage.set(IS_TRANSFER_PAUSED, boolToByte(paused));
}
function isTransferPaused(): bool {
  return byteToBool(IS_TRANSFER_PAUSED);
}

// ========================================================
// ===================== CONSTRUCTOR ======================
// ========================================================

// export function constructor(_: StaticArray<u8>): void {
//   const name = 'Dusa Token';
//   const symbol = 'DUSA';
//   const decimals = 18;
//   const totalSupply = u256.mul(u256.from(100000000), u256.fromU64(10 ** 18));

//   FT.constructor(
//     new Args().add(name).add(symbol).add(decimals).add(totalSupply).serialize(),
//   );
//   Storage.set(IS_TRANSFER_PAUSED, boolToByte(true));
// }

export function transfer(_: StaticArray<u8>): void {
  assert(!isTransferPaused(), 'ERC20Votes: transfer paused');
}
export function transferFrom(_: StaticArray<u8>): void {
  assert(!isTransferPaused(), 'ERC20Votes: transferFrom not implemented');
}
