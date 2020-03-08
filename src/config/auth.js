export default {
  // informacoes para a geracao/autenticacao do token no SessionController
  secret: process.env.APP_SECRET,
  expiresIn: '7d',
};
