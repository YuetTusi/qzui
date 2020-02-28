import { stPhoneInfoPara } from "@src/schema/stPhoneInfoPara";

/**
 * 详情消息
 */
export class DetailMessage {

    m_spif: stPhoneInfoPara;

    m_strDescription: string;

    m_strID: string;

    constructor(props: any) {
        this.m_spif = props.m_spif || new stPhoneInfoPara();
        this.m_strDescription = props.m_strDescription || '';
        this.m_strID = props.m_strID || '';
    }
}