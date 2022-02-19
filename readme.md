# Bouncification

A browser multiplayer game with bouncing balls.

Cliend side is written in TypeScript using [Phaser](https://phaser.io/) game framework, and is based on [parcel template by Ourcade](https://github.com/ourcade/phaser3-parcel-template).

It's using [Colyseus game server](https://www.colyseus.io/), and is running on [Colyseus Arena cloud hosting](https://www.colyseus.io/arena) under a free tier.

[matter.js](https://brm.io/matter-js/) physics engine is used on both client and server sides.

⚠️ Please note that the server is located in Germany, and your game experience may be different depending on your proximity to the data center.

[You can play it here](https://aexy8j.colyseus.de/)

![Bouncification](https://user-images.githubusercontent.com/8040747/154810647-74c16911-94e2-40b5-8052-bcdfc38fdfaa.gif)

## Local development

### Preconditions

- Node.js version v14.18.2
- macOS or Linux/Unix operating system

```
npm install
```

### Running in dev mode

Start server:

```
npm run start-server
```

Start client:

```
npm run start
```

Open the following URL in your browser:

```
http://localhost:8000/
```

Monitor server and room states:

```
http://localhost:2567/colyseus/#/
```

## Build and deploy to your own hosting

```
npm run build
```

Upload the contents of `./dist/server` to Colyseus Arena or any other hosting of your choice.

Server application includes [Express](https://expressjs.com/) web server, and is serving the client web page automatically.

## Hope you enjoy it!

If you find this repo helpful in any way, please consider giving it a star.

Also, if you have any suggestions on how this project can be improved, please submit a PR or create an issue - I'd be forever grateful.
