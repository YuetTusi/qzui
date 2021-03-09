/**
 * 应用基类
 */
abstract class BaseApp {

    /**
     * 应用id
     */
    public m_strID: string;

    constructor(props: any) {
        this.m_strID = props.m_strID ?? '';
    }
}

export { BaseApp };