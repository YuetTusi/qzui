import axios from "axios";
import { IObject } from "@src/type/model";
import config from '@src/config/ui.config.json';
 
const baseURL =
    process.env.NODE_ENV === "production" ? config.prodApi : config.devApi;

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
 * @description ajax请求
 * @param options 默认为GET请求
 */
function request(options:IObject = {}) {
    return instance.request(options);
}

export { request };