const ClientError = require('../../exceptions/ClientError');

const serverErrorResponse = (error, h) => {
  // Server ERROR!
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami',
  });
  response.code(500);
  // eslint-disable-next-line no-console
  console.error(error);
  return response;
};

class NotesHandler {
  /**
     *
     * @param {NotesService} service
     * @param {NotesValidator} validator
     */
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this.validator.validateNotePayload(request.payload);

      const { title = 'untitled', body, tags } = request.payload;

      const noteId = await this.service.addNote({ title, body, tags });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.code);
        return response;
      }
      return serverErrorResponse(error, h);
    }
  }

  async getNotesHandler() {
    const notes = await this.service.getNotes();
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const note = await this.service.getNoteById(id);

      return {
        status: 'success',
        data: {
          note,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.code);
        return response;
      }
      return serverErrorResponse(error, h);
    }
  }

  async putNoteByIdHandler(request, h) {
    try {
      this.validator.validateNotePayload(request.payload);

      const { id } = request.params;

      await this.service.editNoteById(id, request.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.code);
        return response;
      }
      return serverErrorResponse(error, h);
    }
  }

  async deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this.service.deleteNoteById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.code);
        return response;
      }

      return serverErrorResponse(error, h);
    }
  }
}

module.exports = NotesHandler;
