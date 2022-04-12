import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import * as echars from 'echarts/core';
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    LegendComponent,
    TooltipComponent
} from 'echarts/components';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { HitChartModalProp } from './prop';
import { StateTree } from '@src/type/model';

echars.use([
    TitleComponent,
    LegendComponent,
    TooltipComponent,
    PieChart,
    CanvasRenderer
]);

/**
 * 命中数量饼图展示
 */
const HitChartModal: FC<HitChartModalProp> = ({
    hitChartModal,
    dispatch
}) => {

    const { visible, data } = hitChartModal;

    useEffect(() => {

        const $target = document.getElementById('hit-pie');

        if ($target !== null && data.length > 0) {
            const charts = echars.init($target);
            charts.setOption({
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    formatter: (name: string) => {
                        const next = data.find((item) => item.name === name);
                        return `${name}(${next?.value ?? '0'})`;
                    }
                },
                series: [
                    {
                        name: '命中统计',
                        type: 'pie',
                        center: ['40%', '50%'],
                        data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });
        }

    }, [data]);

    const renderChart = () => {
        console.log(data);
        if (data.length === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无命中数据" />;
        } else {
            return <div id="hit-pie" style={{ width: 'auto', height: '460px' }}>
            </div>;
        }
    };

    return <Modal
        footer={[
            <Button onClick={() => {
                dispatch({ type: 'hitChartModal/setVisible', payload: false });
                dispatch({ type: 'hitChartModal/setData', payload: [] });
            }}
                icon="close-circle"
                key="HCM_0"
                type="default">取消</Button>
        ]}
        onCancel={() => {
            dispatch({ type: 'hitChartModal/setVisible', payload: false });
            dispatch({ type: 'hitChartModal/setData', payload: [] });
        }}
        visible={visible}
        width={800}
        centered={true}
        forceRender={true}
        destroyOnClose={true}
        maskClosable={false}
        title="命中统计">
        {renderChart()}
    </Modal>;
}

export default connect((state: StateTree) => ({ hitChartModal: state.hitChartModal }))(HitChartModal);