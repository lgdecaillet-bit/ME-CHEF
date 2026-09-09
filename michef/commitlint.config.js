// Mensajes de commit con formato Conventional Commits.
//   feat: lo que ve el usuario        fix: un bug
//   chore: andamiaje                  docs: documentación
//   test: tests                       refactor: sin cambio de comportamiento
// Ejemplo:  feat(nevera): tres recetas por cobertura
module.exports = { extends: ['@commitlint/config-conventional'] };
