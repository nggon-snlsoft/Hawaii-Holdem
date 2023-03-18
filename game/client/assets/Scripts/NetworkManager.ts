// @ts-ignore
import ColySeus from "db://colyseus-sdk/colyseus.js"
import * as cc from "cc";
import { _decorator, Component, Node } from 'cc';
const { ccclass } = cc._decorator;

@ccclass('NetworkManager')
export class NetworkManager extends cc.Component {
    private static _instance : NetworkManager = null;
    private pin : string = "";

    // hostname = "18.183.95.34";
    // port = 2568;

    hostname = "127.0.0.1";
    port = 2568;

    useSSL = false;
	client!: Colyseus.Client;
	room!: Colyseus.Room;

	public leaveReason : number = -1;
	private userInfo : any = null;
	private userSetting: any = null;

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
		this.pin = '';
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

    httpPost( url, params ) {
		return new Promise( ( resolve, reject ) => {
			let xhr = cc.loader.getXMLHttpRequest();
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

			let url_temp = `http://${ this.hostname }:${ this.port }` + url;
			xhr.open( "POST", url_temp, true );
			xhr.timeout = 5000;// 5 seconds for timeout
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.send( JSON.stringify( params ) );
		} );
	}

	public async refreshUser(onSuccess: (res)=>void, onFail: (err)=>void ) {
		let uuid = this.userInfo.uuid;
		let resultString: string = null;
		let errMsg: string = null;		

		await this.httpPost("/users/getUserInfoByDB", {
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

		await this.httpPost("/users/joinPublicRoom", {
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

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443,
			80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);

		this.client.consumeSeatReservation(reservation["seatReservation"]).then(room => {
			this.room = room;
			onSuccess(this.room, reservation["seatCount"]);
		}).catch(e => {
			onFail(e.message, true);
		});
	}

	public async reqJoinRoom( id: number, onSuccess : (room : Colyseus.Room, info: any, seatCount : number) => void, onFail : ( message : string, code: number, exitLobby : boolean ) => void){
		if (this.pin == "") {
			onFail("user not Logined", 100001, true);
			return;
		}

		let reservation: string = null;
		let errMsg: string = null;

		await this.httpPost("/users/joinRoom", {
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

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443,
			80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);

		this.client.consumeSeatReservation( reservation["reservation"]).then( (room) => {

			this.room = room;
			onSuccess(this.room, reservation["info"], reservation["count"]);
		}).catch(e => {

			onFail( e.message, e.code , false);
		});
	}

	public async reqPublicRoomList(onSuccess : (result : any[]) => void, onFail : (message : string) => void) {
		await this.httpPost("/users/roomList", { pinCode : this.pin }).then((res : string) => {
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
		await this.httpPost("/users/roomInfo", {roomID : roomID}).then((res : string) => {
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

		await this.httpPost( "/users/auth", {
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

		await this.httpPost( "/users/setting", {
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

	public async reqTableList(onSuccess: (tables: any)=>void, onFail: (msg: string)=>void ) {
		let result: any = null;
		await this.httpPost("/users/tableList", {

		}).then((res: string)=>{
			result = JSON.parse(res);

		}).catch(function() {

		});

		onSuccess(result);
	}

	public async reqMakeInstanceRoom(info: any, onSuccess: (room: any )=>void, onFail: (msg: string)=>void ) {

		let result: string = null;
		await this.httpPost("/users/makeInstanceRoom", {
			/*
				info: {
					name: e.name,
					type: 0,
					0: Pre Make Public Room
					1: Instance Room (Made by User)
					maxPlayer: e.maxPlayers,
					betTimeLimit: e.betTimeLimit,
					smallBlind: e.smallBlind,
					bigBlind: e.bigBlind,
					minStakePrice: e.minStakePrice,
					maxStakePrice: e.maxStakePrice,
					rake: e.rake,
					useRakeCap: e.useRakeCap,
					rakeCap1: e.rakeCap1,
					rakeCap2: e.rakeCap2,
					rakeCap3: e.rakeCap3,
					useFlopRake: e.useFlopRake,
				}			
			*/
			
			name: info.name,
			type: 1,
			maxPlayers: info.maxPlayers,
			betTimeLimit: info.betTimeLimit,
			smallBlind: info.smallBlind,
			bigBlind: info.bigBlind,
			minStakePrice: info.minStakePrice,
			maxStakePrice: info.maxStakePrice,

		}).then((res: string )=>{
			result = res;

		}).catch(function() {

		});

		let resultObject: any = JSON.parse(result);

		onSuccess(resultObject);
	}

	public async reqJoinInstanceRoom(roomID : number, onSuccess : (room : Colyseus.Room, seatCount : number) => void, onFail : (message : string, exitLobby : boolean) => void){
		if (this.pin == "") {
			onFail("user not Logined", true);
			return;
		}

		let reservation: string = null;
		let errMsg: string = null;

		await this.httpPost("/users/joinPublicRoom", {
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

		this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443,
			80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`);

		this.client.consumeSeatReservation(reservation["seatReservation"]).then(room => {
			this.room = room;
			onSuccess(this.room, reservation["seatCount"]);
		}).catch(e => {
			onFail(e.message, true);
		});
	}

	public async updateUserAvatar(avatar: number, onSuccess: (res)=> void , onFail: (err)=> void ) {
		let uuid = Number(this.userInfo.uuid);
		let result: string = null;
		let errMessage: string = null;

		await this.httpPost( '/users/updateUserAvatar', {
			uuid: uuid,
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
		let uuid = Number( this.userInfo.uuid );
		let result: string = '';
		let setting: any = selected;
		let errMessage: string = null;

		await this.httpPost( '/users/updateUserSetting', {
			uuid: uuid,
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

	public async getPlayerProfile(id: number, onSuccess: (res)=>void, onFail: (err)=>void ) {
		let userId = id;
		let result: string = '';
		let errMessage: string = null;

		await this.httpPost( '/users/getPlayerProfile', {
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
}


