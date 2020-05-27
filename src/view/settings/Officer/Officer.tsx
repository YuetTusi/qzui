import React, { FC, MouseEvent, useEffect } from 'react';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@type/model';
import { helper } from '@src/utils/helper';
import { CCheckerInfo } from '@src/schema/CCheckerInfo';
import { StoreData } from '@src/model/settings/Officer/Officer';
import './Officer.less';

interface Prop extends StoreComponent {
    officer: StoreData;
}

/**
 * @description 采集人员信息
 */
const Officer: FC<Prop> = ({ dispatch, officer }) => {

    useEffect(() => {
        dispatch({ type: 'officer/fetchOfficer' });
    }, []);

    /**
     * 采集人员Click
     * @param e 
     * @param current 当前实体
     */
    const policeClick = (e: MouseEvent<HTMLDivElement>, current: CCheckerInfo) => {
        const { tagName } = e.target as any;
        if (tagName === 'path' || tagName === 'svg') {
            e.stopPropagation();
        } else {
            dispatch(routerRedux.push({
                pathname: `/settings/officer/edit/${current.m_strUUID}`,
                search: `?m_strCheckerID=${current.m_strCheckerID}&m_strCheckerName=${current.m_strCheckerName}`
            }));
        }
    };

    /**
     * 删除
     */
    const delOfficerClick = (e: MouseEvent<HTMLDivElement>) => {

        const { id, name } = e.currentTarget.dataset;
        Modal.confirm({
            title: '删除',
            content: `确认删除「${name}」？`,
            okText: '是',
            cancelText: '否',
            onOk: () => {
                dispatch({ type: 'officer/delOfficer', payload: id });
            }
        });
    };

    const renderOfficer = (): JSX.Element => {
        const { officerData } = officer;
        if (officerData && officerData.length > 0) {
            let $li = officerData.map((item: CCheckerInfo) => <li key={helper.getKey()}>
                <div className="police" onClick={(event: MouseEvent<HTMLDivElement>) => policeClick(event, item)}>
                    <i className="avatar" title="头像" />
                    <div className="info">
                        <span>姓名：{item.m_strCheckerName}</span>
                        <em>编号：{item.m_strCheckerID}</em>
                    </div>
                    <div className="drop"
                        data-id={item.m_strUUID}
                        data-name={item.m_strCheckerName}
                        onClick={delOfficerClick}
                        title="删除采集人员">
                        <Icon type="close" style={{ fontSize: '22px' }} />
                    </div>
                </div>
            </li>);
            return <ul>{$li}</ul>;
        } else {
            return <Empty description="暂无采集人员" />
        }
    };

    return <div className="officer-panel">
        <Title okText="新增" onOk={() => dispatch(routerRedux.push('/settings/officer/edit/-1'))}>采集人员信息</Title>
        <div className="police-list">
            {renderOfficer()}
        </div>
    </div>;
}

export default connect((state: any) => ({ officer: state.officer }))(Officer);