import React, { FC, memo } from 'react';
import classnames from 'classnames';
import DeviceInfo from '@src/components/DeviceInfo/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { helper } from '@src/utils/helper';
import { FetchState } from '@src/schema/socket/DeviceState';
import { TipType } from '@src/schema/socket/TipType';
import { Prop } from './componentType';

/**
 * 链接文本
 */
const getLinkTxt = (type: TipType) => {
    let txt: string;
    switch (type) {
        case TipType.Question:
            txt = '操作确认';
            break;
        case TipType.RequiredGuide:
            txt = '操作确认';
            break;
        case TipType.Guide:
            txt = '操作提示';
            break;
        default:
            txt = '操作提示'
            break;
    }
    return txt;
}

/**
 * 设备框
 */
const DeviceFrame: FC<Prop> = props => {

    if (helper.isNullOrUndefined(props.data)) {
        return <div className="col" key={helper.getKey()}>
            <div className="cell">
                <div className={classnames({ no: true, flash: false })}>
                    <div>
                        <i className="terminal" />
                        <span>{`终端${props.no}`}</span>
                    </div>
                </div>
                <div className="place">
                    <DeviceInfo
                        fetchState={FetchState.Waiting}
                        collectHandle={props.collectHandle}
                        errorHandle={props.errorHandle}
                        stopHandle={props.stopHandle} />
                </div>
            </div>
        </div>
    } else {
        return <div className="col" key={helper.getKey()}>
            <div className="cell">
                <div
                    className={classnames({
                        no: true,
                        flash: props.data!.tipType === TipType.Question || props.data!.tipType === TipType.RequiredGuide
                    })}>
                    <div>
                        <i className="terminal" />
                        <span>{`终端${props.no}`}</span>
                    </div>
                    <div>
                        <MsgLink
                            {...props.data}
                            show={props.data!.tipType !== TipType.Nothing}
                            flash={false}
                            clickHandle={props.msgLinkHandle}>
                            {getLinkTxt(props.data!.tipType!)}
                        </MsgLink>
                    </div>
                </div>
                <div className="place">
                    <DeviceInfo
                        {...props.data}
                        collectHandle={props.collectHandle}
                        errorHandle={props.errorHandle}
                        stopHandle={props.stopHandle} />
                </div>
            </div>
        </div>
    }
};

export default memo(DeviceFrame);