import { ipcRenderer } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import net from 'net';
import path from 'path';
import cpy from 'cpy';
import uuid from 'uuid/v4';
import yaml from 'js-yaml';
import glob from 'glob';
import memoize from 'lodash/memoize';
import moment, { Moment } from 'moment';
import 'moment/locale/zh-cn';
import { exec, execFile, spawn } from 'child_process';
import { Conf } from '@src/type/model';
import { BcpEntity } from '@src/schema/socket/BcpEntity';
import { DataMode } from '@src/schema/DataMode';
import { Manufaturer } from '@src/schema/socket/Manufaturer';
import { AppCategory } from '@src/schema/AppConfig';
import { BaseApp } from '@src/schema/socket/BaseApp';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo from '@src/schema/CCaseInfo';
import { LocalStoreKey } from './localStore';

moment.locale('zh-cn');

const appRootPath = process.cwd();//应用的根目录
const KEY = 'az'; //密钥

//封装工具函数
const helper = {
    EMPTY_STRING: '',
    /**
     * 默认云取证超时时间
     */
    CLOUD_TIMEOUT: 3600,
    /**
     * 默认云取证时间间隔（秒）
     */
    CLOUD_TIMESPAN: 4,
    /**
     * 是否保活
     */
    IS_ALIVE: false,
    /**
     * 云取证App接口地址（配置文件中若没有地址则使用）
     */
    FETCH_CLOUD_APP_URL: 'http://139.9.112.8:9699/app',
    /**
     * 云取证AppMD5校验地址（配置文件中若没有地址则使用）
     */
    VALID_CLOUD_APP_URL: 'http://139.9.112.8:9699/md5',
    /**
     * @description 取当前日期
     * @param format 格式化字串 默认年-月-日
     */
    getNow(format: string = 'YYYY-MM-DD'): string {
        return moment().format(format);
    },
    /**
     * @description 转为Moment日期格式
     * @param date 原日期字串
     * @param format 格式化字串 默认年-月-日
     * @returns Moment实例
     */
    parseDate(date: string, format: string = 'YYYY-MM-DD'): Moment {
        return moment(date, format);
    },
    /**
     * 得到当前时间戳
     * @param {number} offsetSecond 偏移量（若传入生成的时间戳加上偏移量）
     */
    timestamp(offsetSecond?: number) {
        if (offsetSecond) {
            return moment().add(offsetSecond, 's').format('YYYYMMDDHHmmss');
        } else {
            return moment().format('YYYYMMDDHHmmss');
        }
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
     * 运行exe文件
     * @param filePath 文件路径
     * @param args 命令参数 
     */
    runExe(filePath: string, args: string[] = [], cwd?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (path.extname(filePath) !== '.exe') {
                reject('非exe可执行文件');
            } else {
                execFile(filePath, args, {
                    cwd,
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
     * 启动进程
     * @param {string} exeName exe名称
     * @param {string} exePath exe所在路径
     * @param {string[]} exeParams 参数
     */
    runProc(exeName: string, exePath: string, exeParams: string[] = []) {
        let handle = spawn(exeName, exeParams, {
            cwd: exePath
        });
        return handle;
    },
    /**
     * 参数时间是否在现在之后
     * @param currentDate 当前时间
     */
    isAfter(currentDate?: Moment) {
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
    readConf: memoize((algo: string = 'rc4'): Conf => {
        const isDev = process.env['NODE_ENV'];
        if (isDev === 'development') {
            let confPath = path.join(appRootPath, './src/config/ui.yaml');
            let chunk = fs.readFileSync(confPath, 'utf8');
            return yaml.safeLoad(chunk) as Conf;
        } else {
            let confPath = path.join(appRootPath, 'resources/config/conf');
            let chunk = fs.readFileSync(confPath, 'utf8');
            const decipher = crypto.createDecipher(algo, KEY);
            let conf = decipher.update(chunk, 'hex', 'utf8');
            conf += decipher.final('utf8');
            return yaml.safeLoad(conf) as Conf;
        }
    }),
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
     * 写Bcp.json文件
     * @param phonePath 手机路径
     * @param bcp BCP对象
     */
    writeBcpJson(phonePath: string, bcp: BcpEntity): Promise<void> {
        const target = path.join(phonePath, 'Bcp.json');
        return new Promise((resolve, reject) => {
            fs.writeFile(target, JSON.stringify({
                ...bcp,
                attachment: bcp.attachment ? '1' : '0',
                manufacturer: localStorage.getItem('manufacturer') ?? '',
                security_software_orgcode:
                    localStorage.getItem('security_software_orgcode') ?? '',
                materials_name: localStorage.getItem('materials_name') ?? '',
                materials_model: localStorage.getItem('materials_model') ?? '',
                materials_hardware_version:
                    localStorage.getItem('materials_hardware_version') ?? '',
                materials_software_version:
                    localStorage.getItem('materials_software_version') ?? '',
                materials_serial: localStorage.getItem('materials_serial') ?? '',
                ip_address: localStorage.getItem('ip_address') ?? ''
            }), { encoding: 'utf8' }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(void 0);
                }
            });
        });
    },
    /**
     * 保存Case.json文件
     * @param saveTo 存储位置
     * @param data 案件数据
     */
    writeCaseJson(saveTo: string, data: CCaseInfo) {
        return this.writeJSONfile(path.join(saveTo, 'Case.json'), {
            ...data,
            caseName: helper.isNullOrUndefinedOrEmptyString(data.spareName)
                ? data.m_strCaseName
                : `${data.spareName}_${helper.timestamp()}`,
            checkUnitName: data.m_strCheckUnitName ?? ''
        });
    },
    /**
     * 读取设备软硬件信息
     */
    readManufaturer(): Promise<Manufaturer> {
        const jsonPath = process.env['NODE_ENV'] === 'development'
            ? path.join(appRootPath, './data/manufaturer.json')
            : path.join(appRootPath, './resources/config/manufaturer.json');

        return new Promise((resolve, reject) => {
            fs.readFile(jsonPath, { encoding: 'utf8' }, (err, chunk) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const data: Manufaturer = JSON.parse(chunk);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                }
            })
        });
    },
    /**
     * 读取目录
     * @param filePath 路径
     */
    readDir(filePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(filePath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            })
        });
    },
    /**
     * 创建目录
     * @param dir 目录
     */
    mkDir(dir: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    },
    /**
     * 使用glob查找文件
     * @param exp Glob表达式
     * @param cwd 当前目录
     */
    glob(exp: string, cwd?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            glob(exp, { cwd }, (err, matches) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(matches);
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
    },
    /**
     * 当前模式（标准、点验、警综）
     */
    getDataMode(): DataMode {
        let mode = localStorage.getItem(LocalStoreKey.DataMode);
        if (mode === null) {
            return DataMode.Self;
        } else {
            return Number(mode);
        }
    },
    /**
     * 取磁盘容量信息
     * @param {string} diskName 盘符（如：`C:`）
     * @param {boolean} convert2GB 是否转为GB单位
     */
    getDiskInfo(diskName: string, convert2GB: boolean = false): Promise<Record<string, number>> {

        const command = `wmic logicalDisk where "Caption='${diskName}'" get FreeSpace,Size /value`;

        return new Promise((resolve, reject) => {
            exec(command, (err: Error | null, stdout: string) => {
                if (err) {
                    reject(err);
                } else {
                    let cmdResults = stdout.trim().split('\r\r\n');
                    let result = cmdResults.reduce<Record<string, number>>((total, current) => {
                        const [k, v] = current.split('=');
                        if (convert2GB) {
                            total[k] = Number.parseInt(v) / Math.pow(1024, 3);
                        } else {
                            total[k] = Number.parseInt(v);
                        }
                        return total;
                    }, {});
                    resolve(result);
                }
            });
        });
    },
    /**
     * 取全部应用
     * @param apps AppYaml配置
     * @throws 格式有误抛出TypeError
     */
    getAllApps(apps: AppCategory[]): BaseApp[] {
        if (this.isArray(apps)) {
            return apps.reduce((acc: BaseApp[], current: AppCategory) =>
                acc.concat(current.app_list.map(i => ({
                    m_strID: i.app_id,
                    m_strPktlist: i.packages,
                    name: i.name,
                    key: i.key
                }))), []);
        } else {
            throw new TypeError('应用格式错误');
        }
    },
    /**
     * 返回应用id对应的名称
     * @param appData yaml应用数据
     * @param id 应用id
     */
    getAppDesc(appData: AppCategory[], id: string) {
        const { desc } = appData
            .map((i: any) => i.app_list)
            .flat()
            .find((i: any) => i.app_id === id);
        return desc ? desc : id;
    },
    /**
     * 验证案件名称是否存在
     * @param {string} caseName 案件名称
     * @returns {CCaseInfo[]} 数组长度>0表示存在
     */
    async caseNameExist(caseName: string) {
        try {
            let list = await ipcRenderer.invoke('db-find', TableName.Case, { m_strCaseName: { $regex: new RegExp(`^${caseName}(?=_)`) } });
            return list;
        } catch (error) {
            throw error;
        }
    },
    /**
     * 检测端口号
     * @param port 端口号
     * @returns 返回可用端口号
     */
    portStat(port: number): Promise<number> {
        const server = net.createServer();
        return new Promise((resolve, reject) => {
            if (typeof port !== 'number') {
                reject(new TypeError('Port is not a number'));
            }
            server.listen(port, '0.0.0.0');
            server.on('listening', () => {
                server.close();
                resolve(port);
            });
            server.on('error', (err: any) => {
                server.close();
                if (err.code === 'EADDRINUSE') {
                    console.log(`端口${port}已占用`);

                    return resolve(this.portStat(++port));
                } else {
                    reject(err);
                }
            });
        });
    }
};

export { helper };