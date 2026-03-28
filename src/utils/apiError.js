class ApiError extends Error {
    constructor( statusCode,
        message = "An error occurred",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.stack = stack;
        this.success = false;
        this.data = null;

        if(stack){
            this.stack = stack;

        }
        else{
            //we capture the stack trace excluding constructor call from it
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export { ApiError }
