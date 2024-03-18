import {
  Args,
  NoArg,
  byteToBool,
  byteToU8,
  bytesToString,
  bytesToU256,
} from '@massalabs/as-types';
import { Address, call } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum';
import { ProposalState } from '../contracts/utils/Structs';

/**
 * @dev Interface of the {Governor} core.
 */
export class IGovernor {
  constructor(public _origin: Address) {}

  /**
   * @notice module:core
   * @dev Name of the governor instance (used in building the EIP-712 domain separator).
   */
  name(): string {
    return bytesToString(call(this._origin, 'name', NoArg, 0));
  }

  /**
   * @notice module:core
   * @dev Version of the governor instance (used in building the EIP-712 domain separator). Default: "1"
   */
  version(): string {
    return bytesToString(call(this._origin, 'version', NoArg, 0));
  }

  /**
   * @notice module:voting
   * @dev A description of the possible `support` values for {castVote} and the way these votes are counted, meant to
   * be consumed by UIs to show correct vote options and interpret the results. The string is a URL-encoded sequence of
   * key-value pairs that each describe one aspect, for example `support=bravo&quorum=for,abstain`.
   *
   * There are 2 standard keys: `support` and `quorum`.
   *
   * - `support=bravo` refers to the vote options 0 = Against, 1 = For, 2 = Abstain, as in `GovernorBravo`.
   * - `quorum=bravo` means that only For votes are counted towards quorum.
   * - `quorum=for,abstain` means that both For and Abstain votes are counted towards quorum.
   *
   * If a counting module makes use of encoded `params`, it should  include this under a `params` key with a unique
   * name that describes the behavior. For example:
   *
   * - `params=fractional` might refer to a scheme where votes are divided fractionally between for/against/abstain.
   * - `params=erc721` might refer to a scheme where specific NFTs are delegated to vote.
   *
   * NOTE: The string can be decoded by the standard
   * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams[`URLSearchParams`]
   * JavaScript class.
   */
  // solhint-disable-next-line func-name-mixedcase
  COUNTING_MODE() {
    return bytesToString(call(this._origin, 'COUNTING_MODE', NoArg, 0));
  }

