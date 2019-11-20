// Dependencies
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Input from './input/Input';
import History from './history/History';
import Contacts from './contacts/Contacts';
import Personal from './personal/Personal';

// Create socket
const socket = io();

const App = () => {
    const [chat, setChat] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [mySocketId, setMySocketId] = useState('');
    const [to, setTo] = useState('');

    // Set up listeners for socket events
    useEffect(() => {
        // Add list of all online contacts when connecting
        socket.on('all-contacts', (contactArr) => {
            setContacts(JSON.parse(contactArr));
        });

        // Store my socket.id for future reference
        socket.on('your-socket-id', (socketId) => {
            setMySocketId(socketId);
        });

        // Add new contact to local state
        socket.on('new-contact', (contactId) => {
            setContacts(prev => [...prev, contactId]);
        });

        // Remove disconnected contact from local state
        socket.on('contact-die', (contactId) => {
            setContacts(prevState => {
                return prevState.filter(i => i !== contactId);
            });
        });

        // Listen for new messages and add them to local state
        socket.on('new-message', (msg) => {
            msg = JSON.parse(msg);

            // if it is the first message on the chat, set the "to"
            if(!to){
                setTo(msg.from);
            }

            // Add message to chat
            setChat(prevState => [msg, ...prevState]);
        });
    }, []);

    const newMessageHandler = (msg) => {
        if(!to) return;

        const newMsg = {
            at: Date.now(),
            from: mySocketId,
            to,
            text: msg,
        };

        // Add new message to local state
        setChat(prevState => [newMsg, ...prevState]);

        // Emit new message through the socket
        socket.emit('new-message', JSON.stringify(newMsg));
    };

    const establishChatHandler = (contactId) => {
        setTo(contactId);
    };

    return (
        <main>
            <div className='top-row'>
                <div className='left'>
                    <History
                        chat={chat}
                        to={to}
                        mySocketId={mySocketId}
                    />
                </div>
                <div className='right'>
                    <div className='top'>
                        <Contacts
                            contacts={contacts}
                            onEstablishChat={establishChatHandler}
                        />
                    </div>
                    <div className='bottom'>
                        <Personal socketId={mySocketId} />
                    </div>
                </div>
            </div>
            <div className='bottom-row'>
                <Input onSubmit={newMessageHandler} />
            </div>
        </main>
    );
};

export default App;