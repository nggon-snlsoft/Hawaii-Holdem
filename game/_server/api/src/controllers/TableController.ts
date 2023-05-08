import { json } from 'body-parser';
import express from 'express';
import { resolve } from 'path';
import { ENUM_RESULT_CODE } from '../main';
import { sqlProxy } from "../modules/sqlProxy";
import { ClientUserData } from './ClientUserData';
import * as request from 'superagent';

export class TableController {
    public router: any = null;
    private sql: sqlProxy;
    private devServerInfo: any = null;

    private serverPrefix: string = '';

    constructor( sql: sqlProxy, info: any ) {
        this.router = express.Router();
        this.devServerInfo = info;
        this.sql = sql;

        this.initRouter();

        this.serverPrefix = 'http://' + this.devServerInfo.host + ':' + this.devServerInfo.port + '/';
        console.log('TABLE_CONTROLLER_INITIALIZED');
    }

    private initRouter() {
        this.router.post( '/getTables', this.getTableList.bind(this));
    }

    public async getTableList( req: any, res: any ) {
        console.log('testFunction');
        await this.HttpPostToServer('users/test', {
            id: 1,
            password: 2,            
        }, (res)=>{
            console.log(res);
        }, (err)=>{
            console.log(err);
        });
    }

    private async HttpPostToServer(url: string, body: any, onSuccess:(res: any)=>void, onFail:(err: any)=>void ) {
        let fullUrl = this.serverPrefix + url;

        await request.post(fullUrl).send(body)
        .then( (result)=>{
            if (onSuccess != null) {
                onSuccess( result.body );
            }
        } ).catch( (err)=>{
            if (onFail != null ) {
                onFail( err );
            }
        });
    }

    // public async getTableList( req: any, res: any ) {

    //     let tables: any = await this.getAllTables( req.app.get('DAO'));
    //     if ( tables == undefined) {
    //         res.status( 200 ).json({
    //             code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
    //             msg: 'NO_TABLES',
    //         });
    //         return;
    //     }

    //     let _tables: any[] = [];
    //     for ( let i = 0 ; i < tables.length; i++ ) {
    //         if ( tables[i].alive == 1 && tables[i].disable == 0 ) {
    //             let t = ClientUserData.getClientRoomData(tables[i]);
    //             _tables.push(t);
    //         }
    //     }

    //     res.status( 200 ).json({
    //         code: ENUM_RESULT_CODE.SUCCESS,
    //         tables: _tables,
    //         msg: 'SUCCESS',
    //     });
    // }

    private async getAllTables( dao: any ) {
        return new Promise ( (resolve, reject )=>{
            dao.selectTables ( function(err: any, res: any ) {
                if (!!err) {
                    console.log('getAllTables');
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve(res);
                }
            });
        });
    }
}

export default TableController;