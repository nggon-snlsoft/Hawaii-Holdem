
// import { listen } from "@colyseus/arena";
// import arenaConfig from "./arena.config";

// listen( arenaConfig, 7600 );

import { HoldemRoomServer } from "./main";

const PORT = Number( process.env.PORT ) + Number( process.env.NODE_APP_INSTANCE );
let rooms = new HoldemRoomServer();
if ( rooms != null ) {
    rooms.ListenServer( PORT );
}

