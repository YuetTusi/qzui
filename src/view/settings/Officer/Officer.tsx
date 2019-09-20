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
 * @description 警员信息
 */
class Officer extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch({ type: 'officer/fetchOfficer' });
    }
    delOfficer = (e: MouseEvent<HTMLDivElement>) => {
        const { id, name } = e.currentTarget.dataset;
        Modal.confirm({
            title: '确认',
            content: `确认删除「${name}」？`,
            okText: '是',
            cancelText: '否',
            onOk: () => {
                console.log(`删除${id}...`);
            }
        });
    }
    renderOfficer = (): ReactElement[] => {
        const { officerData } = this.props.officer;
        if (officerData) {
            return officerData.map((item: IObject) => <li key={helper.getKey()}>
                <div className="police">
                    <i className="avatar" title="头像"
                        onClick={() => this.props.dispatch(routerRedux.push(`/settings/officer/edit/${item.id}`))} />
                    <div className="info"
                        onClick={() => this.props.dispatch(routerRedux.push(`/settings/officer/edit/${item.id}`))}>
                        <span>{item.name}</span>
                        <em>{item.no}</em>
                    </div>
                    <div className="drop"
                        data-id={item.id}
                        data-name={item.name}
                        onClick={this.delOfficer}
                        title="删除警员">
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
            <Title okText="新增" onOk={() => this.props.dispatch(routerRedux.push('/settings/officer/edit/-1'))}>警员信息</Title>
            <div className="police-list">
                <ul>
                    {this.renderOfficer()}
                </ul>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ officer: state.officer }))(Officer);