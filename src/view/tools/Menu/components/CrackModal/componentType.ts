import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { CrackModalStore } from "@src/model/tools/Menu/CrackModal";

/**
 * 属性
 */
interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库
     */
    crackModal: CrackModalStore;
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 关闭handle
     */
    cancelHandle: () => void;
}

/**
 * 表单
 */
interface FormValue {
    /**
     * 设备id
     */
    id: string,
    /**
     * 方式
     */
    type: CrackType
}

/**
 * 操作类型
 */
enum UserAction {
    /**
     * 破解
     */
    Crack,
    /**
     * 恢复
     */
    Recover
}

/**
 * 破解方式
 */
enum CrackType {
    /**
     * vivo应用锁
     */
    VivoAppLock,
    /**
     * oppo应用锁
     */
    OppoAppLock,
    /**
     * oppo搬家锁
     */
    OppoMoveLock
}

export { Prop, UserAction, CrackType, FormValue };