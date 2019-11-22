# Chat

A chat web app developed with React and Node.


## Goal

The goal was to make it:

+ **realtime**, it uses web-sockets (socket.io).
+ **end-to-end encrypted**, it uses JSEncrypt to generate RSA key pairs and perform encryption and decryption on the client.
+ **performant**, it uses a web-worker to handle encryption-related tasks as they are computational heavy, specially the keys generation.


## Pipeline

When a client connects, a key-pair is generated on the client. The client gets assigned a socket id by the server, who then notifies all other sockets about the new one and shares its public key.

When writing a message to another client, the message is encrypted by the sender (on the sender's machine) using the recipient's public key. The encrypted message is signed with the sender's private key.

The recipient of the message decrypts it (on the recipient's machine) using its private key and verifies the signature with the sender's public key.