const { BadRequestError, Conflict, InternalServerError, ForbiddenError, AuthError, NotFoundError, UnProcessableEntity } = require("./error")


const knownErrors = [
    BadRequestError,
    Conflict,
    InternalServerError,
    ForbiddenError,
    AuthError,
    NotFoundError,
    UnProcessableEntity
]

const errorHandlingMiddleware = (err, req, res, next)=>{
    for (const ErrorType of knownErrors){
        if(err instanceof ErrorType){
            return res.status(err.statusCode).send({
                success:false, 
                message:err.message
            });
        }
    }

    // If it's not one of the known errors, treat it as a 500 Internal Server Error
    console.log("Unexpected Error:");
    console.error(err); // Logging the unexpected error
    res.status(500).send({success:false, message:"Internal Server Error"})

}

module.exports = errorHandlingMiddleware;