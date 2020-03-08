import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  // listar agendamentos do usuario logado
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      // offset vai pular uma quantidade de registros definida
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  // metodo "store" para criar um novo agendamento
  async store(req, res) {
    // yup para validar os campos preenchidos no agendamento
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    // verifica se o schema foi preenchido de forma valida
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Verifique se o formulario foi preenchido corretamente',
      });
    }

    const { provider_id, date } = req.body;

    // verificação para evitar que usuario marque um agendamento consigo mesmo
    if (provider_id === req.userId) {
      return res.status(400).json({ error: 'Nao pode agendar consigo mesmo' });
    }

    // verifica se o provider_id é mesmo um provider
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'O id nao corresponde a um provider' });
    }

    // startOfHour vai arrendondar um horario para menos. Exemplo: 19:30 fica 19:00 ( retira os minutos e ficam só as horas)
    const hourStart = startOfHour(parseISO(date));

    // usando isBefore para vericar se a data agendada já passou comparando com a data atual
    if (isBefore(hourStart, new Date())) {
      return res
        .status(400)
        .json({ error: 'Data deve ser superior a data atual' });
    }

    // checar se para o horario escolhido ja existe algum agendamento
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'A data não esta disponivel' });
    }

    // cria o agendamento
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    // Notify appointment provider
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm 'h'",
      { locale: pt }
    );

    // cria a notificação
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  // deletar agendamento com no minimo 2h de antecedencia
  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      // include para retornar informacoes dos usuarios para o envio de email
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    // verifica se o usuario é o dono do agendamento para poder cancelar
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'Usuario nao autorizado. Agendamento não pertence a você',
      });
    }
    // subHours Subtrai o número especificado de horas da data especificada
    const dateWithSub = subHours(appointment.date, 2);

    // verifica se a data -2h é menor que a data atual
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Você só pode cancelar com até 2h de antecedencia',
      });
    }
    // atualiza o campo canceled_at
    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
