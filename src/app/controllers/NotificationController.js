import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    // verifica se é um provider
    const checkIsProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'O id nao corresponde a um provider' });
    }

    // busca todas as notificaçoes para o req.userId
    const notifications = await Notification.find({
      user: req.userId,
    })
      // createdAt: -1 para organizar com a ultima notificação primeiro(formato de pilha)
      .sort({ creatdAt: -1 })
      .limit(10);
    return res.json(notifications);
  }

  async update(req, res) {
    // findByIdAndUpdate para localizar e atualizar
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
