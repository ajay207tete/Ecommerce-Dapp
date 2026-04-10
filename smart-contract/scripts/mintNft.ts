#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { Cell, toNano, beginCell } from '@ton/core';
import { Address } from '@ton/core';
import { NftCollection, NftMintDynamicArgs, NftMintStaticArgs } from '../wrappers/NftCollection';

async function main() {
  if (process.argv.length < 4) {
    console.log('Usage:');
    console.log('  tsx mintNft.ts <collection_address> <user_wallet> <ipfs_metadata_url>  # dynamic (product/hotel)');
    console.log('  tsx mintNft.ts <collection_address> <user_wallet> --static              # static (first-time user)');
    process.exit(1);
  }

  const collectionAddr = Address.parseRaw(process.argv[2]);
  const userWallet = Address.parseRaw(process.argv[3]);
  const isStatic = process.argv[4] === '--static';

  const client = await getTonClient();
  const { sender } = await getSender();

  const collection = client.open(NftCollection.createFromAddress(collectionAddr));

  if (isStatic) {
    // Static first-time user loyalty NFT (uses collection static_content)
    const staticArgs: NftMintStaticArgs = { toAddress: userWallet };
    await collection.sendMintStatic(client.provider, sender, staticArgs);
    console.log(`Static loyalty NFT minted to first-time user ${userWallet.toString()}`);
  } else {
    // Dynamic NFT for product/hotel (requires metadata URL)
    if (process.argv.length < 5) {
      console.log('Dynamic mint requires <ipfs_metadata_url>');
      process.exit(1);
    }
    const metadataUrl = process.argv[4];
    const dynamicContent = beginCell()
      .storeUint(0, 8)
      .storeStringTail(metadataUrl)
      .storeUint(1, 1) // offchain
      .endCell();
    
    const dynamicArgs: NftMintDynamicArgs = {
      toAddress: userWallet,
      nftItemContent: dynamicContent
    };
    await collection.sendMintDynamic(client.provider, sender, dynamicArgs);
    console.log(`Dynamic transaction NFT minted to ${userWallet.toString()}`);
    console.log('Metadata:', metadataUrl);
  }

  const data = await collection.getCollectionData(client.provider);
  console.log('Next NFT index:', data.nextItemIndex.toString());
}

main().catch(console.error);

