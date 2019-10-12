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
        return moment().format(format)
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
    }
};

export { helper };