import { remote } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import moment, { Moment } from 'moment';
import { execFile } from 'child_process';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

let keyValue: number = 0;
let conf: any = null;
const KEY = 'az'; //密钥

//封装工具函数
const helper = {
    EMPTY_ARRAY: [],
    EMPTY_STRING: '',
    /**
     * @description 取当前日期
     * @param format 格式化字串 默认年-月-日
     */
    getNow: function (format: string = 'YYYY-MM-DD'): string {
        return moment().format(format);
    },
    /**
     * @description 转为Moment日期格式
     * @param date 原日期字串
     * @param format 格式化字串 默认年-月-日
     * @returns Moment实例
     */
    parseDate: function (date: string, format: string = 'YYYY-MM-DD'): Moment {
        return moment(date, format);
    },
    /**
     * 得到当前时间戳
     */
    timestamp: function () {
        return moment().format('YYYYMMDDHHmmss');
    },
    /**
     * @description 生成Key值
     */
    getKey: function (): string {
        if (keyValue > 1000000) keyValue = 0;
        return `K_${++keyValue}`;
    },
    /**
     * @description 是否是null或undefined
     * @param val 任意值
     */
    isNullOrUndefined(val: any): boolean {
        if (Object.prototype.toString.call(val) === '[object Null]' ||
            Object.prototype.toString.call(val) === '[object Undefined]') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * @description 是否是null或undefined或空串
     * @param val 任意值
     */
    isNullOrUndefinedOrEmptyString(val: any): boolean {
        if (Object.prototype.toString.call(val) === '[object Undefined]' ||
            Object.prototype.toString.call(val) === '[object Null]' ||
            val == '') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * @description 是否是数组
     * @param val 任意值
     */
    isArray(val: any): boolean {
        return Object.prototype.toString.call(val) === '[object Array]';
    },
    /**
     * @description 是否是字符串
     * @param val 任意值
     */
    isString(val: any): boolean {
        return Object.prototype.toString.call(val) === '[object String]';
    },
    /**
     * @description 是否是数值
     * @param val 任意值
     */
    isNumber(val: any): boolean {
        return Object.prototype.toString.call(val) === '[object Number]';
    },
    /**
     * @description 是否是对象
     * @param val 任意值
     */
    isObject(val: any): boolean {
        return Object.prototype.toString.call(val) === '[object Object]';
    },
    /**
     * @description 是否是Promise
     * @param val 任意值
     */
    isPromise(val: any): boolean {
        if (Object.prototype.toString.call(val) === '[object Promise]' && typeof val.then === 'function') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 数字按位逗号分割
     * @param n 数值
     * @param separator 分割符
     * @param digit 打点数位
     */
    comma(n: number, separator: string = ',', digit: number = 3): string {
        if (typeof n !== 'number') {
            throw new TypeError('格式化的内容不是数值');
        }
        if (digit < 1) digit = 3;
        let result: any = null;
        let nStr = n.toString();
        let signIndex = nStr.indexOf('-');
        let [int, dec] = nStr.split('.');
        if (int.length <= digit) {
            return dec ? int + '.' + dec : int;
        } else {
            if (signIndex !== -1) {
                int = int.substring(1);
            }
            let i = 0;
            result = int.split('').reduceRight<string[]>((acc: string[], current: string) => {
                if (i == digit) {
                    acc.push(separator);
                    acc.push(current);
                    i = 1;
                } else {
                    acc.push(current);
                    i++;
                }
                return acc;
            }, []);
            if (signIndex !== -1) {
                result.push('-');
            }
            if (dec) {
                return result.reverse().join('') + '.' + dec;
            } else {
                return result.reverse().join('');
            }
        }
    },
    /**
     * 键值对字串转对象，如 name=Tom返回{name:'Tom'}
     * @param keyVal 键值对
     * @param splitChar 分割符，默认为`=`
     */
    keyValue2Obj(keyVal: string, splitChar: string = '='): Object {
        if (this.isNullOrUndefined(keyVal)) {
            return {};
        }
        let valArr = keyVal.split(splitChar);
        return {
            [valArr[0]]: valArr[1]
        }
    },
    /**
     * 运行exe文件
     * @param filePath 文件路径
     * @param args 命令参数 
     */
    runExe: function (filePath: string, args: string[] = []): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (path.extname(filePath) !== '.exe') {
                reject('非exe可执行文件');
            } else {
                execFile(filePath, args, {
                    windowsHide: false
                }, (err: Error | null) => {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve('success');
                    }
                });
            }
        });
    },
    /**
     * 参数时间是否在现在之后
     * @param currentDate 当前时间
     */
    isAfter(currentDate: Moment | undefined) {
        if (currentDate === undefined) {
            return false;
        } else {
            return currentDate.isAfter();
        }
    },
    /**
     * 参数时间是否在现在之前
     * @param currentDate 当前时间
     */
    disableBefore(currentDate: Moment | undefined) {
        if (currentDate === undefined) {
            return false;
        } else {
            return currentDate.isBefore();
        }
    },
    /**
     * @deprecated 读取ui.yaml配置文件（已废弃）
     */
    getConfig(): any {
        const appPath = remote.app.getAppPath();
        const isDev = process.env['NODE_ENV'];
        let cfgPath = '';
        if (isDev === 'development') {
            cfgPath = path.join(appPath, 'src/config/ui.yaml');
        } else {
            cfgPath = path.join(appPath, '../config/ui.yaml');
        }

        if (conf === null) {
            conf = yaml.safeLoad(fs.readFileSync(cfgPath, 'utf8'));
        }
        return conf;
    },
    /**
     * 读取配置文件
     * @param algo 解密算法（默认rc4）
     */
    readConf(algo: string = 'rc4'): any {
        const isDev = process.env['NODE_ENV'];
        if (isDev === 'development') {
            let confPath = path.join(remote.app.getAppPath(), './src/config/ui.yaml');
            let chunk = fs.readFileSync(confPath, 'utf8');
            return yaml.safeLoad(chunk);
        } else {
            let confPath = path.join(remote.app.getAppPath(), '../config/conf');
            let chunk = fs.readFileSync(confPath, 'utf8');
            const decipher = crypto.createDecipher('rc4', KEY);
            let conf = decipher.update(chunk, 'hex', 'utf8');
            conf += decipher.final('utf8');
            return yaml.safeLoad(conf);
        }
    }
};

export { helper };