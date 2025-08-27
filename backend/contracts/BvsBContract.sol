// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Chainlink Price Feed Interface
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function decimals() external view returns (uint8);
}

contract BvsBContract {
    address public admin;
    AggregatorV3Interface internal priceFeed;

    // Supported tokens
    mapping(address => bool) public supportedTokens;
    mapping(address => string) public tokenSymbols;

    enum Direction { Up, Down }

    struct Trade {
        address player;
        address token;
        uint256 amount;
        Direction direction;
        uint256 placedAt;
        uint256 expiry;
        uint256 entryPrice;
        bool resolved;
        bool won;
    }

    mapping(uint256 => Trade) public trades;
    uint256 public tradeCount;

    event TradeResolved(uint256 indexed tradeId, bool won, uint256 payout);
    event TradePlaced(uint256 indexed tradeId, address indexed player, address token, uint256 amount, Direction direction);

    constructor(address _priceFeed) {
        admin = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function addSupportedToken(address _token, string memory _symbol) external onlyAdmin {
        supportedTokens[_token] = true;
        tokenSymbols[_token] = _symbol;
    }

    function removeSupportedToken(address _token) external onlyAdmin {
        supportedTokens[_token] = false;
        delete tokenSymbols[_token];
    }

    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function placeTrade(address token, uint256 amount, Direction direction, uint256 expiry) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(expiry > block.timestamp, "Expiry must be in the future");

        // Get current price as entry price
        int256 currentPrice = getLatestPrice();
        require(currentPrice > 0, "Invalid price data");

        // Transfer tokens from user to contract
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        trades[tradeCount] = Trade(
            msg.sender,
            token,
            amount,
            direction,
            block.timestamp,
            expiry,
            uint256(currentPrice),
            false,
            false
        );

        emit TradePlaced(tradeCount, msg.sender, token, amount, direction);
        tradeCount++;
    }

    function resolveTrade(uint256 id) external onlyAdmin {
        require(id < tradeCount, "Trade does not exist");
        require(!trades[id].resolved, "Trade already resolved");
        require(block.timestamp >= trades[id].expiry, "Trade not yet expired");

        Trade storage trade = trades[id];

        // Get current price for resolution
        int256 currentPrice = getLatestPrice();
        require(currentPrice > 0, "Invalid price data");

        // Determine if trade won based on direction and price movement
        bool won = false;
        if (trade.direction == Direction.Up) {
            won = uint256(currentPrice) > trade.entryPrice;
        } else {
            won = uint256(currentPrice) < trade.entryPrice;
        }

        trade.resolved = true;
        trade.won = won;

        // Calculate payout (2x for winning trades)
        uint256 payout = 0;
        if (won) {
            payout = trade.amount * 2;
            require(IERC20(trade.token).transfer(trade.player, payout), "Payout transfer failed");
        }

        emit TradeResolved(id, won, payout);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyAdmin {
        require(IERC20(token).transfer(admin, amount), "Emergency withdraw failed");
    }

    function updateAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}

