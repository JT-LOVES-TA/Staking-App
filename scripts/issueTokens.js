const RewardToken = artifacts.require("RewardToken") 

module.exports = async function(callback) {
let rewardToken = await RewardToken.deployed();
await rewardToken.issueTokens();

console.log("Token distributed :)")
callback()
 
};
