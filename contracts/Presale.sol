pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MissuToken.sol";

contract Presale is ReentrancyGuard{

    // The token being sold
    MissuToken public token;
    
    // The open and close time of Presale
    uint256 private openingTime;
    uint256 private closingTime;

    // Min cap and max cap
    uint256 private minCap;
    uint256 private maxCap;

    // How many token units a buyer gets per wei
    uint256 private rate;

    // Owner address
    address payable public owner;
    mapping(address => bool) public whitelist;

    // The tokens amount the buyer bought
    mapping(address => uint256) public bought_amount;

    // The user's balance
    mapping(address => uint256) public balance;

    //Lastest claim time
    mapping(address => uint256) public latestClaimTime;

    event TokenPurchase(
        address indexed buyer,
        uint256 value,
        uint256 amount
    );

    event ClaimToken(
        address indexed user,
        uint256 amount,
        uint256 time
    );

    constructor(MissuToken _token, uint256 _rate, uint256 _openingTime, uint256 _closingTime, 
                uint256 _minCap, uint256 _maxCap) payable {
        owner = payable(msg.sender);
        token = _token;
        //token.mint(address(this), 1000000); //min 1M Token to this contract address
        rate = _rate;

        require(_openingTime >= block.timestamp, "opening time must be after current timestamp");
        require(_closingTime >= _openingTime, "closing time must be after opening time");

        openingTime = _openingTime;
        closingTime = _closingTime;

        require(_minCap > 0, "min Cap must be larger than Zero");
        require(_maxCap > _minCap, "max Cap must be larger than min Cap");
        minCap = _minCap;
        maxCap = _maxCap;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Must be the Owner to perform this action!");
        _;
    }

    modifier isWhitelisted {
        require(whitelist[msg.sender], "Address is not whitelisted");
        _;
    }

    modifier onlyWhileOpen {
        require(block.timestamp >= openingTime && block.timestamp <= closingTime, "Event is not start yet or closed!");
        _;
    }

    modifier isPresaleClosed() {
        require(block.timestamp > closingTime, "The presale is not closed!");
        _;
    }

    // add one address to the whitelist
    function addToWhitelist(address _address) external onlyOwner {
      whitelist[_address] = true;
    }

    // add addresses to the whitelist
    function addAddressesToWhitelist(address[] memory _addresses) external onlyOwner {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
        }
    }

    // check if the address is whitelisted
    function hasWhitelisted(address _address) external view returns(bool){
      return whitelist[_address];
    }

    // Remove address from the whitelist
    function removeFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }
 
    // Investors can buy token only if they are whitelisted by Contract owner
    function buyTokens(address _address) public payable isWhitelisted {
        uint256 paid_amount = msg.value;
        uint256 token_amount = _caculateTokenAmount(paid_amount);
        uint256 total_amount = bought_amount[_address] + token_amount;

        require(total_amount >= minCap, "Tokens amount must be larger than min Cap");
        require(total_amount <= maxCap, "Tokens amount must be smaller than max Cap");

        bought_amount[_address] = total_amount;
        balance[_address] = balance[_address] + token_amount;
        emit TokenPurchase(_address, paid_amount, token_amount);
        //claimable_amount[_address] = token_amount;
    }

    // Trigger token claim from investor
    function claim(address _address) public payable isWhitelisted isPresaleClosed nonReentrant {
        require(_isOverOneMonth(closingTime, block.timestamp), "Tokens only claimable after one month");
        require(isClaimable(_address), "Tokens only can be claimed one per month");
        uint256 claimableAmount = getClaimableAmount(_address);
        
        require(claimableAmount > 0, "Token amount must be larger than Zero!");
        require(claimableAmount <= balance[_address], "Invalid claimable amount!");
        token.transfer(_address, claimableAmount);
        balance[_address] = balance[_address] - claimableAmount;

        emit ClaimToken(_address, claimableAmount, block.timestamp);
        latestClaimTime[_address] = block.timestamp;
    }

    // Return 25% of total tokens that investor purchased
    function getClaimableAmount(address _address) public view returns(uint256) {
        uint256 claimableAmountPerMonth = bought_amount[_address] * 25 / 100;
        //uint months = _calculateMonths(startDate, endDate);
        return claimableAmountPerMonth;
    }

    // Investor can only claim token one per month
    function isClaimable(address _address) public view returns(bool) {
        uint256 currentTime = block.timestamp;
        uint256 latestClaim = latestClaimTime[_address];
        if(currentTime > latestClaim + 30 days) {
            return true;
        }
        return false;
    }

    function _caculateTokenAmount(uint256 paid_amount) internal view returns (uint256) {
        return paid_amount * rate;
    }

    function _calculateMonths(uint startDate, uint endDate) internal pure returns(uint) {
        uint diff = endDate - startDate;
        return diff / (1 days * 30);
    }
    
    function _isOverOneMonth(uint startDate, uint endDate) internal pure returns(bool){
        uint diff = endDate - startDate;
        return (diff / (1 days * 30)) >= 1;
    }
}