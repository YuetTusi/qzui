import { ApkModalState } from "@src/model/tools/ApkModal";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";

/**
 * 属性
 */
export interface ApkModalProp extends StoreComponent, FormComponentProps {

    apkModal: ApkModalState;
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
export interface FormValue {
    /**
     * 设备id
     */
    phone: string,
    /**
     * 存储在
     */
    saveTo: string
}
