import { bytesToU256, stringToBytes, u256ToBytes } from '@massalabs/as-types';
import { Context, Storage } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';

const _votingDelay = stringToBytes('votingDelay');
const _votingPeriod = stringToBytes('votingPeriod');
const _proposalThreshold = stringToBytes('proposalThreshold');

export function constructor(
  initialVotingDelay: u256,
  initialVotingPeriod: u256,
  initialProposalThreshold: u256,
): void {
  assert(
    Context.isDeployingContract(),
    'GovernorSettings: only deployable once',
  );
}

export function votingDelay(): u256 {
  return bytesToU256(Storage.get(_votingDelay));
}

export function votingPeriod(): u256 {
  return bytesToU256(Storage.get(_votingPeriod));
}

export function proposalThreshold(): u256 {
  return bytesToU256(Storage.get(_proposalThreshold));
}

export function setVotingDelay(newVotingDelay: u256): void {
  onlyGovernance();
  Storage.set(_votingDelay, u256ToBytes(newVotingDelay));
}

function onlyGovernance(): void {
  assert(
    Context.caller() == Context.callee(),
    'GovernorSettings: only governance',
  );
}
