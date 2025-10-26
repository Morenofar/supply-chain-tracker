# 🔍 Diagnóstico y Solución - MetaMask Borra Cuentas Importadas

## ⚠️ Problema: Las cuentas importadas con clave privada desaparecen

Esto **NO es comportamiento normal** de MetaMask. Vamos a diagnosticar y solucionar.

---

## 🔎 PASO 1: Verificar Permisos de MetaMask en el Navegador

### Chrome/Brave/Edge:

1. **Abre la configuración de extensiones**:
   ```
   chrome://extensions/
   ```

2. **Busca "MetaMask"** en la lista

3. **Verifica estos permisos**:
   - ✅ **Habilitado**: Debe estar ON (toggle azul)
   - ✅ **Permitir en modo incógnito**: Opcional
   - ✅ **Acceso a datos del sitio**: "En todos los sitios"
   - ✅ **Almacenamiento**: Debe tener permiso de almacenamiento

4. **Click en "Detalles"** → Verifica:
   ```
   Permisos:
   ✅ Leer y cambiar todos tus datos en los sitios web que visitas
   ✅ Mostrar notificaciones
   ✅ Acceder a los datos del portapapeles
   ```

### Firefox:

1. **about:addons**
2. Busca MetaMask
3. Verifica permisos similares

---

## 🔎 PASO 2: Verificar Datos de Almacenamiento de MetaMask

### Chrome DevTools:

1. **Abre DevTools**: `F12` o `Ctrl+Shift+I`

2. **Ve a "Application" (Aplicación)**

3. **Expande "Storage" → "IndexedDB"**
   - Busca: `metamask` o `nkbihfbeogaeaoehlefnkodbefgpgknn` (ID de MetaMask)
   - Debe tener bases de datos con datos

4. **Expande "Local Storage"**
   - Busca: `chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn`
   - Debe tener claves de configuración

5. **Si está vacío o no existe** → MetaMask se está reseteando

---

## 🔎 PASO 3: Verificar Configuración de Chrome

### A. Configuración de Privacidad:

1. **Chrome → Configuración → Privacidad y seguridad**

2. **"Cookies y otros datos de sitios"**
   - Verifica que **NO** esté en:
     - ❌ "Borrar cookies y datos de sitios al cerrar Chrome"
   - Si está activo, las extensiones se resetean al cerrar

3. **"Borrar datos de navegación"**
   - Verifica si tienes programado borrado automático
   - Desmarca "Cookies y otros datos de sitios" si está marcado

### B. Configuración de Sitios:

1. **chrome://settings/content**

2. Verifica:
   ```
   ✅ JavaScript: Permitido
   ✅ Almacenamiento local: Permitido
   ✅ Cookies: Permitidos
   ```

---

## 🔎 PASO 4: Verificar Versión y Estado de MetaMask

### A. Versión de MetaMask:

1. **MetaMask → Settings → About**
2. Versión recomendada: **11.x.x o superior** (estable)
3. Si tienes Flask o versión beta → Instala versión estable

### B. Estado del Vault:

1. **Abrir DevTools** mientras MetaMask está abierto
2. **Console** → Ejecuta:
   ```javascript
   chrome.storage.local.get(null, (items) => {
     console.log('MetaMask Storage:', items);
   });
   ```

3. Deberías ver datos, si está vacío = problema de storage

---

## 🔎 PASO 5: Diagnóstico Avanzado

### Verificar si Chrome está sincronizando extensiones:

1. **chrome://sync-internals**
2. Verifica si "Extensions" está sincronizado
3. Si está sincronizado y tienes múltiples dispositivos, puede haber conflictos

### Solución:
- Desactiva sincronización de extensiones
- O usa perfil local de Chrome solo para desarrollo

---

## 💡 SOLUCIONES

### Solución 1: Perfil de Chrome Separado (RECOMENDADO)

```bash
# Crear perfil de desarrollo permanente
google-chrome --user-data-dir="$HOME/.chrome-dev" --profile-directory="Development"
```

Beneficios:
- ✅ Datos completamente independientes
- ✅ No afecta tu Chrome personal
- ✅ MetaMask separado y permanente
- ✅ Sin conflictos de sincronización

### Solución 2: Deshabilitar Limpieza Automática

1. **chrome://settings/cookies**
2. Desmarcar: "Borrar cookies y datos de sitios al salir de Chrome"
3. En "Sitios que siempre pueden usar cookies":
   - Agregar: `chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn`

### Solución 3: Usar Seed Phrase en lugar de Claves Privadas

**Problema**: Las claves importadas individualmente son más propensas a perderse

**Solución**: Crear wallet con seed phrase de Anvil

```
Seed Phrase: test test test test test test test test test test test junk
```

Beneficios:
- ✅ Las 10 cuentas se generan automáticamente
- ✅ Solo necesitas recordar la seed phrase
- ✅ Más resistente a resets de MetaMask
- ✅ Más fácil de recuperar

#### Pasos:
1. MetaMask → **Lock** (cerrar sesión)
2. **"Import using Secret Recovery Phrase"**
3. Pegar seed phrase de Anvil
4. Crear contraseña
5. ✅ Todas las cuentas aparecen

### Solución 4: Navegador Diferente (Temporal)

Prueba con otro navegador para desarrollo:
- **Brave**: Mismo motor que Chrome pero más privacy-focused
- **Firefox**: Extensión de MetaMask independiente
- **Microsoft Edge**: Similar a Chrome

---

## 🧪 TEST RÁPIDO: ¿Persisten las Cuentas?

### Prueba esto:

