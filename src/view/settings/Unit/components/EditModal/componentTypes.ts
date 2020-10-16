import { FormComponentProps } from 'antd/lib/form';

interface Prop extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 关闭handle
     */
    closeHandle: (reload: boolean) => void
};


interface FormValue {
    /**
     * 采集单位名称
     */
    pcsName: string
}

export { Prop, FormValue };