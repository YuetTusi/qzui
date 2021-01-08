import { FtpStoreState } from "@src/model/settings/FtpConfig/FtpConfig";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";

interface Prop extends StoreComponent, FormComponentProps {
    /**
     * 仓库State
     */
    ftpConfig: FtpStoreState;
}

interface State {
    /**
     * 是否启用FTP功能
     */
    enable: boolean
}

export { Prop, State };