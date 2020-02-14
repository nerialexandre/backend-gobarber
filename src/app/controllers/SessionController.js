import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

// Verificar se email é localizado e se a senha corresponde
class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      res
        .status(400)
        .json({ error: 'Verifique se o formulario foi preenchido' });
    }

    const { email, password } = req.body;

    // localiza o usuario com o email passado
    const user = await User.findOne({ where: { email } });

    // verifica se nao exite esse email
    if (!user) {
      return res.status(401).json({ error: 'Usuario nao encontrado' });
    }
    // verifica se a senha nao esta correta
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha invalida' });
    }

    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      // gerar um token de autenticacao para o Usuario
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
