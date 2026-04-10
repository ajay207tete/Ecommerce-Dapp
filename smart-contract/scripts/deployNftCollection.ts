#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { TonClient4, compileFunc } from '@ton/ton';
import { Cell, toNano, beginCell, Address } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';

async function main() {
  const metadataUrl = process.argv[2] || 'https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7li5i64wnfr5bbr6_igfdsvd6j6nku/collection.json';
  
  const client = await getTonClient();
  const { wallet, sender } = await getSender();
  
  // Compile contracts
  const nftItemCode = await compileFunc({ code: 'nft-item' }); // Blueprint convention
  const nftCollectionCode = await compileFunc({ code: 'nft-collection' });
  
  // Config
  const collectionConfig = {
    owner: wallet.address,
    nft_item_code: nftItemCode,
    content: beginCell()
      .storeUint(0, 8)
      .storeStringTail(metadataUrl)
      .endCell()
  };
  
  // Get address
  const collectionAddress = NftCollection.getAddress(collectionConfig, nftCollectionCode, 0);
  console.log('Collection address:', collectionAddress.toString());
  
  // Deploy
  const collection = client.open(NftCollection.createFromAddress(collectionAddress));
  
  await collection.sendDeploy(sender, toNano('0.3'), metadataUrl);
  
  console.log('NFT Collection deployed!');
  console.log('Address:', collectionAddress.toString());
  console.log('Owner:', wallet.address.toString());
  console.log('Fund it with testnet TON if needed.');
}

main().catch(console.error);
