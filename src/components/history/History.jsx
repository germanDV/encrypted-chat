import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './history.css';

const History = ({ chat, to, mySocketId }) => {
    const ulEl = useRef(null);

    useEffect(() => {
        ulEl.current.scrollTop =
            ulEl.current.scrollHeight
            - ulEl.current.clientHeight;
    }), [chat, to];

    return (
        <div className='history__container'>
            <h2>Chat with: <span>{to}</span></h2>
            <ul ref={ulEl}>
                {chat.map(msg => {
                    if(msg.from === to || msg.to === to){
                        return (
                            <li key={msg.at}>
                                <span className={msg.from === mySocketId ? 'green' : 'red'}>
                                    {msg.from}:
                                </span>
                                {msg.text}
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
};

History.propTypes = {
    chat: PropTypes.array.isRequired,
    to: PropTypes.string.isRequired,
    mySocketId: PropTypes.string.isRequired,
};

export default History;