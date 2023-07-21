import { TokenWrapper } from '@massalabs/sc-standards/assembly/contracts/FT';
import { IVotes } from './IVotes';

export class IERC20Votes extends TokenWrapper, IVotes {}
