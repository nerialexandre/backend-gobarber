import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import FileController from './app/controllers/FileController';
import SessionController from './app/controllers/SessionController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// cria um usuario
routes.post('/users', UserController.store);

// inicia uma sessao por login com email e senha
routes.post('/sessions', SessionController.store);

// Middleware de Autenticação de usuario
routes.use(authMiddleware);

// lista todos os prestadores de serviço
routes.get('/providers', ProviderController.index);

// lista horarios disponiveis para o provider
routes.get('/providers/:providerId/available', AvailableController.index);

routes.put('/users', UserController.update);

// rota para o upload de imagem para avatar
routes.post('/files', upload.single('file'), FileController.store);

// cria agendamento
routes.post('/appointments', AppointmentController.store);

// lista agendamentos
routes.get('/appointments', AppointmentController.index);

// deletar agendamento com no minimo 2h de antecedência
routes.delete('/appointments/:id', AppointmentController.delete);

// listar agenda do prestador
routes.get('/schedules', ScheduleController.index);

// listar notificaçoes
routes.get('/notifications', NotificationController.index);
// marca a notificaçao como lida
routes.put('/notifications/:id', NotificationController.update);

export default routes;
