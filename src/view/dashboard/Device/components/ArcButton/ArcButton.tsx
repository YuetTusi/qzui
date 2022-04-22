import React, { FC, MouseEvent } from 'react';
import './ArcButton.less';

const ArcButton: FC<{ onClick?: () => void }> = ({ children, onClick }) => {

    const onButtonClick = (e: MouseEvent) => {
        e.preventDefault();
        if (onClick) {
            onClick();
        }
    };

    return <div
        onClick={onButtonClick}
        className="arc-button-root">
        <span className="arc-left"></span>
        <button
            type="button"
            className="arc-middle">
            {children}
        </button>
        <span className="arc-right"></span>
    </div>;
};

export default ArcButton;