module.exports = {
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
    }
  },
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  },
  ForbiddenError: class ForbiddenError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenError';
    }
  },
  InternalServerError: class InternalServerError extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalServerError';
    }
  }
};
