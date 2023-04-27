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
        this.router.post( '/getChargeRequest', this.onREQUEST_CHARGE_LIST.bind( this ));
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
        let id = req.body.id;
        let amount = req.body.amount;

        console.log('id: ' + id );
        console.log('amount: ' + amount );        

        if ( id == null || id <= 0 || amount < 10000 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_STORE_ID'
            });
            return;
        }

        let user: any = await this.getUserByID( req.app.get('DAO'), id );        
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

    public async onREQUEST_CHARGE_LIST( req: any, res: any ) {
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
        console.log('CreateChargeRequest');

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
}

export default StoreController;