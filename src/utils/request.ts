import axios from "axios";
import config from '@src/config/ui.yaml';

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
function setInterceptor(instance: Record<string, any>) {
    instance.interceptors.request.use((config: Record<string, any>) => {
        //请求头在此设置
        // config.headers["Authorization"] = "Token";
        return config;
    });
    instance.interceptors.response.use(
        (res: Record<string, any>) => {
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
function request(options: Record<string, any> = {}) {
    return instance.request(options);
}

export { request };