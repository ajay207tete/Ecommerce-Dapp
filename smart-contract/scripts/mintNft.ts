#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { Cell, toNano, beginCell } from '@ton/core';
import { Address } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';

async function main() {
  if (process.argv.length < 4) {
    console.log('Usage: tsx mintNft.ts <collection_address> <user_wallet> <ipfs_metadata_url>');
    process.exit(1);
  }

  const collectionAddr = Address.parseRaw(process.argv[2]);
  const userWallet = Address.parseRaw(process.argv[3]);
  const metadataUrl = process.argv[4];

  const client = await getTonClient();
  const { sender } = await getSender();

  // NFT content cell
  const nftContent = beginCell()
    .storeUint(0, 8)
    .storeStringTail(metadataUrl)
    .storeUint(1, 1) // offchain
    .endCell();

  // Mint args
  const mintArgs = {
    toAddress: userWallet,
    nftItemContent: nftContent
  };

  // Open collection
  const collection = client.open(NftCollection.createFromAddress(collectionAddr));

  // Send mint
  await collection.sendMint(sender, mintArgs, toNano('0.25'));

  console.log(`NFT minted to ${userWallet.toString()}`);
  console.log('Index:', (await collection.getNextSerialNumber(client.provider)).toString());
}

main().catch(console.error);
