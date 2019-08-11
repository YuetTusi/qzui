import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { IObject, IComponent } from '@type/model';
import Title from '@src/components/title/Title';
import { routerRedux } from 'dva/router';
import './BaseDetail.less';

interface IProp extends IComponent { }

/**
 * @description 手机基本信息
 */
class BaseDetail extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="base-detail">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>手机基本信息</Title>
            <div className="bd-panel">
                <div className="center-panel">
                    <div>
                        <i className="iphone" />
                    </div>
                    <div>
                        <table className="phone-table">
                            <tbody>
                                <tr>
                                    <td>手机厂商</td>
                                    <td>Apple</td>
                                </tr>
                                <tr>
                                    <td>手机型号</td>
                                    <td>Apple iPhone 8 plus</td>
                                </tr>
                                <tr>
                                    <td>IMEI1</td>
                                    <td>235235234562364</td>
                                </tr>
                                <tr>
                                    <td>IMEI2</td>
                                    <td>2345235423542345</td>
                                </tr>
                                <tr>
                                    <td>操作系统</td>
                                    <td>iOS</td>
                                </tr>
                                <tr>
                                    <td>操作系统版本</td>
                                    <td>12.3.1</td>
                                </tr>
                                <tr>
                                    <td>操作系统安装时间</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>蓝牙MAC</td>
                                    <td>BC-8F-BC-8F-BC-8F</td>
                                </tr>
                                <tr>
                                    <td>WIFI MAC</td>
                                    <td>BC-8F-BC-8F-BC-8F</td>
                                </tr>
                                <tr>
                                    <td>特征描述</td>
                                    <td>Azkj</td>
                                </tr>
                                <tr>
                                    <td>机身容量</td>
                                    <td>128GB</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default connect((state: IObject) => ({ state }))(BaseDetail);