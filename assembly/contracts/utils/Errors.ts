import { u256ToString } from '@dusalabs/core';
import { Address } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly/integer/u256';
import { ProposalState } from './Structs';
import { bytesToString } from '@massalabs/as-types';

/**
 * @dev Empty proposal or a mismatch between the parameters length for a proposal call.
 */
export const GovernorInvalidProposalLength = (
  targets: u256,
  calldatas: u256,
  values: u256,
): string =>
  `GovernorInvalidProposalLength: ${u256ToString(targets)}, ${u256ToString(
    calldatas,
  )}, ${u256ToString(values)}`;

/**
 * @dev The vote was already cast.
 */
export const GovernorAlreadyCastVote = (voter: Address): string =>
  `GovernorAlreadyCastVote: ${voter}`;

/**
 * @dev Token deposits are disabled in this contract.
 */
export const GovernorDisabledDeposit = (): string => `GovernorDisabledDeposit`;

/**
 * @dev The `account` is not a proposer.
 */
export const GovernorOnlyProposer = (account: Address): string =>
  `GovernorOnlyProposer: ${account}`;

/**
 * @dev The `account` is not the governance executor.
 */
export const GovernorOnlyExecutor = (account: Address): string =>
  `GovernorOnlyExecutor: ${account}`;

/**
 * @dev The `proposalId` doesn't exist.
 */
export const GovernorNonexistentProposal = (proposalId: u256): string =>
  `GovernorNonexistentProposal: ${u256ToString(proposalId)}`;

/**
 * @dev The current state of a proposal is not the required for performing an operation.
 * The `expectedStates` is a bitmap with the bits enabled for each ProposalState enum position
 * counting from right to left.
 *
 * NOTE: If `expectedState` is `bytes32(0)`, the proposal is expected to not be in any state (i.e. not exist).
 * This is the case when a proposal that is expected to be unset is already initiated (the proposal is duplicated).
 *
 * See {Governor-_encodeStateBitmap}.
 */
export const GovernorUnexpectedProposalState = (
  proposalId: u256,
  current: ProposalState,
  expectedStates: StaticArray<u8>,
): string =>
  `GovernorUnexpectedProposalState: ${u256ToString(
    proposalId,
  )}, ${current.toString()}, ${bytesToString(expectedStates)}`;

/**
 * @dev The voting period set is not a valid period.
 */
export const GovernorInvalidVotingPeriod = (votingPeriod: u256): string =>
  `GovernorInvalidVotingPeriod: ${u256ToString(votingPeriod)}`;

/**
 * @dev The `proposer` does not have the required votes to create a proposal.
 */
export const GovernorInsufficientProposerVotes = (
  proposer: Address,
  votes: u256,
  threshold: u256,
): string =>
  `GovernorInsufficientProposerVotes: ${proposer}, ${u256ToString(
    votes,
  )}, ${u256ToString(threshold)}`;

/**
 * @dev The `proposer` is not allowed to create a proposal.
 */
export const GovernorRestrictedProposer = (proposer: Address): string =>
  `GovernorRestrictedProposer: ${proposer}`;

/**
 * @dev The vote type used is not valid for the corresponding counting module.
 */
export const GovernorInvalidVoteType = (): string => `GovernorInvalidVoteType`;

/**
 * @dev Queue operation is not implemented for this governor. Execute should be called directly.
 */
export const GovernorQueueNotImplemented = (): string =>
  `GovernorQueueNotImplemented`;

/**
 * @dev The proposal hasn't been queued yet.
 */
export const GovernorNotQueuedProposal = (proposalId: u256): string =>
  `GovernorNotQueuedProposal: ${u256ToString(proposalId)}`;

/**
 * @dev The proposal has already been queued.
 */
export const GovernorAlreadyQueuedProposal = (proposalId: u256): string =>
  `GovernorAlreadyQueuedProposal: ${u256ToString(proposalId)}`;

/**
 * @dev The provided signature is not valid for the expected `voter`.
 * If the `voter` is a contract, the signature is not valid using {IERC1271-isValidSignature}.
 */
export const GovernorInvalidSignature = (voter: Address): string =>
  `GovernorInvalidSignature: ${voter}`;
