# Comandos · ME CHEF

Chuleta para Luciano. **Copia y pega.** Todo es PowerShell en Windows.

Este archivo crece: cada vez que aparezca un comando nuevo en el proyecto, se añade aquí
con una explicación de qué hace. Si un comando no está en este archivo, no hace falta que
te lo sepas.

Dos rutas que se repiten todo el tiempo:

| Atajo | Ruta real |
|---|---|
| **la raíz** | `C:\Users\Luciano\Desktop\ME-CHEF` |
| **la app** | `C:\Users\Luciano\Desktop\ME-CHEF\michef` |

---

## 1 · Ver la app en el iPhone

Esto es el día a día. Deja esta terminal abierta mientras trabajas.

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
npx expo start
```

Sale un cuadrado de puntos (un QR). Apunta la cámara del iPhone y toca la notificación
que aparece: abre Expo Go con tu app dentro.

Mientras está corriendo, en esa terminal puedes pulsar:

| Tecla | Qué hace |
|---|---|
| `r` | Recarga la app en el iPhone (si se quedó pegada o ves algo viejo) |
| `j` | Abre las herramientas de depuración en el navegador |
| `Ctrl` + `C` | **Para el servidor.** Se pulsan las dos a la vez |

El iPhone y el PC tienen que estar **en la misma red WiFi**. Si no conecta, prueba:

```powershell
npx expo start --tunnel
```

Es más lento pero funciona aunque la red se porte mal.

**Si al abrir sale una pantalla roja que dice «La app no arranca sin estas variables de
entorno»**, no es un error del código: falta algo en `michef/.env` y la pantalla dice
**cuál**. Se arregla en el `.env` (§ 9), se para el servidor con `Ctrl` + `C` y se vuelve a
correr `npx expo start`. El `.env` solo se lee al arrancar el servidor.

**Si la terminal dice «Sentry está apagado: falta EXPO_PUBLIC_SENTRY_DSN»**, la app
funciona, pero sus errores no llegan a Sentry y nadie se entera de ellos. Falta el DSN en
la línea `EXPO_PUBLIC_SENTRY_DSN=` del `.env` (§ 9). Está en sentry.io → Settings →
Projects → **mechef** → **Client Keys (DSN)**, y empieza por `https://`. Se pega, se para
el servidor con `Ctrl` + `C` y se vuelve a arrancar.

**En desarrollo, debajo de «ME CHEF» hay un botón rojo, «Provocar error».** Sirve para
comprobar que Sentry recibe los errores. Al tocarlo la app muestra una pantalla roja de
error: es lo esperado. Ese botón no existe en la app que llega a los usuarios, y hay un
test que lo comprueba.

---

## 2 · Antes de arrancar: ¿en qué versión estoy?

El código vive en «ramas». `main` es la versión buena; las ramas nuevas son trabajo en
curso. Si abres la app y ves algo que no esperabas, casi siempre es que estás en otra rama.

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF
git branch --show-current
```

Te responde el nombre de la rama en la que estás. Para moverte a otra:

```powershell
git checkout main
```

```powershell
git checkout chore/F0-D1-bootstrap
```

Para ver la lista de todas las ramas que existen:

```powershell
git branch -a
```

---

## 3 · Ver qué ha cambiado

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF
git status
```

Te dice qué archivos se han tocado y no están guardados todavía. Si no dice nada
(«nothing to commit, working tree clean»), está todo guardado.

Para ver los últimos cambios guardados, con fecha y autor:

```powershell
git log --oneline -10
```

---

## 4 · Revisar y aprobar un PR

Un **PR** (pull request) es una propuesta de cambio. Se revisa y luego se aprueba.

Ver los que hay abiertos:

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF
gh pr list
```

Leer uno en la terminal (cambia el `1` por el número que quieras):

```powershell
gh pr view 1
```

Abrirlo en el navegador, que se ve mucho mejor:

```powershell
gh pr view 1 --web
```

**Aprobarlo y meterlo en `main`.** Esto es lo que haces cuando ya verificaste que
funciona en el iPhone:

```powershell
gh pr merge 1 --squash --delete-branch
git checkout main
git pull
```

Las tres líneas juntas: mete el cambio, borra la rama que sobra, te devuelve a `main`
y baja la versión actualizada. **Córrelas siempre las tres.**

---

## 5 · Comprobar que nada está roto

**El único que necesitas saber.** Corre las cuatro comprobaciones seguidas y tarda unos
doce segundos:

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
npm run gates
```

