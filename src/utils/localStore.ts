import differenceWith from 'lodash/differenceWith';
import { AppDataExtractType } from '@src/schema/AppDataExtractType';

const CASE_DATA = 'CASE_DATA'; //案件数据key

interface TipsBackup {
    /**
     * 唯一ID (序列号+物理USB端口号)
     */
    id: string;
    /**
     * 提示类型枚举
     */
    AppDataExtractType?: AppDataExtractType;
    /**
     * 品牌
     */
    Brand?: string;
    /**
     * 是否是OPPO_WiFi确认框
     */
    IsWifiConfirm?: boolean;
}

/**
 * 案件数据
 */
interface CaseData {
    /**
     * 唯一ID (序列号+物理USB端口号)
     */
    id: string;
    /**
     * 案件名称
     */
    m_strCaseName: string;
    /**
     * 持有人
     */
    m_strDeviceHolder: string;
    /**
     * 检材编号
     */
    m_strDeviceNumber: string;
    /**
     * 送检单位
     */
    // m_strClientName: string;
}

/**
 * 本地存储
 */
let localStore = {
    /**
     * 存储数据
     * @param key 键
     * @param value 值
     */
    set(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    /**
     * 获取数据
     * @param key 键
     * @param value 值
     */
    get(key: string) {
        let values = localStorage.getItem(key);
        if (values) {
            return JSON.parse(values as string);
        } else {
            return null;
        }
    },
    /**
     * 移除数据
     * @param key 键
     */
    remove(key: string) {
        localStorage.removeItem(key);
    },
    /**
     * 清空所有Session数据
     */
    clear() {
        localStorage.clear();
    }
};

/**
 * 处理案件数据存储
 * 数据格式：[{
 *      id:"751051aePort_#0001.Hub_#0004",
 *      m_strCaseName:'案件名称',
 *      m_strDeviceHolder:'持有人',
 *      m_strDeviceNumber:'检材编号',
 *      m_strClientName:'送检单位名称'
 * },...
 * ]
 */
let caseStore = {
    /**
     * 存储案件数据(有id存在不追加)
     * @param data 弹框数据
     */
    set(data: CaseData) {
        let store = localStore.get(CASE_DATA) as Array<CaseData>;
        if (store === null) {
            localStore.set(CASE_DATA, [data]);
        } else {
            store.push(data);
            localStore.set(CASE_DATA, store);
        }
    },
    /**
     * 获取参数id的数据
     * @param id 
     */
    get(id: string) {
        let store = localStore.get(CASE_DATA) as Array<any>;
        if (store === null) {
            return null;
        }
        let data = store.find((item: any) => item.id === id);
        if (data) {
            return data;
        } else {
            return null;
        }
    },
    /**
     * 验证案件据是否存在
     * @param id 案件数据id
     */
    exist(id: string) {
        let store = localStore.get(CASE_DATA) as Array<CaseData>;
        if (store === null) {
            return false;
        }
        let has = store.findIndex((item: CaseData) => item.id === id);
        return has !== -1;
    },
    /**
     * 删除案件为id数据
     * @param id 案件id
     */
    remove(id: string) {
        let store = localStore.get(CASE_DATA) as Array<CaseData>;
        let updated: Array<CaseData> = [];
        if (store !== null) {
            updated = store.filter((item: CaseData) => item.id !== id);
        }
        localStore.set(CASE_DATA, updated);
    },
    /**
     * 删除掉list参数中没有的数据（根据id判断）
     * @param list 弹框数据列表
     */
    removeDiff(list: Array<CaseData>) {
        let store = localStore.get(CASE_DATA);
        //NOTE:最新监听数据与SessionStorage中比出差值，删除掉
        let diff = differenceWith(store, list, (a: CaseData, b: CaseData) => a.id === b.id);
        diff.forEach((item: CaseData) => this.remove(item.id));
    }
};

export { caseStore, TipsBackup, CaseData };
export default localStore;