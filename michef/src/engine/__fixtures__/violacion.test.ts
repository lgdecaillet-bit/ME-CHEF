/* eslint-disable */
// FIXTURE. Un .only hace que CI corra UN test y pase en verde con todo lo demás
// sin ejecutar. Es la forma más silenciosa de romper el gate, así que hay una
// regla que lo prohíbe y este archivo comprueba que dispara.
// Jest lo ignora: testPathIgnorePatterns excluye __fixtures__.
describe.only('no debería poder existir', () => {
  it.only('ni esto', () => {
    expect(1).toBe(1);
  });
});
