// Enums del contrato
export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Canceled = 3,
}

// Tipos de roles
export type UserRole = 'Producer' | 'Factory' | 'Retailer' | 'Consumer';

// Interfaces para estructuras del contrato
export interface User {
  id: bigint;
  userAddress: string;
  role: UserRole;
  status: UserStatus;
  exists: boolean;
}

export interface Token {
  id: bigint;
  creator: string;
  name: string;
  totalSupply: bigint;
  features: string; // JSON string
  parentIds: bigint[];
  parentAmounts: bigint[];
  dateCreated: bigint;
  exists: boolean;
}

export interface Transfer {
  id: bigint;
  from: string;
  to: string;
  tokenId: bigint;
  dateCreated: bigint;
  amount: bigint;
  status: TransferStatus;
  exists: boolean;
}

// Tipos para features de tokens (JSON)
export interface TokenFeatures {
  tipo?: string;
  descripcion?: string;
  origen?: string;
  lote?: string;
  [key: string]: string | undefined;
}

// Estado de la wallet
export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  user: User | null;
}

// Tipo para deploy info
export interface DeployInfo {
  contractAddress: string;
  adminAddress: string;
  deployedAt: number;
}