Si termina sin quejarse, está todo bien. Si se para, te dice cuál falló y por qué.

Lo que hace por dentro, por si quieres correr solo uno:

| Comando | Qué comprueba | Si falla, casi siempre es |
|---|---|---|
| `npm run typecheck` | Que no hay errores de tipos | Un nombre mal escrito o algo que falta importar |
| `npm run lint` | Errores y malas prácticas | Un `console.log` olvidado |
| `npm run arquitectura` | Las reglas de arquitectura | El motor importando algo que no debe |
| `npm test` | Que todos los tests pasan | Un test roto de verdad |
| `npm run reglas` | Que las reglas de arquitectura siguen vivas | Alguien tocó una regla y la dejó muerta |

Y estos tres, que no entran en `gates` porque tardan más:

| Comando | Qué comprueba |
|---|---|
| `npm run codigo-muerto` | Código y librerías que ya nadie usa |
| `npm run secrets:bundle` | Que ninguna contraseña acabó dentro de la app |
| `npx expo-doctor` | Que el proyecto Expo está sano (`21/21`) |

**Ver los tests mientras trabajas.** Se queda abierto y re-ejecuta al guardar:

```powershell
npm run test:watch
```

**Proteger la rama `main`.** Hace que nadie — ni tú por accidente — pueda subir algo
directo a `main` sin PR ni sin que el CI esté en verde.

```powershell
npm run reglas:rama
```

