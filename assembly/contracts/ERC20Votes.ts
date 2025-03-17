import {
  Args,
  boolToByte,
  bytesToString,
  byteToBool,
  stringToBytes,
} from '@massalabs/as-types';
import {
  Address,
  Context,
  createEvent,
  generateEvent,
  Storage,
} from '@massalabs/massa-as-sdk';
import { onlyOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { u256 } from 'as-bignum/assembly/integer/u256';

import * as FT from '@massalabs/sc-standards/assembly/contracts/MRC20/index';
import { _isOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
export * from '@massalabs/sc-standards/assembly/contracts/MRC20/MRC20-external';

const IS_TRANSFER_PAUSED = stringToBytes('isTransferPaused');
const TRANSFER_WHITELISTED_ADDRESSES = stringToBytes(
  'transferWhitelistedAddresses',
);

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

export function addAddressToWhitelist(bs: StaticArray<u8>): void {
  onlyOwner();
  const address = new Args(bs).nextString().expect('missing address filed');
  const addresses = bytesToString(
    Storage.get(TRANSFER_WHITELISTED_ADDRESSES),
  ).split(',');
  addresses.push(address);
  setAddressesWhitelistedForTransfer(addresses);
}
export function removeAddressFromWhitelist(bs: StaticArray<u8>): void {
  onlyOwner();
  const address = new Args(bs).nextString().expect('missing address filed');
  const addresses = bytesToString(
    Storage.get(TRANSFER_WHITELISTED_ADDRESSES),
  ).split(',');
  const newAddresses = addresses.filter((a) => a !== address);
  setAddressesWhitelistedForTransfer(newAddresses);
}

function setAddressesWhitelistedForTransfer(addresses: Array<string>): void {
  Storage.set(
    TRANSFER_WHITELISTED_ADDRESSES,
    stringToBytes(addresses.join(',')),
  );
}

function isTransferWhitelisted(address: string): bool {
  const addresses = bytesToString(
    Storage.get(TRANSFER_WHITELISTED_ADDRESSES),
  ).split(',');
  if (addresses.length === 0) return false;
  for (let i = 0; i < addresses.length; i++) {
    if (addresses[i] === address) return true;
  }
  return false;
}

function isTransferAuthorized(from: string, to: string): bool {
  if (_isOwner(to) || _isOwner(from)) return true;
  if (isTransferWhitelisted(from) || isTransferWhitelisted(to)) return true;
  return isTransferPaused();
}

// ========================================================
// ===================== CONSTRUCTOR ======================
// ========================================================

export function constructor(_: StaticArray<u8>): void {
  const name = 'Dusa Jellyfish Locked Token';
  const symbol = 'JELLY';
  const decimals = 18;
  const totalSupply = u256.mul(u256.from(100_000_000), u256.fromU64(10 ** 18));

  FT.mrc20Constructor(name, symbol, decimals, totalSupply);
  setTransferPaused(true);
  setAddressesWhitelistedForTransfer([Context.caller().toString()]);
}

export function transfer(bs: StaticArray<u8>): void {
  assert(
    _isOwner(Context.caller().toString()) || !isTransferPaused(),
    'ERC20Votes: transfer paused',
  );
  FT.transfer(bs);

  const args = new Args(bs);
  const toAddress = new Address(
    args.nextString().expect('receiverAddress argument is missing or invalid'),
  );
  const amount = args
    .nextU256()
    .expect('amount argument is missing or invalid');
  const event = createEvent('TRANSFER', [
    toAddress.toString(),
    u256ToString(amount),
  ]);
  generateEvent(event);
}
export function transferFrom(bs: StaticArray<u8>): void {
  assert(!isTransferPaused(), 'ERC20Votes: transferFrom not implemented');
  FT.transferFrom(bs);

  const args = new Args(bs);
  const owner = new Address(
    args.nextString().expect('ownerAddress argument is missing or invalid'),
  );
  const recipient = new Address(
    args.nextString().expect('recipientAddress argument is missing or invalid'),
  );
  const amount = args
    .nextU256()
    .expect('amount argument is missing or invalid');

  const event = createEvent('TRANSFER', [
    owner.toString(),
    recipient.toString(),
    u256ToString(amount),
  ]);
  generateEvent(event);
}

export function u256ToString(u: u256): string {
  return String.UTF16.decode(changetype<ArrayBuffer>(u));
}
