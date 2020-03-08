import {
  startOfDay,
  endOfDay,
  format,
  setSeconds,
  setMinutes,
  setHours,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'invalid date' });
    }

    // passa a data para o formato de numero inteiro
    const searchDate = Number(date);

    const appointments = await Appointments.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          // filtra os agendamentos entre o inicio e o fim do dia passado no seachDate
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    // horarios de trabalho do provider
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
    ];

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      console.log(format(value, "yyy-MM-dd'T'HH:mm:ssxxx"));
      console.log(new Date());
      console.log(new Date());

      return {
        time,
        value: format(value, "yyy-MM-dd'T'HH:mm:ssxxx"),

        // informa se o horarios do schedule é depois do horario atual, e se ja existe appointment marcado com aquele mesmo horario
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}
export default new AvailableController();
