import axios from "axios";
import { IObject } from "@src/type/model";

const baseURL =
    process.env.NODE_ENV === "production" ? "/" : "http://127.0.0.1:3000/";

const instance = setInterceptor(
    axios.create({
        baseURL,
        timeout: 5000,
        headers: {}
        // withCredentials: true
    })
);

/**
 * 为axios设置拦截器
 * @param {Object} instance axios实例
 */
function setInterceptor(instance: IObject) {
    instance.interceptors.request.use((config: IObject) => {
        //请求头在此设置
        // config.headers["Authorization"] = "Token";
        return config;
    });
    instance.interceptors.response.use(
        (res: IObject) => {
            return res.data;
        },
        (err: Error) => {
            return Promise.reject(err);
        }
    );
    return instance;
}

/**
 * ajax请求
 */
function request(options:IObject = {}) {
    return instance.request(options);
}

export { request };