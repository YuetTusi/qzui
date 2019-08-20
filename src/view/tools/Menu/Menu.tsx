import React, { ReactElement, PropsWithChildren } from 'react';
import { Link } from 'dva/router';
import './Menu.less';

interface IProp { }

/**
 * @description BCP二级菜单
 */
function Menu(props: PropsWithChildren<IProp>): ReactElement {
    return <div className="tools-menu">
        <menu>
            <li>
                <Link to="/tools/bcp-generator">
                    <i className="gen"></i>
                    <div className="info">
                        <span>BCP生成</span>
                        <em>可以将案件信息生成为BCP文件</em>
                    </div>
                </Link>
            </li>
            <li>
                <Link to="/tools/bcp-upload">
                    <i className="upload"></i>
                    <div className="info">
                        <span>BCP上传</span>
                        <em>可以将案件上传到指定FTP服务器</em>
                    </div>
                </Link>
            </li>
            <li>
                <Link to="/tools/report">
                    <i className="report"></i>
                    <div className="info">
                        <span>报告生成</span>
                        <em>可以将案件信息生成为HTML报告</em>
                    </div>
                </Link>
            </li>
        </menu>
    </div>

}

export default Menu;