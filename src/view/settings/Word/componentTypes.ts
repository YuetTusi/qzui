import { FormComponentProps } from "antd/lib/form";

/**
 * 属性
 */
interface Prop { }

interface AddCategoryModalProp extends FormComponentProps {
    /**
     * 显示
     */
    visible: boolean,
    /**
     * 读取中
     */
    loading?: boolean,
    /**
     * 保存handle
     */
    saveHandle: (name: string) => void,
    /**
     * 取消
     */
    cancelHandle: () => void
}

export { Prop, AddCategoryModalProp };