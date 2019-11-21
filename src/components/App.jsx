// Dependencies
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Input from './input/Input';
import History from './history/History';
import Contacts from './contacts/Contacts';
import Personal from './personal/Personal';

// Instantiate web-worker
const worker = new Worker('./worker.js');

// Create socket
const socket = io();

const App = () => {
    const [chat, setChat] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [mySocketId, setMySocketId] = useState('');
    const [to, setTo] = useState({});
    const [publicKey, setPublicKey] = useState('');

    const keysHandler = (pubKey) => {
        // Store public key on local state
        setPublicKey(pubKey);

        // Publish public key on socket
        socket.emit('public-key', pubKey);
    };

    // Set up listeners for socket events
    useEffect(() => {
        // Send message to web-worker to generate a key-pair
        worker.postMessage({ cmd: 'keys', payload: null });

        // Listen to messages from web-worker
        worker.onmessage = (ev) => {
            switch(ev.data.msg){
                case 'keys':
                    keysHandler(ev.data.payload);
                    break;
                case 'encrypted':
                    // Emit new message through the socket
                    socket.emit('new-message', JSON.stringify(ev.data.payload));
                    break;
                case 'decrypted':
                    // Add incoming decrypted message to local state
                    const msg = ev.data.payload;
                    setTo({ id: msg.from, key: msg.fromKey });
                    setChat(prevState => [msg, ...prevState]);
                    break;
                default:
                    console.log('web-worker error');
            }
        };

        // Receive list of all online contacts
        socket.on('all-contacts', (contactArr) => {
            setContacts(JSON.parse(contactArr));
        });

        // Store my socket.id for future reference
        socket.on('your-socket-id', (socketId) => {
            setMySocketId(socketId);
        });

        // Add new contact to local state
        socket.on('new-contact', (contact) => {
            setContacts(prev => [...prev, JSON.parse(contact)]);
        });

        // Remove disconnected contact from local state
        socket.on('contact-die', (contactId) => {
            setContacts(prevState => {
                return prevState.filter(i => i.id !== contactId);
            });
        });

        // Listen for new messages and add them to local state
        socket.on('new-message', (msg) => {
            // Ask worker to decrypt incoming message
            worker.postMessage({
                cmd: 'decrypt',
                payload: JSON.parse(msg),
            });
        });
    }, []);

    const newMessageHandler = (msg) => {
        if(!to || !publicKey) return;

        const newMsg = {
            at: Date.now(),
            from: mySocketId,
            fromKey: publicKey,
            to: to.id,
            key: to.key,
            text: msg,
        };

        // Ask worker to encrypt message
        worker.postMessage({
            cmd: 'encrypt',
            payload: newMsg,
        });

        // Add new message to local state
        setChat(prevState => [newMsg, ...prevState]);
    };

    const establishChatHandler = (contact) => {
        setTo(contact);
    };

    return (
        <main>
            <div className='top-row'>
                <div className='left'>
                    <History
                        chat={chat}
                        to={to.id || ''}
                        mySocketId={mySocketId}
                    />
                </div>
                <div className='right'>
                    <div className='top'>
                        <Contacts
                            // only pass contacts with a public key
                            contacts={contacts.filter(i => i.key && i.id !== mySocketId)}
                            onEstablishChat={establishChatHandler}
                            isReady={Boolean(publicKey)}
                        />
                    </div>
                    <div className='bottom'>
                        <Personal
                            socketId={mySocketId}
                            publicKey={publicKey}
                        />
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