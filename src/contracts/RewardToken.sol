pragma solidity ^0.5.0;

import './DaiToken.sol';
import './DappToken.sol';

contract RewardToken{
    string public name = "Reward Token";

    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    mapping(address=>uint) public stakingBalance;
    mapping(address=>bool) public hasStaked;
    mapping(address=>bool) public isStaking;

    address[] public stakers;


    constructor(DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //Stake
    function stakeTokens(uint quantite) public {

        require(quantite > 0, "Quantity must be greater than 0.");
        //Staking d'une quantité de tokens
        daiToken.transferFrom(msg.sender, address(this), quantite);
        //Mise à jour de la quantité de tokens stakée de l'utilisateur
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + quantite;

        //Ajout de l'utilisateur à la liste des stakers si il n'en fait pas déjà partie.
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

    }


    //Issue tokens
    function issueTokens() public {
        require(msg.sender == owner, "Reward tokens must be issued by it's owner :)");
        for(uint i=0; i<stakers.length; i++){
            address recompenseAdresse = stakers[i];
            uint balance = stakingBalance[recompenseAdresse];
            dappToken.transfer(recompenseAdresse, balance);
        }
    }

    //Unstake

    function unstakeTokens() public {

        uint quantity = stakingBalance[msg.sender];
        require(quantity > 0, "Quantity must be greater than 0.");
        daiToken.transfer(msg.sender, quantity);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;

    }
} 