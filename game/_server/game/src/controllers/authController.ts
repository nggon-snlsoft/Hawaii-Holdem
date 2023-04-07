import { matchMaker, Room, RoomListingData, ServerError } from "colyseus";
import logger from "../util/logger";
import { Request, Response } from "express";
import { RoomState } from "../rooms/schema/HoldemState";
import { HoldemRoom } from "../rooms/HoldemRoom";
import { ClientUserData } from "./ClientUserData";
const conf = require("../config/roomConf");
const gameConf = require('../config/gameConf.json');

const tokenService = require( "../modules/token" );

const TITLE = "VanillaHoldem";
const VERSION = "0.200";

export async function test( req: any, res: any ) {
	console.log('test');
	console.log(req.body);
	res.status( 200 ).json('ok');
}

export async function auth( req: any, res: any ) {

	if( !req.body.pinCode ) {
		return sendError( res, "Incorrect Pin Code." );
	}

	const locPin = req.body.pinCode;
	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;

	const userData: any = await getAccount( req.app.get( "DAO" ), locPin );
	if( userData == undefined) {
		return sendError( res, "Incorrect Pin Code." );
	}

	let clientUserData = ClientUserData.getClientUserData(userData);

	let result : any = {
		user: clientUserData,
		game: gameConf['game'],
	}

	let useLog = conf["full"].useLog;
	result.useLog = useLog;

	await isReconnecting(userData.id, userData.publicRoomID, userData.roomID).then((reconnectInfo) => {
		
		if(reconnectInfo.isPublicReconnecting == true){
			result.roomID = userData.publicRoomID;
			result.isPublic = true;

			return;
		}

		if(reconnectInfo.isPrivateReconnecing == true){
			result.roomID = userData.roomID;
			result.isPublic = false;

			return;
		}
	});

	res.status( 200 ).json(result);
}

export async function setting( req: any, res: any ) {

	if( !req.body.uuid ) {
		return sendError( res, "INCORRECT_UUID" );
	}

	const uuid = req.body.uuid;
	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
	let userSetting: any = await getSetting( req.app.get('DAO'), uuid);

	if ( userSetting == undefined ) {
		const r: any = await insertUserSetting( req.app.get('DAO'), uuid  );
		userSetting = await getSetting( req.app.get('DAO'), uuid);

		if ( userSetting == undefined) {
			console.log('NO_DATA??')
			return sendError( res, "INCORRECT_USER_SETTING" );
		}
	}

	let clientSettingData = ClientUserData.getClientSettingData( userSetting );

	let result : any = {
		setting: clientSettingData,
	}

	res.status( 200 ).json(result);
}

export async function getUserInfoByDB( req: any, res: any ) {

	if ( req.body.uuid == null || req.body.pin == null ) {
		return sendError( res, 'INCORRECT_USER_INFO');
	}
	let uuid = req.body.uuid;
	let pin = req.body.pin;

	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
	console.log( ip );

	const userInfo: any = await getAccount( req.app.get( "DAO" ), pin );
	if( userInfo == undefined) {
		return sendError( res, "INCORRECT_PIN_CODE" );
	}
	let _userInfo = ClientUserData.getClientUserData(userInfo);

	const userSetting: any = await getSetting( req.app.get('DAO'), uuid);

	if ( userSetting == undefined ) {
		return sendError( res, "INCORRECT_USER_SETTING" );
	}

	let _userSetting = ClientUserData.getClientSettingData( userSetting );

	let result : any = {
		info: _userInfo,
		setting: _userSetting
	}

	res.status( 200 ).json(result);
}

export async function getPlayerProfile( req: any, res: any ) {

	if ( req.body.uuid == null) {
		return sendError( res, 'INCORRECT_USER_INFO');
	}
	let uuid = req.body.uuid;

	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;

	const profile: any = await getAccountByIndex( req.app.get( "DAO" ), uuid );
	if( profile == undefined) {
		return sendError( res, "INCORRECT_PIN_CODE" );
	}
	let _profile = ClientUserData.getClientUserData(profile);

	let result : any = {
		profile: _profile,
	}

	res.status( 200 ).json(result);
}

export async function updateUserAvatar( req: any, res: any ) {
	if( !req.body.uuid ) {
		return sendError( res, "INCORRECT_UUID" );
	}

	if( !req.body.avatar ) {
		return sendError( res, "INCORRECT_AVATAR" );
	}

	const uuid = req.body.uuid.toString();
	const avatar = req.body.avatar.toString();

	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
	await setUserAvatar( req.app.get( "DAO" ), uuid, avatar );

	const userInfo: any = await getAccountByIndex( req.app.get('DAO'), uuid);
	if ( userInfo == undefined ) {
		return sendError( res, "INCORRECT_USER_Info" );
	}

	let clientUserData = ClientUserData.getClientUserData( userInfo );

	let result : any = {
		user: clientUserData,
	}

	res.status( 200 ).json(result);
}

