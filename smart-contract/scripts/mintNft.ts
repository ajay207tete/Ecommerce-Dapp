#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { beginCell, Address, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';

async function main() {
  if (process.argv.length < 4) {
    console.log('Usage:');
    console.log(
      'tsx mint.ts <collection_address> <user_wallet> <ipfs_url>'
    );
    process.exit(1);
  }

  const collectionAddr = Address.parse(process.argv[2]);
  const userWallet = Address.parse(process.argv[3]);
  const metadataUrl = process.argv[4];

  const client = await getTonClient();
  const { sender } = await getSender();

  const collection = client.open(
    NftCollection.createFromAddress(collectionAddr)
  );

  // ✅ CORRECT METADATA CELL
  const content = beginCell()
    .storeUint(0, 8)
    .storeStringTail(metadataUrl)
    .endCell();

  await collection.sendMint(
    client.provider,
    sender,
    {
      value: toNano('0.2'),
      toAddress: userWallet,
      content: content
    }
  );

  console.log('✅ NFT minted to:', userWallet.toString());
  console.log('Metadata:', metadataUrl);
}

main().catch(console.error);