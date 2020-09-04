import { useRef, RefObject } from "react";

/**
 * 获取当前值
 * @param value 值
 */
function useCurrentVal<T>(value: T): RefObject<T> {

    const last = useRef<T | null>(null);

    last.current = value;

    return last;
}

export { useCurrentVal };