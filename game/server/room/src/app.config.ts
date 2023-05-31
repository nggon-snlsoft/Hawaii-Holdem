import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { RedisDriver } from "@colyseus/redis-driver";

const cors = require('cors');
const methodOverride = require( "method-override" );


/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { RedisPresence } from "colyseus";

export default config({
    options: {
        presence: new RedisPresence(),
        driver: new RedisDriver(),
    },

    initializeGameServer: ( gameServer ) => {
        gameServer.define('my_room', MyRoom);

    },

    initializeExpress: (app) => {
        app.use( cors() );
        app.use( methodOverride() );

        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
