import { useEffect, useRef } from "react";

/**
 * 获取组件最新状态
 * @param value 值
 */
function useLatest<T>(value: T): T | undefined {

    const latest = useRef<T>();

    useEffect(() => {
        latest.current = value
    });

    return latest.current;
}

export { useLatest };