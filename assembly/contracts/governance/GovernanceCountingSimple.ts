import { PersistentMap } from '@massalabs/massa-as-sdk/assembly/collections';
import { u256 } from 'as-bignum/assembly/integer';

enum VoteType {
  Against,
  For,
  Abstain,
}

class ProposalVote {
  constructor(
    public readonly againstVotes: u256,
    public readonly forVotes: u256,
    public readonly abstainVotes: u256,
    public readonly hasVoted: PersistentMap<string, boolean>,
  ) {}
}

const _proposalVotes = new PersistentMap<u256, ProposalVote>('proposalVotes');

export function COUNTING_MODE(): string {
  return 'support=bravo&quorum=for,abstain';
}

export function hasVoted(proposalId: u256, account: string): boolean {
  const proposalVote = _proposalVotes.get(proposalId);
  if (proposalVote == null) {
    return false;
  }
  return proposalVote.hasVoted.get(account) == true;
}