1. **Importa UNA cuenta** (Admin)
2. **Cierra Chrome COMPLETAMENTE** (no solo la ventana, sino todo el navegador)
3. **Abre Chrome de nuevo**
4. **Abre MetaMask**

**¿La cuenta sigue ahí?**
- ✅ **SÍ** → El problema es otra cosa (sync, múltiples perfiles, etc.)
- ❌ **NO** → Chrome está borrando datos de extensiones

Si es NO:
```
Causa más probable: Chrome está configurado para borrar datos al cerrar
Solución: Configuración → Privacidad → Desmarcar "Borrar cookies al salir"
```

---

## 🛠️ SOLUCIÓN DEFINITIVA (Recomendada)

### Opción A: Perfil de Desarrollo Dedicado

1. **Crea perfil de Chrome**:
   - Chrome → Personas → "Agregar"
   - Nombre: "Development"

2. **En ese perfil**:
   - Instala MetaMask
   - Importa seed phrase de Anvil
   - Usa SOLO para desarrollo

3. **Ventajas**:
   - ✅ Completamente independiente
   - ✅ No afecta tu Chrome principal
   - ✅ Datos persistentes garantizados

### Opción B: Extensión Local de MetaMask

1. **Descarga MetaMask en modo desarrollador**:
   ```
   git clone https://github.com/MetaMask/metamask-extension.git
   cd metamask-extension
   yarn install
   yarn start
   ```

2. **Carga extensión sin empaquetar**:
   - `chrome://extensions/`
   - "Modo de desarrollador" ON
   - "Cargar extensión sin empaquetar"
   - Selecciona carpeta `dist/chrome`

3. **Control total** sobre la extensión

---

## 📊 Checklist de Diagnóstico

Marca cada uno:

- [ ] MetaMask habilitado en chrome://extensions/
- [ ] Permisos de almacenamiento otorgados
- [ ] NO está marcado "Borrar datos al cerrar"
- [ ] IndexedDB de MetaMask tiene datos
- [ ] Versión estable de MetaMask (no Flask/beta)
- [ ] No tienes múltiples perfiles sincronizados
- [ ] Test de cierre/apertura de Chrome (cuenta persiste)

Si todos están ✅ y aún se borran:
- Reinstala MetaMask desde cero
- Reporta bug a MetaMask
- Usa perfil de desarrollo separado (solución definitiva)

---

## 🎯 Mi Recomendación Final

Basado en que esto ha pasado **múltiples veces**:

### 1. **Usa Seed Phrase de Anvil** (método rápido)
```
test test test test test test test test test test test junk
```
- Importa todas las cuentas automáticamente
- Más resistente a resets
- Si se borra, re-importar toma 30 segundos

### 2. **Crea Perfil de Chrome Separado** (método permanente)
```bash
# Linux/WSL
google-chrome --user-data-dir="$HOME/.chrome-dev" --profile-directory="Dev"

# Windows
start chrome --user-data-dir="%USERPROFILE%\.chrome-dev" --profile-directory="Dev"
```
- Completamente aislado
- Ideal para desarrollo blockchain
- No afecta tu navegador personal

### 3. **Guarda Este Documento** (respaldo)
- Tienes todas las claves en este archivo
- Puedes re-importar en cualquier momento
- Considera usar gestor de contraseñas (solo para desarrollo)

---

## 🚨 Causas Más Probables

Basándome en que pasa repetidamente:

### 1. **Limpieza Automática de Chrome** (80% probable)
- Chrome está configurado para borrar extensiones al cerrar
- Solución: Cambiar configuración de privacidad

### 2. **Sincronización de Perfiles** (15% probable)
- Tienes Chrome sincronizado en múltiples dispositivos
- Un perfil sin MetaMask está sobrescribiendo
- Solución: Deshabilitar sync de extensiones

### 3. **Bug de MetaMask** (5% probable)
- Versión corrupta de MetaMask
- Solución: Reinstalar extensión desde Chrome Web Store

---

## 🎬 Acción Inmediata Recomendada

### Opción más rápida (2 minutos):

1. **Verifica configuración de privacidad**:
   ```
   chrome://settings/cookies
   → Desmarcar "Borrar cookies al cerrar"
   ```

2. **Importa con seed phrase** en lugar de claves:
   ```
   MetaMask → Import using Secret Recovery Phrase
   → test test test test test test test test test test test junk
   ```

3. **Cierra Chrome completamente y reabre**
   - Verifica si las cuentas persisten

4. **Si persisten** → Problema resuelto ✅
5. **Si se borran** → Usa perfil separado de Chrome

---

## 📞 Información Adicional

Si nada funciona, verifica:

1. **Antivirus/Firewall**: Algunos bloquean storage de extensiones
2. **Modo Incógnito**: No persiste datos (obviamente)
3. **Chrome en modo kiosk/empresa**: Políticas pueden borrar datos
4. **WSL2**: Si usas Chrome en Windows pero el servidor en WSL, no debería afectar
5. **Permisos de escritura**: Chrome debe poder escribir en su directorio de usuario

---

## 💾 Backup de Seguridad

Mientras tanto, guarda este archivo en un lugar seguro:

**`CUENTAS_ANVIL_BACKUP.txt`**:
```
ADMIN:     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Producer1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Factory1:  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Retailer:  0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Consumer1: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

SEED PHRASE:
test test test test test test test test test test test junk
```

---

¿Qué método quieres probar primero?

1. **Verificar configuración de privacidad de Chrome** (más común)
2. **Usar seed phrase en lugar de claves** (más rápido)
3. **Crear perfil de Chrome separado** (más permanente)
4. **Probar en otro navegador** (para descartar problema de Chrome)


