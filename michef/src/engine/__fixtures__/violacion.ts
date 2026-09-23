/* eslint-disable */
// FIXTURE. Viola las reglas a propósito para que scripts/probar-reglas.js
// compruebe que disparan. Nadie lo importa y está fuera de la ejecución normal
// de ESLint, de dependency-cruiser y de la cobertura.
//
// El `eslint-disable` de arriba NO desactiva nada: probar-reglas.js corre con
// --no-ignore y las reglas se evalúan igual. Está para que tu editor no te
// pinte el archivo de rojo mientras trabajas en otra cosa.
//
// Cada línea lleva el mensaje que tiene que salir en ELLA (desde el 2026-09-23).
// Antes se buscaba el mensaje en toda la salida, y una regla muerta quedaba
// tapada por otra viva: se podía vaciar MOTOR_NO_IA y el control seguía en «ok».
// Hay un import por cada FAMILIA de paquetes nativos y de backend de las reglas del
// motor (dependency-cruiser y ESLint), porque el patrón se quedó corto justo en las
// familias (`expo-*`, `react-native-*`) y una familia sin fixture puede morir sin
// que nadie lo vea. Las rutas locales (`src/ai`, `src/db`) y los SDK de modelos
// tienen un import de ejemplo cada una, no uno por alternativa.
import OpenAI from 'openai'; // @espera Ninguna API key de modelo
import { View } from 'react-native'; // @espera El motor es puro
import { Platform } from 'react-native/Libraries/Utilities/Platform'; // @espera El motor es puro
import { registerRootComponent } from 'expo'; // @espera El motor es puro
import * as Haptics from 'expo-haptics'; // @espera El motor es puro
import Animated from 'react-native-reanimated'; // @espera El motor es puro
import { getAssetByID } from '@react-native/assets-registry'; // @espera El motor es puro
import React from 'react'; // @espera El motor es puro
import { getConfig } from '@expo/config'; // @espera El motor es puro
import { createClient } from '@supabase/supabase-js'; // @espera El motor es puro
import * as Sentry from '@sentry/core'; // @espera El motor es puro
import PostHog from 'posthog-react-native'; // @espera El motor es puro
import { llamarModelo } from '../../ai/client'; // @espera src/engine/ no importa nada de src/ai/
import { hogar } from '../../db/schema'; // @espera El motor es puro

export function malaIdea(x: any): unknown { // @espera no-explicit-any
  console.log('esto tampoco debería pasar'); // @espera no-console
  return [OpenAI, View, Platform, registerRootComponent, Haptics, Animated, getAssetByID, React, getConfig, createClient, Sentry, PostHog, llamarModelo, hogar, x];
}
