import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  // conecta com banco redis
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // add jobs a fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // processa os jobs
  processQueue() {
    jobs.forEach(job => {
      // busca o bee e o handle relacionado com o job
      const { bee, handle } = this.queues[job.key];
      // .on escuta o processo e chama um metodo no caso de falha
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  // metodo para mostrar a falha
  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}
export default new Queue();
