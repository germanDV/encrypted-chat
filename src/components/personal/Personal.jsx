import React from 'react';
import PropTypes from 'prop-types';
import './personal.css';

const Personal = ({ socketId }) => {
    return (
        <div className='personal__container'>
            <h2>Your ID:</h2>
            <h3>{socketId}</h3>
        </div>
    );
};

Personal.propTypes = {
    socketId: PropTypes.string.isRequired,
};

export default Personal;