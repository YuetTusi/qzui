import React, { FC } from 'react';
import { helper } from '@src/utils/helper';
import { ListOptionProp } from './prop';

/**
 * 版本信息项
 * 如果内容为空值或空串，不显示
 */
const ListOption: FC<ListOptionProp> = ({ children, label }) =>
    helper.isNullOrUndefinedOrEmptyString(children)
        ? null
        : <div>
            <label>{label}</label>
            <span>{children}</span>
        </div>;

ListOption.defaultProps = {
    label: ''
}

export { ListOption };