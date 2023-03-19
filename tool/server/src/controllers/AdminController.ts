import express from "express";
import {sqlProxy} from "../module/sqlProxy";
import {ENUM_RESULT_CODE} from "../main";

export class AdminController {
    public router: any = null;
    private sql: sqlProxy = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;
    }

    public init() {
        this.initRouter();
    }

    public initRouter() {
        this.router.post( '/login', this.login.bind(this));
    }

    private login( req: any, res: any ) {
        if ( req.body == undefined ) {
            res.status(400);
            res.end();
            return;
        }

        let pins = req.body.pins;
        if ( pins == null ) {
            res.status(400);
            res.end();
            return;
        }

        res.status(200);

        let query = 'SELECT * FROM ADMIN_TABLE WHERE CODE =?';
        let arg = [pins];
        this.sql.query( query, arg, (err, result )=>{
            if ( err != null ) {
                res.send({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    message: 'ERROR' + err
                });
                return;
            }

            if ( result.length < 1 ) {
                res.send( {
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    message: 'ADMIN_ACCOUNT_IS_NOT_EXIST'
                } );
                return;
            }

            let admin: any = result[0];

            query = 'UPDATE ADMIN_TABLE SET LOGINCOUNT =' + (admin.loginCount + 1) +
                ', STATUS = 1, UPDATEDATE = now() where id = ' + admin.id;

            this.sql.query(query, null, (err, result )=> {
                if ( err != null ) {
                    res.send({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        message: 'FAIL_TO_UPDATE_ADMIN_TABLE',
                    });
                    return;
                }
                res.send({
                    code: ENUM_RESULT_CODE.SUCCESS,
                    admin: admin,
                });
            });
        });
    }
}

export default  AdminController;