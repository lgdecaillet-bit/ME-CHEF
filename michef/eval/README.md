# Harness de las 200 fotos

La precisión de la función central se mide con un número, no con una sensación.

## Qué se mide

De todo lo que la app marcó como **`seguro`**, qué porcentaje realmente estaba
en la nevera.

**Umbral para lanzar: > 95 %.**

Lo que no se vio (recall) importa menos: es preferible ver ocho cosas ciertas que
doce con dos falsas. Una receta con un ingrediente inventado destruye la
confianza; una receta con cinco ingredientes ciertos, no.

## El set

200 fotos de neveras reales: la de tu mamá, la tuya, amigos. Distintas luces,
distintos niveles de llenura, distintos países. Etiquetadas a mano con lo que
efectivamente hay.

Van en `eval/fotos/` (ignorada por git: son fotos de casas de gente real) con un
`etiquetas.json` al lado:

```json
{
  "foto-001.jpg": { "ingredientes": ["huevo", "tomate", "leche"], "luz": "buena" },
  "foto-002.jpg": { "ingredientes": ["cebolla", "queso"], "luz": "pobre" }
}
```

## Cómo se corre

Con [Promptfoo](https://promptfoo.dev) (open source, config en YAML, corre local).
Cada cambio de modelo, de prompt o de guía de cámara se corre contra el set
completo antes de aceptarse.

Costo por corrida: 200 fotos × 2 pasadas ≈ 2–20 USD según el modelo.

## Si no llega al 95 %

En orden: (1) mejorar la guía de cámara — la calidad de la foto explica más de
la mitad de los errores; (2) ajustar el prompt de la segunda pasada, que es la
que filtra alucinaciones; (3) subir de Gemini Flash a un modelo mayor. En esta
función el costo no se negocia.

Este set es además el primer entrenamiento del detector on-device (v2).
