import React, { Component } from 'react'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import RewardToken from '../abis/RewardToken.json'

class App extends Component {

  //Function to be triggered right after the component is mounted

  async componentDidMount() {

    //Load Web3
    await this.loadWeb3()

    //Load relevant blockchain data
    await this.getBlockChainData()
  }

  async loadWeb3() {

    //Retrieve provider informations from metamask 

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non ethereum browser detected, you should consider using metamask.')
    }
  }

  async getBlockChainData() {


    const web3 = window.web3

    //Get a list of all the accounts related to the connected blockchain net
    const accounts = await web3.eth.getAccounts()

    //Retrieve the investor's address
    this.setState({ account: accounts[0] })

    //Get the blockchain net ID
    const networkId = await web3.eth.net.getId()

    //Load the DAI contract
    const daiTokenData = DaiToken.networks[networkId]

    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })

      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()

      this.setState({ daiTokenBalance: daiTokenBalance.toString() })

    } else {

      window.alert('DaiToken contract not deployed to detected network.')

    }

    //Load the DAPP contract

    const dappTokenData = DappToken.networks[networkId]

    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })

    } else {

      window.alert('DappToken contract not deployed to detected network.')

    }

    //Load the RewardToken contract

    const rewardTokenData = RewardToken.networks[networkId]

    if (rewardTokenData) {
      const rewardToken = new web3.eth.Contract(RewardToken.abi, rewardTokenData.address)
      this.setState({ rewardToken })
      let stakingBalance = await rewardToken.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })

    } else {

      window.alert('RewardToken contract not deployed to detected network.')

    }

    this.setState({ loading: false })
  }
  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.recompenseToken._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.recompenseToken.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
        await this.getBlockChainData()
        this.setState({ loading: false })
      })
    })
  }

  //Note: not using arrow functions here would change this' context and would trigger an error
  unstakeTokens = () => {
    this.setState({ loading: true })
    this.state.recompenseToken.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', async (hash) => {
      await this.getBlockChainData()
      this.setState({ loading: false })
    })
  }


  constructor(props) {
    super(props)

    //Initialise the state

    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      rewardToken: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {

    let content
    if (this.state.loading) {
      //When data is being fetched
      content = <p id='loader' className='text-center'>loading...</p>
    } else {
      //After fetching data
      content = <Main
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
      />

    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
