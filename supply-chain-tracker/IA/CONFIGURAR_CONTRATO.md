# 🔧 Configurar Dirección del Contrato

## 📍 Contrato Desplegado

```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

## ⚡ OPCIÓN 1: Página Automática (Recomendada)

### **Paso 1: Abre esta URL**
```
http://localhost:3000/set-contract.html
```

### **Paso 2: Click en "Configurar y Abrir DApp"**

### **Paso 3: ¡Listo!**
- Se limpiará localStorage automáticamente
- Se guardará la dirección del contrato
- Te redirigirá a la home
- **Ya NO te pedirá desplegar el contrato** ✅

---

## 🔧 OPCIÓN 2: Consola del Navegador (Manual)

### **Paso 1: Abre la consola**
```
1. Ve a: http://localhost:3000
2. Presiona F12 (o Click derecho → Inspeccionar)
3. Ve a la pestaña "Console"
```

### **Paso 2: Copia y pega ESTE CÓDIGO COMPLETO**
```javascript
// Limpiar todo
localStorage.clear();
sessionStorage.clear();

// Configurar el contrato
const deployInfo = {
  contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  timestamp: Date.now()
};

localStorage.setItem('supplychain_deploy_info', JSON.stringify(deployInfo));

console.log('✅ Contrato configurado:', deployInfo);
console.log('🔄 Recargando página...');

// Recargar la página
setTimeout(() => {
  location.reload();
}, 1000);
```

### **Paso 3: Presiona Enter**
- Verás logs en la consola
- La página se recargará automáticamente
- **Ya NO te pedirá desplegar el contrato** ✅

---

## 🔍 VERIFICAR QUE FUNCIONÓ

Después de configurar, en la consola del navegador ejecuta:

```javascript
console.log(localStorage.getItem('supplychain_deploy_info'));
```

**Deberías ver:**
```json
{
  "contractAddress": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "adminAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": 1729964... 
}
```

---

## ✅ DESPUÉS DE CONFIGURAR

1. **Conecta MetaMask** (cualquier cuenta: Producer1, Factory1, etc.)
2. **NO debería pedir desplegar**
3. **Debería ir directo al Dashboard**
4. Si eres Producer1 o Producer2, verás tus tokens

---

## 🐛 Si Sigue Pidiendo Desplegar

### **Opción A: Forzar desde consola**
```javascript
// Borrar TODO y reconfigurar
localStorage.clear();
sessionStorage.clear();

const deployInfo = {
  contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  timestamp: Date.now()
};

localStorage.setItem('supplychain_deploy_info', JSON.stringify(deployInfo));

// Verificar que se guardó
if (localStorage.getItem('supplychain_deploy_info')) {
  console.log('✅ Guardado correctamente');
  location.reload();
} else {
  console.error('❌ No se pudo guardar');
}
```

### **Opción B: Desplegar desde la DApp**
Si nada funciona, simplemente:
1. Conecta como Admin (`0xf39F...2266`)
2. Click en "Desplegar Contrato"
3. **IMPORTANTE**: Desplegará un nuevo contrato y perderás los usuarios/tokens pre-cargados

---

## 📝 NOTA IMPORTANTE

Si despliegas desde la DApp:
- ✅ Funcionará
- ❌ Perderás los usuarios pre-aprobados
- ❌ Perderás los 3 tokens pre-creados
- ⚠️ Tendrás que registrar usuarios manualmente desde cada cuenta

**Por eso es mejor usar la Opción 1 o 2 de arriba** ☝️

---

## 🎯 RESUMEN

**Lo Más Fácil:**
```
1. http://localhost:3000/set-contract.html
2. Click "Configurar y Abrir DApp"
3. ¡Listo!
```

**Si eso no funciona:**
```
1. F12 → Console
2. Copia el código JavaScript de arriba
3. Presiona Enter
4. Espera a que recargue
```

---

**Con cualquiera de las dos opciones, el contrato se configurará correctamente** ✅


