import Joi from 'joi';

export type NodeEnv = 'production' | 'debug' | 'test' | 'development';
export class IEnvironment {
    public NODE_ENV: NodeEnv;

    public PUBLIC_URL: string;
    public PORT: number;
    public COMPRESSION: boolean;

    public SSL: {
        ENABLED: boolean;
        KEY_PATH: string;
        CERT_PATH: string;
    };

    public CORS: {
        ENABLED: boolean;
        ALLOWED_ORIGINS: string[];
        ALLOWED_METHODS: string[];
        ALLOWED_HEADERS: string[];
        EXPOSED_HEADERS: string[];
        ALLOW_CREDENTIALS: boolean;
        MAX_AGE: number;
    };

    /** https://expressjs.com/en/guide/behind-proxies.html */
    public ALLOW_TERMINATION_FROM?: string[];

    public API_KEY: string;
    public API_SECRET: string;
}

type JoiObject<T> = { [P in keyof T]: any };
const Schema: any = Joi.object({
    NODE_ENV: Joi.string().allow('production', 'debug', 'test', 'development').default('development'),

    PUBLIC_URL: Joi.string().uri({ scheme: ['http', 'https'] }),
    PORT: Joi.number().integer().port().default(8080),
    COMPRESSION: Joi.boolean().default(false),

    SSL: Joi.object({
        ENABLED: Joi
            .boolean()
            .default(false)
            .when('ALLOW_TERMINATION_FROM', { is: Joi.string().required(), then: false }),
        CERT_PATH: Joi.string().when('SSL_ENABLED', { is: true, then: Joi.required() }),
        KEY_PATH: Joi.string().when('SSL_ENABLED', { is: true, then: Joi.required() }),
    }),

    CORS: Joi.object({
        ENABLED: Joi.boolean().default(true),
        ALLOWED_ORIGINS: Joi.array().items(Joi.string()).default('*'),
        ALLOWED_METHODS: Joi.array().items(Joi.string()).default(['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']),
        ALLOWED_HEADERS: Joi.array().items(Joi.string()).default(['*']),
        EXPOSED_HEADERS: Joi.array().items(Joi.string()).default(['*']),
        ALLOW_CREDENTIALS: Joi.boolean().default(true),
        MAX_AGE: Joi.number().integer().positive().default(10),
    }),

    ALLOW_TERMINATION_FROM: Joi.string().trim(),

    API_KEY: Joi.string().min(8),
    API_SECRET: Joi.string().min(8),
} as JoiObject<IEnvironment>).and('API_KEY', 'API_SECRET').required();

export const convertToHiearchy = (schema: Joi.SchemaLike, data: any) => {
    const flattenSchema = (s: any, prefix = '') => {
        const out: any = {};
        for (const child of s._inner.children) {
            if (child.schema._type === 'object') {
                out[child.key] = flattenSchema(child.schema, child.key + '_');
            } else {
                let val = data[prefix + child.key];
                if (child.schema._type === 'array' && child.schema._inner.items[0]._type === 'string' && val) {
                    val = (val as string).split(',').map((str) => str.trim());
                }

                out[child.key] = val;
            }
        }
        return out;
    };
    return flattenSchema(schema);
};

const { error, value } = Joi.validate<IEnvironment>(
    convertToHiearchy(Schema, process.env),
    Schema,
    { stripUnknown: true, allowUnknown: true },
);
if (error) {
    console.error(`Failed valdating environment: ${error.message}`);
    process.exit(-1);
}

// Default PUBLIC URL
if (!value.PUBLIC_URL) {
    value.PUBLIC_URL = value.SSL.ENABLED ? 'https' : 'http';
    value.PUBLIC_URL += '://localhost';
    if (!((value.SSL.ENABLED && value.PORT === 443) || (!value.SSL.ENABLED && value.PORT === 80))) {
        value.PUBLIC_URL += ':' + value.PORT;
    }
}

export default value as Readonly<IEnvironment>;
