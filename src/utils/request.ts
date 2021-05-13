/**
 *  HTTP动词
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE';

interface RequestResult<T> {
    /**
     * 状态0:成功,非0失败
     */
    code: number,
    /**
     * 请求结果
     */
    data: T
}

/**
 * 发送HTTP请求
 * @param url 请求URL地址
 * @param method HTTP方法
 * @param data 参数
 */
export function request<T = any>(url: string, method: HttpMethod = 'GET', data?: BodyInit | null): Promise<RequestResult<T>> {

    let parameter: BodyInit | null | undefined = void 0;

    try {
        if (typeof data !== 'string') {
            parameter = JSON.stringify(data);
        } else {
            parameter = data;
        }
    } catch (error) {
        console.log('Convert to JSON failure', error);
        parameter = data;
    }

    let baseOptions: RequestInit = {
        mode: 'cors',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: parameter
    }

    return new Promise<RequestResult<T>>((resolve, reject) => {
        return fetch(url, {
            ...baseOptions,
            method
        }).then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            } else {
                return null;
            }
        }).then((data) => {
            resolve({
                code: data === null ? 1 : 0,
                data
            });
        }).catch(err => reject(err));
    });
}