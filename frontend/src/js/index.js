import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/index.css'
import { CONTRACT_ADDRESS } from './config.js'
import { ABI } from './config.js'

class App extends React.Component {
   
   constructor(props){
      super(props)
      this.state = {
         lastWinner: 0,
         numberOfBets: 0,
         minimumBet: 0,
         totalBet: 0,
         maxAmountOfBets: 0,
      }
		
      if(typeof ethereum != 'undefined'){
         console.log("Using web3 detected from external source like Metamask");
		 ethereum.send('eth_requestAccounts');
		 this.web3 = new Web3(ethereum);
      }else{
         console.log("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
         this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }
	  
	  var contractAbi = this.web3.eth.contract(ABI);
	  this.state.ContractInstance = contractAbi.at(CONTRACT_ADDRESS);
	  this.state.contractAddress = CONTRACT_ADDRESS;
	  this.state.EthereumNetworkName = this.getNetworkName();
	  
      window.a = this.state
   }
   
   getNetworkName() {
	   if (ethereum.chainId === "0x1") {
		   return "Ethereum Mainnet (Production)";
	   } else if (ethereum.chainId === "0x3") {
		   return "Ropsten Testnet Network";
	   } else if (ethereum.chainId === "0x4") {
		   return "Rinkeby Testnet Network";
	   } else if (ethereum.chainId === "0x5") {
		   return "Goerli Testnet Network";
	   } else if (ethereum.chainId === "0x6") {
		   return "Kotti Testnet Network";
	   } else if (ethereum.chainId === "0x2a") {
		   return "Kovan Testnet Network";
	   }
   }

   componentDidMount(){
      this.updateState()
      this.setupListeners()

      setInterval(this.updateState.bind(this), 7e3)
   }

   updateState(){
      this.state.ContractInstance._minimumBet((err, result) => {
         if(result != null){
            this.setState({
               minimumBet: parseFloat(this.web3.fromWei(result, 'ether'))
            })
         }
      })
      this.state.ContractInstance._totalBet((err, result) => {
         if(result != null){
            this.setState({
               totalBet: parseFloat(this.web3.fromWei(result, 'ether'))
            })
         }
      })
      this.state.ContractInstance._numberOfBets((err, result) => {
         if(result != null){
            this.setState({
               numberOfBets: parseInt(result)
            })
         }
      })
      this.state.ContractInstance._maxAmountOfBets((err, result) => {
         if(result != null){
            this.setState({
               maxAmountOfBets: parseInt(result)
            })
         }
      })
   }

   // Listen for events and executes the voteNumber method
   setupListeners(){
      let liNodes = this.refs.numbers.querySelectorAll('li')
      liNodes.forEach(number => {
         number.addEventListener('click', event => {
            event.target.className = 'number-selected'
            this.voteNumber(parseInt(event.target.innerHTML), done => {

               // Remove the other number selected
               for(let i = 0; i < liNodes.length; i++){
                  liNodes[i].className = ''
               }
            })
         })
      })
   }

   voteNumber(number, cb){
      let bet = this.refs['ether-bet'].value

      if(!bet) bet = 0.1

      if(parseFloat(bet) < this.state.minimumBet){
         alert('You must bet more than the minimum')
         cb()
      } else {
         this.state.ContractInstance.bet(number, {
            gas: 300000,
            from: this.web3.eth.accounts[0],
            value: this.web3.toWei(bet, 'ether')
         }, (err, result) => {
            cb()
         })
      }
   }

   render(){
      return (
         <div className="main-container">
            <h1>A Simple Demo Application build on Ethereum Platform</h1>
			
			<div className="block">
               <b>Ethereum Network:</b> &nbsp;
               <span>{this.state.EthereumNetworkName}</span>
            </div>
			
			<div className="block">
               <b>Smart Contract Address:</b> &nbsp;
               <span>{this.state.contractAddress}</span>
            </div>
			
            <div className="block">
               <b>Number of bets:</b> &nbsp;
               <span>{this.state.numberOfBets}</span>
            </div>

            <div className="block">
               <b>Last number winner:</b> &nbsp;
               <span>{this.state.lastWinner}</span>
            </div>

            <div className="block">
               <b>Total ether bet:</b> &nbsp;
               <span>{this.state.totalBet} ether</span>
            </div>

            <div className="block">
               <b>Minimum bet:</b> &nbsp;
               <span>{this.state.minimumBet} ether</span>
            </div>

            <div className="block">
               <b>Max amount of bets:</b> &nbsp;
               <span>{this.state.maxAmountOfBets}</span>
            </div>

            <hr/>

            <h2>Make Your Bet!</h2>

            <label>
               <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet}/></b> ether
               <br/>
            </label>

            <ul ref="numbers">
               <li>1</li>
               <li>2</li>
               <li>3</li>
               <li>4</li>
               <li>5</li>
               <li>6</li>
               <li>7</li>
               <li>8</li>
               <li>9</li>
               <li>10</li>
            </ul>

            <hr/>
			<br/>
            <div>Github Repository: <a href="https://github.com/igorya7v/ethereum-casino">https://github.com/igorya7v/ethereum-casino</a></div>
         </div>
      )
   }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)