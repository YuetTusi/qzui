import React, { FC, useState } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import Modal from 'antd/lib/Modal';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import CrackModal from './components/CrackModal/CrackModal';
import { helper } from '@utils/helper';
import { StoreComponent } from '@src/type/model';
import { MenuStoreState } from '@src/model/tools/Menu/Menu';
import bcpSvg from './images/bcp.svg';
import indataSvg from './images/indata.svg';
import uploadSvg from './images/upload.svg';
import crackSvg from './images/crack.svg';
import './Menu.less';

const config = helper.readConf();

interface Prop extends StoreComponent {
	/**
	 * 仓库数据
	 */
	menu: MenuStoreState;
}

/**
 * 工具箱菜单
 * @param props 属性
 */
const Menu: FC<Prop> = (props) => {
	const [importDataModalVisible, setImportDataModalVisible] = useState<boolean>(false);
	const [crackModalVisible, setCrackModalVisible] = useState<boolean>(false);

	/**
	 * 关闭导入弹框
	 */
	const importDataModalCancelHandle = () => setImportDataModalVisible(false);

	return (
		<div className="tools-menu">
			<menu className={classnames({ pad: config.max <= 2 })}>
				<li>
					<a
						onClick={() =>
							Modal.info({
								title: 'BCP生成',
								content: '新功能，敬请期待',
								okText: '确定'
							})
						}>
						<i>
							<img src={bcpSvg} />
						</i>
						<div className="info">
							<span>BCP生成</span>
							<em>将报告文件生成BCP文件</em>
						</div>
					</a>
				</li>
				<li>
					<a
						onClick={() => {
							Modal.info({
								title: 'BCP上传',
								content: '请在设置→FTP配置中进行设置',
								okText: '确定'
							});
						}}>
						<i>
							<img src={uploadSvg} />
						</i>
						<div className="info">
							<span>BCP上传</span>
							<em>将案件上传到指定FTP服务器</em>
						</div>
					</a>
				</li>
				<li>
					<a onClick={() => setImportDataModalVisible(true)}>
						<i>
							<img src={indataSvg} />
						</i>
						<div className="info">
							<span>导入数据</span>
							<em>导入第三方数据进行解析</em>
						</div>
					</a>
				</li>
				<li>
					<a
						onClick={() => {
							setCrackModalVisible(true);
						}}>
						<i>
							<img src={crackSvg} />
						</i>
						<div className="info">
							<span>应用锁破解</span>
							<em>破解OPPO&VIVO手机应用锁</em>
						</div>
					</a>
				</li>
			</menu>
			<ImportDataModal
				isLoading={false}
				visible={importDataModalVisible}
				cancelHandle={importDataModalCancelHandle}
			/>
			<CrackModal
				visible={crackModalVisible}
				cancelHandle={() => setCrackModalVisible(false)}></CrackModal>
		</div>
	);
};

export default connect((state: any) => ({ menu: state.menu }))(Menu);
