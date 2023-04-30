import { matchMaker, RoomListingData } from 'colyseus';
import express from 'express';
import { ENUM_RESULT_CODE } from '../arena.config';
import { ClientUserData } from './ClientUserData';

export class TableController {
    public router: any = null;
    
    constructor() {
        this.router = express.Router();
        this.initRouter();
    }

    private initRouter() {
        this.router.post( '/getTables', this.getTableList.bind(this));
        this.router.post( '/enterTable', this.enterTable.bind(this));
    }

    public async getTableList( req: any, res: any ) {
        let store = req.body.store;

        let tables = await this.getTableListFromDB( req.app.get('DAO'), store );
        if ( tables == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_TABLES',
            });
            return;            
        }

        let _tables: any[] = [];
        let rooms: RoomListingData<any>[] = await matchMaker.query({ private: false });

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

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            tables: _tables,
            msg: 'SUCCESS',
        });        
    }

    public async enterTable( req: any, res: any ) {

        let tableID = req.body.tableID;
        let userID = req.body.userID;

        if ( tableID == null || userID == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'TABLEID_OR_USER_ID_NULL',
            });
            return;
        }

        let user: any = await this.getAccount( req.app.get('DAO'), userID);
        if ( user == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INCORRECT_ID',
            });
            return;
        }

        if ( user.tableID != -1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DUPLICATE_LOGIN',
            });
            return;            
        }

        let table: any = await this.getTableInfoFromDB( req.app.get('DAO'), tableID );
        if ( table == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INCORRECT_TABLE_INFO',
            });
            return;            
        }

        let _tables = ClientUserData.getClientTableData(table);
        let seatReservation: matchMaker.SeatReservation = null;
        let gameSize = (_tables.maxPlayers == 9) ? 'holdem_full' : 'holdem_full';
        let room = await matchMaker.query({
            private: false,
            name: gameSize,
            serial: tableID
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

        seatReservation = await matchMaker.joinOrCreate( gameSize, { private: false, serial: tableID });

        user.pendingSessionId = seatReservation.sessionId;
        user.pendingSessionTimestamp = Date.now();
        user.tableID = tableID;

        await this.updatePendingState( req.app.get('DAO'), user);
        await this.updateTableID( req.app.get('DAO'), user);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            seatReservation: seatReservation,
            info: _tables,
            count: _tables.maxPlayers,
        });
    }

    private async updatePendingState( dao: any, data: any ) {

        return new Promise( ( resolve, reject ) => {
            dao.updateAccountPending( data, ( err: any, res: any )=>{

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

    private async updateTableID( dao: any, data: any ) {
        return new Promise( ( resolve, reject ) => {
            dao.updateTableID( data, function( err: any, res: any ) {

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

    private async getTableListFromDB( dao: any, store: number  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.selectTables( store, (err: any, res: any)=>{
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

    private async getTableInfoFromDB( dao: any, id: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.selectTableInfo(id, (err: any, res: any)=>{
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

    private async getAccount( dao: any, id: string ) {
        return new Promise( ( resolve, reject ) => {
            dao.selectAccountByID( id, function( err: any, res: any ) {
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



}

export default TableController;