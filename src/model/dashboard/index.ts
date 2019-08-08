import { IModel } from "@type/model";
import { message } from "antd";

//数据采集
let model: IModel = {
    namespace: "dashboard",
    state: {},
    subscriptions: {
        startApp() {
        }
    }
};

export default model;