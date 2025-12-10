import React from 'react';
import './MitchellCottsLogo.css';

const MitchellCottsLogo = ({ size = 32, className = '' }) => {
    return (
        <div className={`mitchell-cotts-logo ${className}`} style={{ width: size, height: size }}>
            <div className="diamond top"></div>
            <div className="diamond middle"></div>
            <div className="diamond bottom"></div>
        </div>
    );
};

export default MitchellCottsLogo;
