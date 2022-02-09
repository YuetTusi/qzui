import { LoginState, TraceLoginState } from "@src/model/settings/TraceLogin";
import { StoreComponent } from "@src/type/model";
import { FormComponentProps } from "antd/lib/form";

interface TraceLoginProp extends StoreComponent {
    /**
     * ModelState
     */
    traceLogin: TraceLoginState
}

interface LoginFormProp extends FormComponentProps {
    /**
     * 登录状态
     */
    loginState: LoginState
}


export { TraceLoginProp, LoginFormProp };