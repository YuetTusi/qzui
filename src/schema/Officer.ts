import { BaseEntity } from "./db/BaseEntity";


/**
 * 采集人员
 */
class Officer extends BaseEntity {

    /**
     * 编号（6位警号）
     */
    no: string;
    /**
     * 姓名
     */
    name: string;

    constructor(props: any = {}) {
        super();
        this.no = props.no || '';
        this.name = props.name || '';
    }
}

export { Officer };
export default Officer;