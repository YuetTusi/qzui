import React, { PropsWithChildren, ReactElement, useState, MouseEvent } from 'react';
import { Row, Col } from 'antd';
import { helper } from '@utils/helper';
import '@src/global.less';
import './AppList.less';
import { IObject } from '@src/type/model';

interface IProp {
    //app数据
    apps: Array<any>;
    //选中数据的回调
    selectHandle: (apps: Array<any>) => void;
}



/**
 * @description 采集App列表组件, 
 */
function AppList(props: PropsWithChildren<IProp>): ReactElement {

    const { apps } = props;

    let [appList, setAppList] = useState(apps);

    props.selectHandle(apps); //渲染时立即触发

    return <div className="app-list">
        <div className="category">
            {getCategory(appList)}
        </div>
    </div>;

    function selectAllClick(e: MouseEvent<HTMLAnchorElement>) {
        const target = e.target as HTMLAnchorElement;
        const { name } = target.dataset;

        let isCancel: boolean = appList
            .find((category: any) => category.name === name)
            .app_list
            .every((app: any) => app.select === 1);

        const result = appList.map((category: any) => {
            if (category.name === name) {
                category.app_list = category.app_list.map((app: any) => {
                    app.select = isCancel ? 0 : 1;
                    return app;
                });
            }
            return category;
        });
        setAppList(result);
    }

    /**
     * @description 点击图标事件
     * @param e MouseEvent
     */
    function iconClick(e: MouseEvent<HTMLDivElement>) {

        const { type } = (e.target as HTMLDivElement).dataset;
        const { selectHandle } = props;

        let toggleList = appList.map((category: any) => {
            category.app_list = category.app_list.map((app: any) => {
                if (app.app_type === type) {
                    app.select = app.select == 1 ? 0 : 1;
                }
                return app;
            });
            return category;
        });
        setAppList(toggleList);
        selectHandle(toggleList);//触发回调
    }

    /**
     * @description 返回大分类的标题数据
     * @param apps App图标数据
     */
    function getCategory(apps: Array<any>) {
        return apps.map((app: IObject) => {
            return <div key={helper.getKey()}>
                <div className="bar">
                    <span>{app.desc}</span>
                    <a data-name={app.name} onClick={selectAllClick}>全选</a>
                </div>
                {getRowApp(app.app_list)}
            </div>;
        });
    }

    /**
     * @description 以行返回分类下的AppDOM（一行6个App图标,多出来的另起一行）
     * @param appList 一个分类下的App数据
     * @returns 返回一行的DOM数组
     */
    function getRowApp(appList: Array<IObject>): any {
        if (appList === null || appList.length === 0) {
            return null;
        }

        let rows: Array<any> = [];
        let cells: Array<any> = [];

        appList.forEach((app: IObject, index: number, self: Array<any>) => {
            cells.push(<Col span={4} key={helper.getKey()}>
                <div className="item" data-type={app.app_type} onClick={iconClick}>
                    <div className={`app-icon ${app.name}`} data-type={app.app_type}></div>
                    <div data-type={app.app_type}>{app.desc}</div>
                    {app.select === 1 ? <div className="selected" data-type={app.app_type}></div> : ''}
                </div>
            </Col>);

            if ((index + 1) % 6 === 0) {
                rows.push(<div className="box" key={helper.getKey()}>
                    <Row>
                        {cells}
                    </Row>
                </div>);
                cells = [];
            }
            if (self.length - 1 === index) {
                rows.push(<div className="box" key={helper.getKey()}>
                    <Row>
                        {cells}
                    </Row>
                </div>);
            }
        });
        return rows;
    }
}

export default AppList;