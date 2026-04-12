import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  contractAddress
} from '@ton/core';

export type NftMintArgs = {
  toAddress: Address;
  content: Cell;
};

export class NftCollection implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new NftCollection(address);
  }

  static createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
    const data = packData(config);
    return new NftCollection(contractAddress(workchain, { code, data }));
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value = 300000000n) {
    await provider.internal(via, {
      value,
      deploy: true,
      body: beginCell().endCell()
    });
  }

  // ✅ SINGLE MINT FUNCTION
  async sendMint(provider: ContractProvider, via: Sender, args: NftMintArgs, value = 200000000n) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(1, 32) // OP_MINT
        .storeAddress(args.toAddress)
        .storeRef(args.content)
        .endCell()
    });
  }

  async getCollectionData(provider: ContractProvider) {
    const res = await provider.get('get_collection_data', []);
    const slice = res.stack.readCell().beginParse();

    return {
      mintable: slice.loadInt(1),
      owner: slice.loadAddress(),
      nextItemIndex: slice.loadUintBig(64)
    };
  }
}

export type NftCollectionConfig = {
  owner: Address;
  nft_item_code: Cell;
  collection_content: Cell;
};

function packData(config: NftCollectionConfig): Cell {
  return beginCell()
    .storeAddress(config.owner)
    .storeInt(1, 1)
    .storeUint(0, 64)
    .storeRef(config.nft_item_code)
    .storeRef(config.collection_content)
    .endCell();
}