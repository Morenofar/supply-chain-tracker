// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract DeployScript is Script {
    function setUp() public {}
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying SupplyChain...");
        console.log("Deployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        SupplyChain tracker = new SupplyChain();
        
        vm.stopBroadcast();
        
        console.log("SupplyChain deployed at:", address(tracker));
        console.log("Admin address:", tracker.admin());
        
        // Verificar que el contrato funciona
        assert(tracker.isAdmin(deployer));
        console.log("Deployment verification: PASSED");
    }
}