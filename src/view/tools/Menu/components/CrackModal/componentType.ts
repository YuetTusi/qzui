import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";
import { CrackModalStore } from "@src/model/tools/Menu/CrackModal";
import { CrackTypes } from "@src/schema/CrackTypes";

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
     * 破解类型
     */
    type: CrackTypes;
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
    id: string
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


export { Prop, UserAction, FormValue };