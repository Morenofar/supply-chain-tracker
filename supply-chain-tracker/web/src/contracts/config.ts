// Configuración de la red Anvil (blockchain local)
export const ANVIL_NETWORK = {
  chainId: '0x7a69', // 31337 en hexadecimal
  chainName: 'Anvil Local',
  rpcUrls: ['http://127.0.0.1:8545'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: null,
};

// Cargar ABI dinámicamente (solo en el cliente)
export async function getABI() {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const response = await fetch('/contracts/SupplyChain.abi.json');
    const abi = await response.json();
    return abi;
  } catch (error) {
    console.error('Error cargando ABI:', error);
    return [];
  }
}

// Cargar Bytecode dinámicamente (solo en el cliente)
export async function getBytecode() {
  if (typeof window === 'undefined') {
    return '';
  }
  
  try {
    const response = await fetch('/contracts/SupplyChain.bytecode.json');
    const data = await response.json();
    return data.bytecode;
  } catch (error) {
    console.error('Error cargando bytecode:', error);
    return '';
  }
}

// El admin NO está hardcodeado.
// El admin es la primera cuenta que despliega el contrato.
// El contrato guarda automáticamente la dirección del deployer como admin.

// Cuentas de prueba de Anvil para desarrollo
export const ANVIL_TEST_ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Admin (Account #0)
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account #3
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Account #4
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // Account #5
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Account #6
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Account #7
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', // Account #8
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9
];
