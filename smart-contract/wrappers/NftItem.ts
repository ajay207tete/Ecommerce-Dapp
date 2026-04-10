import { Address, beginCell, Cell, Contract, ContractProvider, Sender, Slice } from '@ton/core';

export type NftItemData = {
  init?: Address;
  index: bigint;
  collection: Address;
  owner: Address;
  content: Cell;
};

export class NftItem implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new NftItem(address);
  }

  static createFromConfig(config: NftItemData, code: Cell, workchain = 0) {
    const data = NftItem.packData(config);
    return new NftItem(contractAddress(workchain, { code, data }));
  }

  async sendTransfer(provider: ContractProvider, via: Sender, toAddress: Address, value = toNano('0.05')) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(0x5fcc3d14, 32) // transfer
        .storeAddress(toAddress)
        .storeRef(beginCell().storeUint(0, 64).endCell()) // response_dest null
        .storeUint(0, 64) // query_id
        .storeRef(beginCell().endCell()) // custom_payload empty
        .endCell(),
    });
  }

  async getNftData(provider: ContractProvider) {
    const result = provider.get('get_nft_data', []) as Cell;
    const data = NftItemData.unpack(result.beginParse());
    return data;
  }
}

export function packNftItemData(data: NftItemData): Cell {
  return beginCell()
    .storeUint(data.index, 64)
    .storeAddress(data.collection)
    .storeRef(data.content)
    .storeAddress(data.owner)
    .endCell();
}

export function unpackNftItemData(slice: Slice): NftItemData {
  return {
    index: slice.loadUintBig(64),
    collection: slice.loadAddress(),
    content: slice.loadRef(),
    owner: slice.loadAddress(),
  };
}
