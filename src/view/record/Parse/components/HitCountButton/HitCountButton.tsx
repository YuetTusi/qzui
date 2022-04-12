import { join } from 'path';
import React, { FC, useEffect, useRef, useState } from 'react';
import Button from 'antd/lib/button';
import { HitCountButtonProp } from './prop';
import { helper } from '@src/utils/helper';

const cwd = process.cwd();

/**
 * 命中数量按钮
 */
const HitCountButton: FC<HitCountButtonProp> = ({ data, dispatch }) => {

    const [count, setCount] = useState<number>(0);

    const dataRef = useRef<any>();

    useEffect(() => {
        const { id } = data;
        const p = join(cwd, `./KeywordSearch/${id}.json`);
        (async () => {
            try {
                const exist = await helper.existFile(p);
                if (exist) {
                    const json = await helper.readJSONFile(p);
                    dataRef.current = json.items;
                    setCount(json.totalcount);
                } else {
                    setCount(0);
                }
            } catch (error) {
                setCount(0);
            }
        })();
    }, [data]);

    return <Button
        onClick={() => {
            dispatch({ type: 'hitChartModal/setVisible', payload: true });
            dispatch({ type: 'hitChartModal/setDevice', payload: data });
            dispatch({ type: 'hitChartModal/setData', payload: dataRef.current ?? [] });
        }}
        type="primary"
        size="small">
        {count}
    </Button>;
}

export default HitCountButton;