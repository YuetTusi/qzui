import { BaseEntity } from "@src/type/model";

/**
 * 解析日志
 */
class UIRetOneParseLogInfo extends BaseEntity {
    /**
     * 案件名称
     */
    public strCase_: string = '';
    /**
     * 手机名称
     */
    public strPhone_: string = '';
    /**
     * 解析开始时间
     */
    public llParseStart_: string = '';
    /**
     * 解析完成时间
     */
    public llParseEnd_: string = '';
    /**
     * 解析是否成功
     */
    public isParseOk_: boolean = false;
    /**
     * 创建报告开始时间
     */
    public llReportStart_: string = '';
    /**
     * 创建报告结束时间
     */
    public llReportEnd_: string = '';
    /**
     * 解析App信息
     */
    public parseApps_: UIParseOneAppinfo[] = [];
    /**
     * 是否解析成功
     */
    public isparseok_: boolean;
    /**
     * 描述信息
     */
    public strdec: string;

    constructor(props: any = {}) {
        super();
        this.strCase_ = props.strCase_ || '';
        this.strPhone_ = props.strPhone_ || '';
        this.llParseStart_ = props.llParseStart_ || '';
        this.llParseEnd_ = props.llParseEnd_ || '';
        this.isParseOk_ = props.isParseOk_ || false;
        this.llReportStart_ = props.llReportStart_ || '';
        this.llReportEnd_ = props.llReportEnd_ || '';
        this.parseApps_ = props.parseApps_ || [];
        this.isparseok_ = false;
        this.strdec = '';
    }
}

/**
 * 解析App
 */
class UIParseOneAppinfo {
    /**
     * 解析的单个app名称
     */
    public strAppName: string = ''; //解析的单个app名称
    /**
     * 解析的单个app数量
     */
    public count_: number = 0;     //解析的单个app数量

    constructor(props: any = {}) {
        this.strAppName = props.strAppName || '';
        this.count_ = props.count_ || 0;
    }
}

export { UIRetOneParseLogInfo, UIParseOneAppinfo };