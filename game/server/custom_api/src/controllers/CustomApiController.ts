import express from 'express';
import { sqlProxy } from '../modules/sqlProxy';
import { ENUM_RESULT_CODE } from '../main';
import { send } from 'process';
import { ClientUserData } from './ClientUserData';
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { resolve } from 'path';
import { rejects } from 'assert';
import { use } from 'passport';
import { SECRET_KEY } from '../routes/JwtMiddleware';
import { compileFunction } from 'vm';
import requestIp from 'request-ip';
import * as fs from 'fs';
import * as path from 'path';

const gameConf = require('../config/gameConf.json');

let Address6 = require('ip-address').Address6;

export class CustomApiController {
    public router: any = null;
    private sql: sqlProxy = null;
    private conf: any = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;
        this.Init();
        this.initRouter();

        console.log('USER_CONTROLLER_INITIALIZED');
    }

    async Init(): Promise<any>{
        let confFile = await fs.readFileSync( path.join(__dirname, "../config/ServerConfigure.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
        this.conf = confJson['server'];
    }

    private async initRouter() {
        this.router.get( '/', ( req: any, res: any)=>{
			res.send( "CustomApiDocument" );
        });

        this.router.get( '/TRANSFER_TICKET', ( req: any, res: any)=>{
            this.TRANSFER_TICKET(req, res);
        });

    }
    private async TRANSFER_TICKET( req: any, res: any ) {
        let sales_users: any = null;
        let items: any[] = [];

        sales_users = await this.GET_SALES_USERS( req.app.get('DAO'));        
        if ( sales_users != null ) {
            console.log(sales_users.length);

            let c: number = 0;

            for( let i = 0 ; i < sales_users.length; i ++ ) {
                if ( sales_users[i].useTicket != 0 ) {
                    continue;
                }

                c++;

                items.push( {
                    user_id: sales_users[i].user_id,
                    store_id: -1,
                    distributor_id: sales_users[i].distributor_id,
                    partner_id: sales_users[i].partner_id,
                    year: sales_users[i].year,
                    month: sales_users[i].month,
                    day: sales_users[i].day,
                    timestamp: sales_users[i].timestamp,
                    charge: sales_users[i].charge,
                    point: sales_users[i].point,
                    transfer: sales_users[i].transfer,
                    return: sales_users[i].return,
                    wins: sales_users[i].wins,
                    rakes: sales_users[i].rakes,
                    bettings: sales_users[i].bettings,
                    rollings: sales_users[i].rollings,
                    rolling_rakes: sales_users[i].rolling_rakes,
                    rake_back: sales_users[i].rake_back,
                    useTicket: sales_users[i].useTicket,
                    updateDate: sales_users[i].updateDate,
                    createDate: sales_users[i].createDate
                });
            }

            console.log('useTicket 0 = : ' + c );

        } else {
            res.send( "TRANSFER_TICKET_FAIL" );
            return;
        }

        let tickets: any = null;
        tickets = await this.GET_TICKETS( req.app.get('DAO'));

        if ( tickets != null ) {
            console.log('ticket count = : ' + tickets.length );        
            for( let i = 0 ; i < tickets.length; i ++ ) {
                let user: any = null;
                user = await this.GET_USER_ByUSER_ID( req.app.get('DAO'), tickets[i].user_id );
                if ( user != null ) {

                    if ( tickets[i].return > 0 ) {
                        continue;
                    }

                    let dt = new Date( tickets[i].updateDate );

                    let y: any = dt.getFullYear();
                    let m: any = dt.getMonth() + 1;
                    let d: any = dt.getDate();
                    let ts: any = dt.getTime();

                    items.push( {
                        user_id: tickets[i].user_id,
                        store_id: user.store_id,
                        distributor_id: user.distributor_id,
                        partner_id: user.partner_id,
                        year: y,
                        month: m,
                        day: d,
                        timestamp: ts,
                        charge: tickets[i].charge,
                        point: 0,
                        transfer: tickets[i].transfer,
                        return: 0,
                        wins: 0,
                        rakes: 0,
                        bettings: 0,
                        rollings: 0,
                        rolling_rakes: 0,
                        rake_back: 0,
                        useTicket: 1,
                        updateDate: tickets[i].updateDate,
                        createDate: tickets[i].createDate
                    });
                } else {

                }
            }
        } else {
            res.send( "TRANSFER_TICKET_FAIL" );
            return;            
        }

        items.sort(( a: any, b: any )=>{
            if ( a.createDate > b.createDate ) return 1;
            if ( a.createDate == b.createDate ) return 0;
            if ( a.createDate < b.createDate ) return -1;
        });

        let affectedCount = 0;

        let truncate_result: any = null;
        truncate_result = await this.TRUNCATE_SALES_USER(req.app.get('DAO'));
        if ( truncate_result != null ) {
            console.log(truncate_result);

        } else {
            res.send( "TRANSFER_TICKET_FAIL" );            
            return;
        }

        console.log( items.length );

        for ( let i = 0; i < items.length; i ++ ) {
            let affected: any = null;

            affected = await this.INSERT_SALES_USER( req.app.get('DAO'), items[i] );
            if ( affected > 0 ) {
                affectedCount++;
            }
        }
        console.log('insert count: ' + affectedCount );

        res.send( "TRANSFER_TICKET_COMPLETE: " + items.length );
    }

    private async GET_SALES_USERS( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_SALES_USERS ( function(err: any, res: any ) {
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

    private async GET_TICKETS( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_TICKETS ( function(err: any, res: any ) {
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

    private async GET_USER_ByUSER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USER_BY_USER_ID ( user_id, function(err: any, res: any ) {
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

    private async TRUNCATE_SALES_USER( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.TRUNCATE_SALES_USER ( function(err: any, res: any ) {
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

    private async INSERT_SALES_USER( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.INSERT_SALES_USER ( data, function(err: any, res: any ) {
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

export default CustomApiController;