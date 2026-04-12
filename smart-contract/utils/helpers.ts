import { TonClient4, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { beginCell, internal, Sender, toNano } from '@ton/core';
import * as dotenv from 'dotenv';

dotenv.config();

export async function getTonClient() {
  return new TonClient4({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY
  });
}

export async function getSender(mnemonic: string = process.env.MNEMONIC!) {
  const client = await getTonClient();

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey
  });

  const walletContract = client.open(wallet);

  // ✅ CORRECT sender
  const sender: Sender = {
    send: async (args) => {
      const seqno = await walletContract.getSeqno();

      await walletContract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages: [
          internal({
            to: args.to!,
            value: args.value || toNano('0.1'),
            body: args.body || beginCell().endCell(),
            bounce: false
          })
        ]
      });
    }
  };

  return {
    wallet: walletContract,
    sender
  };
}