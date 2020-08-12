import React, { FC, useRef, useEffect } from 'react';
import color from 'color';
import Rect from './Rect';
import './ProgressBar.less';

interface Prop {
    /**
     * 颜色值
     */
    color: string;
};

const count = 10;

/**
 * 进度动画条
 * @param props 
 */
const ProgressBar: FC<Prop> = (props) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rectList = useRef<Rect[]>([]);
    const index = useRef(0);

    /**
     * 画出Bar
     */
    const drawBar = () => {
        let rectList: Rect[] = [];
        const width = canvasRef.current?.clientWidth as number;
        const eachWidth = width / count - 1;
        const ctx = canvasRef.current?.getContext('2d') as CanvasRenderingContext2D;
        for (let i = 0; i < count; i++) {
            let temp = new Rect(ctx, (i * eachWidth + i + 1), 0, eachWidth, 10, props.color);
            temp.draw();
            rectList.push(temp);
        }
        return rectList;
    };

    /**
     * 运行动画
     */
    const run = () => {
        let nextColor = color(props.color).lighten(0.6).hex();
        return setInterval(() => {
            if (index.current === 0) {
                rectList.current[count - 1].update(props.color);
                rectList.current[0].update(nextColor);
                index.current++;
            } else if (index.current === count) {
                rectList.current[0].update(props.color);
                rectList.current[index.current - 1].update(nextColor);
                index.current = 0;
            } else {
                rectList.current[index.current - 1].update(props.color);
                rectList.current[index.current].update(nextColor);
                index.current++;
            }
        }, 80);
    };

    useEffect(() => {
        rectList.current = drawBar();
        var timer = run();
        return () => {
            clearInterval(timer);
        }
    });

    return <div className="progress-bar-root">
        <canvas ref={canvasRef}></canvas>
    </div>;
};

export default ProgressBar;
