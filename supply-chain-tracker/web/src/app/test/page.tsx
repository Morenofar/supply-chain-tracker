'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  const handleClick = async () => {
    console.log('🔘 Botón clickeado');
    
    // Verificar que MetaMask existe
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask no está instalado');
      console.error('❌ window.ethereum no existe');
      return;
    }
    
    console.log('✅ MetaMask detectado');
    
    try {
      // Solicitar cuentas
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('✅ Cuentas:', accounts);
      alert(`Conectado: ${accounts[0]}`);
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de MetaMask</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleClick} className="w-full">
            Click Aquí para Probar MetaMask
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>1. Abre la consola del navegador (F12)</p>
            <p>2. Haz click en el botón</p>
            <p>3. Verifica los logs en la consola</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


