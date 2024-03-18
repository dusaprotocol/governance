import { PersistentMap } from '@dusalabs/core';
import { stringToBytes } from '@massalabs/as-types';

export const ADMIN = stringToBytes('admin');
export const PENDING_ADMIN = stringToBytes('pendingAdmin');
export const DELAY = stringToBytes('delay');
export const QUEUED_TRANSACTIONS = new PersistentMap<StaticArray<u8>, bool>(
  'queuedTransactions',
);
