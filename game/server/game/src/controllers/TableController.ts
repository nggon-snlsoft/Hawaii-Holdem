import { matchMaker, RoomListingData } from 'colyseus';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ENUM_RESULT_CODE } from '../arena.config';
import { ClientUserData } from './ClientUserData';

import requestIp from 'request-ip';
let Address6 = require('ip-address').Address6;

export class TableController {
    public router: any = null;
    private conf: any = null;
    
    constructor() {
        this.router = express.Router();
        this.initRouter();
        this.Init();
    }

    async Init(): Promise<any>{
        let confFile = await fs.readFileSync( path.join(__dirname, "../config/ServerConfigure.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
        this.conf = confJson['server'];
    }

    async RefreshConfig(): Promise<any>{
        let confFile = await fs.readFileSync( path.join(__dirname, "../config/ServerConfigure.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
        this.conf = confJson['server'];
    }

    private initRouter() {
        this.router.post( '/get', this.getTABLE_LIST.bind(this));
        this.router.post( '/enter', this.enterTABLE.bind(this));
    }

    private async getIp( req: any, next: (ip: string )=>void ) {
        let ip: string = await requestIp.getClientIp( req );
        let address = new Address6(ip);

        next( address.parsedAddress4 );
    }

    public async getTABLE_LIST( req: any, res: any ) {
        let client_version = req.body.version;
        let server_version = this.conf.version;

        if ( client_version == null || client_version != server_version ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'VERSION_MISMATCH'
            });
            return;
        }

        let tables: any[] = [];
        try {
            tables = await this.getTABLE_LIST_FromDB( req.app.get('DAO') );            
            if ( tables == null || tables == undefined || tables.length <= 0 ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'NO_TABLES',
                });
                return;            
            }
    
        } catch (error) {
            console.log( error);
            return;
        }

        let _tables: any[] = [];
        let rooms: RoomListingData<any>[] = [];

        try {
            rooms = await matchMaker.query({ private: false });
            for (let i = 0; i < tables.length; i++ ) {
                let t = ClientUserData.getClientTableData( tables[i] );
    
                let r = rooms.find( (e)=> {
                    return e.serial == t.id;
                });
    
                if ( r != null ) {
                }
    
                let p = (r == null) ? 0 : r.clients;
                t.players = p;
                _tables.push(t);
            }                                
        } catch (error) {
            console.log ( error );            
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            tables: _tables,
            msg: 'SUCCESS',
        });        
    }

    public async enterTABLE( req: any, res: any ) {
        let table_id = req.body.table_id;
        let user_id = req.body.user_id;
        let token = req.body.token;
        let client_version = req.body.version;
        let server_version = this.conf.version;

        if ( client_version == null || client_version != server_version ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'VERSION_MISMATCH'
            });
            return;
        }

        let verify: any = null;
        try {
            verify = await this.reqTOKEN_VERIFY( req.app.get('DAO'), user_id, token );
        } catch (error) {
            console.log( error );
        }

        if ( verify == null || verify == false ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_TOKEN'
            });
            return;
        }

        if ( table_id == null || user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'TABLEID_OR_USER_ID_NULL',
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id);            
        } catch (error) {
            console.log( error );
        }

        if ( user == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INCORRECT_ID',
            });
            return;
        }

        if ( user.table_id != -1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DUPLICATE_LOGIN',
            });
            return;            
        }

        let table: any = null;
        try {
            table = await this.getTABLE_ByTABLE_ID( req.app.get('DAO'), table_id );
        } catch (error) {
            console.log( error );
        }

        if ( table == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INCORRECT_TABLE_INFO',
            });
            return;            
        }

        let balance = user.balance;
        let minBuyIn = table.minStakePrice;
        if ( balance < minBuyIn ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NOT_ENOUGHT_BALANCE',
                balance: balance,
                buyin: minBuyIn
            });
            return;
        }

        let _tables = ClientUserData.getClientTableData(table);
        let gameSize = (_tables.maxPlayers == 9) ? 'holdem_full' : 'holdem_short';
        let room = await matchMaker.query({
            private: false,
            name: gameSize,
            serial: _tables.id
        });

        if ( room != null && room.length > 0) {
            if ( room[0].maxClients == room[0].clients ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'TABLE_IS_FULL',
                });
                return;
            }
        }

        let clientIp: string = '';
        try {
            await this.getIp( req, ( ip: string )=>{
                clientIp = ip;
            });            
        } catch (error) {
            clientIp = '';
        }

        await this.RefreshConfig();
        
        if ( this.conf.checkIpDuplication) {
            let users: any[] = [];
            try {
                users = await this.getUSERS_ByTABLE_ID( req.app.get('DAO'), table_id );
            } catch (error) {
                console.log( error );
            }

            if ( users != null && users.length > 0 ) {
                let d = users.find( ( e )=>{
                    return (e.login_ip.length > 0) && (clientIp == e.login_ip);
                });

                if ( d != null ) {
                    res.status( 200 ).json({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'TABLE_DUPLICATE_IP',
                    });        
                    return;
                }
            }
        }

        let seatReservation: matchMaker.SeatReservation = null;
        try {
            seatReservation = await matchMaker.joinOrCreate( gameSize, { private: false, serial: _tables.id });            
        } catch (error) {
            console.log( error);            
        }

        if ( seatReservation == null || seatReservation == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'TABLE_JOIN_FAIL',
            });
            return;
        }

        user.pendingSessionId = seatReservation.sessionId;
        user.pendingSessionTimestamp = 0; Date.now();

        user.table_id = _tables.id;
        user.login_ip = clientIp;

        let session_id = seatReservation.sessionId;
        if ( session_id == null || session_id.length <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'TABLE_JOIN_FAIL',
            });            
        }

        try {
            await this.reqSESSION_ID( req.app.get('DAO'), {
                session_id: session_id,
                id: user.id,
            } );

        } catch (error) {
            console.log( error );
        }

        let tb: any = null;

        try {
            tb = await this.reqTABLE_ID( req.app.get('DAO'), user );

        } catch (error) {
            console.log ( error );
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            ip: clientIp,
            seatReservation: seatReservation,
            info: _tables,
            count: _tables.maxPlayers,
        });
    }

    private async reqSESSION_ID( dao: any, data: any ) {

        return new Promise( ( resolve, reject ) => {
            dao.UPDATE_USERS_SESSION_ID( data, ( err: any, res: any )=>{

                if( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                }

                resolve( res );
            } );
        } );
    }    

    private async reqPENDING_STATE( dao: any, data: any ) {

        return new Promise( ( resolve, reject ) => {
            dao.UPDATE_USERS_PENDING( data, ( err: any, res: any )=>{

                if( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                }

                resolve( res );
            } );
        } );
    }

    private async reqTABLE_ID( dao: any, data: any ) {
        return new Promise( ( resolve, reject ) => {
            dao.UPDATE_USERS_TABLE_ID_LOGIN_IP_ByUSER( data, function( err: any, res: any ) {

                if( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                }
                resolve( res );
            } );
        } );
    }

    private async getTABLE_LIST_FromDB( dao: any ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SELECT_TABLES( (err: any, res: any)=>{
                if ( err != null ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async getTABLE_ByTABLE_ID( dao: any, table_id: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SELECT_TABLES_ByTABLE_ID(table_id, (err: any, res: any)=>{
                if ( err != null ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async getUSERS_ByTABLE_ID( dao: any, table_id: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SELECT_USERS_ByTABLE_ID(table_id, (err: any, res: any)=>{
                if ( err != null ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                    return;
                }
                resolve( res ); 
            });
        });
    }    

    private async getUSER_ByUSER_ID( dao: any, id: string ) {
        return new Promise( ( resolve, reject ) => {
            dao.SELECT_USERS_ByUSER_ID( id, function( err: any, res: any ) {
                if( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'                        
                    });
                }

                resolve( res[0] );
            } );
        } );
    }

    private async reqTOKEN_VERIFY( dao: any, user_id: string, token: string  ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USERS_BY_USER_ID_TOKEN ( user_id, token, function(err: any, res: any ) {
                if ( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }
            });
        });
    }
}

export default TableController;