  /**
   * @notice module:core
   * @dev Hashing function used to (re)build the proposal id from the proposal details..
   */
  hashProposal(
    targets: Address[],
    values: u256[],
    calldatas: StaticArray<u8>,
    descriptionHash: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'hashProposal',
        new Args().add(targets).add(values).add(calldatas).add(descriptionHash),
        0,
      ),
    );
  }

  /**
   * @notice module:core
   * @dev Current state of a proposal, following Compound's convention
   */
  state(proposalId: u256): ProposalState {
    return byteToU8(call(this._origin, 'state', new Args().add(proposalId), 0));
  }

  /**
   * @notice module:core
   * @dev The number of votes required in order for a voter to become a proposer.
   */
  proposalThreshold(): u256 {
    return bytesToU256(call(this._origin, 'proposalThreshold', NoArg, 0));
  }

  /**
   * @notice module:core
   * @dev Timepoint used to retrieve user's votes and quorum. If using block number (as per Compound's Comp), the
   * snapshot is performed at the end of this block. Hence, voting for this proposal starts at the beginning of the
   * following block.
   */
  proposalSnapshot(proposalId: u256): u256 {
    return bytesToU256(
      call(this._origin, 'proposalSnapshot', new Args().add(proposalId), 0),
    );
  }

  /**
   * @notice module:core
   * @dev Timepoint at which votes close. If using block number, votes close at the end of this block, so it is
   * possible to cast a vote during this block.
   */
  proposalDeadline(proposalId: u256): u256 {
    return bytesToU256(
      call(this._origin, 'proposalDeadline', new Args().add(proposalId), 0),
    );
  }

  /**
   * @notice module:core
   * @dev The account that created a proposal.
   */
  proposalProposer(proposalId: u256): Address {
    return new Address(
      bytesToString(
        call(this._origin, 'proposalProposer', new Args().add(proposalId), 0),
      ),
    );
  }

  /**
   * @notice module:core
   * @dev The time when a queued proposal becomes executable ("ETA"). Unlike {proposalSnapshot} and
   * {proposalDeadline}, this doesn't use the governor clock, and instead relies on the executor's clock which may be
   * different. In most cases this will be a timestamp.
   */
  proposalEta(proposalId: u256): u256 {
    return bytesToU256(
      call(this._origin, 'proposalEta', new Args().add(proposalId), 0),
    );
  }

  /**
   * @notice module:core
   * @dev Whether a proposal needs to be queued before execution.
   */
  proposalNeedsQueuing(proposalId: u256): bool {
    return byteToBool(
      call(this._origin, 'proposalNeedsQueuing', new Args().add(proposalId), 0),
    );
  }

  /**
   * @notice module:user-config
   * @dev Delay, between the proposal is created and the vote starts. The unit this duration is expressed in depends
   * on the clock (see ERC-6372) this contract uses.
   *
   * This can be increased to leave time for users to buy voting power, or delegate it, before the voting of a
   * proposal starts.
   *
   * NOTE: While this interface returns a uint256, timepoints are stored as uint48 following the ERC-6372 clock type.
   * Consequently this value must fit in a uint48 (when added to the current clock). See {IERC6372-clock}.
   */
  votingDelay(): u256 {
    return bytesToU256(call(this._origin, 'votingDelay', NoArg, 0));
  }

  /**
   * @notice module:user-config
   * @dev Delay between the vote start and vote end. The unit this duration is expressed in depends on the clock
   * (see ERC-6372) this contract uses.
   *
   * NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
   * duration compared to the voting delay.
   *
   * NOTE: This value is stored when the proposal is submitted so that possible changes to the value do not affect
   * proposals that have already been submitted. The type used to save it is a uint32. Consequently, while this
   * interface returns a uint256, the value it returns should fit in a uint32.
   */
  votingPeriod(): u256 {
    return bytesToU256(call(this._origin, 'votingPeriod', NoArg, 0));
  }

  /**
   * @notice module:user-config
   * @dev Minimum number of cast voted required for a proposal to be successful.
   *
   * NOTE: The `timepoint` parameter corresponds to the snapshot used for counting vote. This allows to scale the
   * quorum depending on values such as the totalSupply of a token at this timepoint (see {ERC20Votes}).
   */
  quorum(timepoint: u256): u256 {
    return bytesToU256(
      call(this._origin, 'quorum', new Args().add(timepoint), 0),
    );
  }

  /**
   * @notice module:reputation
   * @dev Voting power of an `account` at a specific `timepoint`.
   *
   * Note: this can be implemented in a number of ways, for example by reading the delegated balance from one (or
   * multiple), {ERC20Votes} tokens.
   */
  getVotes(account: Address, timepoint: u256): u256 {
    return bytesToU256(
      call(this._origin, 'getVotes', new Args().add(account).add(timepoint), 0),
    );
  }

  /**
   * @notice module:reputation
   * @dev Voting power of an `account` at a specific `timepoint` given additional encoded parameters.
   */
  getVotesWithParams(
    account: Address,
    timepoint: u256,
    params: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'getVotesWithParams',
        new Args().add(account).add(timepoint).add(params),
        0,
      ),
    );
  }

  /**
   * @notice module:voting
   * @dev Returns whether `account` has cast a vote on `proposalId`.
   */
  hasVoted(proposalId: u256, account: Address): bool {
    return (
      call(
        this._origin,
        'hasVoted',
        new Args().add(proposalId).add(account),
        0,
      )[0] == 1
    );
  }

  /**
   * @dev Create a new proposal. Vote start after a delay specified by {IGovernor-votingDelay} and lasts for a
   * duration specified by {IGovernor-votingPeriod}.
   *
   * Emits a {ProposalCreated} event.
   *
   * NOTE: The state of the Governor and `targets` may change between the proposal creation and its execution.
   * This may be the result of third party actions on the targeted contracts, or other governor proposals.
   * For example, the balance of this contract could be updated or its access control permissions may be modified,
   * possibly compromising the proposal's ability to execute successfully (e.g. the governor doesn't have enough
   * value to cover a proposal with multiple transfers).
   */
  propose(
    targets: Address[],
    values: u256[],
    calldatas: StaticArray<u8>,
    description: string,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'propose',
        new Args().add(targets).add(values).add(calldatas).add(description),
        0,
      ),
    );
  }

  /**
   * @dev Queue a proposal. Some governors require this step to be performed before execution can happen. If queuing
   * is not necessary, this function may revert.
   * Queuing a proposal requires the quorum to be reached, the vote to be successful, and the deadline to be reached.
   *
   * Emits a {ProposalQueued} event.
   */
  queue(
    targets: Address[],
    values: u256[],
    calldatas: StaticArray<u8>,
    descriptionHash: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'queue',
        new Args().add(targets).add(values).add(calldatas).add(descriptionHash),
        0,
      ),
    );
  }

  /**
   * @dev Execute a successful proposal. This requires the quorum to be reached, the vote to be successful, and the
   * deadline to be reached. Depending on the governor it might also be required that the proposal was queued and
   * that some delay passed.
   *
   * Emits a {ProposalExecuted} event.
   *
   * NOTE: Some modules can modify the requirements for execution, for example by adding an additional timelock.
   */
  execute(
    targets: Address[],
    values: u256[],
    calldatas: StaticArray<u8>,
    descriptionHash: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'execute',
        new Args().add(targets).add(values).add(calldatas).add(descriptionHash),
        0,
      ),
    );
  }

  /**
   * @dev Cancel a proposal. A proposal is cancellable by the proposer, but only while it is Pending state, i.e.
   * before the vote starts.
   *
   * Emits a {ProposalCanceled} event.
   */
  cancel(
    targets: Address[],
    values: u256[],
    calldatas: StaticArray<u8>,
    descriptionHash: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'cancel',
        new Args().add(targets).add(values).add(calldatas).add(descriptionHash),
        0,
      ),
    );
  }

  /**
   * @dev Cast a vote
   *
   * Emits a {VoteCast} event.
   */
  castVote(proposalId: u256, support: u8): u256 {
    return bytesToU256(
      call(
        this._origin,
        'castVote',
        new Args().add(proposalId).add(support),
        0,
      ),
    );
  }

  /**
   * @dev Cast a vote with a reason
   *
   * Emits a {VoteCast} event.
   */
  castVoteWithReason(proposalId: u256, support: u8, reason: string): u256 {
    return bytesToU256(
      call(
        this._origin,
        'castVoteWithReason',
        new Args().add(proposalId).add(support).add(reason),
        0,
      ),
    );
  }

  /**
   * @dev Cast a vote with a reason and additional encoded parameters
   *
   * Emits a {VoteCast} or {VoteCastWithParams} event depending on the length of params.
   */
  castVoteWithReasonAndParams(
    proposalId: u256,
    support: u8,
    reason: string,
    params: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'castVoteWithReasonAndParams',
        new Args().add(proposalId).add(support).add(reason).add(params),
        0,
      ),
    );
  }

  /**
   * @dev Cast a vote using the voter's signature, including ERC-1271 signature support.
   *
   * Emits a {VoteCast} event.
   */
  castVoteBySig(
    proposalId: u256,
    support: u8,
    voter: Address,
    signature: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'castVoteBySig',
        new Args().add(proposalId).add(support).add(voter).add(signature),
        0,
      ),
    );
  }

  /**
   * @dev Cast a vote with a reason and additional encoded parameters using the voter's signature,
   * including ERC-1271 signature support.
   *
   * Emits a {VoteCast} or {VoteCastWithParams} event depending on the length of params.
   */
  castVoteWithReasonAndParamsBySig(
    proposalId: u256,
    support: u8,
    voter: Address,
    reason: string,
    params: StaticArray<u8>,
    signature: StaticArray<u8>,
  ): u256 {
    return bytesToU256(
      call(
        this._origin,
        'castVoteWithReasonAndParamsBySig',
        new Args()
          .add(proposalId)
          .add(support)
          .add(voter)
          .add(reason)
          .add(params)
          .add(signature),
        0,
      ),
    );
  }
}
