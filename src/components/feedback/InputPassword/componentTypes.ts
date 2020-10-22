type OkHandle = (params: DeviceParam, forget: boolean, password?: string) => void;

/**
 * 导入手机输入密码时传回的参数
 */
interface DeviceParam {
    /**
     * 案件ID
     */
    caseId: string,
    /**
     * 手机ID
     */
    deviceId: string,
    /**
     * 手机名称
     */
    mobileName: string
};

export { DeviceParam, OkHandle };