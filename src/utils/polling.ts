import { helper } from './helper';

type loopFunc = (...args: any[]) => (Promise<boolean> | boolean);

/**
 * 函数轮询
 * @param loopHandle 轮询方法，返回false或Promise<false>终止轮询
 * @param ms 间隔(毫秒数)
 */
export function polling(loopHandle: loopFunc, ms: number = 2000): void {

    (function _loop() {
        setTimeout(() => {
            let ret = loopHandle();
            if (helper.isPromise(ret)) {
                (ret as Promise<boolean>).then((result: boolean) => {
                    if (result) {
                        _loop();
                    }
                }).catch((err: Error) => console.log('@utils/polling.ts 轮询失败', err));
            } else {
                if (ret) { _loop(); }
            }
        }, ms);
    })();
}

