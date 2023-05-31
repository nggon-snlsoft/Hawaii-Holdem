"use strict";
// import { listen } from "@colyseus/arena";
// import arenaConfig from "./arena.config";
Object.defineProperty(exports, "__esModule", { value: true });
// listen( arenaConfig, 7600 );
const main_1 = require("./main");
const PORT = Number(process.env.PORT) + Number(process.env.NODE_APP_INSTANCE);
console.log('process.env.PORT' + process.env.PORT);
console.log('process.env.NODE_APP_INSTANCE: ' + process.env.NODE_APP_INSTANCE);
console.log('PORT: ' + PORT);
let rooms = new main_1.HoldemRoomServer();
if (rooms != null) {
    rooms.ListenServer(PORT);
}
