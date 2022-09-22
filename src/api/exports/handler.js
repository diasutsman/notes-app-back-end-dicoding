const ClientError = require('../../exceptions/ClientError')

class ExportsHandler {
    constructor(service, validator) {
        this.service = service;
        this.validator = validator

        this.postExportNotesHandler = this.postExportNotesHandler.bind(this)
    }

    async postExportNotesHandler(request, h) {
        try {
            this.validator.validateExportNotesPayload(request.payload)

            const message = {
                userId: request.auth.credentials.id,
                targetEmail: request.payload.targetEmail,
            }

            await this.service.sendMessage('export:notes', JSON.stringify(message))

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda dalam antrean'
            })
            response.code(201)
            return response

        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = ExportsHandler;
