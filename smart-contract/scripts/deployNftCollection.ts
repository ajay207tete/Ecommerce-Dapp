#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { TonClient4 } from '@ton/ton';
import { Cell, toNano, beginCell, Address } from '@ton/core';
import { NftCollection, NftCollectionConfig } from '../wrappers/NftCollection';

async function main() {
  const collMetadataUrl = process.argv[2] || 'https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7li5i64wnfr5bbr6_igfdsvd6j6nku/collection.json';
  const staticMetadataUrl = process.argv[3] || 'https://ipfs.io/ipfs/bafybeifirsttimeloyalty-nft.json'; // First-time loyalty NFT
  
  const client = await getTonClient();
  const { wallet, sender } = await getSender();
  
  // TODO: Replace with actual compiled codes
  const nftItemCode = Cell.fromBase64('NFT_ITEM_CODE_BASE64_PLACEHOLDER');
  const nftCollectionCode = Cell.fromBase64('NFT_COLLECTION_CODE_BASE64_PLACEHOLDER');
  
  const collContent = beginCell()
    .storeUint(0, 8)
    .storeStringTail(collMetadataUrl)
    .endCell();
  
  const staticContent = beginCell()
    .storeUint(0, 8)
    .storeStringTail(staticMetadataUrl)
    .endCell();
  
  const collectionConfig: NftCollectionConfig = {
    owner: wallet.address,
    nft_item_code: nftItemCode,
    coll_content: collContent,
    static_content: staticContent
  };
  
  const collectionAddress = NftCollection.getAddress(collectionConfig, nftCollectionCode, 0);
  console.log('Collection address:', collectionAddress.toString());
  
  const collection = client.open(NftCollection.createFromAddress(collectionAddress));
  
  await collection.sendDeploy(client.provider, sender, toNano('0.3'));
  
  console.log('NFT Collection deployed!');
  console.log('Address:', collectionAddress.toString());
  console.log('Owner:', wallet.address.toString());
  console.log('Static content:', staticMetadataUrl);
  console.log('\\nCompile FunC first, then deploy!');
}

main().catch(console.error);

