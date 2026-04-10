# TON Smart Contract TODO (Auth-Based Static/Dynamic NFTs)

## Completed
- [x] Blueprint removal & TS setup

## Auth-Based NFT Minting Plan
1. [x] Update nft-collection.fc: Add OP_MINT_STATIC=3, store static_content in data
2. [x] Update NftCollection.ts: Add sendMintStatic(), rename sendMint → sendMintDynamic
3. [x] Update deployNftCollection.ts: Fix compilation, add static_content param (first-time loyalty NFT)
4. [x] Update mintNft.ts: Add --static/--dynamic CLI flags ✓\n5. [ ] npm run build\n6. [ ] Test deploy on testnet
7. [ ] Test mintStatic (signed-in sim), mintDynamic (transaction sim)
8. [ ] Update TODO.md, complete task

