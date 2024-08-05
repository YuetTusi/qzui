import { FormComponentProps } from 'antd/lib/form';
import { DeviceType } from '@src/schema/socket/DeviceType';

export interface StepOneFormValue extends FormComponentProps {
    visible: boolean,
    /**
     * 案件名称
     */
    caseName?: string,
    /**
     * 案件编号
     */
    caseNo?: string,
    /**
     * 报告名称
     */
    reportName?: string,
    /**
     * 报告编号
     */
    reportNo?: string,
    /**
     * 持有人
     */
    mobileHolder?: string,
    /**
     * 保存路径
     */
    savePath?: string,
    /**
     * 选中的设备
     */
    checkedDevices: DeviceType[],
    /**
     * 选中案件名称
     */
    selectedCaseName: string
}