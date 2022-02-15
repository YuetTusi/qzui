import { Dispatch } from 'redux';
import { TraceLoginState } from "@src/model/settings/TraceLogin";
import { ParseState } from "@src/schema/socket/DeviceState";
import { DeviceType } from "@src/schema/socket/DeviceType";
import { Prop as InnerPhoneTableProp } from '../InnerPhoneTable/componentType';

interface Prop {

    dispatch?: Dispatch<any>,
    /**
     * 解析状态
     */
    parseState: ParseState;
    /**
     * 设备数据
     */
    deviceData: DeviceType;
    /**
     * 设备表格属性
     */
    innerPhoneTableProp: InnerPhoneTableProp;

    setDataHandle: (data: DeviceType[]) => void;

    setLoadingHandle: (loading: boolean) => void;

    traceLogin?: TraceLoginState
}

export { Prop }