const { assert } = require('chai')

const RecompenseToken = artifacts.require("RecompenseToken") 
const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")

require('chai').use(require('chai-as-promised')).should()
function tokens(x){
    return web3.utils.toWei(x, 'ether')
}
contract('RecompenseToken', ([owner, investor])=> {

    let daiToken, recompenseToken, dappToken


    before(async ()=>{

        //Chargement des contrats

        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        recompenseToken = await RecompenseToken.new(dappToken.address, daiToken.address)
        
        //Transfert d'un million de tokens à l'app
        await dappToken.transfer(recompenseToken.address, tokens('1000000'))

        //Envoie de tokens à l'investor
        await daiToken.transfer(investor, tokens('100'), {from: owner})

    })

    describe('Mock DAI Token', async () => {
        it('has a name', async ()=>{
            const name = await daiToken.name()
            assert.equal(name,'Mock DAI Token')
        })
    } )

    describe('Reward Token', async () => {
        it('has a name', async ()=>{
            const name = await recompenseToken.name()
            assert.equal(name,'Reward Token')
        })
    } )

    describe('DApp Token', async () => {
        it('has a name', async ()=>{
            const name = await dappToken.name()
            assert.equal(name,'DApp Token')
        })
        it('has tokens', async ()=>{
            const balance = await dappToken.balanceOf(recompenseToken.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    } )
    describe('Farming tokens', async () => {
        it('a des tokens a staker',async () => {

            let result 
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), result.toString(), 'The investor has the right amount of DAI before staking.')

            await daiToken.approve(recompenseToken.address,tokens('100'), {from: investor}  )
            await recompenseToken.stakeTokens(tokens('100'), {from: investor});
            
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'The investor has the right amount of DAI after staking.')

            result = await recompenseToken.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'The contract has received 100 DAI')

            result = await recompenseToken.isStaking(investor)
            assert.equal(result , true);

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'))

            await recompenseToken.issueTokens({from: owner})

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'))

            await recompenseToken.issueTokens({from: investor}).should.be.rejected;

        })

    describe('Unstaking', async ()=>{
        it('unstaking fonctionnel', async () => {
            let result

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'), "The investor still has 0 DAI.")

            result = await recompenseToken.stakingBalance(investor)
            assert.equal(result.toString(),tokens('100'), "The contract still has 100 DAI")

            result = await recompenseToken.isStaking(investor)
            assert.equal(result , true);


            await recompenseToken.unstakeTokens({from:investor});

            result = await recompenseToken.isStaking(investor)
            assert.equal(result , false);


            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'), "The investor has retrieved his 100 DAI")

            result = await recompenseToken.stakingBalance(investor)
            assert.equal(result.toString(),tokens('0'), "0 tokens staked")
        })
    })

    })
})