// Config para upload imagens
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';
// "extname" retona a extensao do arquivo

export default {
  // storage define como seram guardados os arquivos
  storage: multer.diskStorage({
    // *diskStorage guarda os arquivos junto aos arquivos da aplicação
    destination: resolve(__dirname, '..', '..', 'temp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // "toString" ira transformar o randombytes em uma string hexadecimal nesse caso, que sera concatenado apenas com a extensão do arquivo recuperada através do método "extname"
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
