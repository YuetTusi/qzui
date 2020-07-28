import { useEffect } from 'react';

/**
 * 组件装载后
 * @param handle 装载完成后执行
 */
function useMount(handle: Function) {
    useEffect(() => {
        handle();
    }, []);
}

export { useMount };