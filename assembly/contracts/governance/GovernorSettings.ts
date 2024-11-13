import { bytesToU256, stringToBytes, u256ToBytes } from '@massalabs/as-types';
import { Context, Storage } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';

// Storage keys

const _votingDelay = stringToBytes('votingDelay');
const _votingPeriod = stringToBytes('votingPeriod');
const _proposalThreshold = stringToBytes('proposalThreshold');

// Constructor

export function constructor(
  initialVotingDelay: u256,
  initialVotingPeriod: u256,
  initialProposalThreshold: u256,
): void {
  assert(
    Context.isDeployingContract(),
    'GovernorSettings: only deployable once',
  );
  Storage.set(_votingDelay, u256ToBytes(initialVotingDelay));
  Storage.set(_votingPeriod, u256ToBytes(initialVotingPeriod));
  Storage.set(_proposalThreshold, u256ToBytes(initialProposalThreshold));
}

// Getters

export function votingDelay(): u256 {
  return bytesToU256(Storage.get(_votingDelay));
}

export function votingPeriod(): u256 {
  return bytesToU256(Storage.get(_votingPeriod));
}

export function proposalThreshold(): u256 {
  return bytesToU256(Storage.get(_proposalThreshold));
}

// Setters

export function setVotingDelay(newVotingDelay: u256): void {
  onlyGovernance();
  Storage.set(_votingDelay, u256ToBytes(newVotingDelay));
}

export function setVotingPeriod(newVotingPeriod: u256): void {
  onlyGovernance();
  Storage.set(_votingPeriod, u256ToBytes(newVotingPeriod));
}

export function setProposalThreshold(newProposalThreshold: u256): void {
  onlyGovernance();
  Storage.set(_proposalThreshold, u256ToBytes(newProposalThreshold));
}

// Modifiers

function onlyGovernance(): void {
  assert(
    Context.caller() == Context.callee(),
    'GovernorSettings: only governance',
  );
}
