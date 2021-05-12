
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'TRACE';

/**
 * 发送HTTP请求
 * @param url 请求URL地址
 * @param method HTTP方法
 * @param data 参数
 */
export function request(url: string, method: HttpMethod = 'GET', data?: BodyInit | null) {

    let parameter: BodyInit | null | undefined = data;

    try {
        if (typeof data === 'string') {
            parameter = JSON.stringify(data);
        }
    } catch (error) {
        console.log('Convert to JSON failure', error);
        parameter = data;
    }

    let baseOptions: RequestInit = {
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: parameter
    }

    return fetch(url, {
        ...baseOptions,
        method
    }).then(data => data.json()).catch(err => err);
}