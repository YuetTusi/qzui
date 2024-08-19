import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/lib/form';
import { PaperworkModalState } from '@src/model/tools/PaperworkModal';

export interface StepThreeFormValue extends FormComponentProps {
    visible: boolean,
    /**
     * 检材名称
     */
    mobileName?: string,
    /**
     * 检材型号
     */
    model?: string,
    /**
     * 持有人
     */
    mobileHolder?: string,
    /**
     * IMEI
     */
    imei?: string,
    /**
     * 手机号
     */
    mobileNumber?: string,
    /**
     * 前面照片路径
     */
    frontPath?: string,
    /**
     * 背面照片路径
     */
    backPath?: string,

    dispatch: Dispatch<any>,
    /**
     * Store
     */
    paperworkModal: PaperworkModalState,
    /**
     * 其他
     */
    [others: string]: any
}
