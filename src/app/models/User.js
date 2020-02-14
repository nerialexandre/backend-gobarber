import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

// esquema para o cadastro dos usuario no banco de dados postgres usando sequelize
class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    // Critptografar a senha quando for salvar o usuario no banco de dados
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  // funcao para checar o password criptografado
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
