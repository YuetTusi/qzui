import { FormComponentProps } from 'antd/lib/form';

interface Prop extends FormComponentProps {
    /**
     * 是否显示
     */
    visible: boolean,
    /**
     * 关闭handle
     */
    closeHandle: () => void
}

export { Prop };