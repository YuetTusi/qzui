import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const helper = {
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
        return 'K_' + Date.now() + Number.parseInt((Math.random() * 10000000 + ''));
    }
};

export { helper };