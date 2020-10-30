import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import cpy from 'cpy';
import uuid from 'uuid/v4';
import yaml from 'js-yaml';
import moment, { Moment } from 'moment';
import 'moment/locale/zh-cn';
import { execFile } from 'child_process';
import { LocalStoreKey } from './localStore';

moment.locale('zh-cn');

const appRootPath = process.cwd();//应用的根目录

let keyValue: number = 0;
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
     * @param {number} offsetSecord 偏移量（若传入生成的时间戳加上偏移量）
     */
    timestamp: function (offsetSecord?: number) {
        if (offsetSecord) {
            return moment().add(offsetSecord, 's').format('YYYYMMDDHHmmss');
        } else {
            return moment().format('YYYYMMDDHHmmss');
        }
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
        if (Object.prototype.toString.call(val) === '[object Undefined]' ||
            Object.prototype.toString.call(val) === '[object Null]') {
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
     * 读取配置文件
     * @param algo 解密算法（默认rc4）
     */
    readConf(algo: string = 'rc4'): any {
        const isDev = process.env['NODE_ENV'];
        if (isDev === 'development') {
            let confPath = path.join(appRootPath, './src/config/ui.yaml');
            let chunk = fs.readFileSync(confPath, 'utf8');
            return yaml.safeLoad(chunk);
        } else {
            let confPath = path.join(appRootPath, 'resources/config/conf');
            let chunk = fs.readFileSync(confPath, 'utf8');
            const decipher = crypto.createDecipher(algo, KEY);
            let conf = decipher.update(chunk, 'hex', 'utf8');
            conf += decipher.final('utf8');
            return yaml.safeLoad(conf);
        }
    },
    /**
     * 读取JSON文件
     * @param filePath 文件路径
     */
    readJSONFile(filePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, { encoding: 'utf8' }, (err, chunk) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(chunk));
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    },
    /**
     * 写入JSON文件，原文件会覆盖
     * @param filePath 文件路径
     * @param data JSON数据
     */
    writeJSONfile(filePath: string, data: string | object | any[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let json = "";
            if (typeof data === 'string') {
                json = data;
            } else {
                try {
                    json = JSON.stringify(data);;
                } catch (error) {
                    reject(error);
                }
            }
            fs.writeFile(filePath, json, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    },
    /**
     * 验证文件是否存在
     * @param filePath 文件路径
     * @returns {Promise<boolean>} true为存在
     */
    existFile(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.access(filePath, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    },
    /**
     * 删除磁盘上的文件或目录
     * @param filePath 路径
     */
    delDiskFile(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const delExe = path.join(appRootPath, '../tools/Del/Del.exe');
            const process = execFile(delExe, [filePath], {
                windowsHide: true
            });
            process.once('close', (code) => {
                if (code == 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    },
    /**
     * 拷贝文件到某个目录下
     * @param fileList 文件路径列表
     * @param destination 目标目录，若目录不存在会按传入的层级创建
     * @returns Promise<string[]>
     */
    copyFiles(fileList: string | string[], destination: string, options?: any) {
        return cpy(fileList, destination, options);
    },
    /**
     * 获取采集单位信息
     * 未设置返回null
     * @returns 数组类型，0为单位名称，1为单位编号 如['洋桥派出所','100100203']
     */
    getUnit() {
        let unitName = localStorage.getItem(LocalStoreKey.UnitName);
        let unitCode = localStorage.getItem(LocalStoreKey.UnitCode);
        if (unitName === null || unitCode === null) {
            return null;
        } else {
            return [unitName, unitCode];
        }
    },
    /**
     * 获取目的检验单位信息
     * 未设置返回null
     * @returns 数组类型，0为单位名称，1为单位编号 如['洋桥派出所','100100203']
     */
    getDstUnit() {
        let dstUnitName = localStorage.getItem(LocalStoreKey.DstUnitName);
        let dstUnitCode = localStorage.getItem(LocalStoreKey.DstUnitCode);
        if (dstUnitName === null || dstUnitCode === null) {
            return null;
        } else {
            return [dstUnitName, dstUnitCode];
        }
    },
    /**
     * 加载线程文件
     * @param workerPath 文件路径
     * @returns Promise<Worker> 返回workerPromise
     */
    loadWorker(workerPath: string): Promise<Worker> {
        return new Promise((resolve, reject) => {
            fs.readFile(workerPath, { encoding: 'utf8' }, (err, chunk) => {
                if (err) {
                    reject(err);
                } else {
                    const sourceCode = new Blob([chunk]);
                    const worker = new Worker(URL.createObjectURL(sourceCode));
                    resolve(worker);
                }
            });
        });
    },
    /**
     * 生成UUID
     * @param len 位数（默认16位）
     */
    newId(len: number = 16) {
        return uuid().replace(/-/g, '').substring(len);
    }
};

export { helper };