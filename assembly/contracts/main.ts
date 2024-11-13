import { ONE_COIN } from '@dusalabs/core';
import {
  createSC,
  fileToByteArray,
  generateEvent,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { IERC20Votes } from '../interfaces/IERC20Votes';
import { u256 } from 'as-bignum/assembly/integer/u256';
import { IGovernor } from '../interfaces/IGovernor';

export function main(bs: StaticArray<u8>): void {
  constructor(bs);
}

export function constructor(bs: StaticArray<u8>): void {
  const erc20Wasm: StaticArray<u8> = fileToByteArray('build/ERC20Votes.wasm');
  const erc20Votes: IERC20Votes = new IERC20Votes(createSC(erc20Wasm));
  transferCoins(erc20Votes._origin, 5 * ONE_COIN);
  erc20Votes.init(
    'vote escrowed DUSA',
    'veDUSA',
    18,
    u256.from(18 ** 1_000_000_000),
  );

  const governorWasm: StaticArray<u8> = fileToByteArray(
    'build/GovernorBravo.wasm',
  );
  const governorBravo: IGovernor = new IGovernor(createSC(governorWasm));
  generateEvent(governorBravo.version());
}
