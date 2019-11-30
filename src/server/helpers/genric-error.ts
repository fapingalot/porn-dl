export type HttpCode = number;

export class GenericError extends Error {
    public readonly name: string;
    public readonly message: string;
    public readonly httpCode: HttpCode;

    public readonly extra?: any;
    public readonly recoverable: boolean;

    constructor(name: string, httpCode: HttpCode, message: string, extra?: any, recoverable = true) {
        super(name);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

        this.name = name;
        this.httpCode = httpCode;
        this.message = message;
        this.extra = extra;
        this.recoverable = recoverable;

        Error.captureStackTrace(this);
    }
}

export class NotAuthenticated extends GenericError {
    static readonly DEFAULT_MESSAGE = 'You are not logged in';

    constructor(message = NotAuthenticated.DEFAULT_MESSAGE, extra?: any) {
        super('NotAuthenticated', 401, message, extra, true);
    }
}
export class NotAuthrorized extends GenericError {
    static readonly DEFAULT_MESSAGE = 'You dont have permission to do that';

    constructor(message = NotAuthrorized.DEFAULT_MESSAGE, extra?: any) {
        super('NotAuthrorized', 403, message, extra, true);
    }
}

export class InvalidState extends GenericError {
    static readonly DEFAULT_MESSAGE = 'The state is invalid';

    constructor(message = InvalidState.DEFAULT_MESSAGE, extra?: any) {
        super('InvalidState', 500, message, extra, true);
    }
}
export class MethodNotAllowed extends GenericError {
    static readonly DEFAULT_MESSAGE = 'This http method is not allowed for this route';

    constructor(message = MethodNotAllowed.DEFAULT_MESSAGE, extra?: any) {
        super('MethodNotAllowed', 405, message, extra, true);
    }
}
