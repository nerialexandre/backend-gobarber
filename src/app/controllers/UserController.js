import * as Yup from 'yup';
import User from '../models/User';

// Cadastrar novo usuario
class UserController {
  async store(req, res) {
    // eschema de validacao usando yup
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      res
        .status(400)
        .json({ error: 'Verifique se o formulario foi preenchido' });
    }

    // verifica se ja existe usuario cadastrado com o mesmo email
    const userExist = await User.findOne({ where: { email: req.body.email } });
    if (userExist) {
      res.status(400).json({ error: 'Email já cadastrado' });
    }

    // recebe os dados do usuario e os armazena
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  // atualiza usuario usando o toke para identificar o usuario
  async update(req, res) {
    // eschema de validacao usando yup
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      res
        .status(400)
        .json({ error: 'Verifique se o formulario foi preenchido' });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email && email !== user.email) {
      const userExist = await User.findOne({ where: { email } });
      if (userExist) {
        res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha invalida' });
    }
    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      provider,
    });
  }
}
export default new UserController();
