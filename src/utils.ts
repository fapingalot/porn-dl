import crypto from 'crypto';

export const zpad = (val: number, pad: number) => {
    let out = String(val);
    while (out.length < pad) { out = '0' + out; }
    return out;
};

export const dateToString = (date = new Date()) =>
    `${date.getFullYear()}-${zpad(date.getMonth() + 1, 2)}-${zpad(date.getDay() + 1, 2)}`;

export const UUID = () =>
    crypto.randomBytes(20).toString('base64')
        .replace(/\//g, '_')
        .replace(/\\/g, '_')
        .replace(/\+/g, '-');
