// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const notes = require('./api/notes/index');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes/index');

const init = async () => {
  const notesService = new NotesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log('Server running on %s', server.info.uri);
};

init();
