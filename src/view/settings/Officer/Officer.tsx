import React, { FC, MouseEvent } from 'react';
import Empty from 'antd/lib/empty';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Title from '@src/components/title/Title';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { StoreComponent } from '@type/model';
import { useMount } from '@src/hooks';
import { helper } from '@src/utils/helper';
import { Officer as OfficerEntity } from '@src/schema/Officer';
import { StoreData } from '@src/model/settings/Officer/Officer';
import policeSvg from './images/police.svg';
import './Officer.less';

interface Prop extends StoreComponent {
    officer: StoreData;
}

/**
 * @description 采集人员信息
 */
const Officer: FC<Prop> = ({ dispatch, officer }) => {

    useMount(() => { dispatch({ type: 'officer/fetchOfficer' }) });

    /**
     * 采集人员Click
     * @param e 
     * @param current 当前实体
     */
    const policeClick = (e: MouseEvent<HTMLDivElement>, current: OfficerEntity) => {
        const { tagName } = e.target as any;
        if (tagName === 'path' || tagName === 'svg') {
            e.stopPropagation();
        } else {
            dispatch(routerRedux.push({
                pathname: `/settings/officer/edit/${current._id}`,
                search: `?no=${current.no}&name=${current.name}`
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
        const { data } = officer;
        if (data && data.length > 0) {
            let $li = data.map(item => <li key={helper.getKey()}>
                <div className="police" onClick={(event: MouseEvent<HTMLDivElement>) => policeClick(event, item)}>
                    <img
                        src={policeSvg}
                        className="avatar"
                        alt="头像" />
                    <div className="info">
                        <span>姓名：{item.name}</span>
                        <em>编号：{item.no}</em>
                    </div>
                    <div className="drop"
                        data-id={item._id}
                        data-name={item.name}
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