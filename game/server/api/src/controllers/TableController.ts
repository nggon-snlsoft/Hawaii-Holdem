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
    }

}

export default TableController;