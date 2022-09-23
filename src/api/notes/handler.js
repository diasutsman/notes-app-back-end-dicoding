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
    this.validator.validateNotePayload(request.payload);

    const { title = 'untitled', body, tags } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    const noteId = await this.service.addNote({
      title, body, tags, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });
    response.code(201);
    return response;
  }

  async getNotesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const notes = await this.service.getNotes(credentialId);
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Verify if the user has access to the resources
    await this.service.verifyNoteAccess(id, credentialId);
    // if yes then do the action
    const note = await this.service.getNoteById(id);

    return {
      status: 'success',
      data: {
        note,
      },
    };
  }

  async putNoteByIdHandler(request) {
    this.validator.validateNotePayload(request.payload);

    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    // Verify if the user has access to the resources
    await this.service.verifyNoteAccess(id, credentialId);

    // if yes then do the action
    await this.service.editNoteById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteNoteByIdHandler(request) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentials;

    // Verify if the user has access to the resources
    await this.service.verifyNoteOwner(id, credentialId);
    // if yes then do the action
    await this.service.deleteNoteById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = NotesHandler;
