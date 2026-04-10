import { TonClient4, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const TESTNET = {
  clientConfig: {
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY // Optional
  }
};

export async function getTonClient() {
  return new TonClient4({
    endpoint: TESTNET.clientConfig.endpoint,
    apiKey: TESTNET.clientConfig.apiKey
  });
}

export async function getSender(mnemonic: string = process.env.MNEMONIC!) {
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
  const client = await getTonClient();
  
  return {
    wallet,
    sender: internal({
      from: wallet.address,
      deploy: !!wallet.code,
      body: '',
      bounce: false,
      value: '0.1'
    }, keyPair)
  };
}

export function collectionConfig(metadataUrl: string) {
  return {
    testOnly: true,
    code: 'NftCollection',
    initialValues: { ownerAddress: 'EQ...', nextItemIndex: 0n, content: metadataUrl.toCell() }
  };
}
