// @ts-ignore
import ColySeus from "db://colyseus-sdk/colyseus.js"
import * as cc from "cc";
import { _decorator, Component, Node } from 'cc';
import { ENUM_BETTING_TYPE } from "./Game/UiBettingControl";
const { ccclass } = cc._decorator;

export enum ENUM_RESULT_CODE {
	DISCONNECT_SERVER = -2,
	UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

export enum HOLDEM_SERVER_TYPE {
	API_SERVER = 0,
	GAME_SERVER = 1,
}

const apiHost: string = '127.0.0.1';
const apiPort: number = 2600;

const gameHost: string = '127.0.0.1';
const gamePort: number = 2568;

@ccclass('NetworkManager')
export class NetworkManager extends cc.Component {
    private static _instance : NetworkManager = null;
    private pin : string = "";

    useSSL = false;
	client!: Colyseus.Client;
	room!: Colyseus.Room;

	public leaveReason : number = -1;

	private userInfo : any = null;
	private userSetting: any = null;
	private gameSetting: any = null;	

    public static Instance() : NetworkManager
	{
		if(null == this._instance){
			this._instance = new NetworkManager();
		}
		
		return this._instance;
	}

	public logout() {
		this.userInfo = null;
		this.userSetting = null;
		this.gameSetting = null;
		
		this.pin = '';
	}

