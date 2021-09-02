const RewardToken = artifacts.require("RewardToken") 
const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")

module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  await deployer.deploy(RewardToken, dappToken.address, daiToken.address)
  const rewardToken = await RewardToken.deployed()


  await dappToken.transfer(rewardToken.address, '1000000000000000000000000')
  await daiToken.transfer(accounts[1], '100000000000000000000')

  console.log("Finished deployment.")
 
};
