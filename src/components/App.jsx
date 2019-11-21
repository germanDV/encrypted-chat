// Dependencies
import React, {
    useState,
    useEffect,
    useCallback,
    useReducer,
} from 'react';
import io from 'socket.io-client';
import Input from './input/Input';
import History from './history/History';
import Contacts from './contacts/Contacts';
import Personal from './personal/Personal';

// Instantiate web-worker
const worker = new Worker('./worker.js');

// Create socket
const socket = io();

// Initial state for reducer
const initialState = {
    chat: [],
    contacts: [],
    to: {
        id: null,
        key: null,
    },
};

// Reducer
function reducer(state, action){
    switch(action.type){
        case 'set-chat':
            return {
                ...state,
                chat: [
                    ...state.chat,
                    action.payload,
                ],
            };

        case 'set-contacts':
            return {
                ...state,
                contacts: action.payload,
            };

        case 'new-contact':
            return {
                ...state,
                contacts: [
                    ...state.contacts,
                    action.payload,
                ],
            };

        case 'contact-die':
            return {
                ...state,
                contacts: state.contacts.filter(i => i.id !== action.payload),
            };

        case 'contacts-unread':
            const currentContactId = state.to.id;
            return {
                ...state,
                contacts: state.contacts.map(cont => {
                    if(cont.id === action.payload && cont.id !== currentContactId){
                        cont.unread = true;
                    }
                    return cont;
                }),
            };

        case 'contacts-read':
            return {
                ...state,
                contacts: state.contacts.map(cont => {
                    if(cont.id === action.payload){
                        cont.unread = false;
                    }
                    return cont;
                }),
            };

        case 'set-to':
            return {
                ...state,
                to: action.payload,
            };

        default:
            return state;
    }
}

const App = () => {
    const [mySocketId, setMySocketId] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [state, dispatch] = useReducer(reducer, initialState);

    const keysHandler = useCallback((pubKey) => {
        // Store public key on local state
        setPublicKey(pubKey);

        // Publish public key on socket
        socket.emit('public-key', pubKey);
    }, []);

    const encryptedHandler = useCallback((msg) => {
        // Emit new message through the socket
        socket.emit('new-message', JSON.stringify(msg));
    }, []);

    const decryptedHandler = useCallback((msg) => {
        // Add flag to contact to indicate there's a new message
        dispatch({
            type: 'contacts-unread',
            payload: msg.from,
        });

        // Add incoming decrypted message to local state
        dispatch({
            type: 'set-chat',
            payload: msg,
        });
    }, []);

    // Set up listeners for socket events
    useEffect(() => {
        // Listen to messages from web-worker
        worker.onmessage = (ev) => {
            switch(ev.data.msg){
                case 'keys':
                    keysHandler(ev.data.payload);
                    break;
                case 'encrypted':
                    encryptedHandler(ev.data.payload);
                    break;
                case 'decrypted':
                    decryptedHandler(ev.data.payload);
                    break;
                default:
                    console.log('web-worker error');
            }
        };

        // Send message to web-worker to generate a key-pair
        worker.postMessage({ cmd: 'keys', payload: null });

        // Receive list of all online contacts
        socket.on('all-contacts', (contactArr) => {
            dispatch({
                type: 'set-contacts',
                payload: JSON.parse(contactArr),
            });
        });

        // Store my socket.id for future reference
        socket.on('your-socket-id', (socketId) => {
            setMySocketId(socketId);
        });

        // Add new contact to local state
        socket.on('new-contact', (contact) => {
            dispatch({
                type: 'new-contact',
                payload: JSON.parse(contact),
            });
        });

        // Remove disconnected contact from local state
        socket.on('contact-die', (contactId) => {
            dispatch({
                type: 'contact-die',
                payload: contactId,
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
        if(!state.to.id || !publicKey) return;

        const newMsg = {
            at: Date.now(),
            from: mySocketId,
            fromKey: publicKey,
            to: state.to.id,
            key: state.to.key,
            text: msg,
        };

        // Ask worker to encrypt message
        worker.postMessage({
            cmd: 'encrypt',
            payload: newMsg,
        });

        // Add new message to local state
        dispatch({
            type: 'set-chat',
            payload: newMsg,
        });
    };

    const establishChatHandler = (contact) => {
        dispatch({
            type: 'set-to',
            payload: contact,
        });
        // Remove "unread" flag from contact
        dispatch({
            type: 'contacts-read',
            payload: contact.id,
        });
    };

    return (
        <main>
            <div className='top-row'>
                <div className='left'>
                    <History
                        chat={state.chat}
                        to={state.to.id || ''}
                        mySocketId={mySocketId}
                    />
                </div>
                <div className='right'>
                    <div className='top'>
                        <Contacts
                            contacts={state.contacts.filter(i => i.id !== mySocketId)}
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