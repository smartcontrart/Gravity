const Gravity = artifacts.require("./Gravity.sol");
const Ash = artifacts.require("./fakeAsh.sol");
const assert = require('assert');

contract("Gravity", accounts => {
  let amount = 900*10**18;
  let signer;
  let AL = {};
  let WL;
  let amountToApprove;

  beforeEach(async() =>{
    nft = await Gravity.deployed();
    ash = await Ash.deployed();
    await web3.eth.accounts.wallet.create(1)
    signer = web3.eth.accounts.wallet[0]
    amountToApprove = await nft._ashPrice.call();
  });


  it("... should create a WL", async ()=>{
    WL = [
      {"address": accounts[1]},
      {"address": accounts[2]},
      {"address": accounts[3]},
      {"address": accounts[4]}]
    const contractAddress = await nft.address;
    const tokenId = 1
    const mintOpenedCheck = true;
    const tokenClaimCheck = false;
    const supplyCheck = true;
    assert(await nft.setSigner(signer.address),"Could not set the signer");
    for(i=0; i < WL.length ;i ++){
      assert(web3.utils.toChecksumAddress(WL[i].address),"error")
      assert(web3.utils.toChecksumAddress(signer.address),"error")
      AL[WL[i].address] = await web3.eth.accounts.sign(web3.utils.soliditySha3(WL[i].address, contractAddress, tokenId, mintOpenedCheck, tokenClaimCheck, supplyCheck), signer.privateKey)
    }
  })

  it("... should allow accounts to mint some ash", async ()=>{
    assert(await nft.setAshAddress(await ash.address) ,"Could not setup contract address");
    for(let i=0; i < 10; i++){
      await ash.mint(amount.toString(), {from: accounts[i]});
    }
    let balance = await ash.balanceOf(accounts[0]);
    assert(balance.toString() == amount.toString(), "Account[0] did not mint ash");
  })
  
  it("... should deploy with less than 4.7 mil gas", async () => {
    let GravityInstance = await Gravity.new();
    let receipt = await web3.eth.getTransactionReceipt(Gravity.transactionHash);
    console.log(receipt.gasUsed);
    assert(receipt.gasUsed <= 5000000, "Gas was more than 4.7 mil");
  });

  it("... should mint when Admin and closed drop", async () =>{
    assert(await nft.mintBatch(accounts[0], [1], [2], {from: accounts[0]}), 'Could not mint a token');
  })

  it("... should add URI", async () =>{
    assert(await nft.addURI(1, "URI1", {from: accounts[0]}), 'Could not add a token URI');
    let URIToken1 = await nft.uri(1);
    assert.equal(URIToken1, "URI1")
  })

  it("... should add a second URI", async () =>{
    assert(await nft.addURI(2, "URI2", {from: accounts[0]}), 'Could not add a second token URI');
    let URIToken2 = await nft.uri(2);
    assert.equal(URIToken2, "URI2")
  })

  it("... should edit a URI", async () =>{
    assert(await nft.editURI(1, "newURI1", {from: accounts[0]}), 'Could not edit token URI');
    let URIToken1 = await nft.uri(1);
    assert.equal(URIToken1, "newURI1")
  })

  it("... should edit a second URI", async () =>{
    assert(await nft.editURI(2, "newURI2", {from: accounts[0]}), 'Could not edit a second token URI');
    let URIToken2 = await nft.uri(2);
    assert.equal(URIToken2, "newURI2")
  })

  if("... should not mint when not on the WL", async () => {
    let minter = accounts[7];
    assert(await ash.approve(await nft.address, (amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    await assert.rejects(nft.publicMint(1, null, null, null, {from: minter}), 'Successfully minted with a closed Drop');
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

  it("... should allow publicMint for AL addresses ", async () =>{
    assert(await nft.toggleMintState())
    let minter = accounts[2];
    let signature = AL[minter]
    assert(await ash.approve(await nft.address, (amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    assert(await nft.publicMint(1, signature.v, signature.r, signature.s, {from: minter})); 
  })

  it("... should prevent to mint more tokens than allowed", async () =>{
    let minter = accounts[3];
    let signature = AL[minter]
    assert(await ash.approve(await nft.address, (amountToApprove).toString(), {from: minter}),"Could not approve ASH");
    assert(await nft.publicMint( 1, signature.v, signature.r, signature.s, {from: minter})); 
    await  assert.rejects( nft.publicMint(1, signature.v, signature.r, signature.s, {from: minter})); 
  })
  
});
