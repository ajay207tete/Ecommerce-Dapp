import { 
  Address, 
  beginCell, 
  Cell, 
  Contract, 
  ContractProvider, 
  Sender, 
  Slice 
} from '@ton/core';

export type NftMintArgs = {
  toAddress: Address;
  nftItemContent: Cell;
};

export class NftCollection implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new NftCollection(address);
  }

  static createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
    const data = packNftCollectionData(config);
    const init = { code, data };
    return new NftCollection(Address.fromCellStateInit(workchain, init));
  }

  static getAddress(config: NftCollectionConfig, code: Cell, workchain = 0) {
    const data = packNftCollectionData(config);
    const init = { code, data };
    return Address.fromCellStateInit(workchain, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      body: beginCell(),
      deploy: true
    });
  }

  async sendMint(provider: ContractProvider, via: Sender, args: NftMintArgs, value = 250000000n ) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(1, 32) // mint op
        .storeAddress(args.toAddress)
        .storeRef(args.nftItemContent)
        .endCell()
    });
  }

  async getCollectionData(provider: ContractProvider): Promise<NftCollectionData> {
    const res = provider.get('get_collection_data', []) as Cell;
    return unpackNftCollectionData(res.beginParse());
  }

  async getNextSerialNumber(provider: ContractProvider): Promise<bigint> {
    const res = provider.get('get_next_item_index', []) as bigint;
    return res;
  }
}

export interface NftCollectionConfig {
  owner: Address;
  nft_item_code: Cell;
  content: Cell;
}

function packNftCollectionData(src: NftCollectionConfig): Cell {
  return beginCell()
    .storeAddress(src.owner)
    .storeRef(src.nft_item_code)
    .storeRef(src.content)
    .endCell();
}

function unpackNftCollectionData(slice: Slice): NftCollectionData {
  return {
    owner: slice.loadAddress(),
    nextItemIndex: slice.loadBigUint(64),
    content: slice.loadRef(),
  };
}

export interface NftCollectionData {
  owner: Address;
  nextItemIndex: bigint;
  content: Cell;
}

