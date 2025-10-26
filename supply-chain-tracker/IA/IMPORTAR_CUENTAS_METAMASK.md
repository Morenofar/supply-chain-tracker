# 🦊 Importar Cuentas de Anvil en MetaMask

## ⚠️ Problema: MetaMask Elimina Cuentas Importadas

Esto **NO es comportamiento normal** de MetaMask. Posibles causas:

1. **MetaMask está siendo reiniciado/reinstalado** de alguna forma
2. **Extensión corrupta** o con problemas
3. **Múltiples perfiles de navegador** conflictivos
4. **Versión beta/inestable** de MetaMask

---

## 🔑 Cuentas de Anvil - Importar TODAS

### Cuenta #0 - ADMIN (Despliega el Contrato)
- **Dirección**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Clave Privada**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Rol**: Administrador

### Cuenta #1 - Producer 1
- **Dirección**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Clave Privada**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Rol**: Producer

### Cuenta #2 - Factory 1
- **Dirección**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Clave Privada**: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- **Rol**: Factory

### Cuenta #3 - Retailer
- **Dirección**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- **Clave Privada**: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
- **Rol**: Retailer

### Cuenta #4 - Consumer 1
- **Dirección**: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
- **Clave Privada**: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
- **Rol**: Consumer

### Cuenta #5 - Producer 2
- **Dirección**: `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc`
- **Clave Privada**: `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba`
- **Rol**: Producer

### Cuenta #6 - Factory 2
- **Dirección**: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
- **Clave Privada**: `0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e`
- **Rol**: Factory

### Cuenta #7 - Producer 3
- **Dirección**: `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955`
- **Clave Privada**: `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`
- **Rol**: Producer

---

## 📝 Instrucciones de Importación (Paso a Paso)

### Para Cada Cuenta:

1. **Abre MetaMask**
2. Click en el **icono de cuenta** (arriba derecha)
3. Click en **"Importar cuenta"** o **"Import account"**
4. **Selecciona**: "Importar con clave privada"
5. **Pega la clave privada** de la cuenta
6. Click en **"Importar"**
7. **Opcional**: Renombra la cuenta (click en los 3 puntos → "Detalles de la cuenta" → Editar nombre)
   - Ejemplo: `Anvil Admin`, `Anvil Producer1`, etc.

### Script Rápido para Copiar (uno por uno):

```
Cuenta #0 (ADMIN):
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Cuenta #1 (Producer1):
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Cuenta #2 (Factory1):
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Cuenta #3 (Retailer):
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Cuenta #4 (Consumer1):
0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Cuenta #5 (Producer2):
0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

Cuenta #6 (Factory2):
0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

Cuenta #7 (Producer3):
0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
```

---

## 🔍 ¿Por Qué MetaMask Elimina las Cuentas?

### Causas Comunes:

1. **🔄 Reinstalación de MetaMask**
   - Si desinstalas y reinstalas la extensión
   - Las cuentas importadas se pierden (solo se mantienen si tienes seed phrase)

2. **🧹 Limpieza de Datos del Navegador**
   - Si limpias datos de sitio/extensiones
   - Chrome → Configuración → Privacidad → Borrar datos

3. **👤 Múltiples Perfiles de Navegador**
   - Cada perfil de Chrome tiene su propia MetaMask independiente

4. **🐛 Bug de MetaMask**
   - Versión inestable o con problemas

---

## 💡 Soluciones Recomendadas

### 1. **Verificar Versión de MetaMask**
   - MetaMask → Configuración → Acerca de
   - Usa la versión **estable** (no beta/flask)

### 2. **Usar Seed Phrase (Recomendado para Producción)**
   En lugar de importar cuentas:
   - MetaMask → Crear nueva wallet con seed phrase
   - Anotar las 12-24 palabras
   - Si MetaMask se resetea, restaurar con seed phrase

### 3. **Hardhat/Foundry en Modo Determinista**
   Anvil ya usa mnemonic fijo:
   ```
   test test test test test test test test test test test junk
   ```
   
   Podrías importar en MetaMask usando esta frase en lugar de claves privadas individuales:
   - MetaMask → Importar usando frase de recuperación secreta
   - Pega: `test test test test test test test test test test test junk`
   - ✅ **Todas las cuentas de Anvil se importan automáticamente**

### 4. **Usar Otro Navegador/Perfil**
   - Crea un perfil específico de Chrome para desarrollo
   - Instala MetaMask solo ahí
   - Mantén las cuentas de desarrollo separadas

---

## 🚀 Método RÁPIDO: Importar con Seed Phrase

### Pasos:

1. **Abre MetaMask**
2. Click en el icono de cuenta → **"Agregar cuenta o hardware wallet"**
3. Selecciona **"Importar cuenta"**
4. **PERO**, si quieres importar TODAS las cuentas de Anvil a la vez:
   - Ve a MetaMask → Configuración → Avanzado
   - **"Mostrar frase de recuperación secreta"** (de tu wallet actual)
   - **GUÁRDALA** antes de continuar

5. **Método alternativo** - Crear nueva wallet con seed de Anvil:
   - **⚠️ ADVERTENCIA**: Esto REEMPLAZARÁ tu wallet actual
   - Solo hazlo si estás en un perfil de desarrollo separado
   - MetaMask → Configuración → Avanzado → "Restablecer cuenta"
   - Usa seed phrase: `test test test test test test test test test test test junk`
   - ✅ Todas las 10 cuentas de Anvil estarán disponibles

---

## ⚡ Método RECOMENDADO para Desarrollo

### Opción 1: Perfil de Chrome Separado
```bash
# Linux
google-chrome --profile-directory="Development"

# El perfil tendrá su propia MetaMask independiente
```

### Opción 2: Navegador Diferente
- Usa **Firefox** o **Brave** solo para desarrollo
- Instala MetaMask ahí
- Tu Chrome personal permanece intacto

### Opción 3: Import Script (Temporal)
Solo importa las 3-4 cuentas que usas frecuentemente:
- Account #0 (Admin)
- Account #1 (Producer1)
- Account #2 (Factory1)
- Account #3 (Retailer)

---

## 🛡️ Para Evitar Perder Cuentas

1. ✅ **Usa perfil de desarrollo separado**
2. ✅ **No limpies datos del navegador** mientras desarrollas
3. ✅ **Anota este archivo** - tienes todas las claves privadas
4. ✅ **Considera usar la seed phrase** de Anvil para importación automática

---

## 🎯 Resumen Rápido

**Para importar TODO Anvil (10 cuentas) de una vez:**
1. MetaMask → Settings → Security & Privacy
2. "Reveal Secret Recovery Phrase" → **Guarda tu phrase actual**
3. Logout de MetaMask
4. "Import using Secret Recovery Phrase"
5. Pega: `test test test test test test test test test test test junk`
6. ✅ Todas las cuentas de Anvil disponibles automáticamente

**⚠️ Solo hazlo en un perfil/navegador de desarrollo, NO en tu MetaMask principal**

---

## 📋 Checklist Post-Importación

- [ ] Cuenta Admin (0xf39F...2266) importada
- [ ] Cuenta Producer1 (0x7099...C8) importada
- [ ] Cuenta Factory1 (0x3C44...BC) importada
- [ ] Red "Anvil Local" (31337) configurada
- [ ] Verificado balance de 10,000 ETH en cada cuenta

---

**Si sigues teniendo problemas con MetaMask, considera:**
- Reinstalar la extensión desde cero
- Usar un navegador diferente
- Reportar el bug a MetaMask (es muy extraño que elimine cuentas)


