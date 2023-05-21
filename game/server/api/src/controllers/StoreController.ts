import express from 'express';
import { sqlProxy } from '../modules/sqlProxy';
import { ENUM_RESULT_CODE } from '../main';
import { send } from 'process';
import { ClientUserData } from './ClientUserData';
import { resolve } from 'path';
import { rejects } from 'assert';
import { use } from 'passport';

const requestIp = require('request-ip');
const gameConf = require('../config/gameConf.json');

export class StoreController {
    public router: any = null;
    private sql: sqlProxy = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;

        this.InitRouter();
        console.log('STORE_CONTROLLER_INITIALIZED');
    }

    private InitRouter() {
        this.router.post( '/get', this.onGET_STORE.bind( this ));
        this.router.post( '/charge/req', this.onREQ_CHARGE.bind( this ));
        this.router.post( '/transfer/req', this.onREQ_TRANSFER.bind( this ));
        this.router.post( '/chargeRequest/get', this.onGET_CHARGE_REQUESTS.bind( this ));
        this.router.post( '/transferRequest/get', this.onGET_TRANSFER_REQUESTS.bind( this ));
        this.router.post( '/popups/get', this.onGET_POPUPS.bind( this ));
        this.router.post( '/ticket/check', this.onCHECK_TICKETS.bind( this ));        
    }

    public async onGET_STORE( req: any, res: any ) {
        let store_id = req.body.store_id;
        let user_id = req.body.user_id;
        let token = req.body.token;

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

        if ( store_id == null || store_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let store: any = null;
        try {
            store = await this.getSTORE_BySTORE_ID( req.app.get('DAO'), store_id );            
        } catch (error) {
            console.log( error );
        }

        if ( store === null || store === undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _store = ClientUserData.getClientStoreData( store );

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            store: _store,
        });
    }

    public async onREQ_CHARGE( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;
        let amount = req.body.amount;
        let holder = req.body.holder;

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

        if ( user_id == null || user_id <= 0 || amount < 10000 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }

        if ( user == null || user == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let affected: any = null;
        try {
                affected = await this.reqCHARGE_REQUEST( req.app.get('DAO'), {
                user: user,
                amount: amount,
                holder: holder,
            } );
        } catch (error) {
            console.log ( error );            
        }

        if ( affected == true ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
            });
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INSERT_FAIL',
            });
        }
    }

    public async onREQ_TRANSFER( req: any, res: any ) {
        let user_id = req.body.user_id;
        let value = req.body.value;
        let password = req.body.password;
        let token = req.body.token;

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

        if ( user_id == null || user_id <= 0 || value < 10000 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_PARAMETER'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );            
        } catch (error) {
            console.log( error );
        }

        if ( user == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID',
            });
            return;
        }

        if ( user.transferpassword != password ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_TRANSFER_PASSWORD',
            });
            return;
        }

        let result: any = null;
        try {
            result = await this.reqTRANSFER_REQUEST( req.app.get('DAO'), {
                user: user,
                value: value
            } );
                
        } catch (error) {
            console.log( error );            
        }

        if ( result == null || result == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'TRANSFER_REQUEST_FAIL',
            });
            return;
        }

        if ( result.affected == 1 ) {
            let r: any = null;
            try {
                r = await this.setUSER_BALANCE( req.app.get('DAO'), {
                    id: user.id,
                    newBalance: result.balance
                } );                
            } catch (error) {
                console.log( error );
            }

            if ( r != null && r.length > 0 ) {
                let _user = ClientUserData.getClientUserData( r[0] );
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS',
                    user: _user,
                });
            } else {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'UPDATE_BALANCE_FAIL',
                });                
            }

        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INSERT_FAIL',
            });
        }
    }

    public async onGET_CHARGE_REQUESTS( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

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

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID'
            });
            return;
        }

        let charges: any = null;
        try {
            charges = await this.reqCHARGE_REQUSETS_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );            
        }

        if ( charges == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            });
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                charges: charges,
            });
        }
    }

    public async onGET_TRANSFER_REQUESTS( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

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

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID'
            });
            return;
        }

        let transfers: any = null;
        try {
            transfers = await this.reqTRANSFER_REQUESTS_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }

        if ( transfers == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            });
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                transfers: transfers,
            });
        }
    }

    public async onGET_POPUPS( req: any, res: any ) {
        let user_id = req.body.user_id;
        let store_id = req.body.store_id;
        let token = req.body.token;

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

        if ( store_id == null || store_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let popups: any = null;
        try {
            popups = await this.reqPOPUPS_BySTORE_ID( req.app.get('DAO'), store_id );
        } catch (error) {
            console.log( error );
        }

        // let tickets: any = null;
        // try {
        //     tickets = await this.reqTICKETS_ByUSER_ID( req.app.get('DAO'), user_id );
            
        // } catch (error) {
        //     console.log( error );            
        // }

        if ( popups == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'POPUP_NULL',                
            });
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                popups: popups,
            });
        }
    }

    public async onCHECK_TICKETS( req: any, res: any ) {
        let ticket_id = req.body.ticket_id;

        if ( ticket_id == null || ticket_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_TICKET_ID'
            });
            return;
        }

        let affected: any = null;
        try {
            affected = await this.reqCHECK_TICKET_ByTICKET_ID( req.app.get('DAO'), ticket_id );
        } catch (error) {
            console.log( error );
        }

        if ( affected == null || affected <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            });            
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
            });            
        }
    }    
    
    private async getUSER_ByUSER_ID( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USER_BY_USER_ID ( id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res[0]);
                }
            });
        });
    }    
    
    private async getSTORE_BySTORE_ID( dao: any, store_id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_STORE_BySTORE_ID ( store_id, function(err: any, res: any ) {

                if ( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res[0]);
                }
            });
        });
    }

    private async reqCHARGE_REQUEST( dao: any, data: any ) {

        return new Promise( (resolve, reject )=>{
            dao.INSERT_CHARGE_REQUEST( data, function( err: any, res: any ) {

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
    
    private async reqTRANSFER_REQUEST( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{

            dao.INSERT_TRANSFER_REQUEST( data, function( err: any, res: any ) {

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

    private async setUSER_BALANCE( dao: any, data: any ) {
        let id = data.id;
        let value = data.newBalance;

        return new Promise( (resolve, reject )=>{
            dao.UPDATE_USER_BALANCE( {
                id: id,
                newBalance: value,

            }, function( err: any, res: any ) {

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

    private async reqCHARGE_REQUSETS_ByUSER_ID( dao: any, id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_CHARGE_REQUESTS_ByUSER_ID ( id, function(err: any, res: any ) {

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

    private async reqTRANSFER_REQUESTS_ByUSER_ID( dao: any, id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_TRANSFER_REQUEST_ByUSER_ID ( id, function(err: any, res: any ) {

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

    private async reqPOPUPS_BySTORE_ID( dao: any, store_id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_POPUPS_BySTORE_ID ( store_id, function(err: any, res: any ) {

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

    private async reqCHECK_TICKET_ByTICKET_ID( dao: any, ticket_id: number ) {

        return new Promise( (resolve, reject )=>{
            dao.UPDATE_TICKETS_ALIVE ( ticket_id, function(err: any, res: any ) {

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

    private async reqTICKETS_ByUSER_ID( dao: any, user_id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_TICKETS_ByUSER_ID ( user_id, function(err: any, res: any ) {

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

export default StoreController;