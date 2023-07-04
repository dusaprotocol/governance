import { Args, SafeMath, stringToBytes, u64ToBytes } from '@massalabs/as-types';
import {
  Address,
  Context,
  Storage,
  call,
  createEvent,
  generateEvent,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { PersistentMap } from '@massalabs/massa-as-sdk/assembly/collections';

// CONSTANTS

const dayInMs = 14 * 24 * 3600 * 1000;
const GRACE_PERIOD = 14 * dayInMs;
const MINIMUM_DELAY = 2 * dayInMs;
const MAXIMUM_DELAY = 30 * dayInMs;

// STORAGE KEYS
const ADMIN = stringToBytes('admin');
const PENDING_ADMIN = stringToBytes('pendingAdmin');
const DELAY = stringToBytes('delay');
const QUEUED_TRANSACTIONS = new PersistentMap<string, boolean>(
  'queuedTransactions',
);

export function constructor(admin: Address, delay: u64): void {
  assert(
    delay >= MINIMUM_DELAY,
    'Timelock::constructor: Delay must exceed minimum delay.',
  );
  assert(
    delay <= MAXIMUM_DELAY,
    'Timelock::setDelay: Delay must not exceed maximum delay.',
  );

  Storage.set(ADMIN, admin.serialize());
  Storage.set(DELAY, u64ToBytes(delay));
}

export function setDelay(delay: u64): void {
  assert(
    Context.caller() == Context.callee(),
    'Timelock::setDelay: Call must come from Timelock.',
  );
  assert(
    delay >= MINIMUM_DELAY,
    'Timelock::setDelay: Delay must exceed minimum delay.',
  );
  assert(
    delay <= MAXIMUM_DELAY,
    'Timelock::setDelay: Delay must not exceed maximum delay.',
  );
  Storage.set(DELAY, u64ToBytes(delay));

  generateEvent(createEvent('NewDelay', [delay.toString()]));
}

export function acceptAdmin(): void {
  assert(
    Context.caller() == pendingAdmin(),
    'Timelock::acceptAdmin: Call must come from pendingAdmin.',
  );
  Storage.set(ADMIN, Context.caller().serialize());
  Storage.set(PENDING_ADMIN, []);

  generateEvent(createEvent('NewAdmin', [Context.caller().toString()]));
}

export function setPendingAdmin(pendingAdmin: Address): void {
  assert(
    Context.caller() == Context.callee(),
    'Timelock::setPendingAdmin: Call must come from Timelock.',
  );
  Storage.set(PENDING_ADMIN, pendingAdmin.serialize());

  generateEvent(createEvent('NewPendingAdmin', [pendingAdmin.toString()]));
}

export function queueTransaction(
  target: Address,
  value: u64,
  signature: string,
  data: StaticArray<u8>,
  eta: u64,
): StaticArray<u8> {
  assert(
    Context.caller() == admin(),
    'Timelock::queueTransaction: Call must come from admin.',
  );
  assert(
    eta >= SafeMath.add(Context.timestamp(), delay()),
    'Timelock::queueTransaction: Estimated execution block must satisfy delay.',
  );

  // bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
  // queuedTransactions[txHash] = true;

  // emit QueueTransaction(txHash, target, value, signature, data, eta);
  // return txHash;
  return [];
}

export function cancelTransaction(
  target: Address,
  value: u64,
  signature: string,
  data: StaticArray<u8>,
  eta: u64,
): void {
  assert(
    Context.caller() == admin(),
    'Timelock::cancelTransaction: Call must come from admin.',
  );

  // bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
  // queuedTransactions[txHash] = false;

  // emit CancelTransaction(txHash, target, value, signature, data, eta);
}

export function executeTransaction(
  target: Address,
  method: string,
  value: u64,
  args: StaticArray<u8>,
  signature: string,
  data: StaticArray<u8>,
  eta: u64,
): StaticArray<u8> {
  assert(
    Context.caller() == admin(),
    'Timelock::executeTransaction: Call must come from admin.',
  );

  // bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
  const txHash = '';
  assert(
    QUEUED_TRANSACTIONS.get(txHash),
    "Timelock::executeTransaction: Transaction hasn't been queued.",
  );
  assert(
    Context.timestamp() >= eta,
    "Timelock::executeTransaction: Transaction hasn't surpassed time lock.",
  );
  assert(
    Context.timestamp() <= SafeMath.add(eta, GRACE_PERIOD),
    'Timelock::executeTransaction: Transaction is stale.',
  );

  QUEUED_TRANSACTIONS.set(txHash, false);

  // bytes memory callData;

  // if (bytes(signature).length == 0) {
  //     callData = data;
  // } else {
  //     callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
  // }

  let returnData: StaticArray<u8> = [];

  if (method == '') {
    transferCoins(target, value);
  } else {
    returnData = call(target, method, new Args(args), value);
  }
  // assert(success, "Timelock::executeTransaction: Transaction execution reverted.");

  generateEvent(
    createEvent('ExecuteTransaction', [
      txHash.toString(),
      target.toString(),
      value.toString(),
      signature,
      data.toString(),
      eta.toString(),
    ]),
  );

  return returnData;
}

// GETTERS

function delay(): u64 {
  return new Args(Storage.get(DELAY)).nextU64().unwrap();
}

function admin(): Address {
  return new Args(Storage.get(ADMIN)).nextSerializable<Address>().unwrap();
}

function pendingAdmin(): Address {
  return new Args(Storage.get(PENDING_ADMIN))
    .nextSerializable<Address>()
    .unwrap();
}
