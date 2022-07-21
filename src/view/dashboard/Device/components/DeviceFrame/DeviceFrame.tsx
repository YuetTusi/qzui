import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import React, { FC, memo } from 'react';
import classnames from 'classnames';
import DeviceInfo from '@src/components/DeviceInfo';
import MsgLink from '@src/components/MsgLink/MsgLink';
import { helper } from '@utils/helper';
import { FetchState } from '@src/schema/socket/DeviceState';
import { TipType } from '@src/schema/socket/TipType';
import { Prop } from './componentType';

/**
 * 链接文本
 */
const getLinkTxt = (type: TipType) => {
	let txt: string;
	switch (type) {
		case TipType.Flash:
			txt = '操作确认';
			break;
		case TipType.Normal:
			txt = '操作提示';
			break;
		case TipType.ApplePassword:
			txt = '密码确认';
			break;
		case TipType.CloudCode:
			txt = '云取进度';
			break;
		case TipType.UMagicCode:
			txt = '连接码';
			break;
		default:
			txt = '操作提示';
			break;
	}
	return txt;
};

/**
 * 设备方框
 */
const DeviceFrame: FC<Prop> = ({
	data,
	no,
	collectHandle,
	serverCloudHandle,
	errorHandle,
	stopHandle,
	userHelpHandle,
	msgLinkHandle
}) => {
	if (helper.isNullOrUndefined(data)) {
		return (
			<div className="col" key={`DF_${no}`}>
				<div className="cell">
					<div className="no">
						<div>
							<FontAwesomeIcon icon={faMobileAlt} className="terminal" />
							<span>{`终端${no}`}</span>
						</div>
					</div>
					<div className="place">
						<DeviceInfo
							fetchState={FetchState.Waiting}
							collectHandle={collectHandle}
							serverCloudHandle={serverCloudHandle}
							errorHandle={errorHandle}
							stopHandle={stopHandle}
							userHelpHandle={userHelpHandle}
						/>
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="col" key={`DF_${no}`}>
				<div className="cell">
					<div className="no">
						<div>
							<span
								className={classnames({
									flash:
										data!.tipType !== TipType.Nothing &&
										data!.tipType !== TipType.Normal
								})}>
								{data!.tipType === TipType.Nothing ? (
									<b>{`终端${no}`}</b>
								) : (
									<MsgLink
										{...data}
										show={true}
										flash={true}
										clickHandle={msgLinkHandle}>
										{getLinkTxt(data!.tipType!)}
									</MsgLink>
								)}
							</span>
						</div>
					</div>
					<div className="place">
						<DeviceInfo
							{...data}
							collectHandle={collectHandle}
							serverCloudHandle={serverCloudHandle}
							errorHandle={errorHandle}
							stopHandle={stopHandle}
							userHelpHandle={userHelpHandle}
						/>
					</div>
				</div>
			</div>
		);
	}
};

export default memo(DeviceFrame);
