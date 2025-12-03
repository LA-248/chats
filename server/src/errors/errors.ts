export class BadRequestError extends Error {
  statusCode = 400;

  constructor(message = 'Bad Request') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;

  constructor(message = 'Unauthorised') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message = 'Not Found') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InternalServerError extends Error {
  statusCode = 500;

  constructor(message = 'Internal Server Error') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UsernameTakenError extends Error {
  statusCode = 409;

  constructor(message = 'Username is already taken') {
    super(message);
    this.name = this.constructor.name;
  }
}
