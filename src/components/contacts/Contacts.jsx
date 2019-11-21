import React from 'react';
import PropTypes from 'prop-types';
import './contacts.css';

const Contacts = (props) => {
    if(!props.isReady){
        return (
            <div className='contacts__container'>
                <h2>Generating key-pair...</h2>
            </div>
        );
    }
    return (
        <div className='contacts__container'>
            <h2>online contacts</h2>
            <ul>
                {props.contacts.map(contact => {
                    return (
                        <li
                            key={contact.id}
                            onClick={() => props.onEstablishChat(contact)}
                        >
                            <span className='contacts__icon' role='img' aria-label='user'>
                                &#128125;
                            </span>
                            <span className='contacts__id'>
                                {contact.id}
                            </span>
                            {contact.unread && (
                                <span className='contacts__new' role='img' aria-label='new message'>
                                    &#9756;
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

Contacts.propTypes = {
    contacts: PropTypes.arrayOf(PropTypes.object).isRequired,
    onEstablishChat: PropTypes.func.isRequired,
    isReady: PropTypes.bool.isRequired,
};

export default Contacts;