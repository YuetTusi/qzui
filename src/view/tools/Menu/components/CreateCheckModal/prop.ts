import CCaseInfo from "@src/schema/CCaseInfo"
import { FormComponentProps } from "antd/lib/form"

export interface CreateCheckModalProp extends FormComponentProps {
    /**
     * 显示
     */
    visible: boolean,
    /**
     * 保存
     */
    saveHandle: (data: CCaseInfo) => void
    /**
     * 取消
     */
    cancelHandle: () => void
}

export interface FormValue {
    /**
     * 案件名称
     */
    currentCaseName: string,
    /**
     * 案件路径
     */
    m_strCasePath: string,
    /**
     * 检验单位
     */
    checkUnitName: string
}