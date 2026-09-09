/* eslint-disable */
// FIXTURE. Viola las reglas a propósito para que scripts/probar-reglas.js
// compruebe que disparan. Nadie lo importa y está fuera de la ejecución normal
// de ESLint, de dependency-cruiser y de la cobertura.
//
// El `eslint-disable` de arriba NO desactiva nada: probar-reglas.js corre con
// --no-ignore y las reglas se evalúan igual. Está para que tu editor no te
// pinte el archivo de rojo mientras trabajas en otra cosa.
import OpenAI from 'openai';
import { View } from 'react-native';
import { llamarModelo } from '../../ai/client';
import { hogar } from '../../db/schema';

export function malaIdea(x: any): unknown {
  console.log('esto tampoco debería pasar');
  return [OpenAI, View, llamarModelo, hogar, x];
}
