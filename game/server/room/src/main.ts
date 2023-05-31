import { RedisPresence } from '@colyseus/redis-presence';
import { RedisDriver} from '@colyseus/redis-driver';
import { createServer } from 'http';
import { Server } from 'colyseus';
import express, { Response, Request, NextFunction } from 'express';
import { HoldemRoom } from "./rooms/HoldemRoom";
import { monitor } from '@colyseus/monitor';

import TableController from './controllers/TableController';
let tableController: TableController = null;

const cors = require('cors');
const methodOverride = require( "method-override" );
const bodyParser = require( "body-parser" );
const errorHandler = require( "errorhandler" );

const SQL = require( "./modules/sqlProxy" );
const DAO = require( "./modules/dao" );

const HoldemServer = new Server( {
    presence: new RedisPresence(),
    driver: new RedisDriver(),
    gracefullyShutdown: true,
});

export class HoldemRoomServer {
    private app: express.Application;
    private port: number = -1;

    constructor() {
        this.InitExpress();
        this.InitMiddleWares();
        this.InitServer();
    }

    private InitExpress() {
        this.app = express();
        this.app.use( cors() );
        this.app.use( methodOverride() );
        this.app.use( bodyParser.json() );
        this.app.use( bodyParser.urlencoded() );
        if ( this.app.get( 'env' ) == 'development ') {
            this.app.use ( errorHandler() );
        }

        this.app.set( 'DAO', DAO );
        this.app.use( '/colyseus', monitor() );

        tableController = new TableController();
        if ( tableController != null ) {
            this.app.use( '/tables', tableController.router );
        }
		this.app.use( "/check", (req, res )=>{
			res.send( "GAME_SERVER_OK" );
		} );

		process.on( "uncaughtException", function( err ) {
			console.error( "Caught exception: " + err.stack );
		} );

		process.on( "exit", function( code ) {
			console.log( "About to exit with code : ", code );
		} );        
    }

    private InitMiddleWares() {
        const SQL_CLIENT = SQL.init();
        DAO.init( SQL_CLIENT );
    }

    private InitServer() {
        HoldemServer.define( "holdem_full", HoldemRoom, { dao: DAO, ts :"full", clientLimit: 9 } ).filterBy( [ "serial" ] );
        HoldemServer.define( "holdem_short", HoldemRoom, { dao: DAO, ts : "short", clientLimit: 6 } ).filterBy( [ "serial" ] );

        HoldemServer.onShutdown( function() {
            console.log( "HOLDEM SERVER IS GOING DOWN" );
        } );
    }

    public ListenServer( port: number ) {
        this.port = port;

        this.app.listen(port);
        HoldemServer.listen( 8100 );
    }
}