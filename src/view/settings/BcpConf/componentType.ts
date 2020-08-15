import { FormComponentProps } from "antd/lib/form/Form";

interface Prop extends FormComponentProps {

};

interface FormValue {
    /**
     * 制造商名称
     */
    manufacturer: string;
    /**
     * 厂商组织机构代码
     */
    securitySoftwareOrgCode: string;
    /**
     * 采集设备名称
     */
    materialsName: string;
    /**
     * 设备型号
     */
    materialsModel: string;
    /**
     * 设备硬件版本号
     */
    materialsHardwareVersion: string;
    /**
     * 设备软件版本号
     */
    materialsSoftwareVersion: string;
    /**
     * 设备序列号
     */
    materialsSerial: string;
    /**
     * 采集点IP
     */
    ipAddress: string;
}

export { Prop, FormValue };