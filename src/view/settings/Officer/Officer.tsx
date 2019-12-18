import React, { Component, MouseEvent } from 'react';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import { helper } from '@src/utils/helper';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import './Officer.less';

interface IProp extends IComponent {
    officer: any;
}

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
                <div className="police">
                    <i className="avatar" title="头像"
                        onClick={() => dispatch(routerRedux.push({
                            pathname: `/settings/officer/edit/${item.m_strUUID}`,
                            search: `?m_strCheckerID=${item.m_strCheckerID}&m_strCheckerName=${item.m_strCheckerName}`
                        }))} />
                    <div className="info"
                        onClick={() => dispatch(routerRedux.push({
                            pathname: `/settings/officer/edit/${item.m_strUUID}`,
                            search: `?m_strCheckerID=${item.m_strCheckerID}&m_strCheckerName=${item.m_strCheckerName}`
                        }))}>
                        <span>{item.m_strCheckerName}</span>
                        <em>{item.m_strCheckerID}</em>
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