	public async reqCHECK_VERSION( version: number, onSuccess:(res: any)=>void , onFail:(msg: any)=>void) {
		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/checkVersion', {
			version: version,
		} )
		.then( (res: String)=> {

		})
		.catch( (err: any)=>{

		});
	}

    public async reqLOGIN_HOLDEM( uid: string, password: string, onSuccess : (res : any) => void, onFail : (err : any) => void) {
		let result: string = null;
		let error: string = null;
		let isConnect: boolean = true;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/login', {
			uid: uid,
			password: password,

		} ).then(( res: string ) => {
			isConnect = true;
			result = res;
			}
		).catch( function( err: any ) {
			if ( err.length == 0 ) {
				isConnect = false;
				return;
			}

			err = JSON.parse( err );
			error = err.msg;
		} );

		if ( !isConnect ) {
			onFail({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		if( error != null ) {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: error,
			});
			return;
		}

		if( result == null || result == undefined ) {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'NO_USER',
			});
			return;
		}

		let obj : any = JSON.parse( result );
		if(null == obj){
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'JSON_PARSE_ERROR',
			});
			return;
		}

		onSuccess( {
			code: ENUM_RESULT_CODE.SUCCESS,
			obj: obj,			
		});
	}

    async reqLOAD_INITIAL_DATA( id: number, onSuccess : (res : any) => void, onFail : (msg : string) => void) {
		let result: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, "/users/getInitialData", {
			id: id,

		} ).then(( res: string ) => {
			result = res;
			}
		).catch( function( err: any ) {
			err = JSON.parse( err );
			error = err.msg;
		} );

		if( null !== error ) {
			return onFail( error );
		}

		if( null === result ) {
			return onFail("USER_DATA_IS_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_ERROR");
			return;
		}

		if (obj.user != null ) {
			this.userInfo = obj.user;
		}

		if (obj.setting != null ) {
			this.userSetting = obj.setting;
		}

		if (obj.conf != null ) {
			this.gameSetting = obj.conf;
		} 

		onSuccess(obj);
	}	

	public async reqTABLE_LIST(onSuccess: (tables: any)=>void, onFail: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;
		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, "/tables/getTables", {

		}).then((res: string)=>{
			isConnect = true;
			result = JSON.parse(res);

		}).catch((err: any)=> {
			if (err.length == 0) {
				isConnect = false;
				return;
			}
		});

		if ( isConnect == false) {
			onFail({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSuccess(result);
	}

	public async reqENTER_TABLE( tableID: number, onSuccess : ( room: ColySeus.Room, res: any ) => void, onFail : ( err ) => void){
		let result: any = null;
		let reservation: string = null;
		let error: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/tables/enterTable", {
			tableID: tableID,
			userID: this.userInfo.id,

		}).then((res: string) => {
			result = res;
			
		}).catch(function (err: any) {
			if (0 === err.length) {
				return error = "NETWORK ERROR";
			}

			err = JSON.parse(err);
			error = err.msg;
		});

		if ( error != null ) {
			return onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'UNKNOWN_ERROR'
			});
		}

		if ( result == null ) {
			return onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'RESERVATION_DATA_IS_INVALID'
			});
		}

		result = JSON.parse(result);

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443,
			80].includes( gamePort ) || this.useSSL) ? "" : `:${gamePort}`}`);

		this.client.consumeSeatReservation( result["seatReservation"]).then( (room) => {

			this.room = room;
			onSuccess( this.room, result );
		}).catch(e => {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				errorCode: e.code,
				msg: e.msg,				
			});
		});
	}		

	async reqSetting( id: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/getSetting', {
			id: id,
		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			errMessage = err.msg;
		} );

		if( null !== errMessage ) {
			return onFail( errMessage );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userSetting = obj.setting;

		onSuccess(obj);
	}

	public async reqJoinMember( user: any, onSuccess:(user: any)=>void, onFail:(err: any)=>void) {
		let result: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, "/users/join", {
			user: user,
		}).then(( res: string ) => {
			result = res;
		}).catch( function( err: any ) {
			if ( err.length == 0 ) {
				return error = 'NETWORK_ERROR'
			}

			err = JSON.parse( err );
			error = err.msg;
		});

		if ( error !== null ) {
			return onFail(error);
		}

		if ( result == null ) {
			return onFail('CREATE_USER_ERROR');
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFail('JSON_PARSE_ERROR');
		}

		onSuccess(obj);
	}

	public async reqCheckUID( uid: string, onSuccess:(res: any)=>void, onFail:(err: any)=>void) {
		let result: string = null;
		let error: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.API_SERVER, '/users/checkUID', {
			uid: uid,
		}).then(( res: string ) => {
			result = res;

		}).catch( function( err: any ) {
			if ( err.length == 0 ) {
				return error = 'NETWORK_ERROR'
			}

			err = JSON.parse( err );
			error = err.msg;
		});

		if ( error !== null ) {
			return onFail(error);
		}

		if ( result == null ) {
			return onFail('CHECK_USER_ERROR');
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFail('JSON_PARSE_ERROR');
		}

		onSuccess(obj);
	}
	
	public async reqCheckNickname( nickname: string, onSuccess:(res: any)=>void, onFail:(err: any)=>void) {
		let result: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, "/users/checkNickname", {
			nickname: nickname,
		}).then(( res: string ) => {
			result = res;

		}).catch( function( err: any ) {
			if ( err.length == 0 ) {
				return error = 'NETWORK_ERROR'
			}

			err = JSON.parse( err );
			error = err.msg;
		});

		if ( error !== null ) {
			return onFail(error);
		}

		if ( result == null ) {
			return onFail('CHECK_USER_ERROR');
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFail('JSON_PARSE_ERROR');
		}

		onSuccess(obj);
	}

    getQueryStringParams = function() {
		let a = window.location.search.substr( 1 ).split( "&" );
		if( a.length === 0 ) {
			return {};
		}
		let b = {};
		for( let i = 0; i < a.length; ++i ) {
			let p = a[ i ].split( "=", 2 );
			if( p.length == 1 ) {
				b[ p[ 0 ] ] = "";
			}
			else {
				b[ p[ 0 ] ] = decodeURIComponent( p[ 1 ].replace( /\+/g, " " ) );
			}
		}
		return b;
	};

    public isLogin() : boolean{
		return this.pin != "" && this.userInfo != null;
	}

    public getUserInfo() : any{
		return this.userInfo;
	}

	public getUserSetting() : any {
		return this.userSetting;
	}

	public async refreshUser(onSuccess: (res)=>void, onFail: (err)=>void ) {
		let uuid = this.userInfo.uuid;
		let resultString: string = null;
		let errMsg: string = null;		

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, '/users/getUserInfoByDB', {
			uuid: uuid,
			pin: this.pin

		}).then((res: string) => {
			resultString = res;

		}
		).catch(function (err: any) {
			if( 0 === err.length ) {
				return errMsg = "NETWORK ERROR";
			}
			err = JSON.parse( err );
			errMsg = err.msg;
		});

		if( null !== errMsg ) {
			return onFail( errMsg );
		}

		if( null === resultString ) {
			return onFail( "USER_DATA_IS_INVALID" );
		}

		let resultObject : any = JSON.parse( resultString );

		if(null == resultObject){
			onFail("JSON_PARSE_FAIL");
			return;
		}
		
		this.userInfo = resultObject.info;
		this.userSetting = resultObject.setting;

		onSuccess(resultObject);
	}

	public async reqJoinPublicRoom(roomID : number, onSuccess : (room : Colyseus.Room, seatCount : number) => void, onFail : (message : string, exitLobby : boolean) => void){
		if (this.pin == "") {
			onFail("user not Logined", true);
			return;
		}

		let reservation: string = null;
		let errMsg: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/joinPublicRoom", {
			pinCode: this.pin,
			roomID : roomID
		}).then((res: string) => {
			reservation = res;
		}
		).catch(function (err: any) {
			if (0 === err.length) {
				return errMsg = "NETWORK ERROR";
			}
			err = JSON.parse(err);
			errMsg = err.msg;
		});

		if (null !== errMsg) {
			return onFail(errMsg, false);
		}

		if (null === reservation) {
			return onFail("reservation data is invalid.", false);
		}

		reservation = JSON.parse(reservation);

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443,
			80].includes( gamePort ) || this.useSSL) ? "" : `:${ gamePort }`}`);

		this.client.consumeSeatReservation(reservation["seatReservation"]).then(room => {
			this.room = room;
			onSuccess(this.room, reservation["seatCount"]);
		}).catch(e => {
			onFail(e.message, true);
		});
	}

	public async reqJoinTable( id: number, onSuccess : (room : Colyseus.Room, info: any, seatCount : number) => void, onFail : ( message : string, code: number, exitLobby : boolean ) => void){
		if (this.pin == "") {
			onFail("user not Logined", 100001, true);
			return;
		}

		let reservation: string = null;
		let errMsg: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/joinRoom", {
			id: id,
			pins: this.pin,

		}).then((res: string) => {
			reservation = res;
			
		}).catch(function (err: any) {
			if (0 === err.length) {
				return errMsg = "NETWORK ERROR";
			}
			err = JSON.parse(err);
			errMsg = err.msg;
		});

		if (null !== errMsg) {
			return onFail(errMsg, 100002, false);
		}

		if (null === reservation) {
			return onFail("reservation data is invalid.", 100003, false);
		}

		reservation = JSON.parse(reservation);

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${ gameHost}${([443,
			80].includes( gamePort ) || this.useSSL) ? "" : `:${ gamePort }`}`);

		this.client.consumeSeatReservation( reservation["seatReservation"]).then( (room) => {

			this.room = room;
			onSuccess(this.room, reservation["info"], reservation["count"]);
		}).catch(e => {

			onFail( e.message, e.code , false);
		});
	}

	public async reqJoinRoom( id: number, onSuccess : (room : Colyseus.Room, info: any, seatCount : number) => void, onFail : ( message : string, code: number, exitLobby : boolean ) => void){
		if (this.pin == "") {
			onFail("user not Logined", 100001, true);
			return;
		}

		let reservation: string = null;
		let errMsg: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/joinRoom", {
			id: id,
			pins: this.pin,

		}).then((res: string) => {
			reservation = res;
			
		}).catch(function (err: any) {
			if (0 === err.length) {
				return errMsg = "NETWORK ERROR";
			}
			err = JSON.parse(err);
			errMsg = err.msg;
		});

		if (null !== errMsg) {
			return onFail(errMsg, 100002, false);
		}

		if (null === reservation) {
			return onFail("reservation data is invalid.", 100003, false);
		}

		reservation = JSON.parse(reservation);

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443,
			80].includes( gamePort ) || this.useSSL) ? "" : `:${gamePort}`}`);

		this.client.consumeSeatReservation( reservation["reservation"]).then( (room) => {

			this.room = room;
			onSuccess(this.room, reservation["info"], reservation["count"]);
		}).catch(e => {

			onFail( e.message, e.code , false);
		});
	}

	public async reqPublicRoomList(onSuccess : (result : any[]) => void, onFail : (message : string) => void) {
		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/roomList", { pinCode : this.pin }).then((res : string) => {
			let jsonObject = JSON.parse(res);

			if(null == jsonObject || null == jsonObject.result){
				onFail("fail to parse result");
				return;
			}
			
			this.userInfo = jsonObject.userData;
			onSuccess(jsonObject.result);
		}).catch((err : string) => {
			onFail("fail to get RoomList : " + err);
		});
	}

	public async reqPublicRoomInfo(roomID : number, onSuccess : (result : any) => void, onFail : (message : string) => void){
		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/roomInfo", {roomID : roomID}).then((res : string) => {
			let jsonObject = JSON.parse(res);

			if(null == jsonObject || null == jsonObject.result){
				onFail("fail to parse result");
				return;
			}

			onSuccess(jsonObject.result);
		}).catch((err : string) => {
			onFail("Fail to Get RoomInfo : " + err);
		});
	}

    async login( pin: string, onSuccess : (user : any) => void, onFail : (message : string) => void) {
		let parseIntPinCode = parseInt( pin );

		let resultString: string = null;
		let errMsg: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/auth", {
			pinCode: parseIntPinCode,
		} ).then(( res: string ) => {
				this.pin = pin;
				resultString = res;
			}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMsg = "NETWORK ERROR";
			}
			err = JSON.parse( err );
			errMsg = err.msg;
		} );

		if( null !== errMsg ) {
			return onFail( errMsg );
		}

		if( null === resultString ) {
			return onFail( "reservation data is invalid." );
		}

		let resultObject : any = JSON.parse( resultString );

		if(null == resultObject){
			onFail("Json Parse Fail");
			return;
		}

		this.userInfo = resultObject.user;

		onSuccess(resultObject);
	}

	async setting( uuid: string, onSuccess : ( setting : any) => void, onFail : (message : string) => void ) {
		let parseIntId = parseInt( uuid );

		let result: string = null;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, "/users/setting", {
			uuid: uuid,
		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			errMessage = err.msg;
		} );

		if( null !== errMessage ) {
			return onFail( errMessage );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userSetting = obj.setting;

		onSuccess(obj);
	}



	public async updateUserAvatar(avatar: number, onSuccess: (res)=> void , onFail: (err)=> void ) {
		let id = Number(this.userInfo.id);
		let result: string = null;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/updateAvatar', {
			id: id,
			avatar: avatar
		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			errMessage = err.msg;
		} );

		if( null !== errMessage ) {
			return onFail( errMessage );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userInfo = obj.user;

		onSuccess(obj);
	}

	public async updateUserSetting( selected: any, onSuccess: (res)=> void, onFail: (err)=> void ) {
		let id = this.userInfo.id;
		let result: string = '';
		let setting: any = selected;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/updateSetting', {
			id: id,
			setting: setting

		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			errMessage = err.msg;
		} );

		if( null !== errMessage ) {
			return onFail( errMessage );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userSetting = obj.setting;
		onSuccess(obj);
	}

	public async getUserInfoFromDB( onSuccess: (res)=> void, onFail: (err)=> void ) {
		let id = this.userInfo.id;
		let result: string = '';
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/getUserInfo', {
			id: id,

		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return error = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			error = err.msg;
		} );

		if( null !== error ) {
			return onFail( error );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userInfo = obj.user;
		onSuccess(obj);
	}

	public async getPlayerProfile(id: number, onSuccess: (res)=>void, onFail: (err)=>void ) {
		let userId = id;
		let result: string = '';
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, '/users/getPlayerProfile', {
			uuid: userId,

		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORD_ERROR";
			}
			err = JSON.parse( err );
			errMessage = err.msg;
		} );

		if( null !== errMessage ) {
			return onFail( errMessage );
		}

		if( null === result ) {
			return onFail( "SETTING_DATA_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		this.userSetting = obj.setting;
		onSuccess(obj);
	}

	private Post( type:HOLDEM_SERVER_TYPE , url, params ) {
		return new Promise( ( resolve, reject ) => {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if( xhr.readyState === 4 && ( xhr.status >= 200 && xhr.status < 300 ) ) {
					let respone: string = xhr.responseText;
					resolve( respone );
				}

				if( xhr.readyState === 4 && ( xhr.status != 200 ) ) {
					let respone: string = xhr.responseText;
					reject( respone );
				}
			};

			let fullUrl: string = '';
			switch ( type ) {
				case HOLDEM_SERVER_TYPE.API_SERVER:
					fullUrl = `http://${ apiHost }:${ apiPort }`;
				break;
				case HOLDEM_SERVER_TYPE.GAME_SERVER	:
					fullUrl = `http://${ gameHost }:${ gamePort }`;					
				break;
			}
			fullUrl += url;

			xhr.open( "POST", fullUrl, true );
			xhr.timeout = 5000;
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.send( JSON.stringify( params ) );
		} );
	}
}


