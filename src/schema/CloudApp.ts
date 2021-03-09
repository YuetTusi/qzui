import { BaseApp } from './socket/BaseApp';

/**
 * 短信云取应用APP
 */
class CloudApp extends BaseApp {
    /**
     * 应用名称
     */
    public name: string;
    /**
     * 云取证应用Key值
     */
    public key: string;

    constructor(props: any = {}) {
        super(props);
        this.name = props.name ?? '';
        this.key = props.key ?? '';
    }
}

export { CloudApp };