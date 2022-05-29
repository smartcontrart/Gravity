const Duality = artifacts.require("./Duality.sol");
const Ash = artifacts.require("./fakeAsh.sol");
const assert = require('assert');

contract("Duality", accounts => {
  let amount = 900*10**18;
  let signer;
  let AL = {};
  let WL;
  let amountToApprove;



  beforeEach(async() =>{
    nft = await Duality.deployed();
    ash = await Ash.deployed();
    await web3.eth.accounts.wallet.create(1)
    signer = web3.eth.accounts.wallet[0]
    amountToApprove = await nft._ashPrice.call();
  });


  it("... should create a WL", async ()=>{
    WL = [
      {"address": accounts[1], "quantity": 2},
      {"address": accounts[2], "quantity": 2},
      {"address": accounts[3], "quantity": 4},
      {"address": accounts[4], "quantity": 50}]
    const contractAddress = nft.address;
    const mintOpenedCheck = true;
    const quantityCheck = true;
    assert(await nft.setSigner(signer.address),"Could not set the signer");
    for(i=0; i < WL.length ;i ++){
      assert(web3.utils.toChecksumAddress(WL[i].address),"error")
      assert(web3.utils.toChecksumAddress(signer.address),"error")
      AL[WL[i].address] = await web3.eth.accounts.sign(web3.utils.soliditySha3(WL[i].address, await nft.address, true, true, WL[i].quantity), signer.privateKey)
    }
  })

  it("... should allow accounts to mint some ash", async ()=>{
    assert(await nft.setAshContractAddress(await ash.address) ,"Could not setup contract address");
    for(let i=0; i < 10; i++){
      await ash.mint(amount.toString(), {from: accounts[i]});
    }
    let balance = await ash.balanceOf(accounts[0]);
    assert(balance.toString() == amount.toString(), "Account[0] did not mint ash");
  })
  
  it("... should deploy with less than 4.7 mil gas", async () => {
    let DualityInstance = await Duality.new();
    let receipt = await web3.eth.getTransactionReceipt(Duality.transactionHash);
    console.log(receipt.gasUsed);
    assert(receipt.gasUsed <= 5000000, "Gas was more than 4.7 mil");
  });

  it("... should mint when Admin and closed drop", async () =>{
    assert(await nft.mintBatch(accounts[0], [1], [2], {from: accounts[0]}), 'Could not mint a token');
  })

  it("... should return the right URI", async () =>{
    assert(await nft.setURI("test"), "Could not update the URI");
    assert.equal(await nft.uri(1), "test1.json", 'Did not return the right URI');
    assert.equal(await nft.uri(2), "test2.json", 'Did not return the right URI');
    assert(await nft.setURI("https://arweave.net/mEGsCrxdcxml8r1N91KkOtzlhsCc_Dloh8WGiYVWzMg/token"), "Could not update the URI");
    for(let i=1;i<=16;i++){
      assert.equal(await nft.uri(i), `https://arweave.net/mEGsCrxdcxml8r1N91KkOtzlhsCc_Dloh8WGiYVWzMg/token${i}.json`, 'Did not return the right URI');
    }
  })

  if("... should not mint when not on the WL", async () => {
    await assert.rejects(nft.publicMint(accounts[7], [1], [1], 5, {from: accounts[1]}), 'Successfully minted without with a closed Drop');
  });

  it("... should add Admins", async () =>{
    assert(await nft.approveAdmin(accounts[1], {from: accounts[0]}));
  });

  it("... should allow to perform tasks", async () =>{
    assert(await nft.mintBatch(accounts[1], [1], [1], {from: accounts[1]}), 'Could not airdrop a token');
  })

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(nft.setRoyalties(accounts[2], 100, {from: accounts[2]}), 'could edit royalties but was not admin')
  })
  
  it("... should remove Admins", async ()=>{
    assert(await nft.revokeAdmin(accounts[1], {from: accounts[0]}));
  })

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(nft.setRoyalties(accounts[1], 100, {from: accounts[1]}), 'could edit royalties but was not admin')
  })

  it("... should allow publicMint for AL addresses", async () =>{
    assert(await nft.toggleMintState(), "Could not activate mint");
    let minter = accounts[1];
    let quantityMinted = WL[0].quantity
    assert(await ash.approve(await nft.address, (amountToApprove * quantityMinted).toString(), {from: minter}),"Could not approve ASH");
    let signature = AL[minter]
    assert(await nft.publicMint(minter, [1], [quantityMinted], quantityMinted, signature.v, signature.r, signature.s, {from: minter})); 
  })

  it("... should allow to mint in 2 times ", async () =>{
    let minter = accounts[2];
    let signature = AL[minter]
    let ALquantity = WL[1].quantity
    assert(await ash.approve(await nft.address, (ALquantity*amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    assert(await nft.publicMint(accounts[2], [1], [1], ALquantity, signature.v, signature.r, signature.s, {from: accounts[2]})); 
    assert(await nft.publicMint(accounts[2], [1], [1], ALquantity, signature.v, signature.r, signature.s, {from: accounts[2]})); 
  })

  it("... should prevent to mint more tokens than allowed", async () =>{
    let minter = accounts[3];
    let signature = AL[minter]
    let ALquantity = WL[2].quantity
    assert(await ash.approve(await nft.address, (ALquantity*amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    await assert.rejects(nft.publicMint(accounts[3], [1], [5], ALquantity, signature.v, signature.r, signature.s, {from: accounts[3]}), "Minted 3 edition of a token when shouldn't get more than 2");
    await assert.rejects(nft.publicMint(accounts[3], [1,2], [2,3], ALquantity, signature.v, signature.r, signature.s, {from: accounts[3]}), "Minted a total of 3 NFTs, when shouldn't be able to."); 
  })

  // it("... should prevent to mint 3 tokens if minting one at a time ", async () =>{
  //   let minter = accounts[3];
  //   let signature = AL[minter]
  //   assert(await ash.approve(await nft.address, (3*amountToApprove).toString(), {from: minter}),"Could not approve ASH");
  //   assert(await nft.publicMint(accounts[3], [1], [1], signature.v, signature.r, signature.s, {from: accounts[3]})); 
  //   assert(await nft.publicMint(accounts[3], [1], [1], signature.v, signature.r, signature.s, {from: accounts[3]})); 
  //   await assert.rejects(nft.publicMint(accounts[3], [1], [1], signature.v, signature.r, signature.s, {from: accounts[3]})); 
  // })

  it("... should prevent to mint 2 different tokens at once in too high quantity", async()=>{
    let minter = accounts[4];
    let signature = AL[minter]
    let ALquantity = WL[3].quantity
    assert(await ash.approve(await nft.address, (ALquantity*amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    await assert.rejects(nft.publicMint(accounts[4], [15,16], [26, 26], ALquantity, signature.v, signature.r, signature.s, {from: accounts[3]})); 
  })

  it("... should allow to mint 2 different tokens at once", async()=>{
    let minter = accounts[4];
    let signature = AL[minter]
    let ALquantity = WL[3].quantity
    assert(await ash.approve(await nft.address, ((19+19)*amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    assert(await nft.publicMint(accounts[4], [15,16], [19,19], ALquantity, signature.v, signature.r, signature.s, {from: accounts[4]})); 
  })

  // it("... should allow to merge tokens", async () =>{
  //   assert(await nft.toggleMergeState(), "Could not activate merge");
  //   assert(await nft.mintBatch(accounts[5], [1, 2, 3, 4, 5, 6], [10, 10, 10, 10, 10, 10]));
  //   let balances = []
  //   merges = [
  //     [1,2,7],
  //     [1,4,8],
  //     [1,6,9],
  //     [3,2,10],
  //     [3,4,11],
  //     [3,6,12],
  //     [5,2,13],
  //     [5,4,14],
  //     [5,6,15],
  //   ]
  //   for(i=0; i<=14; i++){
  //     balances[i] = await nft.balanceOf(accounts[4], i+1);
  //   }
  //   for(i=0; i<= merges.length-1; i++){
  //     assert(await nft.merge(accounts[5], merges[i][0], merges[i][1]), `Couldn't merge ${merges[i][0]} and ${merges[i][1]}`)
  //     assert.equal(await nft.balanceOf(accounts[5], merges[i][2]),1,`token ${merges[i][2]} not in account's wallet`)
  //   }
  // })

  // it("... should prevent to merge incompatible tokens", async () =>{
  //   assert(await nft.mintBatch(accounts[6], [1, 2, 3, 4, 5, 6], [10, 10, 10, 10, 10, 10]));
  //   let balances = []
  //   merges = [
  //     [1,3,7],
  //     [1,5,8],
  //     [1,7,9],
  //     [2,2,10],
  //     [6,4,11]
  //   ]
  //   for(i=0; i<=14; i++){
  //     balances[i] = await nft.balanceOf(accounts[6], i+1);
  //   }
  //   for(i=0; i<= merges.length-1; i++){
  //     await assert.rejects(nft.merge(accounts[6], merges[i][0], merges[i][1]), `Could merge ${merges[i][0]} and ${merges[i][1]}`)
  //   }
  // })

  it(".. should prevent to exchange a token the address do not own", async ()=>{
    assert(await nft.toggleExchangeState(), "Could not activate exchange phase");
    await assert.rejects(nft.exchange(accounts[1], 2, 3,{from: accounts[1]}), "Successfully exchanged a token not owned");
  })

  it(".. should prevent to exchange someone else's token", async ()=>{
    await assert.rejects(nft.exchange(accounts[4], 15, 3,{from: accounts[1]}), "Successfully exchanged a token owned by someone else");
  })

  it(".. should allow to exchange tokens for free the first time", async ()=>{
    assert(await nft.exchange(accounts[1], 1, 2,{from: accounts[1]}), "Could not exchange token 1 for token2");
    assert(await nft.exchange(accounts[4], 15, 1,{from: accounts[4]}), "Could not exchange token 1 for token2");
  })

  it(".. should prevent to exchange tokens for free the second time", async ()=>{
    await assert.rejects(nft.exchange(accounts[4], 15, 3,{from: accounts[4]}), "Successfully exchanged a token a second time without paying");
  })

  it(".. should allow to exchange tokens for a fee the subsequent times", async ()=>{
    let numberOfExchanges = 10;
    let exchangePrice = await nft._exchangePrice.call();
    let exchangePhase = await nft._exchangesAllowed.call();
    console.log('HERE')
    console.log(exchangePhase)
    console.log('HERE')
    for (i=1; i<numberOfExchanges; i++){
      assert(await ash.approve(await nft.address, exchangePrice.toString(), {from: accounts[4]}),"Could not approve ASH");
      assert(await nft.exchange(accounts[4], 15, 1,{from: accounts[4]}), "Could not exchange token 1 for token2");
    }
  })

  
});
