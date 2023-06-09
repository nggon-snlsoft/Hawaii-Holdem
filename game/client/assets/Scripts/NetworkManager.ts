// @ts-ignore
import ColySeus from "db://colyseus-sdk/colyseus.js"
import * as cc from "cc";
import { _decorator } from 'cc';
import { GameManager } from "./GameManager";
import { ENUM_LEAVE_REASON } from "./HoldemDefines";

const { ccclass } = cc._decorator;

export enum ENUM_RESULT_CODE {
	DISCONNECT_SERVER = -2,
	UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

export enum HOLDEM_SERVER_TYPE {
	API_SERVER = 0,
	API_SERVER_SUB = 1,	
	GAME_SERVER = 2,
	GAME_SERVER_SUB = 3,
}

// const apiHost: string = '127.0.0.1';
// const gameHost: string = '127.0.0.1';

// const apiHost: string = '43.207.193.204';	//for MAIN SERVER
// const gameHost: string = '43.207.193.204';	//for MAIN SERVER

const apiHost: string = '18.183.95.34';	//for TEST SERVER
const gameHost: string = '18.183.95.34'; //for TEST SERVER

const apiPort: number = 7500;
const apiPort_sub: number = 7510;

const gamePort: number = 7600;
const gamePort_sub: number = 7610;

// const apiHost: string = 'hw-123.com';
// const apiPort: number = 7500;

// const gameHost: string = 'hw-123.com';
// const gamePort: number = 7510;

// const apiHost: string = '43.207.193.204';
// const apiPort: number = 7500;

// const gameHost: string = '43.207.193.204';
// const gamePort: number = 7510;

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

	private user : any = null;
	private setting: any = null;
	private statics: any = null;
	private config: any = null;
	private store: any = null;	
	private token: string = null;
	private API_SERVER: HOLDEM_SERVER_TYPE = HOLDEM_SERVER_TYPE.API_SERVER;
	private GAME_SERVER: HOLDEM_SERVER_TYPE = HOLDEM_SERVER_TYPE.GAME_SERVER;
	private api_port: number = apiPort;
	private game_port: number = gamePort;
	private user_id: number = null;

    public static Instance() : NetworkManager
	{
		if(null == this._instance){
			this._instance = new NetworkManager();
		}
		
		return this._instance;
	}

	public Initialize() {
		this.token = '';		
	}

