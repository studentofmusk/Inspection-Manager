class BadRequestError extends Error {
    constructor(message){
        super(message);
        this.statusCode = 400;
    }
}
class Conflict extends Error {
    constructor(message){
        super(message);
        this.statusCode = 409;
    }
}
class NotFoundError extends Error {
    constructor(message){
        super(message);
        this.statusCode = 404;
    }
}
class InternalServerError extends Error {
    constructor(message){
        super(message);
        this.statusCode = 500;
    }
}
class AuthError extends Error {
    constructor(message){
        super(message);
        this.statusCode = 401;
    }
}
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
    }
}
class UnProcessableEntity extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 422;
    }
}

module.exports = {
    BadRequestError,
    Conflict,
    NotFoundError,
    InternalServerError,
    AuthError,
    ForbiddenError,
    UnProcessableEntity

}