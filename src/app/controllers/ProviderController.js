import User from '../models/User';
import File from '../models/File';

class ProviderController {
  // retorna todos os Users que sao marcados como provider: true
  async index(req, res) {
    const providers = await User.findAll({
      where: {
        provider: true,
      },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      // Include vai retornar alguns dados do Avatar
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(providers);
  }
}
export default new ProviderController();
