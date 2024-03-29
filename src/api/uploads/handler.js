class UploadsHandler {
    constructor(service, validator) {
        this.service = service;
        this.validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this)
    }

    async postUploadImageHandler(request, h) {
        const { data } = request.payload

        // Validate headers
        this.validator.validateImageHeaders(data.hapi.headers)

        // if validated, then write the file to storage
        const filename = await this.service.writeFile(data, data.hapi)

        const response = h.response({
            status: 'success',
            data: {
                fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
            }
        })
        response.code(201)
        return response
    }
}

module.exports = UploadsHandler;