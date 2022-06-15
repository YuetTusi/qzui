import { FormComponentProps } from 'antd/lib/form';

export interface MiChangeModalProp extends FormComponentProps {

    /**
     * 显示
     */
    visible: boolean,
    /**
     * 确定handle
     */
    onOk: (targetPath: string) => void,
    /**
     * 取消handle
     */
    onCancel: () => void
};