export async function updateUserSetting( req: any, res: any ) {
	if( !req.body.uuid ) {
		return sendError( res, "INCORRECT_UUID" );
	}

	if( !req.body.setting ) {
		return sendError( res, "INCORRECT_SETTING" );
	}

	const uuid = req.body.uuid.toString();
	const setting = req.body.setting;

	const ip = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
	await setUserSetting( req.app.get( "DAO" ), uuid, setting );

	const userSetting: any = await getSetting( req.app.get('DAO'), uuid);
	if ( userSetting == undefined ) {
		return sendError( res, "INCORRECT_USER_SETTING" );
	}

	let clientSettingData = ClientUserData.getClientSettingData( userSetting );

	let result : any = {
		setting: clientSettingData,
	}

	res.status( 200 ).json(result);
}

export async function isReconnecting(userID : number, publicRoomID : number, privateRoomID : number) : Promise<any>{
	let resultObj = { 
		isPublicReconnecting : false,
		isPrivateReconnecing : false
	}

	return new Promise(async(res : (result : any) => void, rej) => {
		if (-1 != publicRoomID) {
			let room: RoomListingData<any>[] = await matchMaker.query({ private: false, serial: publicRoomID });
			if (room != null && room.length > 0) {
				let serverRoom: Room<RoomState> = await matchMaker.getRoomById(room[0].roomId);

				if (null != serverRoom) {
					//gamming
					let serverRoomCast = serverRoom as HoldemRoom;
					let publicReconnecting : boolean = serverRoomCast.isUserReconnecting(userID);

					if(publicReconnecting == true){
						resultObj.isPublicReconnecting = true;
						res(resultObj);
						return;
					}
				}
			}
		}

		if (-1 != privateRoomID) {
			let room: RoomListingData<any>[] = await matchMaker.query({ private: true, serial: privateRoomID });
			if (room != null && room.length > 0) {
				let serverRoom: Room<RoomState> = await matchMaker.getRoomById(room[0].roomId);

				if (null != serverRoom) {

					let serverRoomCast = serverRoom as HoldemRoom;
					let privaterReconnecting : boolean = serverRoomCast.isUserReconnecting(userID);

					if(privaterReconnecting == true){
						resultObj.isPrivateReconnecing = true;
						res(resultObj);
						return;
					}
				}
			}
		}

		res(resultObj);
	});
}

export async function joinPrivateRoom(req : Request, res : Response) {
	
	if( null == req.body.pinCode ) {
		return sendError( res, "Incorrect Pin Code." );
	}

	let pinCode : string = req.body.pinCode;

	
	let userData: any = await getAccount( req.app.get( "DAO" ), pinCode);
	if( userData == undefined) {
		return sendError( res, "Incorrect Pin Code." );
	}

	const roomData: any = await getRoom( req.app.get( "DAO" ), userData["roomID"] );
	if( roomData == undefined) {
		return sendError( res, "Incorrect Room Info." );
	}

	let seatReservation: matchMaker.SeatReservation = null;
	let roomID = roomData["maxPlayers"] == 9 ? "holdem_full" : "holdem_short";
	let room = await matchMaker.query({private : true, name : roomID, serial : userData["roomID"]});

	if(null != room && room.length > 0)
	{
		// logger.error("Room Found" + room + "   " + room[0].maxClients + " clinet " + room[0].clients);
		if( room[0].maxClients ==  room[0].clients){
			return sendError( res, "Room is Full" );
		}
	}

	seatReservation = await matchMakeToRoom( roomID, userData["roomID"] );

	userData.pendingSessionId = seatReservation.sessionId;
	userData.pendingSessionTimestamp = Date.now();

	await updateAccountPendingState( req.app.get( "DAO" ), userData );

	const userCopy = { ...userData };
	delete userCopy.pin_code;

	res.status( 200 ).json( {
		seatReservation: seatReservation,
		user: userCopy,
		seatCount : roomData["maxPlayers"]
	});
}

export async function getPrivateRoomInfo(req : Request, res : Response){
	if( null == req.body.pinCode ) {
		return sendError( res, "Incorrect Pin Code." );
	}

	let pinCode : string = req.body.pinCode;

	let userData: any = await getAccount( req.app.get( "DAO" ), pinCode);
	if( userData == undefined) {
		return sendError( res, "Incorrect Pin Code." );
	}

	const roomData: any = await getRoom( req.app.get( "DAO" ), userData["roomID"] );

	if( roomData == undefined) {
		return sendError( res, "Incorrect Room Info." );
	}

	let users : any[] = [];
	
	let room : RoomListingData<any>[] = await matchMaker.query({ private : true, serial : userData["roomID"] });
	if(room != null && room.length > 0){
		let serverRoom : Room<RoomState> = await matchMaker.getRoomById(room[0].roomId);

		if(null != serverRoom){
			let serverRoomCast = serverRoom as HoldemRoom;
			users.push(...serverRoomCast.getEntitiesInfo());
		}
	}

	res.status( 200 ).json( {
		result : roomData,
		users : users
	});
}

