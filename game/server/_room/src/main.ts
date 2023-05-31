import { RedisPresence } from '@colyseus/redis-presence';
import { RedisDriver} from '@colyseus/redis-driver';
import { http } from 'http';
import { Server } from '@colyseus/core';

import express, { Response, Request, NextFunction } from 'express';
import { HoldemRoom } from "./rooms/HoldemRoom";
import { monitor } from '@colyseus/monitor';

import TableController from './controllers/TableController';
// import { http } from './util/logger';
let tableController: TableController = null;

const cors = require('cors');
const methodOverride = require( "method-override" );
const bodyParser = require( "body-parser" );
const errorHandler = require( "errorhandler" );

const SQL = require( "./modules/sqlProxy" );
const DAO = require( "./modules/dao" );

export class HoldemRoomServer {
    private HOLDEM_SERVER: any = null;
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

        this.HOLDEM_SERVER = new Server( {            
            presence: new RedisPresence(),
            driver: new RedisDriver(),
            server: createServer( this.app ),
            gracefullyShutdown: true,
        });

        this.HOLDEM_SERVER.define( "holdem_full", HoldemRoom, { dao: DAO, ts :"full", clientLimit: 9 } ).filterBy( [ "serial" ] );
        this.HOLDEM_SERVER.define( "holdem_short", HoldemRoom, { dao: DAO, ts : "short", clientLimit: 6 } ).filterBy( [ "serial" ] );

        this.HOLDEM_SERVER.onShutdown( function() {
            console.log( "HOLDEM SERVER IS GOING DOWN" );
        } );

        tableController = new TableController();
        if ( tableController != null ) {
            this.app.use( '/tables', tableController.router );
        }
    }

    public ListenServer( port: number ) {
        this.port = 6000;
        console.log( 'Holdem Server Listen: ' + this.port );
        // this.app.listen(port);
        this.HOLDEM_SERVER.listen( this.port );
    }
}