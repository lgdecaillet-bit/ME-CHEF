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

Estos son los que corro yo antes de decir que algo está listo. Los pongo aquí por si
quieres comprobarlo tú mismo. Todos se corren desde **la app**.

```powershell
cd C:\Users\Luciano\Desktop\ME-CHEF\michef
```

| Comando | Qué comprueba | Qué quieres ver |
|---|---|---|
| `npx tsc --noEmit` | Que no hay errores de tipos | Que no diga nada |
| `npx expo-doctor` | Que el proyecto Expo está sano | `21/21 checks passed` |
| `npm audit` | Vulnerabilidades en las librerías | Ninguna `high` ni `critical` |
| `npx expo export --platform ios` | Que la app compila de verdad | `ios bundles (1)` |

A partir del paso D2 habrá uno solo que los corre todos:

```powershell
npm run gates
```

*(todavía no existe — se crea en D2)*

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

Comprobar que sigues conectado a las cuentas:

```powershell
gh auth status
```

```powershell
eas whoami
```

```powershell
npx supabase projects list
```

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
