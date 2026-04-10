import { 
  Address, 
  beginCell, 
  Cell, 
  Contract, 
  ContractProvider, 
  Sender, 
  Slice,
  contractAddress 
} from '@ton/core';

export type NftMintDynamicArgs = {
  toAddress: Address;
  nftItemContent: Cell;
};

export type NftMintStaticArgs = {
  toAddress: Address;
};

export class NftCollection implements Contract {
  constructor(readonly address: Address) {}
 
  static createFromAddress(address: Address) {
    return new NftCollection(address);
  }

  static createFromConfig(config: NftCollectionConfig, code: Cell, workchain = 0) {
    const data = packNftCollectionData(config);
    const init = { code, data };
    return new NftCollection(contractAddress(workchain, init));
  }

  static getAddress(config: NftCollectionConfig, code: Cell, workchain = 0) {
    const data = packNftCollectionData(config);
    const init = { code, data };
    return contractAddress(workchain, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value?: bigint) {\n    await provider.internal(via, {\n      value: value || 250000000n,\n      body: beginCell(),\n      deploy: true\n    });\n  }

  async sendMintDynamic(provider: ContractProvider, via: Sender, args: NftMintDynamicArgs, value = 250000000n ) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(1, 32) // OP_MINT
        .storeAddress(args.toAddress)
        .storeRef(args.nftItemContent)
        .endCell()
    });
  }

  async sendMintStatic(provider: ContractProvider, via: Sender, args: NftMintStaticArgs, value = 250000000n ) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(3, 32) // OP_MINT_STATIC
        .storeAddress(args.toAddress)
        .endCell()
    });
  }

  async getCollectionData(provider: ContractProvider): Promise<NftCollectionData> {
    const boc = await provider.get('get_collection_data', []);
    const cell = Cell.fromBoc(Buffer.from(boc as any))[0];
    return unpackNftCollectionData(cell.beginParse());
  }

  async getNextSerialNumber(provider: ContractProvider): Promise<bigint> {
    const data = await this.getCollectionData(provider);
    return data.nextItemIndex;
  }
}

export interface NftCollectionConfig {
  owner: Address;
  nft_item_code: Cell;
  coll_content: Cell;
  static_content: Cell;
}

export function packNftCollectionData(config: NftCollectionConfig): Cell {
  return beginCell()
    .storeAddress(config.owner)
    .storeBit(1) // mintable
    .storeUint(0, 64) // next_item_index
    .storeRef(config.nft_item_code)
    .storeRef(config.coll_content)
    .storeRef(config.static_content)
    .endCell();
}

export function unpackNftCollectionData(slice: Slice): NftCollectionData {
  return {
    mintable: slice.loadInt(1),
    owner: slice.loadAddress(),
    nextItemIndex: slice.loadUintBig(64),
    nft_item_code: slice.loadRef(),
    coll_content: slice.loadRef(),
    static_content: slice.loadRef()
  };
}

export interface NftCollectionData {
  mintable: number;
  owner: Address;
  nextItemIndex: bigint;
  nft_item_code: Cell;
  coll_content: Cell;
  static_content: Cell;
}

