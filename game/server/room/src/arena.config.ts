import { Server } from "colyseus";
import { RedisPresence } from "@colyseus/redis-presence";
import { RedisDriver } from "@colyseus/redis-driver";

import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from "path";
import express from "express";

const cors = require( "cors" );
const methodOverride = require( "method-override" );
// const session = require( "express-session" );
const bodyParser = require( "body-parser" );
const errorHandler = require( "errorhandler" );
const favicon = require( "serve-favicon" );

const sql = require( "./modules/sqlProxy" );
const dao = require( "./modules/dao" );

import { HoldemRoom } from "./rooms/HoldemRoom";
import TableController from "./controllers/TableController";
const port = Number( process.env.PORT || 2568 );

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

let tableController: TableController = null;


export default Arena( {
	getId: () => "Hawaii-Holdem",	

	initializeGameServer: ( gameServer ) => {
		const sqlClient = sql.init();
		dao.init( sqlClient );

		gameServer.define( "full", HoldemRoom, { dao: dao, ts :"full", clientLimit: 9 } ).filterBy( [ "serial" ] );
		gameServer.define( "short", HoldemRoom, { dao: dao, ts : "short", clientLimit: 6 } ).filterBy( [ "serial" ] );

		gameServer.onShutdown( function() {
			console.log( "game server is going down." );
		} );
	},

	initializeExpress: ( app ) => {
		app.use( cors() );
		app.use( methodOverride() );
		app.use( bodyParser.json() );
		app.use( bodyParser.urlencoded( { extended: true } ) );

		if( app.get( "env" ) === "development" ) {
			app.use( errorHandler() );
		}
		else {
		}

		tableController = new TableController();

		app.set( "DAO", dao );
		app.use( "/tables", tableController.router );
		app.use( "/check", (req, res )=>{
			res.send( "GAME_SERVER_OK" );
		} );

		app.get( "/", ( req, res ) => {
			res.send( "It could not be a better day to die~~ :)" );
		} );
		app.use( "/colyseus", monitor() );

		process.on( "uncaughtException", function( err ) {
			console.error( "Caught exception: " + err.stack );
		} );

		process.on( "exit", function( code ) {
			console.log( "About to exit with code : ", code );
		} );
	},

	beforeListen: () => {

	}
} );