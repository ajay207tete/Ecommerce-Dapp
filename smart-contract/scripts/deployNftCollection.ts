#!/usr/bin/env node
import { getTonClient, getSender } from '../utils/helpers';
import { Cell, toNano, beginCell } from '@ton/core';
import { NftCollection, NftCollectionConfig } from '../wrappers/NftCollection';

async function main() {
  const collMetadataUrl =
    process.argv[2] ||
    'https://ipfs.io/ipfs/YOUR_COLLECTION_METADATA.json';

  const client = await getTonClient();
  const { wallet, sender } = await getSender();

  // ✅ REPLACE AFTER BUILD
  const nftItemCode = Cell.fromBase64('PASTE_ITEM_CODE');
  const nftCollectionCode = Cell.fromBase64('PASTE_COLLECTION_CODE');

  const collectionContent = beginCell()
    .storeUint(0, 8)
    .storeStringTail(collMetadataUrl)
    .endCell();

  const config: NftCollectionConfig = {
    owner: wallet.address,
    nft_item_code: nftItemCode,
    collection_content: collectionContent
  };

  const collection = NftCollection.createFromConfig(
    config,
    nftCollectionCode
  );

  await collection.sendDeploy(
    client.provider,
    sender,
    toNano('0.3')
  );

  console.log('✅ Collection deployed');
  console.log('Address:', collection.address.toString());
}

main().catch(console.error);