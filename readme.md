# Chat

A chat web app developed with React and Node.

The goal was to make it:

+ **realtime**, it uses web-sockets (socket.io).
+ **end-to-end encrypted**, it uses JSEncrypt to generate RSA key pairs and perform encryption and decryption on the client.
+ **performant**, it uses a web-worker to handle encryption-related tasks as they are computational heavy, specially the keys generation.