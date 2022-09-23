class CollaborationsHandler {
  constructor(collaborationsService, notesService, validator) {
    this.collaborationsService = collaborationsService;
    this.notesService = notesService;
    this.validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { noteId, userId } = request.payload;

    // verify if the request is from the owner of the notes
    await this.notesService.verifyNoteOwner(noteId, credentialId);

    // if yes then add that user to the collaboration of the notes
    const collaborationId = await this.collaborationsService.addCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });

    response.code(201);

    return response;
  }

  async deleteCollaborationsHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { noteId, userId } = request.payload;

    // verify if the request is from the owner of the notes
    await this.notesService.verifyNoteOwner(noteId, credentialId);

    // if yes then delete that user to the collaboration of the notes
    await this.collaborationsService.deleteCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });

    return response;
  }
}

module.exports = CollaborationsHandler;
