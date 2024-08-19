import { PaperworkModalState } from '@src/model/tools/PaperworkModal';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/lib/form';

export interface StepTwoForm extends FormComponentProps {
    /**
     * 隐藏/显示
     */
    visible: boolean,
    /**
     * Store
     */
    paperworkModal: PaperworkModalState,
    /**
     * Dispatcher
     */
    dispatch: Dispatch<any>,


    /**
     * 委托信息
     */
    delegation?: string,
    /**
     * 检查时间
     */
    checkFrom?: string,
    /**
     * 检查时间
     */
    checkTo?: string,
    /**
     * 检查人
     */
    checker?: string,
    /**
     * 检查对象封存固定情况
     */
    condition?: string,
    /**
     * 检查目的
     */
    purpose?: string,
    /**
     * 检查依据方法
     */
    standard?: string[],
    /**
     * 检查设备
     */
    equipment?: string,
}
