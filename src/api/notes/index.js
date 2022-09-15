const AlbumsHandler = require('./handler');
const routes = require('./routes');

// The structure of plugin objects
module.exports = {
  name: 'notes',
  version: '1.0.0',

  // must have register function with server and server options as its parameter
  async register(server, { service, validator }) {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};
