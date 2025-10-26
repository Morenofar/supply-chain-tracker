# 🔧 SOLUCIÓN SIMPLE - Configurar Contrato

## ⚡ PASOS EXACTOS (2 minutos)

### **1. Abre la DApp**
```
http://localhost:3000
```

### **2. Abre la Consola del Navegador**
```
Presiona F12 → Pestaña "Console"
```

### **3. Copia y Pega TODO esto (UN SOLO BLOQUE):**

```javascript
// ========================================
// CONFIGURACIÓN DEL CONTRATO
// ========================================

// Limpiar todo
localStorage.clear();
sessionStorage.clear();

console.log('%c✅ localStorage limpiado', 'color: green; font-size: 14px');

// Configurar el contrato
const deployInfo = {
  contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  timestamp: Date.now()
};

// Guardar en localStorage con la clave correcta
localStorage.setItem('deployInfo', JSON.stringify(deployInfo));

console.log('%c✅ Contrato configurado correctamente', 'color: green; font-size: 14px');
console.log('📍 Dirección:', deployInfo.contractAddress);
console.log('👤 Admin:', deployInfo.adminAddress);

// Verificar que se guardó
const saved = localStorage.getItem('deployInfo');
if (saved) {
  console.log('%c✅ VERIFICACIÓN: Datos guardados correctamente', 'color: green; font-weight: bold; font-size: 16px');
  console.log(JSON.parse(saved));
  
  console.log('%c🔄 Recargando página en 2 segundos...', 'color: blue; font-size: 14px');
  
  setTimeout(() => {
    location.reload();
  }, 2000);
} else {
  console.error('%c❌ ERROR: No se pudo guardar en localStorage', 'color: red; font-size: 16px');
}
```

### **4. Presiona Enter**

Deberías ver en la consola:
```
✅ localStorage limpiado
✅ Contrato configurado correctamente
📍 Dirección: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
👤 Admin: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ VERIFICACIÓN: Datos guardados correctamente
{contractAddress: "0xe7f...", adminAddress: "0xf39...", timestamp: ...}
🔄 Recargando página en 2 segundos...
```

### **5. La Página se Recargará Automáticamente**

Después de recargar:
- ✅ **NO debería pedirte desplegar el contrato**
- ✅ Deberías ver el botón "Conectar MetaMask"
- ✅ Al conectar, irás directo al dashboard

---

## ✅ SI FUNCIONA:

- Conecta con Producer1 (`0x7099...79C8`)
- Ve a "Mis Tokens"
- Deberías ver 2 tokens: Tomates y Calabacines

---

## ❌ SI SIGUE PIDIENDO DESPLEGAR:

Entonces hay un problema con cómo la DApp lee localStorage. En ese caso:

### **Solución Alternativa: Desplegar desde la DApp**

Simplemente:
1. Conecta como Admin (`0xf39F...2266`)
2. Click en "Desplegar Contrato"
3. ✅ Funcionará (pero perderás los usuarios y tokens pre-cargados)

---

## 📝 IMPORTANTE:

Si despliegas desde la DApp:
- Los usuarios NO estarán pre-registrados
- Los tokens NO existirán
- Tendrás que:
  1. Conectar con cada cuenta (Producer1, Factory1, etc.)
  2. Solicitar rol desde cada cuenta
  3. Aprobarlos como Admin

**Pero el contrato SÍ tendrá Factory → Factory habilitado** ✅

---

## 🔍 PARA DEBUGEAR (Si quieres ver qué pasa):

En la consola, ejecuta:

```javascript
// Ver qué hay en localStorage
console.log('deployInfo:', localStorage.getItem('deployInfo'));
console.log('wallet_address:', localStorage.getItem('wallet_address'));

// Ver todas las claves
console.log('Todas las claves:', Object.keys(localStorage));
```

---

**Prueba primero el código JavaScript de arriba.**  
Dime qué mensajes ves en la consola después de pegarlo. 🔍


