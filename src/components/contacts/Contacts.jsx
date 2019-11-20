import React from 'react';
import PropTypes from 'prop-types';
import './contacts.css';

const Contacts = (props) => {
    return (
        <div className='contacts__container'>
            <h2>online contacts</h2>
            <ul>
                {props.contacts.map(contact => (
                    <li
                        key={contact}
                        onClick={() => props.onEstablishChat(contact)}
                    >
                        <span className='contacts__icon'>&#128125;</span>
                        <span className='contacts__id'>{contact}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

Contacts.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.string).isRequired,
    onEstablishChat: PropTypes.func.isRequired,
};

export default Contacts;