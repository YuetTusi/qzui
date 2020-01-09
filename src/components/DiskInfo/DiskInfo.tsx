import React, { Component } from 'react';
import { connect } from 'dva';
import round from 'lodash/round';
import { StoreState } from '@src/model/dashboard/index';
import Progress from 'antd/lib/progress';
import './DiskInfo.less';

interface Prop {
    dashboard: StoreState;
}
interface State { }

/**
 * 磁盘信息组件
 */
class DiskInfo extends Component<Prop, State> {
    constructor(props: Prop) {
        super(props);
    }
    renderProgress(): JSX.Element {
        const { freeSpace, size } = this.props.dashboard;
        let precent = usedPercent(freeSpace, size);
        return <Progress
            percent={precent}
            status={precent > 90 ? 'exception' : 'success'}
            strokeLinecap="round"
            showInfo={false} />;
    }
    render(): JSX.Element {
        const { freeSpace } = this.props.dashboard;
        const freeWithGB = round(freeSpace / 1024 / 1024 / 1024, 2);
        return <div className="disk-info-root">
            <i className="disk-img" title={`剩余空间：${freeWithGB}GB`}/>
            {this.renderProgress()}
        </div>;
    }
}

/**
 * 计算磁盘空间百分比值
 * @param freeSpace 空余空间(bytes)
 * @param size 总容量(bytes)
 */
function usedPercent(freeSpace: number, size: number): number {
    if (size === 0) {
        return 0;
    } else {
        const useSpace = size - freeSpace;
        return useSpace / size * 100;
    }
}

export default connect((state: any) => ({ dashboard: state.dashboard }))(DiskInfo);