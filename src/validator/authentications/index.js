const { PostAuthenticationPayloadSchema, PutAuthenticationPayloadSchema, DeleteAuthenticationPayloadSchema } = require('./schema');
const AuthenticationError = require('../../exceptions/AuthenticationError');

const AuthenticationValidator = {

  validatePostAuthenticationPayload(payload) {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new AuthenticationError(validationResult.error.message);
    }
  },

  validatePutAuthenticationPayload(payload) {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new AuthenticationError(validationResult.error.message);
    }
  },

  validateDeleteAuthenticationPayload(payload) {
    const validationResult = DeleteAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new AuthenticationError(validationResult.error.message);
    }
  },

};

module.exports = AuthenticationValidator;
