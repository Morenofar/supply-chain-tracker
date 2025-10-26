// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract CheckBalances is Script {
    function run() external view {
        SupplyChain tracker = SupplyChain(0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9);
        
        // Direcciones
        address factory1 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        
        console.log("=== BALANCES DE FACTORY1 ===");
        console.log("Direccion:", factory1);
        console.log("");
        
        // Verificar tokens del 1 al 10
        for (uint256 tokenId = 1; tokenId <= 10; tokenId++) {
            uint256 balance = tracker.balanceOf(factory1, tokenId);
            
            if (balance > 0) {
                console.log("Token ID:", tokenId);
                console.log("  Balance Factory1:", balance);
                console.log("");
            }
        }
    }
}

