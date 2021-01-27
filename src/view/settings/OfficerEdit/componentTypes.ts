import { Officer } from "@src/schema/Officer";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";

/**
 * OfficeEdit属性
 */
interface Prop extends StoreComponent<{ id: string }> {
    officerEdit: any;
}

/**
 * 表单Prop
 */
interface EditFormProp extends FormComponentProps {
    /**
     * 数据
     */
    data: Officer;
    /**
     * 记录id
     */
    id?: string;
}

export { Prop, EditFormProp };