**Ya está aplicado** desde el 2026-09-10, cuando el repositorio pasó a ser público
(decisión #54). No hace falta volver a correrlo: solo si alguien cambia las reglas en
GitHub y hay que dejarlas como estaban. Es seguro repetirlo.

Si el repositorio vuelve a ser **privado**, este comando dirá que no puede: GitHub no
protege ramas privadas con la cuenta gratuita. Ahí hay que volver a la decisión #54.

**Levantar la base de datos en tu PC.** Hace falta que Docker Desktop esté abierto.
La primera vez tarda porque se descarga; después son segundos.

```powershell
npm run supabase:start
```

Cuando termina, puedes ver las tablas con el navegador en **http://localhost:54323**.

**Apagarla** cuando no la uses (libera memoria):

```powershell
npm run supabase:stop
```

**Comprobar que los candados de la base funcionan.** Esto intenta hacer, a propósito, lo
que un atacante haría — escribir precios, leer el caché de modelos — y comprueba que
falla. También prueba el proxy de IA.

```powershell
npm run supabase:test
```

Si dice que no puede conectarse, es que falta `npm run supabase:start`.

**Volver a crear la base desde cero**, aplicando todas las migraciones en limpio. Borra
los datos locales de prueba; no toca nada en internet.

```powershell
npm run supabase:reset
```

**El commit dice «AVISO: gitleaks no está instalado».**
Casi siempre significa una sola cosa: **esa terminal se abrió antes de instalar gitleaks.**
Una terminal se queda con la lista de programas que había al abrirla; instalar algo después
no la actualiza. Ciérrala, abre una nueva, y comprueba:

```powershell
gitleaks version
```

Si dice `8.30.1`, ya está: el enganche vuelve a revisar. Si dice que no se reconoce el
comando, entonces sí falta ponerlo en el PATH, y esto lo hace una sola vez (después hay
que volver a cerrar y abrir la terminal):

```powershell
$dir = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter gitleaks.exe -Recurse | Select-Object -First 1).DirectoryName
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path","User") + ";$dir", "User")
```

**Mientras salga ese aviso, tus commits pasan sin que nadie revise si llevan una clave.**
El aviso no bloquea a propósito — un enganche que se cae por no tener una herramienta
estorba más de lo que protege — pero no es decorativo: revisa a qué se debe.

**Un test se pone rojo y dice «Failing test passed».**
No es un fallo: es un aviso bueno. Significa que arreglaste uno de los errores conocidos
del motor, y ese test estaba registrado como «falla a propósito». Hay que ir a
`michef/src/engine/__tests__/bugs.test.ts`, quitarle el `.failing` a ese test, y ya queda
como un test normal que protege el arreglo.

Quedan **tres** así: BUG-2, BUG-3 y BUG-6. Los otros cuatro ya se arreglaron y sus tests
son normales. Los tres que faltan necesitan antes un catálogo de ingredientes (con la
unidad natural de cada uno y su densidad) y un sitio donde validar lo que entra; por eso
esperan, no por olvido.

**Arreglar en vez de comprobar.** Estos dos corrigen solos lo que se puede corregir solo:

```powershell
npm run lint:fix
```

```powershell
npm run format
```

---

## 6 · Node

Node es el motor que hace funcionar todo. La versión se maneja con **fnm**, que ya está
instalado. No hace falta tocar nada del sistema.

Ver qué versión estás usando:

```powershell
node -v
```

Debe responder **v22.23.2**. Si responde otra cosa, es que esa terminal se abrió antes
del cambio: ciérrala y abre una nueva.

Ver todas las versiones que tienes instaladas:

```powershell
fnm list
```

Cambiar la versión por defecto (solo si hace falta, y avísame antes):

```powershell
fnm default 22.23.2
```

---

## 7 · Las cuentas y sus llaves

Ver los secretos que tiene GitHub (solo muestra los nombres, nunca los valores):

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF
gh secret list
```

**Un secreto de GitHub no se puede leer nunca**, ni siquiera por ti. `gh secret list` solo
te dice el nombre y cuándo se guardó por última vez. Si dudas de lo que hay dentro de uno,
no hay forma de mirarlo: se sobreescribe y ya. Sobreescribir es seguro y se puede repetir
las veces que haga falta.

Corregir uno cuyo valor **no es secreto** (como el identificador del proyecto):

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF
echo "npswkfpomhinewxsmiic" | gh secret set SUPABASE_PROJECT_ID
```

Corregir uno cuyo valor **sí es secreto** (los tres tokens). Este comando te abre un
espacio para pegar el valor sin que quede escrito en el historial de la terminal. Pegas,
pulsas `Enter`, y luego `Ctrl` + `Z` y `Enter` otra vez para cerrar:

```powershell
gh secret set SUPABASE_ACCESS_TOKEN
```

Los nombres válidos son exactamente estos cuatro, sin variaciones:
`EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SENTRY_AUTH_TOKEN`.

Comprobar que el buscador de secretos está instalado y visible:

```powershell
gitleaks version
```

Debe responder `8.30.1` o superior. Si dice que no encuentra el comando cuando
acabas de instalarlo, **cierra la terminal y abre una nueva**: la que tienes
abierta se quedó con la lista de programas de antes de la instalación.

Comprobar que sigues conectado a las cuentas:

```powershell
gh auth status
```

```powershell
eas whoami
```

Debe decir `lucogav8`. **Si dice que no encuentra `eas`:** se instaló cuando usabas Node
22.12.0, y desde D2 usas 22.23.2. Cada versión de Node tiene sus propios programas
globales, así que hay que instalarlo otra vez, **una sola vez**:

```powershell
npm install -g eas-cli
```

Tu sesión de `eas` tiene **dos cuentas**: `lucogav8` (ME CHEF) y `tes0` (TESO). No pasa
nada: `app.config.ts` fija `owner: 'lucogav8'`, así que ningún comando de ME CHEF puede
acabar en la cuenta de TESO.

```powershell
npx supabase projects list
```

---

## 7b · Cuando el commit no te deja

Desde el paso D2, hacer un commit dispara revisiones automáticas. Si te rechaza, **no
es un fallo tuyo: es el sistema haciendo su trabajo.** Nunca uses `--no-verify` para
saltártelo. Está prohibido en las reglas del proyecto y anula la única red que hay.

| Lo que ves | Qué pasó | Qué haces |
|---|---|---|
| `Unexpected console statement` | Se quedó un `console.log` | Bórralo, o usa el registro del proyecto |
| `subject may not be empty` | El mensaje no tiene el formato | Escríbelo como abajo |
| `Hay un secreto en lo que ibas a commitear` | Una contraseña iba a subirse | Sácala a `.env`. Si ya se subió antes, hay que revocarla |
| `AVISO: gitleaks no está instalado` | Falta la herramienta, o el PATH está viejo | `winget install Gitleaks.Gitleaks` y **abre una terminal nueva** |
| Se para en `gates` al hacer push | Algo se rompió | Corre `npm run gates` y mira cuál falló |

**El formato del mensaje.** Empieza siempre con una palabra, dos puntos, y qué hiciste:

```
feat: la pantalla de la nevera muestra tres recetas
fix: la lista de mercado ya no suma gramos con mililitros
docs: actualizada la bitácora
chore: instalado el linter
test: tests del motor de porciones
```

Las palabras válidas son `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`,
`perf`, `build`, `ci` y `revert`.

---

## 8 · Si algo se rompe

**La app no abre en el iPhone o se ve rara.**
Pulsa `Ctrl` + `C` en la terminal, cierra Expo Go del todo en el iPhone (desliza hacia
arriba), y vuelve a correr `npx expo start`.

**Sale un error raro de librerías.**
Borra e instala de nuevo. Tarda un par de minutos:

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
Remove-Item -Recurse -Force node_modules
npm install
```

**Metro se quedó con basura en la caché.**

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
npx expo start --clear
```

**No sé dónde estoy ni qué pasó.**
Estos dos archivos te lo cuentan sin que nadie te lo explique:

```powershell
code C:\Users\Luciano\Desktop\ME-CHEF\michef\docs\estado.md
```

```powershell
code C:\Users\Luciano\Desktop\ME-CHEF\michef\docs\bitacora.md
```

---

## 9 · El archivo `.env`

Guarda los valores que la app necesita para hablar con Supabase. **Nunca sube a GitHub**:
está en el `.gitignore`, vive solo en tu PC.

Crearlo la primera vez, copiando la plantilla:

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
Copy-Item .env.example .env
```

Abrirlo para pegar los valores:

```powershell
code C:\Users\Luciano\Desktop\ME-CHEF\michef\.env
```

Dentro solo hay que rellenar **una** línea, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. El resto ya
viene puesto. Dónde encontrar ese valor y por qué solo esa, está explicado dentro del
propio `.env.example`, y en la sección de abajo.

### Qué va en `.env` y qué NO

Esta es la parte importante y vale la pena leerla una vez.

**Sí van** los valores **públicos**: viajan dentro de la app, cualquiera que descargue
ME CHEF puede verlos. No son secretos y no pasa nada. Lo que protege la base de datos no
es esconder esta llave, son las reglas de acceso del servidor (se configuran en el paso D4).

**No van** los cuatro **tokens**: `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`,
`SUPABASE_PROJECT_ID` y `SENTRY_AUTH_TOKEN`. Esos ya están cargados en GitHub y no tienen
nada que hacer en tu PC. Si uno de esos acaba en un archivo, cualquiera que lo vea puede
publicar en tu cuenta o leer tu base de datos entera.

> ### ⚠️ No borres los tokens de tu gestor de contraseñas
>
> Me dijiste que querías pegar las variables aquí «y borrarlas de la parte externa».
> Para la llave pública, perfecto. **Para los cuatro tokens, no.**
>
> GitHub guarda los secretos de forma que **no se pueden volver a leer**, ni siquiera por
> ti. Solo se pueden reemplazar. Si los borras de tu gestor de contraseñas y algún día
> hace falta uno, no habrá manera de recuperarlo: toca ir a cada servicio, revocar el
> viejo y generar uno nuevo.
>
> Déjalos donde están.

---

## 10 · Cómo se lee un comando

Por si quieres entender lo que estás pegando, en vez de solo pegarlo.

| Trozo | Qué significa |
|---|---|
| `cd <ruta>` | «Métete en esta carpeta». Todo lo que venga después pasa ahí dentro |
| `npx <algo>` | Ejecuta una herramienta sin instalarla de forma permanente |
| `npm run <algo>` | Ejecuta un atajo definido en el proyecto (están en `package.json`) |
| `git <algo>` | Habla con el control de versiones: ramas, cambios, historial |
| `gh <algo>` | Habla con GitHub: PRs, secretos, permisos |
| `--algo` | Una opción que modifica el comando. Siempre con dos guiones delante |

Y una regla que ahorra sustos: **si un comando te pide confirmación y no entiendes qué
te está preguntando, no confirmes.** Pulsa `Ctrl` + `C`, que cancela sin hacer nada, y
me lo cuentas.
