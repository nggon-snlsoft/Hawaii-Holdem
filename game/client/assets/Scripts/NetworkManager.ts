// @ts-ignore
import ColySeus from "db://colyseus-sdk/colyseus.js"
import * as cc from "cc";
import { _decorator } from 'cc';
import { GameManager } from "./GameManager";
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

// const apiHost: string = '18.183.95.34';
// const apiPort: number = 2600;

// const gameHost: string = '18.183.95.34';
// const gamePort: number = 2568;

@ccclass('NetworkManager')
export class NetworkManager extends cc.Component {
    private static _instance : NetworkManager = null;

    useSSL = false;
	client!: Colyseus.Client;
	room!: Colyseus.Room;

	public leaveReason : number = -1;

	private userInfo : any = null;
	private userSetting: any = null;
	private userStatics: any = null;
	private gameSetting: any = null;
	private storeInfo: any = null;	

    public static Instance() : NetworkManager
	{
		if(null == this._instance){
			this._instance = new NetworkManager();
		}
		
		return this._instance;
	}

	public async Init( version: string, onSuccess: ( res: any )=>void, onFail: (msg: any )=> void ) {
		let result_api: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/check', {
			version: version,
		} )
		.then( (res: string)=> {
			result_api = res;
		})
		.catch( (err: any)=>{
			err = JSON.parse( err );
			error = err.msg;
		});

		if( error != null ) {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: error,
			});
			return;
		}

		let obj : any = JSON.parse( result_api );
		if(null == obj){
			onFail( 'JSON_PARSE_ERROR' );
			return;
		}

		if ( obj.code != ENUM_RESULT_CODE.SUCCESS ) {
			onFail('VERSION_MISMATCH');
			return;			
		}

		onSuccess( {
			code: ENUM_RESULT_CODE.SUCCESS,
			obj: obj,
		});
	}

	public logout() {
		this.userInfo = null;
		this.userSetting = null;
		this.gameSetting = null;
		this.storeInfo = null;
	}

	public async reqCHECK_VERSION( version: number, onSuccess:(res: any)=>void , onFail:(msg: any)=>void) {
		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/check', {
			version: version,
		} )
		.then( (res: string)=> {

		})
		.catch( (err: any)=>{

		});
	}

    public async reqLOGIN_HOLDEM( login_id: string, password: string, onSuccess : (res : any) => void, onFail : (err : any) => void) {
		let result: string = null;
		let error: string = null;
		let isConnect: boolean = true;
		let version: string = GameManager.Instance().GetVersion();

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/login', {
			login_id: login_id,
			password: password,
			version: version,

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

    async getINIT_DATA( user_id: number, onSuccess : (res : any) => void, onFail : (msg : string) => void) {
		let result: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, "/users/getInitialData", {
			user_id: user_id,

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
	
    async getSTATICS( user_id: number, onSuccess : (res : any) => void, onFail : (msg : string) => void) {
		let result: string = null;
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, "/users/getStatics", {
			user_id: user_id,

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

		if (obj.statics != null ) {
			this.userStatics = obj.static;

		}

		onSuccess(obj);
	}	

	public async getTABLE_LIST( onSuccess: (tables: any)=>void, onFail: (msg: any)=>void ) {
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

	public async reqENTER_TABLE( table_id: number, onSuccess : ( room: ColySeus.Room, res: any ) => void, onFail : ( err ) => void){
		let result: any = null;
		let reservation: string = null;
		let error: string = null;

		await this.Post(HOLDEM_SERVER_TYPE.GAME_SERVER, "/tables/enterTable", {
			table_id: table_id,
			user_id: this.userInfo.user_id,

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
		if ( result == null ) {
			return onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'JSON_PARSE_ERROR'
			});
		}

		if ( result.code == ENUM_RESULT_CODE.SUCCESS ) {
			this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443, 80].includes( gamePort ) || this.useSSL) ? "" : `:${gamePort}`}`);
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
		} else {
			switch ( result.msg ) {
				case 'DUPLICATE_LOGIN':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'DUPLICATE_LOGIN',				
					});	
					break;
				case 'INCORRECT_TABLE_INFO':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'INCORRECT_TABLE_INFO',				
					});	
					break;
				case 'TABLE_IS_FULL':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'TABLE_IS_FULL',				
					});	
					break;					
				default:
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'UNKNOWN_FAIL',				
					});	
			}
		}
	}
	
	async getSTORE( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let store_id = this.userInfo.store_id;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/store/getStore', {
			store_id: store_id,
		} ).then(( res: string ) => {
			result = res;
		}
		).catch( function( err: any ) {
			if( 0 === err.length ) {
				return errMessage = "NETWORK_ERROR";
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

		this.storeInfo = obj.store;

		onSuccess(obj);
	}
	
	async reqGET_CHARGE_REQUEST_COUNT( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.userInfo.user_id;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/store/getChargeRequests', {
			user_id: user_id,
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

		onSuccess(obj);
	}
	
	async reqGET_TRANSFER_REQUEST_COUNT( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.userInfo.user_id;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/store/getTransferRequests', {
			user_id: user_id,
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

		onSuccess(obj);
	}			

	async reqCHARGE_REQUEST( amount: number, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.userInfo.user_id;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/store/reqCharge', {
			user_id: user_id,
			amount: amount

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
		onSuccess(obj);
	}
	
	async reqTANSFER_REQUEST( data: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.userInfo.user_id;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/store/reqTransfer', {
			user_id: user_id,
			value: data.value,
			password: data.password,

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
		this.userInfo = obj.user;

		onSuccess(obj);
	}			

	async getSETTING( user_id: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/getSetting', {
			user_id: user_id,
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

	public async reqJOIN_MEMBER( user: any, onSUCCESS:(user: any)=>void, onFAIL:(err: any)=>void) {
		let result: string = null;
		let error: string = null;

		try {
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
				
		} catch (error) {
			if ( error != null ) {
				return onFAIL(error);
			}
			return onFAIL(error);						
		}


		if ( error !== null ) {
			return onFAIL(error);
		}

		if ( result == null ) {
			return onFAIL('CREATE_USER_ERROR');
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFAIL('JSON_PARSE_ERROR');
		}

		onSUCCESS(obj);
	}

	public async reqCHECK_LOGIN_ID( login_id: string, onSUCCESS:( res: any )=>void, onFAIL:( err: any )=>void ) {
		let result: string = null;
		let error: string = null;

		try {
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/check/login_id', { login_id: login_id }
			).then( ( res: string )=>{
				result = res;
			}).catch( ( err: any )=>{
				if ( err.length == 0 ) {
					return error = 'NETWORK_ERROR';
				}

				if ( err != null ) {
					error = JSON.parse( err.msg );
				}
			});			
		} catch (error) {
			return onFAIL(error);
		}

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result != null ) {
			let obj: any = JSON.parse( result );
			if ( obj != null ) {
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}

	public async reqCHECK_NICKNAME( nickname: string, onSUCCESS:( res: any )=>void, onFAIL:( err: any )=>void ) {
		let result: string = null;
		let error: string = null;

		try {
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/check/nickname', { nickname: nickname }
			).then( ( res: string )=>{
				result = res;
			}).catch( ( err: any )=>{
				if ( err.length == 0 ) {
					return error = 'NETWORK_ERROR';
				}

				if ( err != null ) {
					error = JSON.parse( err.msg );
				}
			});			
		} catch (error) {
			return onFAIL(error);
		}

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result != null ) {
			let obj: any = JSON.parse( result );
			if ( obj != null ) {
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}	

	public async reqPOINT_TRANSFER( data: any, onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void) {
		let result: string = null;
		let user_id = data.user_id;
		let value = data.value;
		let error: string = null;

		try {
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/point/transfer', { 
				user_id: user_id,
				value: value, 
			}
			).then( ( res: string )=>{
				result = res;
			}).catch( ( err: any )=>{
				if ( err.length == 0 ) {
					return error = 'NETWORK_ERROR';
				}

				if ( err != null ) {
					error = JSON.parse( err.msg );
				}
			});			
		} catch (error) {
			return onFAIL(error);
		}

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result != null ) {
			let obj: any = JSON.parse( result );
			if ( obj != null ) {
				this.userInfo = obj.user;				
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}

	public async getPOINT_TRANSFERS( onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void ) {
		let result: string = null;
		let user_id = this.userInfo.user_id;
		let error: string = null;

		try {
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/point/transferLog', { 
				user_id: user_id,
			}
			).then( ( res: string )=>{
				result = res;
			}).catch( ( err: any )=>{
				if ( err.length == 0 ) {
					return error = 'NETWORK_ERROR';
				}

				if ( err != null ) {
					error = JSON.parse( err.msg );
				}
			});			
		} catch (error) {
			return onFAIL(error);
		}

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result != null ) {
			let obj: any = JSON.parse( result );
			if ( obj != null ) {
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}	

	public async getPOINT_RECEIVES(onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void) {
		let result: string = null;
		let user_id = this.userInfo.user_id;
		let error: string = null;

		try {
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/point/receiveLog', { 
				user_id: user_id,
			}
			).then( ( res: string )=>{
				result = res;
			}).catch( ( err: any )=>{
				if ( err.length == 0 ) {
					return error = 'NETWORK_ERROR';
				}

				if ( err != null ) {
					error = JSON.parse( err.msg );
				}
			});			
		} catch (error) {
			return onFAIL(error);
		}

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result != null ) {
			let obj: any = JSON.parse( result );
			if ( obj != null ) {
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
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

    public GetUser() : any{
		return this.userInfo;
	}

	public GetSetting() : any {
		return this.userSetting;
	}

	public async updateUSER_AVATAR( avatar: number, onSuccess: (res)=> void , onFail: (err)=> void ) {
		let user_id = Number( this.userInfo.user_id );
		let result: string = null;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/updateAvatar', {
			user_id: user_id,
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

	public async updateUSER_SETTING( selected: any, onSuccess: (res)=> void, onFail: (err)=> void ) {
		let user_id = this.userInfo.user_id;
		let result: string = '';
		let setting: any = selected;
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/updateSetting', {
			user_id: user_id,
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

	public async getUSER_FromDB( onSuccess: (res)=> void, onFail: (err)=> void ) {
		let user_id = this.userInfo.user_id;
		let result: string = '';
		let error: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/users/get', {
			user_id: user_id,

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

	public async getPLAYER_PROFILE( user_id: number, onSuccess: (res)=>void, onFail: (err)=>void ) {
		let result: string = '';
		let errMessage: string = null;

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, '/users/getPlayerProfile', {
			user_id: user_id,

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


