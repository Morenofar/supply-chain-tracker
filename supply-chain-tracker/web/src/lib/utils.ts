import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Acortar dirección Ethereum
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Formatear fecha desde timestamp
export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Convertir BigInt a string para JSON
export function bigIntToJSON(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(bigIntToJSON);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, bigIntToJSON(value)])
    );
  }
  return obj;
}

// Parsear features JSON
export function parseFeatures(featuresJSON: string): Record<string, any> {
  try {
    return JSON.parse(featuresJSON);
  } catch {
    return {};
  }
}

// Stringify features
export function stringifyFeatures(features: Record<string, any>): string {
  return JSON.stringify(features);
}

// Validar dirección Ethereum
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Obtener nombre del status del usuario
export function getUserStatusName(status: number): string {
  const statusNames = ['Pending', 'Approved', 'Rejected', 'Canceled'];
  return statusNames[status] || 'Unknown';
}

// Obtener nombre del status de la transferencia
export function getTransferStatusName(status: number): string {
  const statusNames = ['Pending', 'Accepted', 'Rejected', 'Canceled'];
  return statusNames[status] || 'Unknown';
}

// Obtener color del status del usuario
export function getUserStatusColor(status: number): string {
  const colors = {
    0: 'text-yellow-500', // Pending
    1: 'text-green-500',  // Approved
    2: 'text-red-500',    // Rejected
    3: 'text-gray-500',   // Canceled
  };
  return colors[status as keyof typeof colors] || 'text-gray-500';
}

// Obtener color del status de la transferencia
export function getTransferStatusColor(status: number): string {
  const colors = {
    0: 'text-yellow-500', // Pending
    1: 'text-green-500',  // Accepted
    2: 'text-red-500',    // Rejected
    3: 'text-gray-500',   // Canceled
  };
  return colors[status as keyof typeof colors] || 'text-gray-500';
}


