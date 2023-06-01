import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { RedisDriver } from "@colyseus/redis-driver";
import { RedisPresence } from "colyseus";

import basicAuth from 'express-basic-auth';

const cors = require('cors');
const methodOverride = require( "method-override" );
const bodyParser = require( "body-parser" );
const errorHandler = require( "errorhandler" );

import { HoldemRoom } from "./rooms/HoldemRoom";
import TableController from "./controllers/TableController";
const SQL = require( "./modules/sqlProxy" );
const DAO = require( "./modules/dao" );

const basicAuthMiddleware = basicAuth( {
    users: {
        'admin': 'admin',
    },
    challenge: true,
});

const SQL_CLIENT = SQL.init();
DAO.init( SQL_CLIENT );

let TABLE_CONTROLLER: TableController = new TableController;

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

let pid: string = process.env.NODE_APP_INSTANCE;
if ( pid == null ) {
    pid = '0';
}

let uAddress = 'server-' + pid + '.hawaiiholdem.com';

export default config({
    options: {
        presence: new RedisPresence(),
        driver: new RedisDriver(),
        publicAddress: uAddress
    },
	getId: () => "Hawaii-Holdem",
    initializeGameServer: ( gameServer ) => {        
        gameServer.define( "holdem_full", HoldemRoom, { dao: DAO, ts :"full", clientLimit: 9 } ).filterBy( [ "serial" ] );
		gameServer.define( "holdem_short", HoldemRoom, { dao: DAO, ts : "short", clientLimit: 6 } ).filterBy( [ "serial" ] );

		gameServer.onShutdown( function() {
			console.log( "game server is going down." );
		} );
    },

    initializeExpress: (app) => {
        app.use( cors() );
        app.use( methodOverride() );

        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.set( 'DAO', DAO );
        app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded( { extended: true } ) );

        app.use( '/tables', TABLE_CONTROLLER.router );
        app.use( "/check", (req, res )=>{
			res.send( "GAME_SERVER_OK" );
		} );

        if( app.get( "env" ) === "development" ) {
			app.use( errorHandler() );
		}
		else {
		}

        app.use("/monitor/rooms", basicAuthMiddleware ,monitor());

        process.on( "uncaughtException", function( err ) {
			console.error( "Caught exception: " + err.stack );
		} );

		process.on( "exit", function( code ) {
			console.log( "About to exit with code : ", code );
		} );
    },

    beforeListen: () => {

    }
});