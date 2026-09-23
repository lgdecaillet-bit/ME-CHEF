#!/bin/sh
# El control de secretos del pre-commit, en su propio archivo desde el
# 2026-09-23 para que tenga test (scripts/__tests__/revisar-secretos.test.ts):
# el arreglo del PR #3 — que el enganche diga POR QUÉ bloquea, y distinga una
# fuga de una herramienta rota — no tenía ninguno, y la regla de CLAUDE.md es
# test antes del arreglo. Lo llama .husky/pre-commit.
#
# Se ejecuta con `sh -e`, igual que los enganches de husky: el `|| CODIGO=$?`
# de abajo es lo que impide que muera en silencio al primer fallo.
set -e

# gitleaks mira el repo; scripts/secrets-bundle.js mira lo que acaba en el
# teléfono. Son cosas distintas y hacen falta las dos.
if command -v gitleaks >/dev/null 2>&1; then
  # `gitleaks protect` está obsoleto desde 8.19; el subcomando actual es
  # `gitleaks git --staged`. Se prueba el nuevo y se cae al viejo si no existe,
  # para no romper con cualquier versión que haya instalada.
  CODIGO=0
  if gitleaks git --help >/dev/null 2>&1; then
    SALIDA=$(gitleaks git --staged --redact --no-banner 2>&1) || CODIGO=$?
  else
    SALIDA=$(gitleaks protect --staged --redact --no-banner 2>&1) || CODIGO=$?
  fi

  if [ "$CODIGO" -ne 0 ]; then
    echo "$SALIDA" >&2
    # Distinguir «hay una fuga» de «la herramienta se rompió»: si el hook grita
    # «secreto» cada vez que gitleaks falla por otra cosa, dejas de leerlo.
    if echo "$SALIDA" | grep -qiE "leaks? found|secret"; then
      echo "" >&2
      echo "  Hay un secreto en lo que ibas a commitear." >&2
      echo "" >&2
      echo "  Qué hacer:" >&2
      echo "   1. Saca el valor del archivo. Si es público va en michef/.env;" >&2
      echo "      si es un token, va en GitHub Secrets y en ningún archivo." >&2
      echo "   2. Vuelve a hacer el commit." >&2
      echo "" >&2
      echo "  NO uses --no-verify: está prohibido en CLAUDE.md." >&2
      echo "  Si esa credencial ya se subió alguna vez, revócala primero:" >&2
      echo "  git no olvida, y quien tenga el repo la tiene." >&2
    else
      echo "" >&2
      echo "  gitleaks falló, pero NO por una fuga. Lee el mensaje de arriba." >&2
    fi
    exit 1
  fi
else
  echo "AVISO: gitleaks no está instalado, no se revisaron secretos." >&2
  echo "       Instálalo con:  winget install Gitleaks.Gitleaks" >&2
  echo "       El CI lo revisa igual y bloqueará el PR (paso D5)." >&2
fi
