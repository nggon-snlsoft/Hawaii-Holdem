import express from 'express';
import { resolve } from 'path';
import { ENUM_RESULT_CODE } from '../main';
import { sqlProxy } from "../modules/sqlProxy";

export class TableController {
    public router: any = null;
    private sql: sqlProxy;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;

        this.initRouter();
        console.log('TABLE_CONTROLLER_INITIALIZED');
    }

    private initRouter() {
        this.router.post( '/getTables', this.getTableList.bind(this));
    }

    public async getTableList( req: any, res: any ) {
        console.log('getTableList');

        let tables: any = await this.getAllTables( req.app.get('DAO'));
        console.log(tables);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            tables: tables,
            msg: 'SUCCESS',
        });
    }

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
                    console.log(res);
                    resolve(res);
                }
            });
        });
    }
}

export default TableController;