@AGENTS.md

# ME CHEF — reglas provisionales hasta migrar el starter (paso D1)

Las reglas completas del proyecto están en `../michef-starter/CLAUDE.md` y se migran
aquí en el paso D1 de `docs/fases/fase-0-fundaciones.md`. **Léelo entero antes de
hacer nada.** Hasta la migración, estas reglas aplican ya:

## Al abrir sesión, antes de hablar

1. Leer `../michef-starter/CLAUDE.md` entero.
2. Leer `docs/estado.md` entero (el tablero: fase, paso, tareas tomadas, siguiente paso).
3. Leer las últimas 3 entradas de `docs/bitacora.md` (el historial).
4. Leer `docs/decisiones.md` desde la última que conocías hasta la vigente (número en
   `estado.md`).
5. Decir en una frase dónde está el proyecto y qué toca. Si Luciano no está de acuerdo,
   corregir antes de tocar nada.

## Reglas que no se negocian

- **Todo paso se aprueba antes de ejecutarse** (decisión #34). Ninguna tarea del
  roadmap (`docs/fases/`), ningún PR, ninguna instalación, ninguna migración ni cambio
  de configuración empieza sin un «adelante» explícito a ese paso concreto. Aprobar un
  paso no aprueba el siguiente. Antes de cada paso: qué se toca, qué se instala (con
  versión), qué test lo protege, cómo se verifica. Después: qué se corrió y qué salió,
  tal cual.
- **Buscar bugs es parte de escribir código** (decisión #35). Casos límite y una
  propiedad invariante por función; un bug se registra como test antes de arreglarse;
  nada se mergea en rojo; todo input externo se valida con `zod` en la frontera; ninguna
  key de modelo al alcance del bundle. Detalle en `docs/protocolos-calidad.md`.
- **La memoria vive en el repo** (decisión #36). Al cerrar cada tarea: entrada en
  `docs/bitacora.md`, `docs/estado.md` actualizado, decisiones nuevas numeradas en
  `docs/decisiones.md`. En el mismo PR que el código.
- **Revisor antes de cada PR** (decisión #37). Invocar el subagente `revisor`
  (`.claude/agents/revisor.md`) sobre el diff; solo con `APROBADO` se abre el PR.
- **Un solo agente en Fase 0** (decisión #38). Una tarea = una rama = un PR.
