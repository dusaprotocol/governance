import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
import { Args, BUILDNET_CHAIN_ID, DefaultProviderUrls, MAX_GAS_DEPLOYMENT, fromMAS } from '@massalabs/massa-web3';

dotenv.config();

const publicApi = DefaultProviderUrls.BUILDNET

const secretKey = process.env.WALLET_SECRET_KEY;
if (!secretKey) {
  throw new Error('Missing WALLET_SECRET_KEY in .env file');
}

const deployerAccount = await WalletClient.getAccountFromSecretKey(secretKey);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(path.dirname(__filename));

(async () => {
  await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(path.join(__dirname, 'build', 'MyGovernor.wasm')),
        coins: fromMAS(0.1),
        args: new Args().addString('AS12Aw4tqoERAFqsav7pGTRdMiBwjQgZeWjcogVUatY7rVwtSuk3T'),
      },
    ],
    BUILDNET_CHAIN_ID,
    0n,
    MAX_GAS_DEPLOYMENT,
    true,
  );
  process.exit(0);
})();