	public async Init( version: string, onSuccess: ( res: any )=>void, onFail: (msg: any )=> void ) {
		let result_api: string = null;
		let error: string = null;
		this.token = '';

		await this.Post( HOLDEM_SERVER_TYPE.API_SERVER, '/check', {
			version: version,
		} )
		.then( (res: string)=> {
			result_api = res;
		})
		.catch( (err: any)=>{
			error = err;
		});

		if ( error != null ) {
			error = null;
			await this.Post( HOLDEM_SERVER_TYPE.API_SERVER_SUB, '/check', {
				version: version,
			} )
			.then( (res: string)=> {
				result_api = res;
			})
			.catch( (err: any)=>{
				error = err;
			});

			if ( error != null ) {
				onFail({
					code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
					msg: 'DISCONNECT_SERVER',
				});			
				return;	
			}
			this.API_SERVER = HOLDEM_SERVER_TYPE.API_SERVER_SUB;
		}

		let obj : any = JSON.parse( result_api );
		if( obj == null ){
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'JSON_PARSE_ERROR',
			});
			return;
		}

		if ( obj.code != ENUM_RESULT_CODE.SUCCESS ) {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'VERSION_MISMATCH',
			});
			return;
		}

		onSuccess( {
			code: ENUM_RESULT_CODE.SUCCESS,
			obj: obj,
		});
	}

	public logout() {
		this.user = null;
		this.setting = null;
		this.config = null;
		this.store = null;
		this.user_id = -1;
		this.token = '';
	}

	public async reqTOKEN_VERIFY( onSUCCESS:(res: any)=>void , onFAIL:(msg: any)=>void) {
		let user_id = this.user.id;
		let token = this.token;
		let result: string = null;
		let error: string = null;
		await this.Post( this.API_SERVER, '/token/verify', {
			user_id: user_id,
			token: token,
		} )
		.then( (res: string)=> {
			result = res;
		})
		.catch( (err: any)=>{
			let parsedError = JSON.parse ( err );
			if ( parsedError != null ) {
				error = parsedError.msg;
			} 
		});

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result == null ) {
			return onFAIL( 'RESULT_NULL' );			
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFAIL( 'RES_PARSED_ERROR' );						
		}

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}		

		if (obj.statics != null ) {
			this.statics = obj.static;
		}

		onSUCCESS(obj);
	}	

	public async reqCHECK_VERSION( version: number, onSuccess:(res: any)=>void , onFail:(msg: any)=>void) {
		await this.Post( this.API_SERVER, '/check', {
			version: version,
		} )
		.then( (res: string)=> {

		})
		.catch( (err: any)=>{

		});
	}

	public async reqCHECK_TICKETS( ticket_id: any, onSUCCESS : (res : any) => void, onFAIL : (err : any) => void ) {
		let result: string = null;
		let error: string = null;

		await this.Post( this.API_SERVER, '/store/ticket/check', {
			ticket_id: ticket_id,

		} ).then(( res: string ) => {
			result = res;
			}
		).catch( function( err: any ) {
			err = JSON.parse( err );
			error = err.msg;
		} );

		if ( error != null ) {
			return onFAIL( error );
		}

		if ( result == null ) {
			return onFAIL( 'RESULT_NULL' );			
		}

		let obj: any = JSON.parse( result );
		if ( obj == null ) {
			return onFAIL( 'RES_PARSED_ERROR' );						
		}

		onSUCCESS( {
			code: obj.code,
			msg: obj.msg,
		});
	}

    public async reqLOGIN_HOLDEM( login_id: string, password: string, onSuccess : (res : any) => void, onFail : (err : any) => void) {
		let result: string = null;
		let error: string = null;
		let isConnect: boolean = true;
		let version: string = GameManager.Instance().GetVersion();
		let platform: string = cc.sys.platform;
		let os: string = cc.sys.os;

		await this.Post( this.API_SERVER, '/users/login', {
			login_id: login_id,
			password: password,
			version: version,
			platform: platform,
			os: os,

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
			if ( this.API_SERVER == HOLDEM_SERVER_TYPE.API_SERVER ) {
				this.API_SERVER = HOLDEM_SERVER_TYPE.API_SERVER_SUB;
			} else {
				this.API_SERVER = HOLDEM_SERVER_TYPE.API_SERVER;
			}

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

		if ( obj.token != null ) {
			this.token = obj.token;
		}

		if ( obj.user != null && obj.user.table_id != -1 ) {

			await this.Post( this.GAME_SERVER, '/tables/check/table_id', {
				user_id: obj.user.id,
				table_id: obj.user.table_id,
			} ).then(( res: string ) => {

			} ).catch( function( err: any ) {

			} );
		}

		this.user_id = obj.id;
		onSuccess( {
			code: obj.code,
			msg: obj.msg,
			obj: obj,
		});
	}

	public async reqJOIN_REQUEST( onSuccess : (res : any) => void, onFail : (err : any) => void) {
		let result: string = null;
		let error: string = null;
		let isConnect: boolean = true;

		await this.Post( this.API_SERVER, '/users/join_request', {
		} ).then(( res: string ) => {
			isConnect = true;
			result = res;
		}).catch( function( err: any ) {
			if ( err.length == 0 ) {
				isConnect = false;
				return;
			}
		} );

		if ( !isConnect ) {
			if ( this.API_SERVER == HOLDEM_SERVER_TYPE.API_SERVER ) {
				this.API_SERVER = HOLDEM_SERVER_TYPE.API_SERVER_SUB;
			} else {
				this.API_SERVER = HOLDEM_SERVER_TYPE.API_SERVER;
			}

			await this.Post( this.API_SERVER, '/users/join_request', {
			} ).then(( res: string ) => {
				isConnect = true;
				result = res;
			}).catch( function( err: any ) {
				if ( err.length == 0 ) {
					isConnect = false;
					return;
				}
			} );
		}

		if ( !isConnect ) {
			onFail(ENUM_RESULT_CODE.DISCONNECT_SERVER);
			return;
		}

		if( error != null ) {
			onFail(ENUM_RESULT_CODE.UNKNOWN_FAIL);
			return;
		}

		onSuccess(ENUM_RESULT_CODE.SUCCESS);
	}

    async getDATA( user_id: number, onSuccess : (res : any) => void, onFail : (msg : string) => void) {
		let result: string = null;
		let error: string = null;

		await this.Post( this.API_SERVER, "/users/getData", {
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
			this.user = obj.user;
		}

		if (obj.setting != null ) {
			this.setting = obj.setting;
		}

		if (obj.conf != null ) {
			this.config = obj.conf;
		}

		onSuccess( obj );
	}

	async getPOPUPS( onSUCCESS : (res : any) => void, onFAIL : (msg : string) => void) {
		let user_id = this.user.id;
		let store_id = this.user.store_id;
		let token = this.token;

		let result: string = null;
		let error: string = null;

		await this.Post( this.API_SERVER, "/store/popups/get", {
			user_id: user_id,
			store_id: store_id,
			token: token,

		} ).then(( res: string ) => {
			result = res;
			}
		).catch( function( err: any ) {
			err = JSON.parse( err );
			error = err.msg;
		} );

		if( null !== error ) {
			return onFAIL( error );
		}

		if( null === result ) {
			return onFAIL("USER_DATA_IS_INVALID" );
		}

		let obj : any = JSON.parse( result );

		if(null == obj){
			onFAIL("JSON_PARSE_ERROR");
			return;
		}

		onSUCCESS( obj );
	}
	
    async getSTATICS( user_id: number, onSuccess : (res : any) => void, onFail : (msg : string) => void) {
		let result: string = null;
		let error: string = null;

		await this.Post( this.API_SERVER, "/users/statics/get", {
			user_id: user_id,
			token: this.token,

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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}		

		if (obj.statics != null ) {
			this.statics = obj.static;
		}

		onSuccess(obj);
	}

	public async reqREFRESH( onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;
		let user_id = this.user.id;

		await this.Post( this.API_SERVER, "/users/refresh", {
			user_id: user_id,
			token: this.token,

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		if ( result.msg != null && result.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( result.user != null ) {
			this.user = result.user;
		}

		onSUCCESS(result);
	}

	public async reqGET_UNREAD_MESSAGE( onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;
		let user_id = this.user.id;

		await this.Post( this.API_SERVER, "/users/message/unread", {
			user_id: user_id,

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSUCCESS(result);
	}
	
	public async reqREAD_QNA( id: any, onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;

		await this.Post( this.API_SERVER, "/users/qna/read", {
			id: id,

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSUCCESS(result);
	}

	public async reqREAD_MESSAGE( id: any, onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;

		await this.Post( this.API_SERVER, "/users/message/read", {
			id: id,

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSUCCESS(result);
	}

	public async reqNOTICES( onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;

		await this.Post( this.API_SERVER, "/store/notices/get", {

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSUCCESS(result);
	}
	
	public async reqDELETE_QNA( id: any, onSUCCESS: (res: any)=>void, onFAIL: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;

		await this.Post( this.API_SERVER, "/users/qna/delete", {
			id: id,

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
			onFAIL({
				code: ENUM_RESULT_CODE.DISCONNECT_SERVER,
				msg: 'NETWORK_REFUSE',
			});
			return;
		}

		onSUCCESS(result);
	}		
	

	public async getTABLE_LIST( onSuccess: (tables: any)=>void, onFail: (msg: any)=>void ) {
		let result: any = null;
		let isConnect = false;
		let user_id = this.user.id;
		let version = GameManager.Instance().GetVersion();

		await this.Post( this.GAME_SERVER, "/tables/get", {
			user_id: user_id,
			token: this.token,
			version: version,

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

		if ( result.msg != null && result.msg == 'VERSION_MISMATCH') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_VERSION_MISMATCH );
			return;
		}

		if ( result.msg != null && result.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		onSuccess(result);
	}

	public async reqENTER_TABLE( table_id: number, onSuccess : ( room: ColySeus.Room, res: any ) => void, onFail : ( err ) => void){
		
		let result: any = null;
		let reservation: string = null;
		let error: string = null;
		let user_id = this.user.id;
		let version = GameManager.Instance().GetVersion();

		await this.Post( this.GAME_SERVER, "/tables/enter", {
			table_id: table_id,
			user_id: this.user_id,
			token: this.token,
			version: version,

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

		if ( result.msg != null && result.msg == 'DISABLE_ACCOUNT') {
			onFail({
				code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
				msg: 'DISABLE_ACCOUNT',
			});	
			return;
		}

		if ( result.msg != null && result.msg == 'VERSION_MISMATCH') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_VERSION_MISMATCH );
			return;
		}

		if ( result.msg != null && result.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( result.code == ENUM_RESULT_CODE.SUCCESS ) {
			this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443, 80].includes( this.game_port ) || this.useSSL) ? "" : `:${ this.game_port }`}`);
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
				case 'NOT_ENOUGHT_BALANCE':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'NOT_ENOUGHT_BALANCE',						
						balance: result.balance,
						buyin: result.buyin,
					});	
					break;				
				case 'DUPLICATE_LOGIN':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'DUPLICATE_LOGIN',				
					});	
					break;
				case 'TABLE_DUPLICATE_IP':
					onFail({
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'TABLE_DUPLICATE_IP',				
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

	async reqCOMPANY( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;

		await this.Post(this.API_SERVER, '/store/company', {
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

		let obj : any = JSON.parse( result );
		if(null == obj){
			onFail("JSON_PARSE_FAIL");
			return;
		}

		if ( obj.store != null ) {
			this.store = obj.store;
		}

		onSuccess(obj);
	}	
	
	async getSTORE( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.user.id;
		let store_id = this.user.store_id;

		await this.Post(this.API_SERVER, '/store/get', {
			store_id: store_id,
			user_id: user_id,
			token: this.token,
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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.store != null ) {
			this.store = obj.store;
		}

		onSuccess(obj);
	}
	
	async getCHARGE_REQUESTS( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.user.id;

		await this.Post( this.API_SERVER, '/store/chargeRequest/get', {
			user_id: user_id,
			token: this.token,
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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		onSuccess(obj);
	}
	
	async getTRANSFER_REQUESTS( onSuccess : ( res : any) => void, onFail : (err : string) => void ) {

		let result: string = null;
		let errMessage: string = null;
		let user_id = this.user.id;

		await this.Post(this.API_SERVER, '/store/transferRequest/get', {
			user_id: user_id,
			token: this.token,
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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		onSuccess(obj);
	}			

	async reqCHARGE_REQUEST( data: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let amount = data.amount;
		let holder = data.holder;
		let user_id = this.user.id;
		

		await this.Post( this.API_SERVER, '/store/charge/req', {
			user_id: user_id,
			amount: amount,
			holder: holder,
			token: this.token,

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

		if ( obj != null && obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		onSuccess(obj);
	}
	
	async reqTRANSFER_REQUEST( data: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;
		let user_id = this.user.id;

		await this.Post( this.API_SERVER, '/store/transfer/req', {
			user_id: user_id,
			value: data.value,
			password: data.password,
			token: this.token,

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
		if ( obj != null && obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.user != null ) {
			this.user = obj.user;
		}

		onSuccess(obj);
	}			

	async getSETTING( user_id: any, onSuccess : ( res : any) => void, onFail : (err : string) => void ) {
		let result: string = null;
		let errMessage: string = null;

		await this.Post( this.API_SERVER, '/users/setting/get', {
			user_id: user_id,
			token: this.token,
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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.setting != null ) {
			this.setting = obj.setting;
		}

		onSuccess(obj);
	}

	public async reqJOIN_MEMBER( user: any, onSUCCESS:(user: any)=>void, onFAIL:(err: any)=>void) {
		let result: string = null;
		let error: string = null;
		let isConnect = false;
		let platform: string = cc.sys.platform;
		let os: string = cc.sys.os;		

		try {
			await this.Post( this.API_SERVER, "/users/join", {
				user: user,
				platform: platform,
				os: os,
			}).then(( res: string ) => {
				isConnect = true;
				result = res;
			}).catch( function( err: any ) {
				if ( err.length == 0 ) {
					isConnect = false;					
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
			await this.Post( this.API_SERVER, '/users/check/login_id', { login_id: login_id }
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
			await this.Post( this.API_SERVER, '/users/check/nickname', { nickname: nickname }
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
			await this.Post( this.API_SERVER, '/users/point/transfer', { 
				user_id: user_id,
				value: value,
				token: this.token, 
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
				if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
					GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
					return;
				}

				if ( obj.user != null ) {
					this.user = obj.user;
				}

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
		let user_id = this.user.id;
		let error: string = null;

		try {
			await this.Post( this.API_SERVER, '/users/point/transferLog', { 
				user_id: user_id,
				token: this.token,
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
				if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
					GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
					return;
				}

				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}

	public async reqUNREAD( onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void ) {
		let result: string = null;
		let user_id = this.user.id;
		let error: string = null;

		try {
			await this.Post( this.API_SERVER, '/users/unread', { 
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
	
	public async reqGET_QNA( onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void ) {
		let result: string = null;
		let user_id = this.user.id;
		let token = this.token;
		let error: string = null;

		try {
			await this.Post( this.API_SERVER, '/users/qna/get', { 
				user_id: user_id,
				token: token,
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
				if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
					GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
					return;
				}
				onSUCCESS(obj);
			} else {
				return onFAIL('JSON_PARSE_ERROR');
			}
	
		} else {
			return onFAIL('CHECK_USER_ERROR');			
		}
	}

	public async reqMESSAGE( onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void ) {
		let result: string = null;
		let user_id = this.user.id;
		let error: string = null;

		try {
			await this.Post( this.API_SERVER, '/users/message/get', { 
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

	public async reqSEND_QNA( data: any, onSUCCESS: (res: any)=>void, onFAIL:(err: any)=>void ) {
		let result: string = null;
		let user_id = this.user.id;

		let token = this.token;
		let error: string = null;

		try {
			await this.Post(this.API_SERVER, '/users/qna/send', {
				user_id: user_id,
				token: token,
				data: data,
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
				if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
					GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
					return;
				}
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
		let user_id = this.user.id;
		let error: string = null;

		try {
			await this.Post( this.API_SERVER, '/users/point/receiveLog', { 
				user_id: user_id,
				token: this.token,
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
				if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
					GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
					return;
				}

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
		return this.user;
	}

	public GetSetting() : any {
		return this.setting;
	}

	public GetConfig(): any {
		return this.config;
	}

	public async updateUSER_AVATAR( avatar: number, onSuccess: (res)=> void , onFail: (err)=> void ) {
		let user_id = this.user.id;
		let result: string = null;
		let errMessage: string = null;

		await this.Post( this.API_SERVER, '/users/updateAvatar', {
			user_id: user_id,
			avatar: avatar,
			token: this.token,
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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.user != null ) {
			this.user = obj.user;
		}

		onSuccess(obj);
	}

	public async updateUSER_SETTING( selected: any, onSuccess: (res)=> void, onFail: (err)=> void ) {
		let user_id = this.user.id;
		let result: string = '';
		let setting: any = selected;
		let errMessage: string = null;

		await this.Post( this.API_SERVER, '/users/setting/update', {
			user_id: user_id,
			setting: setting,
			token: this.token,

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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.setting != null ) {
			this.setting = obj.setting;
		}

		onSuccess(obj);
	}

	public async getUSER_FromDB( onSuccess: (res)=> void, onFail: (err)=> void ) {
		let user_id = this.user.id;
		let result: string = '';
		let error: string = null;

		await this.Post( this.API_SERVER, '/users/get', {
			user_id: user_id,
			token: this.token,

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

		if ( obj.msg != null && obj.msg == 'INVALID_TOKEN') {
			GameManager.Instance().ForceExit( ENUM_LEAVE_REASON.LEAVE_TOKEN_EXPIRE );
			return;
		}

		if ( obj.user != null ) {
			this.user = obj.user;
		}

		onSuccess(obj);
	}

	public async Reconnect(roomid: string, session_id: string, cb: (room: any)=>void ) {
		// this.client = new ColySeus.Client(`${this.useSSL ? "wss" : "ws"}://${gameHost}${([443, 80].includes( this.game_port ) || this.useSSL) ? "" : `:${ this.game_port }`}`);
		this.client.reconnect( roomid, session_id ).then(( room: any )=>{
			cb( room );
		});
	}

	public async reqCHECK_GAME_SERVER( onSuccess: (res)=> void, onFail: (err)=> void ) {
		let game_servers: any[] = [];

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER, '/check', {
		} ).then(( res: string ) => {
			game_servers.push({
				server: HOLDEM_SERVER_TYPE.GAME_SERVER,
				port: gamePort,
			});
		}).catch( function( err: any ) {
		} );

		await this.Post( HOLDEM_SERVER_TYPE.GAME_SERVER_SUB, '/check', {
		} ).then(( res: string ) => {
			game_servers.push({
				server: HOLDEM_SERVER_TYPE.GAME_SERVER_SUB,
				port: gamePort_sub,
			});			
		}).catch( function( err: any ) {
		} );

		if ( game_servers.length > 0 ) {
			this.GAME_SERVER = game_servers[0].server;
			this.game_port = game_servers[0].port;
		} else {
			this.GAME_SERVER = HOLDEM_SERVER_TYPE.GAME_SERVER;
			this.game_port = gamePort;
		}
		onSuccess( this.GAME_SERVER );
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

			xhr.onerror = function() {
				if ( xhr.readyState != 4 ) {
					reject( 'NETWORK_REQUEST_FAILED' );
				}
			}

			let fullUrl: string = '';
			switch ( type ) {
				case HOLDEM_SERVER_TYPE.API_SERVER:
					fullUrl = `http://${ apiHost }:${ apiPort }`;
				break;
				case HOLDEM_SERVER_TYPE.API_SERVER_SUB:
					fullUrl = `http://${ apiHost }:${ apiPort_sub }`;
				break;				
				case HOLDEM_SERVER_TYPE.GAME_SERVER	:
					fullUrl = `http://${ gameHost }:${ gamePort }`;
				break;
				case HOLDEM_SERVER_TYPE.GAME_SERVER_SUB	:
					fullUrl = `http://${ gameHost }:${ gamePort_sub }`;
				break;				
			}
			fullUrl += url;

			xhr.open( "POST", fullUrl, true );
			xhr.timeout = 10000;
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.send( JSON.stringify( params ) );
		} );
	}
}


