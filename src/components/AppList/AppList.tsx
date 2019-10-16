import React, { PropsWithChildren, ReactElement, MouseEvent, useState, useMemo } from 'react';
import { Row, Col } from 'antd';
import { helper } from '@utils/helper';
import { ICategory, IIcon } from './IApps';
import '@src/global.less';
import './AppList.less';

interface IProp {
    //app数据
    apps: Array<any>;
    //选中数据的回调
    selectHandle?: (apps: Array<ICategory>) => void;
}



/**
 * @description 采集App列表组件, 
 */
function AppList(props: PropsWithChildren<IProp>): ReactElement {

    const { apps } = props;
    let [appList, setAppList] = useState(apps);

    if (props.selectHandle) {
        props.selectHandle(apps); //渲染时立即触发
    }

    // let memoizedAppList = useMemo(() => <div className="app-list">
    //     <div className="category">
    //         {getCategory(appList)}
    //     </div>
    // </div>, [appList]);

    return <div className="app-list">
        <div className="category">
            {getCategory(appList)}
        </div>
    </div>;

    /**
     * @description 全选事件
     * @param e EventTarget
     */
    function selectAllClick(e: MouseEvent<HTMLAnchorElement>): void {
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
    function iconClick(e: MouseEvent<HTMLDivElement>): void {

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
        if (selectHandle) {
            selectHandle(toggleList);//触发回调
        }
    }

    /**
     * @description 返回大分类的标题数据
     * @param apps App图标数据
     */
    function getCategory(apps: Array<ICategory>) {
        return apps.map((app: ICategory) => {
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
    function getRowApp(appList: Array<IIcon>): any {
        if (appList === null || appList.length === 0) {
            return null;
        }

        let rows: Array<ReactElement> = [];
        let cells: Array<ReactElement> = [];

        appList.forEach((app: IIcon, index: number, self: Array<IIcon>) => {
            cells.push(<Col span={4} key={helper.getKey()}>
                <div className="item" data-type={app.app_type} onClick={iconClick}>
                    <div className={`app-icon ${app.name}`} data-type={app.app_type}></div>
                    <div className="txt" data-type={app.app_type}>{app.desc}</div>
                    {selectOrCollecting(app)}
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

    /**
     * @description 根据状态渲染“选中”或“采集中”
     * @param app 图标数据
     */
    function selectOrCollecting(app: IIcon) {
        if (app.state === 1) {
            return <div className="mask">采集中...</div>;
        } else if (app.select === 1) {
            return <div className="selected" data-type={app.app_type}></div>
        } else {
            return '';
        }
    }
}

export default AppList;