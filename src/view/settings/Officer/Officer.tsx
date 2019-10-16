import React, { Component, ReactElement, MouseEvent } from 'react';
import { Icon, Modal } from 'antd';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import './Officer.less';
import { helper } from '@src/utils/helper';

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
            title: '确认',
            content: `确认删除「${name}」？`,
            okText: '是',
            cancelText: '否',
            onOk: () => {
                dispatch({ type: 'officer/delOfficer', payload: id });
            }
        });
    }
    renderOfficer = (): ReactElement[] => {
        const { officerData } = this.props.officer;
        const { dispatch } = this.props;
        if (officerData) {
            return officerData.map((item: IObject) => <li key={helper.getKey()}>
                <div className="police">
                    <i className="avatar" title="头像"
                        onClick={() => dispatch(routerRedux.push({
                            pathname: `/settings/officer/edit/${item.m_strUUID}`,
                            search: `?m_strCoronerID=${item.m_strCoronerID}&m_strCoronerName=${item.m_strCoronerName}`
                        }))} />
                    <div className="info"
                        onClick={() => dispatch(routerRedux.push({
                            pathname: `/settings/officer/edit/${item.m_strUUID}`,
                            search: `?m_strCoronerID=${item.m_strCoronerID}&m_strCoronerName=${item.m_strCoronerName}`
                        }))}>
                        <span>{item.m_strCoronerName}</span>
                        <em>{item.m_strCoronerID}</em>
                    </div>
                    <div className="drop"
                        data-id={item.m_strUUID}
                        data-name={item.m_strCoronerName}
                        onClick={this.delOfficerClick}
                        title="删除检验员">
                        <Icon type="close" style={{ fontSize: '22px' }} />
                    </div>
                </div>
            </li>);
        } else {
            return [];
        }
    }
    render(): ReactElement {
        return <div className="officer-panel">
            <Title okText="新增" onOk={() => this.props.dispatch(routerRedux.push('/settings/officer/edit/-1'))}>检验员信息</Title>
            <div className="police-list">
                <ul>
                    {this.renderOfficer()}
                </ul>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ officer: state.officer }))(Officer);