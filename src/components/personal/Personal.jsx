import React from 'react';
import PropTypes from 'prop-types';
import './personal.css';

const Personal = ({ socketId, publicKey }) => {
    return (
        <div className='personal__container'>
            <h2>Your ID:</h2>
            <h3>{socketId}</h3>
            <h2>Your public key:</h2>
            <span>{publicKey || 'is being generated...'}</span>
        </div>
    );
};

Personal.propTypes = {
    socketId: PropTypes.string.isRequired,
    publicKey: PropTypes.string.isRequired,
};

export default Personal;