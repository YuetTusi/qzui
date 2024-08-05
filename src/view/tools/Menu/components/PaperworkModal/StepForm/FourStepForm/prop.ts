import { Dispatch } from 'redux';
import { PaperworkModalState } from '@src/model/tools/PaperworkModal';
import { FormComponentProps } from 'antd/lib/form';

export interface Attachment {
    /**
     * 路径
     */
    path: string,
    /**
     * MD5
     */
    md5: string,
    /**
     * Sha1
     */
    sha1: string,
    /**
     * Sha256
     */
    sha256: string,
}

export interface StepFourFormValue extends FormComponentProps {
    /**
     * 检查步骤
     */
    checkStep?: string,
    /**
     * 结语
     */
    summary?: string,
    /**
     * 附件路径列表
     */
    attachments?: Attachment[],
    /**
     * 截图路径
     */
    reportCapture?: string,
    /**
     * 其他
     */
    [others: string]: any,

    paperworkModal: PaperworkModalState,

    dispatch: Dispatch<any>
}