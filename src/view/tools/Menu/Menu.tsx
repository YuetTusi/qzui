import React, { FC, useRef, useState, MouseEvent } from 'react';
import { connect } from 'dva';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons';
import { StateTree, StoreComponent } from '@src/type/model';
import { MenuStoreState } from '@src/model/tools/Menu/Menu';
import { ImportTypes } from '@src/schema/ImportType';
import { CrackTypes } from '@src/schema/CrackTypes';
import ImportDataModal from './components/ImportDataModal/ImportDataModal';
import CrackModal from './components/CrackModal/CrackModal';
import huaweiSvg from './images/huawei.svg';
import oppoSvg from './images/oppo.svg';
import vivoSvg from './images/vivo.svg';
import './Menu.less';

// const config = helper.readConf();

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
	const currentImportType = useRef(ImportTypes.IOS);
	const currentCrackType = useRef(CrackTypes.VivoAppLock);

	/**
	 * 关闭导入弹框
	 */
	const importDataModalCancelHandle = () => setImportDataModalVisible(false);

	/**
	 * 导入第三方数据按钮Click
	 * @param event 事件对象
	 * @param type 导入类型
	 */
	const importDataLiClick = (event: MouseEvent<HTMLLIElement>, type: ImportTypes) => {
		currentImportType.current = type;
		setImportDataModalVisible(true);
	};

	/**
	 * 应用锁破解按钮Click
	 * @param event 事件对象
	 * @param type 破解类型
	 */
	const crackLiClick = (event: MouseEvent<HTMLLIElement>, type: CrackTypes) => {
		currentCrackType.current = type;
		setCrackModalVisible(true);
	};

	return (
		<div className="tools-menu">
			<div className="sort-root">
				<div className="sort">
					<div className="caption">导入第三方数据</div>
					<hr />
					<ul>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.IOS)
							}>
							<div className="fn-box">
								<i>
									<FontAwesomeIcon icon={faApple} style={{ color: '#222' }} />
								</i>
								<span>苹果iTunes备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.Hisuite)
							}>
							<div className="fn-box">
								<i>
									<img src={huaweiSvg} />
								</i>
								<span>华为Hisuite备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.VivoEasyshare)
							}>
							<div className="fn-box">
								<i>
									<img src={vivoSvg} />
								</i>
								<span>VIVO自备份</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								importDataLiClick(e, ImportTypes.OppoBackup)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO自备份</span>
							</div>
						</li>
					</ul>
				</div>
				<div className="sort">
					<div className="caption">应用锁破解</div>
					<hr />
					<ul>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.VivoAppLock)
							}>
							<div className="fn-box">
								<i>
									<img src={vivoSvg} />
								</i>
								<span>VIVO应用锁</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.OppoAppLock)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO应用锁</span>
							</div>
						</li>
						<li
							onClick={(e: MouseEvent<HTMLLIElement>) =>
								crackLiClick(e, CrackTypes.OppoMoveLock)
							}>
							<div className="fn-box">
								<i>
									<img src={oppoSvg} />
								</i>
								<span>OPPO搬家锁</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<ImportDataModal
				visible={importDataModalVisible}
				type={currentImportType.current}
				cancelHandle={importDataModalCancelHandle}
			/>
			<CrackModal
				visible={crackModalVisible}
				type={currentCrackType.current}
				cancelHandle={() => setCrackModalVisible(false)}></CrackModal>
		</div>
	);
};

export default connect((state: StateTree) => ({ menu: state.menu }))(Menu);