export async function cancelRejoin(req : Request, res : Response){

	let roomID : number = req.body.roomID;
	let pin : string = req.body.pin;

	const userData: any = await getAccount( req.app.get( "DAO" ), pin );

	if( userData == undefined) {
		res.status(200).json({});
		return;
	}
	
	//{ private: false, serial: publicRoomID private : true,
	let rooms : RoomListingData<any>[] = await matchMaker.query({  serial: roomID });
	let room : RoomListingData<any> = null;

	if (rooms == null || rooms.length < 1) 
	{
		// rooms = await matchMaker.query({ private : true, serial: roomID });

		// if(rooms == null || rooms.length < 1)
		console.error("no Room number : " + roomID);
		res.status(200).json({});
		return;
	}

	room = rooms[0];

	let serverRoom: Room<RoomState> = await matchMaker.getRoomById(room.roomId);

	if (null == serverRoom) {
		console.error("no server room : " + room.roomId);
		res.status(200).json({});
		return;
	}

	let serverRoomCast = serverRoom as HoldemRoom;
	serverRoomCast.cancelRejoin(userData.id);
	
	res.status(200).json({});
}

function sendError( res: any, msg: string ) {
	logger.info( `[ authController::auth ] sendError : ${ msg }` );
	res.status( 400 ).json( {
		msg: msg
	} );
}

async function updateAccountPendingState( dao: any, updateData: any ) {
	return new Promise( ( res, rej ) => {
		dao.updateAccountPending( updateData, function( err: any, result: any ) {
			if( !!err ) {
				logger.error( "[ authController::updateAccountPendingState ] query error : %s", err );
				rej( new ServerError( 400, "bad access token" ) );
			}
			else {
				// logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
				res( result );
			}
		} );
	} );
}

async function setUserAvatar( dao: any, uuid: string, avatar: string ) {
	return new Promise( (res, rej ) => {

		dao.updateAvatarType( uuid, avatar , function ( err: any, result: any ) {
			if (!!err) {
				rej( new ServerError( 400, "BAD_ACCESS_TOKEN"));
			} else {
				res ( result );
			}
		});
	});
}

async function setUserSetting( dao: any, uuid: string, setting: any ) {
	let value: any = setting;

	return new Promise( (res, rej ) => {

		dao.updateSetting( uuid, value , function ( err: any, result: any ) {
			if (!!err) {
				rej( new ServerError( 400, "BAD_ACCESS_TOKEN"));
			} else {
				res ( result );
			}
		});
	});
}

async function getAccount( dao: any, uid: string ) {
	return new Promise( ( resolve, reject ) => {
		dao.selectAccountByUID( uid, function( err: any, res: any ) {
			if( !!err ) {
				logger.error( "[ authController::getAccount ] query error : %s", err );
				reject( new ServerError( 400, "bad access token" ) );
			}
			else {
				resolve( res[ 0 ] );
			}
		} );
	} );
}

async function getAccountByIndex( dao: any, uid: string ) {
	return new Promise( ( resolve, reject ) => {
		dao.selectAccountByIndex( uid, function( err: any, res: any ) {
			if( !!err ) {
				logger.error( "[ authController::getAccount ] query error : %s", err );
				reject( new ServerError( 400, "bad access token" ) );
			}
			else {
				resolve( res[ 0 ] );
			}
		} );
	} );
}

async function getSetting( dao: any, uuid: string ) {
	return new Promise( ( resolve, reject ) => {
		dao.selectSettingByUUID( uuid, function( err: any, res: any ) {
			if( !!err ) {
				logger.error( "[ authController::getSetting ] query error : %s", err );
				reject( new ServerError( 400, "bad access token" ) );
			}
			else {
				resolve( res[ 0 ] );
			}
		} );
	} );
}

async function getRoom( dao: any, rid: string ) {
	return new Promise( ( resolve, reject ) => {
		dao.selectRoomByUID( rid, function( err: any, res: any ) {
			if( !!err ) {
				logger.error( "[ authController::getRoom ] query error : %s", err );
				reject( new ServerError( 400, "bad access token" ) );
			}
			else {
				// logger.info( "[ authController::getAccount ] query res : %s", JSON.stringify( res[ 0 ] ) );
				resolve( res[ 0 ] );
			}
		} );
	} );
}

async function insertUserSetting( dao: any, uuid: string ) {
	return new Promise( ( resolve, reject ) => {
		dao.insertUserSetting( uuid, function( err: any, res: any ) {
			if( !!err ) {
				reject( new ServerError( 400, "BAD_ACCESS_TOKEN" ) );
			}
			else {
				resolve( res );
			}
		} );
	} );
}

async function matchMakeToRoom( room: string = "holdem", serial: number = 0 ): Promise<matchMaker.SeatReservation> {
	return await matchMaker.joinOrCreate( room, { private : true, serial: serial } );
}
