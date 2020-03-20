/*--------------------------------------------------------*\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: https://hprose.com                     |
|                                                          |
| Method.ts                                                |
|                                                          |
| Method for TypeScript.                                   |
|                                                          |
| LastModified: Mar 7, 2020                                |
| Author: Ma Bingyao <andot@hprose.com>                    |
|                                                          |
\*________________________________________________________*/

export class Method {
    public missing?: boolean;
    public passContext?: boolean;
    [name: string]: any;
    constructor(
        public method: Function,
        public fullname: string = method.name,
        public target?: any,
        public paramTypes?: (Function | undefined | null)[],
    ) {
        if (fullname === '') {
            throw new Error('fullname must not be empty');
        }
    }
}

export interface MethodLike extends Method { }