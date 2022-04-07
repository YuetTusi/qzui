import { Moment } from 'moment';
import { Dispatch } from 'redux';
import CCaseInfo from "@src/schema/CCaseInfo";
import { FormComponentProps } from "antd/lib/form";
import { CaseEditState } from '@src/model/case/CaseEdit';

export interface CreateCheckModalProp extends FormComponentProps {
    /**
     * 显示
     */
    visible: boolean,
    /**
     * 案件id
     * id为空是创建操作；否则为编辑
     */
    caseId?: string,
    /**
     * 保存
     */
    saveHandle: (data: CCaseInfo) => void,
    /**
     * 取消
     */
    cancelHandle: () => void,
    /**
     * 仓库
     */
    caseEdit?: CaseEditState,
    /**
     * 派发方法
     */
    dispatch?: Dispatch<any>
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
    checkUnitName: string,
    /**
     * 违规时间起
     */
    ruleFrom: number,
    /**
     * 违规时间止
     */
    ruleTo: number
}