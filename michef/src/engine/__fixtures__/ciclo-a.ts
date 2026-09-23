/* eslint-disable */
// FIXTURE. Un ciclo a propósito (ciclo-a ↔ ciclo-b) para que scripts/probar-reglas.js
// compruebe que `no-circular` de dependency-cruiser dispara. Nadie lo importa.
import { b } from './ciclo-b';

export const a = (): unknown => b;
