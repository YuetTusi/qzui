import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

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
     * @description 转为日期格式
     * @param date 原日期字串
     * @param format 格式化字串 默认年-月-日
     */
    parseDate: function (date: string, format: string = 'YYYY-MM-DD'): string {
        return moment(date).format(format);
    },
    /**
     * 得到当前时间戳
     */
    timestamp: function () {
        return moment().format('YYYYMMDDHHmmSSSS');
    },
    /**
     * @description 生成Key值
     */
    getKey: function (): string {
        return 'K_' + Date.now() + ~~(Math.random() * 1000000);
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
    }
};

export { helper };