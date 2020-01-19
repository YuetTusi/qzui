import React, { Component, MouseEvent } from 'react';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent, IObject } from '@type/model';
import { helper } from '@src/utils/helper';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import './Officer.less';

interface IProp extends StoreComponent {
    officer: any;
}
interface IState { }

/**
 * @description 检验员信息
 */
class Officer extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch({ type: 'officer/fetchOfficer' });
    }
    /**
     * 
     */
    policeClick = (event: MouseEvent<HTMLDivElement>, current: CCheckerInfo) => {
        const { dispatch } = this.props;
        const { tagName } = event.target as any;
        if (tagName === 'path' || tagName === 'svg') {
            event.stopPropagation();
        } else {
            dispatch(routerRedux.push({
                pathname: `/settings/officer/edit/${current.m_strUUID}`,
                search: `?m_strCheckerID=${current.m_strCheckerID}&m_strCheckerName=${current.m_strCheckerName}`
            }));
        }
    }
    /**
     * 删除
     */
    delOfficerClick = (e: MouseEvent<HTMLDivElement>) => {
        const { id, name } = e.currentTarget.dataset;
        const { dispatch } = this.props;
        Modal.confirm({
            title: '删除',
            content: `确认删除「${name}」？`,
            okText: '是',
            cancelText: '否',
            onOk: () => {
                dispatch({ type: 'officer/delOfficer', payload: id });
            }
        });
    }
    renderOfficer = (): JSX.Element => {
        const { officerData } = this.props.officer;
        const { dispatch } = this.props;
        if (officerData && officerData.length > 0) {
            let $li = officerData.map((item: CCheckerInfo) => <li key={helper.getKey()}>
                <div className="police" onClick={(event: MouseEvent<HTMLDivElement>) => this.policeClick(event, item)}>
                    <i className="avatar" title="头像" />
                    <div className="info">
                        <span>姓名：{item.m_strCheckerName}</span>
                        <em>编号：{item.m_strCheckerID}</em>
                    </div>
                    <div className="drop"
                        data-id={item.m_strUUID}
                        data-name={item.m_strCheckerName}
                        onClick={this.delOfficerClick}
                        title="删除检验员">
                        <Icon type="close" style={{ fontSize: '22px' }} />
                    </div>
                </div>
            </li>);
            return <ul>{$li}</ul>;
        } else {
            return <Empty description="暂无检验员" />
        }
    }
    render(): JSX.Element {
        return <div className="officer-panel">
            <Title okText="新增" onOk={() => this.props.dispatch(routerRedux.push('/settings/officer/edit/-1'))}>检验员信息</Title>
            <div className="police-list">
                {this.renderOfficer()}
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ officer: state.officer }))(Officer);