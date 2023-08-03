/* eslint-disable import/prefer-default-export */
import bcryptjs from 'bcryptjs';

export function hash(str: string = ''): string {
    return bcryptjs.hashSync(str, 5);
}