// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract CheckUser is Script {
    function run() external view {
        SupplyChain tracker = SupplyChain(0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9);
        
        address consumer1 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        
        console.log("=== ESTADO DE CONSUMER1 ===");
        console.log("Direccion:", consumer1);
        
        try tracker.getUserInfo(consumer1) returns (SupplyChain.User memory user) {
            console.log("\nUsuario EXISTE:");
            console.log("  ID:", user.id);
            console.log("  Rol:", user.role);
            console.log("  Estado:", uint(user.status), "(0=Pending, 1=Approved, 2=Rejected, 3=Canceled)");
            console.log("  Existe:", user.exists);
        } catch {
            console.log("\nUsuario NO REGISTRADO");
        }
    }
}

