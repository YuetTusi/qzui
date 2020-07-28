import { useEffect, useRef } from "react";

/**
 * 获取上一次的state
 * @param state state对象
 */
function usePrev<T>(state: T): T | undefined {
    
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = state
    });

    return ref.current;
}

export { usePrev };