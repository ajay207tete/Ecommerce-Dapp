import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender
} from '@ton/core';

export class NftItem implements Contract {
  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new NftItem(address);
  }

  async sendTransfer(
    provider: ContractProvider,
    via: Sender,
    to: Address,
    value = 50000000n
  ) {
    await provider.internal(via, {
      value,
      body: beginCell()
        .storeUint(0x5fcc3d14, 32)
        .storeAddress(to)
        .endCell()
    });
  }

  async getNftData(provider: ContractProvider) {
    const res = await provider.get('get_nft_data', []);
    const slice = res.stack.readCell().beginParse();

    slice.loadDict(); // skip dict
    const content = slice.loadRef();
    const id = slice.loadUintBig(64);
    const collection = slice.loadAddress();
    const owner = slice.loadAddress();

    return { id, collection, owner, content };
  }
}