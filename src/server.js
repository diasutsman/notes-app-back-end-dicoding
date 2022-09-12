const Hapi = require('@hapi/hapi');
const notes = require('./api/notes/index');
const NotesService = require('./services/inMemory/NotesService');
const NotesValidator = require('./validator/notes/index')

const init = async () => {
    const notesService = new NotesService()

    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*']
            }
        }
    });

    await server.register({
        plugin: notes,
        options: {
            service: notesService,
            validator: NotesValidator
        }
    })

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

init();
