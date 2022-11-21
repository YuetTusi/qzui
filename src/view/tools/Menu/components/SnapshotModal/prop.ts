import { CrackModalStore } from "@src/model/tools/Menu/CrackModal";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";

export interface SnapshotModalProp extends StoreComponent, FormComponentProps<FormValue> {

    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * Model
     */
    crackModal: CrackModalStore;
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
    id: string,
    /**
     * 保存位置
     */
    saveTo: string,
}
