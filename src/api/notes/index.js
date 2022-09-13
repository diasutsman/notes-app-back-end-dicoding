const NotesHandler = require('./handler');
const routes = require('./routes');

// The structure of plugin objects
module.exports = {
  name: 'notes',
  version: '1.0.0',

  // must have register function with server and server options as its parameter
  async register(server, { service, validator }) {
    const notesHandler = new NotesHandler(service, validator);
    server.route(routes(notesHandler));
  },
};
