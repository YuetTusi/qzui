import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import './Init.less'
import { IObject, IComponent } from '@src/type/model';
import { Icon } from 'antd';
import PhoneInfo from '@src/components/PhoneInfo/PhoneInfo';



interface IProp extends IComponent {
    init: IObject;
}
interface IState { }

/**
 * 初始化连接设备
 * 对应模型：model/dashboard/Init
 */
class Init extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
    }
    shouldComponentUpdate(nextProp: IProp) {
        return this.props.init.m_nDevID !== nextProp.init.m_nDevID;
    }
    /**
     * 等待文字提示
     * @param devID 设备id
     */
    renderLoadingTxt(m_nDevID: any) {
        if (m_nDevID === null) {
            return <div className="title">请将设备连接到电脑并保持连接</div>;
        } else {
            return <div className="title success">手机正确识别，正在连接...</div>;
        }
    }
    /**
     * 小圆圈
     * @param m_nDevID 设备id
     */
    renderLoadingIcon(m_nDevID: any) {
        if (m_nDevID === null) {
            return <div></div>;
        } else {
            return <div className="phone-loading"></div>;
        }
    }
    /**
     * 返回手机品牌样式
     * @param phoneData 手机数据对象
     */
    renderBrand(phoneData: IObject) {
        if (phoneData.piMakerName) {
            //处理为小写对应CSS类
            return phoneData.piMakerName.toLowerCase();
        } else {
            return 'android';
        }
    }
    render(): ReactElement {
        const { init } = this.props;
        return <div className="init">
            <div className="bg">
                <div className="panel">
                    <div className="row">
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端1</div>
                                <div className="place">
                                    <PhoneInfo isConnected={true} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端2</div>
                                <div className="place">
                                    <PhoneInfo isConnected={false} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端3</div>
                                <div className="place">
                                    <PhoneInfo isConnected={false} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端4</div>
                                <div className="place">
                                    <PhoneInfo isConnected={false} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端5</div>
                                <div className="place">
                                    <PhoneInfo isConnected={false} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="cell">
                                <div className="no">终端6</div>
                                <div className="place">
                                    <PhoneInfo isConnected={false} m_nDevID={init.m_nDevID}
                                        piMakerName={init.piMakerName} piPhoneType={init.piPhoneType} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => {
    return { 'init': state.init }
})(Init);