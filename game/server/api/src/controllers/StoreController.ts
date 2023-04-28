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
        this.router.post( '/getStore', this.onGET_STORE.bind( this ));
        this.router.post( '/reqCharge', this.onREQ_CHARGE.bind( this ));
        this.router.post( '/reqTransfer', this.onREQ_TRANSFER.bind( this ));        
        this.router.post( '/getChargeRequests', this.onGET_CHARGE_REQUESTS.bind( this ));
        this.router.post( '/getTransferRequests', this.onGET_TRANSFER_REQUESTS.bind( this ));        
    }

    public async onGET_STORE( req: any, res: any ) {
        let id = req.body.store;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let store: any = await this.GetStoreByStoreID( req.app.get('DAO'), id );
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
        let userId = req.body.userId;
        let amount = req.body.amount;

        if ( userId == null || userId <= 0 || amount < 10000 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let user: any = await this.getUserByID( req.app.get('DAO'), userId );        
        if ( user == null ) {
            return;
        } 

        let affected: any = await this.CreateChargeRequest( req.app.get('DAO'), {
            user: user,
            amount: amount
        } );

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
        console.log('onREQ_TRANSFER');
        console.log( req.body );

        let userId = req.body.id;
        let value = req.body.value;
        let password = req.body.password;

        if ( userId == null || userId <= 0 || value < 10000 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_PARAMETER'
            });
            return;
        }

        let user: any = await this.getUserByID( req.app.get('DAO'), userId );        
        if ( user == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID',
            });
            return;
        }

        if ( user.transferpassword != password ) {
            console.log('password is not match');            
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_TRANSFER_PASSWORD',
            });
            return;
        }

        console.log('CreateTransferRequest');
        let result: any = await this.CreateTransferRequest( req.app.get('DAO'), {
            user: user,
            value: value
        } );

        console.log( result );

        if ( result.affected == 1 ) {
            let r: any = await this.UpdateUserBalance( req.app.get('DAO'), {
                id: user.id,
                newBalance: result.balance
            } );

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
        let id = req.body.id;
        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID'
            });
            return;
        }

        let charges: any = await this.GetRequestChargeListByID( req.app.get('DAO'), id );

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
        let id = req.body.id;
        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_USER_ID'
            });
            return;
        }

        let transfers: any = await this.GetRequestTransferListByID( req.app.get('DAO'), id );

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
    
    private async getUserByID( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectAccountByID ( id, function(err: any, res: any ) {
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
    
    private async GetStoreByStoreID( dao: any, storeID: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SelectStoreByStoreID ( storeID, function(err: any, res: any ) {

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

    private async CreateChargeRequest( dao: any, data: any ) {

        return new Promise( (resolve, reject )=>{

            dao.CreateChargeRequest( data, function( err: any, res: any ) {

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
    
    private async CreateTransferRequest( dao: any, data: any ) {
        console.log('CreateTransferRequest');
        console.log(data);

        return new Promise( (resolve, reject )=>{

            dao.CreateTransferRequest( data, function( err: any, res: any ) {

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

    private async UpdateUserBalance( dao: any, data: any ) {
        let id = data.id;
        let value = data.newBalance;

        return new Promise( (resolve, reject )=>{
            dao.UpdateUserBalance( {
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

    private async GetRequestChargeListByID( dao: any, id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SelectChargeRequestsByID ( id, function(err: any, res: any ) {

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

    private async GetRequestTransferListByID( dao: any, id: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SelectTransferRequestsByID ( id, function(err: any, res: any ) {

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