// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IERC20 { function transferFrom(address, address, uint256) external returns (bool); }

contract TipJar {
    address public owner;
    address public payout;
    address public usdc; // optional

    event Tipped(address indexed from, uint256 amount, string currency, string note);

    modifier onlyOwner(){ require(msg.sender==owner, "not owner"); _; }

    constructor(address _payout){ owner = msg.sender; payout = _payout; }

    function setPayout(address p) external onlyOwner { payout = p; }
    function setUSDC(address a) external onlyOwner { usdc = a; }

    function tipETH(string calldata note) external payable {
        require(msg.value > 0, "no value");
        (bool ok,) = payable(payout).call{value: msg.value}("");
        require(ok, "transfer fail");
        emit Tipped(msg.sender, msg.value, "ETH", note);
    }

    function tipUSDC(uint256 amount, string calldata note) external {
        require(usdc != address(0), "USDC off");
        require(IERC20(usdc).transferFrom(msg.sender, payout, amount), "transferFrom fail");
        emit Tipped(msg.sender, amount, "USDC", note);
    }
}
