// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract ListAllTokens is Script {
    function run() external view {
        SupplyChain tracker = SupplyChain(0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9);
        
        console.log("=== TODOS LOS TOKENS EN EL SISTEMA ===");
        console.log("");
        
        // Obtener el siguiente ID de token (el último creado es nextTokenId - 1)
        uint128 nextId = tracker.nextTokenId();
        console.log("Proximo ID de token:", nextId);
        console.log("Total tokens creados:", nextId - 1);
        console.log("");
        
        // Listar todos los tokens creados
        for (uint256 tokenId = 1; tokenId < nextId; tokenId++) {
            console.log("--- Token ID:", tokenId, "---");
            console.log("");
        }
    }
}


