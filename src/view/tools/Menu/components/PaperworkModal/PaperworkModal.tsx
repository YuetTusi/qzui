import React, { FC } from "react";
import { Modal } from 'antd';
import { connect } from 'dva';
import { StateTree } from "@src/type/model";
import { PaperworkModalProp } from "./prop";
import "./PaperworkModal.less";

const PaperworkModal: FC<PaperworkModalProp> = ({ visible, onCancel, onOk, paperworkModal }) => {


    return <Modal
        visible={visible}
        onCancel={onCancel}
        title="生成鉴定报告"
        maskClosable={false}
        destroyOnClose={true}>
        <div className="paperwork-modal-root">

        </div>
    </Modal>
};

export default connect((state: StateTree) => state.paperworkModal)(PaperworkModal);