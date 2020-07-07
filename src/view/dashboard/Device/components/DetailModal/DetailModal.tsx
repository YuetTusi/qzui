import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import './DetailModal.less';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 取消回调
     */
    cancelHandle?: () => void;
};

const DetailModal: FC<Prop> = props => {

    return <Modal
        visible={props.visible}
        footer={[
            <Button type="default" icon="close-circle" onClick={props.cancelHandle}>取消</Button>
        ]}
        onCancel={props.cancelHandle}
        title="取证详情"
        width={800}
        className="detail-modal-root">
        <div className="list-block">
            <ul>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.22.wx</span></li>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.tencent.wx 总体进度：80% 总体进度：80总体进度：80总体进度：80</span></li>
                <li><label>【2020-07-07 12:03:18】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:19】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:20】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:21】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:22】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:23】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:24】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:15】</label><span>正在拉取 com.tencent.wx 总体进度：80% 总体进度：80总体进度：80总体进度：80</span></li>
                <li><label>【2020-07-07 12:03:18】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:19】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:20】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:21】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:22】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:23】</label><span>正在拉取 com.tencent.wx</span></li>
                <li><label>【2020-07-07 12:03:24】</label><span>正在拉取 com.tencent.wx</span></li>
            </ul>
        </div>
    </Modal>;
};

DetailModal.defaultProps = {
    visible: false,
    cancelHandle: () => { }
};

export default DetailModal;
