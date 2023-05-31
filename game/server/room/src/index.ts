
// import { listen } from "@colyseus/arena";
// import arenaConfig from "./arena.config";

// listen( arenaConfig, 7600 );

import { HoldemRoomServer } from "./main";

let rooms = new HoldemRoomServer();
rooms.ListenServer( 8000 );
