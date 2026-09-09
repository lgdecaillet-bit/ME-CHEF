# ME CHEF

App iOS que resuelve la fatiga de decidir qué comer. Le tomas una foto a la
nevera y en segundos tienes tres recetas con lo que hay.

- **Producto, backend y stack:** `docs/producto.html` (ábrelo en el navegador)
- **Reglas del proyecto:** `CLAUDE.md` — léelo antes de tocar código
- **Decisiones tomadas:** `docs/decisiones.md`

---

## Puesta en marcha en Windows

Todo se hace desde Windows. No hace falta un Mac: EAS Build compila y sube en la
nube.

### 0. Requisitos

- [Node.js LTS](https://nodejs.org) (incluye npm)
- [Git](https://git-scm.com)
- La app **Expo Go** en tu iPhone (App Store), para probar mientras desarrollas
- Cuenta gratuita en [expo.dev](https://expo.dev) y en [supabase.com](https://supabase.com)
- Apple Developer Program (99 USD/año) — necesario solo cuando vayas a TestFlight

Comprueba que todo está:

```bash
node -v
npm -v
git --version
```

### 1. Crear el proyecto Expo

Desde la carpeta donde quieras el repo:

```bash
npx create-expo-app@latest michef
cd michef
```

### 2. Copiar encima los archivos de este starter

Copia el contenido de este paquete dentro de `michef/`, respetando las carpetas.
Si Windows pregunta por archivos repetidos, quédate con los de este paquete
excepto `package.json` (ese lo generó Expo y no hay que tocarlo).

### 3. Instalar dependencias

```bash
npx expo install expo-sqlite expo-camera expo-notifications expo-apple-authentication expo-secure-store expo-file-system expo-background-task
npm install drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit typescript @types/react
```

### 4. Variables de entorno

```bash
copy .env.example .env
```

Rellena `.env` con la URL y la clave anónima de tu proyecto Supabase
(Settings → API). **Nunca pongas ahí claves de modelos de IA**: esas viven solo
en las Edge Functions.

### 5. Correr en tu iPhone

```bash
npx expo start
```

Escanea el QR con la cámara del iPhone. La app abre en Expo Go y recarga sola al
guardar.

### 6. Base de datos compartida

En el panel de Supabase, SQL Editor, pega y ejecuta `supabase/schema.sql`.
Crea el catálogo compartido (ingredientes, productos, precios, recetas) con
pgvector activado.

### 7. Primer build a TestFlight (cuando estés listo)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas submit --platform ios
```

EAS gestiona certificados y perfiles solo. El plan gratuito da 15 builds iOS al
mes y cada build tarda entre 15 y 35 minutos.

### 8. Git

```bash
git init
git add .
git commit -m "Base del proyecto: reglas, esquema y motor determinista"
```

Luego crea el repo en GitHub y sigue las instrucciones que te da para conectarlo.

---

## Mapa del repo

```
CLAUDE.md              reglas del proyecto — se lee en cada sesión
docs/
  producto.html        producto, backend y stack en tres pestañas
  decisiones.md        qué se decidió y por qué
src/
  db/schema.ts         datos personales (SQLite en el teléfono)
  engine/              motor determinista — sin IA, sin red, testeable
    types.ts
    portions.ts        escalar recetas al hogar
    groceries.ts       lista de mercado = necesario − inventario
    inventory.ts       fusión de escaneo y factura con el inventario
    coverage.ts        tres recetas con lo que hay
  ai/                  clientes que llaman al proxy, nunca a los modelos
supabase/
  schema.sql           catálogo compartido, sin identidad
  functions/ai-proxy/  proxy de modelos: aquí viven las keys
eval/                  harness de las 200 fotos (Promptfoo)
```

## Reglas que no se rompen

Están todas en `CLAUDE.md`. Las tres que más se olvidan:

1. Ninguna API key de modelo en la app. Todo por el proxy.
2. `src/engine/` nunca importa de `src/ai/`.
3. Una receta a partir de una foto solo usa ingredientes `seguro` más la
   despensa básica. Nunca inventar.
