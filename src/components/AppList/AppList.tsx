import React, { PropsWithChildren, ReactElement, MouseEvent, useState } from 'react';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Row from 'antd/lib/row';
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
function AppList(props: PropsWithChildren<IProp>): JSX.Element {
    const { apps } = props;
    const APP_COUNT = getAppCount(apps);
    const selectedCount = getSelectedCount(apps);
    let [appList, setAppList] = useState<any[]>(apps);

    if (props.selectHandle) {
        props.selectHandle(apps); //渲染时立即触发
    }
    // let memoizedAppList = useMemo(() => <div className="app-list">
    //     <div className="category">
    //         {getCategory(appList)}
    //     </div>
    // </div>, [appList]);
    // console.log(APP_COUNT);
    // console.log(selectedCount);

    return <div className="app-list">
        <div className="select-all-bar">
            <span><Icon type="appstore" rotate={45} /><span>APP</span></span>
            <a onClick={selectAllAppsClick}>{selectedCount === APP_COUNT ? '全部取消' : '全部解析'}</a>
        </div>
        <div className="category">
            {getCategory(appList)}
        </div>
    </div>;

    /**
     * 全选所有Apps
     * @param e MouseEvent
     */
    function selectAllAppsClick(e: MouseEvent<HTMLAnchorElement>) {
        const result = appList.map((category: any) => {
            category.app_list = category.app_list.map((app: any) => {
                app.select = selectedCount === APP_COUNT ? 0 : 1;
                return app;
            });
            return category;
        });
        setAppList(result);
    }

    /**
     * 获取App数量
     */
    function getAppCount(apps: any[]): number {
        return apps.reduce((acc: number, current: any) => {
            return acc + current.app_list.length;
        }, 0);
    }

    /**
     * 获取选中的App数量
     */
    function getSelectedCount(apps: any[]): number {
        return apps.reduce((acc: number, current: any) => {
            return acc + current.app_list.filter((i: any) => i.select === 1).length;
        }, 0);
    }

    /**
     * @description 全选一个分类事件
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
            let { app_list } = category;
            if (category.name === name) {
                app_list = app_list.map((app: any) => {
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
                if (app.app_id === type) {
                    app.select = app.select === 1 ? 0 : 1;
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
                    <div>
                        <Icon type="tag" />
                        <span>{app.desc}</span>
                    </div>

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
                <div className="item" data-type={app.app_id} onClick={iconClick}>
                    <div className={`app-icon ${app.name}`} data-type={app.app_id}></div>
                    <div className="txt" data-type={app.app_id}>{app.desc}</div>
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
            return <div className="selected" data-type={app.app_id}></div>
        } else {
            return '';
        }
    }
}

export default AppList;