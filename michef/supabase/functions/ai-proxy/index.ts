/**
 * Punto de entrada de la Edge Function. Nada mas que esto: la logica vive en
 * `handler.ts` para que los tests la llamen sin levantar un servidor.
 */
import { manejar } from './handler.ts';

Deno.serve(manejar);
