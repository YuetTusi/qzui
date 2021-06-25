import FetchData from "@src/schema/socket/FetchData";
import { StoreState } from '@src/model/dashboard/Device/CaseInputModal';
import { FormComponentProps } from 'antd/lib/form';
import { StoreComponent } from '@src/type/model';
import DeviceType from '@src/schema/socket/DeviceType';

export interface Prop extends FormComponentProps, StoreComponent {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 当前手机设备数据
     */
    device?: DeviceType;
    /**
     * 保存回调
     */
    saveHandle?: (arg0: FetchData) => void;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
    /**
     * 仓库数据
     */
    caseInputModal?: StoreState;
};

/**
 * 表单
 */
export interface FormValue {
    /**
     * 案件
     */
    case: string;
    /**
     * 手机名称
     */
    phoneName: string;
    /**
     * 手机编号
     */
    deviceNumber: string;
    /**
     * 手机持有人
     */
    user: string;
    /**
     * 检材持有人编号
     */
    handleOfficerNo: string;
    /**
     * 备注
     */
    note: string;
}