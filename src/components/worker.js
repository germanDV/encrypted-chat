// For JSEncrypt to work in a web-worker
self.window = self;

// Import JSEncrypt library
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/2.3.1/jsencrypt.min.js');

let crypto;
let privateKey;

self.addEventListener('message', (event) => {
    switch(event.data.cmd){
        case 'keys':
            crypto = new JSEncrypt({ default_key_size: 2056 });
            privateKey = crypto.getPrivateKey();
            const publicKey = crypto.getPublicKey();

            self.postMessage({
                msg: 'keys',
                payload: publicKey,
            });

            break;

        case 'encrypt':
            const { text, key } = event.data.payload;
            crypto.setKey(key);

            self.postMessage({
                msg: 'encrypted',
                payload: {
                    ...event.data.payload,
                    text: crypto.encrypt(text),
                },
            });

            break;

        case 'decrypt':
            const encrypted = event.data.payload.text;
            crypto.setKey(privateKey);
            const decrypted = crypto.decrypt(encrypted);

            self.postMessage({
                msg: 'decrypted',
                payload: {
                    ...event.data.payload,
                    text: decrypted,
                },
            });
            break;

        default:
            self.postMessage('ERROR: cmd not found.');
            break;
    }
});
