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

export class UserController {
    public router: any = null;
    private sql: sqlProxy = null;
    private conf: any = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;
        this.Init();
        this.initRouter();
        // this.initPassport();

        console.log('USER_CONTROLLER_INITIALIZED');
    }

    async Init(): Promise<any>{
        let confFile = await fs.readFileSync( path.join(__dirname, "../config/ServerConfigure.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
        this.conf = confJson['server'];
    }

    private initRouter() {
        this.router.post( '/login', this.reqLOGIN.bind(this));
        this.router.post( '/join', this.reqJOIN.bind(this));
        this.router.post( '/join_request', this.reqJOIN_REQUEST.bind(this));        
        this.router.post( '/refresh', this.reqREFRESH.bind(this));
        this.router.post( '/get', this.getUSER.bind(this));        

        this.router.post( '/check/login_id', this.checkLOGIN_ID.bind(this));
        this.router.post( '/check/nickname', this.checkUSER_NICKNAME.bind(this));

        this.router.post( '/point/transfer', this.transferPOINT.bind(this));
        this.router.post( '/point/transferLog', this.getPOINT_TRANSFER_LOG.bind(this));
        this.router.post( '/point/receiveLog', this.getPOINT_RECEIVE_LOG.bind(this));        

        this.router.post( '/qna/get', this.reqGET_QNA.bind(this));
        this.router.post( '/qna/send', this.reqSEND_QNA.bind(this));        

        this.router.post( '/getInitData', this.getINIT_DATA.bind(this));
        this.router.post( '/updateAvatar', this.updateAVATAR.bind(this));

        this.router.post( '/setting/get', this.getSETTING.bind(this));
        this.router.post( '/setting/update', this.updateSETTING.bind(this));

        this.router.post( '/statics/get', this.getSTATICS.bind(this));
        this.router.post( '/token/verify', this.checkTOKEN.bind(this));        
    }

    private async getIp( req: any, next: (ip: string )=>void ) {
        let ip: string = await requestIp.getClientIp( req );
        let address = new Address6(ip);

        next( address.parsedAddress4 );
    }

    public async reqJOIN_REQUEST( req: any, res: any ) {
        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
        });
    }

    public async reqLOGIN( req: any, res: any ) {
        let login_id = req.body.login_id;
        let password = req.body.password;
        if ( req.body.version == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_VERSION'
            });
            return;
        }

        let cv: string = req.body.version;
        let sv = this.conf.version;
        if ( cv != sv ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_VERSION'
            });
            return;
        }

        if ( login_id == null || login_id.length < 4 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let clientIp: string = '';
        try {
            await this.getIp( req, ( ip: string )=>{
                clientIp = ip;
            });            
        } catch (error) {
            clientIp = '';
        }

        let data: any = null;
        try {
            data = await this.getUSER_ByLOGIN_ID( req.app.get('DAO'), login_id );            
        } catch (error) {
            console.log(error);
            return;
        }

        if (data == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_LOGIN_ID'
            });
            return;
        }

        if ( password != data.password ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_MATCH_PASSWORD'
            });
            return;
        }

        if ( data.alive == 0 || data.disable == 1) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DISABLE_ACCOUNT'
            });
            return;
        }

        let token = sign({
            login_id: login_id,
            password: password
        }, SECRET_KEY, {

        });

        let affected: any = null;
        try {
            affected = await this.reqTOKEN_ByLOGIN_ID( req.app.get('DAO'), token, login_id );            
        } catch (error) {
            console.log(error);
        }

        affected = null;

        try {
            affected = await this.updateLOGIN_ByUSER_ID( req.app.get('DAO'), {
                user_id: data.id,
                login_ip: clientIp,
            } );
        } catch (error) {
            console.log(error);
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            id: data.id,
            ip: clientIp,
            token: token,
        });
    }

    public async getINIT_DATA( req: any, res: any ) {
        let user_id = req.body.user_id;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );            
        } catch (error) {
            console.log( error );
        }

        if (user == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _user = ClientUserData.getClientUserData(user);

        let setting: any = null;
        try {
            setting = await this.getSETTING_BY_USER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );            
        }

        let affected: any = 0;
        if ( setting == null || setting == undefined ) {
            try {
                affected = await this.createSETTING( req.app.get('DAO'), user_id );                
            } catch (error) {
                console.log( error );
            }

            try {
                setting = await this.getSETTING_BY_USER_ID( req.app.get('DAO'), user_id );                
            } catch (error) {
                console.log(error);
            }

            if ( setting == undefined ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'LOAD_SETTING_ERROR'
                });
                return;
            }
        }

        let _setting = ClientUserData.getClientSettingData(setting);

        let statics: any = null;
        try {
            statics = await this.getSTATICS_ByUSER_ID( req.app.get('DAO'), user_id );            
        } catch (error) {
            console.log( error );
        }

        if ( statics == null || statics == undefined ) {
            let affected: any = null;
            try {
                affected = await this.createSTATICS( req.app.get('DAO'), user_id );                
            } catch (error) {
                console.log(error);
            }

            try {
                statics = await this.getSTATICS_ByUSER_ID( req.app.get('DAO'), user_id );                
            } catch (error) {
                console.log(error);                
            }

            if ( setting == undefined ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'LOAD_STATICS_ERROR'
                });
                return;
            }
        }
        let _statics = ClientUserData.getClientStaticsData(statics);

        let conf = gameConf['game'];

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
            setting: _setting,
            statics: _statics,
            conf: conf,
        });
    }    

    public async reqJOIN( req: any, res: any) {
        let user = req.body.user;
        if ( user.login_id == null || user.login_id.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        if ( user.login_id.length <= 0 || user.nickname <= 0 || user.password.length <= 0  ||
            user.transfer_password.length <= 0 || user.phone.length <= 0 || user.bank.length <= 0 ||
            user.holder.length <= 0 || user.account.length <= 0 || user.recommender.length <= 0 /*|| user.store_id < 0*/ ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_FORM'
                });
                return;
        }

        let login_id: string = user.login_id;
        let nickname: string = user.nickname;        
        let data: any = null;

        try {
            data = await this.getUSER_ByLOGIN_ID( req.app.get('DAO'), login_id );
            if ( data != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_UID'
                });
                return;
            }
        } catch (error) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'ERROR_GET_USER'
            });
            return;
        }

        data = null;
        try {
            data = await this.getJOIN_USER_ByLOGIN_ID( req.app.get('DAO'), login_id );
            if ( data != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_JOIN_UID'
                });
                return;                
            }
        } catch (error) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'ERROR_GET_JOIN_USER'
            });
            return;            
        }

        data = null;
        try {
            data = await this.getUSER_ByNICKNAME( req.app.get('DAO'), nickname );
            if ( data != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_NICKNAME'
                });
                return;                
            }
        } catch (error) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'ERROR_GET_USER'
            });
            return;            
        }

        data = null;
        try {
            data = await this.getJOIN_USER_ByNICKNAME( req.app.get('DAO'), nickname );
            if ( data != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_NICKNAME'
                });
                return;                
            }
        } catch (error) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'ERROR_GET_JOIN_USER'
            });
            return;            
        }

        let partner: any = null;
        try {
            partner = await this.getPARTNER_ByCODE( req.app.get('DAO'), user.recommender );                        
        } catch (error) {
            console.log( error );
        }

        if ( partner == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_REFERAL_CODE'
            });
            return;
        } else {
            user.store_id = partner.store_id;
            user.distributor_id = partner.distributor_id;
            user.partner_id = partner.id;

            if ( partner.alive == 0 ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'EXPIRED_REFERAL_CODE'
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

        if ( clientIp != null ) {
            user.join_ip = clientIp;
        }

        let result: any = null;
        try {
            result = await this.createJOIN_MEMBER( req.app.get('DAO'), user );
            if ( result != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS'
                });
                return;
            } else {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DB_ERROR'
                });
                return;    
            }
            
        } catch (error) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DB_ERROR'
            });
            return;
        }
    }

    public async checkLOGIN_ID( req: any, res: any) {
        let login_id = req.body.login_id;
        if ( login_id == null || login_id.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByLOGIN_ID( req.app.get('DAO'), login_id );
            if ( user != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_USERS'
                });
                return;
            }

        } catch( error )
        {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        let join: any = null;
        try {
            join = await this.getJOIN_USER_ByLOGIN_ID( req.app.get('DAO'), login_id );            
            if ( join != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_JOIN_USERS'
                });
                return;
            }

        } catch( error )
        {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }        

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS'
        });
        return;
    }
    
    public async checkUSER_NICKNAME( req: any, res: any) {
        let nickname = req.body.nickname;
        if ( nickname == null || nickname.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUSER_ByNICKNAME( req.app.get('DAO'), nickname );            
            if ( user != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_USERS'
                });
                return;
            }

        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        let join: any = null;
        try {
            join = await this.getJOIN_USER_ByNICKNAME( req.app.get('DAO'), nickname );            
            if ( join != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'DUPLICATE_JOIN_USERS'
                });
                return;
            }

        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }        

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS'
        });
        return;
    }

    public async transferPOINT( req: any, res: any) {
        let user_id = req.body.user_id;
        let value = req.body.value;
        let desc = req.body.desc;
        let token = req.body.token;

        if ( desc == null ) {
            desc = "";
        }

        if ( user_id == null || value == null || value <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );            
            if ( user != null ) {
                if ( user.point < value ) {
                    res.status( 200 ).json({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'NOT_ENOUGH_POINT'
                    });
                }
            } else {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;        
            }

        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        let point = user.point;
        let balance = user.balance;
        let remainPoint = point - value;
        let newBalance = user.balance + value;

        if ( remainPoint < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        try {
            let affected = await this.reqPOINT_TRANSFER( req.app.get('DAO'), {
                user_id: user_id,
                point: remainPoint,
                balance: newBalance,
            } );

            if ( Number( affected ) < 1 ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }

        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        user = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );

            if ( user == null ) {
                // res.status( 200 ).json({
                //     code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                //     msg: 'NOT_ENOUGH_POINT'
                // });
            }
        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        let logs: any = null;
        try {
            logs = await this.reqPOINT_TRANSFER_LOG( req.app.get('DAO'), {
                user_id: user_id,
                oldPoint: point,
                newPoint: user.point,
                point: value,
                oldBalance: balance,
                newBalance: user.balance,
                desc: desc,
            } );

        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        let _user = ClientUserData.getClientUserData(user);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
            logs: logs

        });
        return;
    }
    
    public async getPOINT_TRANSFER_LOG( req: any, res: any) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

        let logs: any = null;
        try {
            logs = await this.getTRANSFER_LOGS( req.app.get('DAO'), user_id );
            if ( logs == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            logs: logs
        });

        return;
    }
    
    public async getPOINT_RECEIVE_LOG( req: any, res: any) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

        let logs: any = null;
        try {
            logs = await this.getRECEIVE_LOGS( req.app.get('DAO'), user_id );
            if ( logs == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            logs: logs

        });

        return;
    }

    public async reqGET_QNA( req: any, res: any) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

        let qnas: any = null;
        try {
            qnas = await this.getQNA( req.app.get('DAO'), user_id );
            if ( qnas == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            qnas: qnas

        });

        return;
    }
    
    public async reqSEND_QNA( req: any, res: any) {
        let user_id = req.body.user_id;
        let token = req.body.token;
        let data = req.body.data;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

        console.log(user_id);

        let user: any = null;
        try {
            user = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );
            if ( user == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;                
            }
        } catch ( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;            
        }

        console.log( user );

        let affected: any = null;
        try {
            affected = await this.sendQNA( req.app.get('DAO'), user, data );
            if ( affected == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
                return;
            }
        } catch( error ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: error
            });            
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            affected: affected,
        });

        return;
    }        

    public async updateAVATAR( req: any, res: any ) {
        let user_id = req.body.user_id;
        let avatar = req.body.avatar;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        if ( avatar == null || avatar < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_AVATAR'
            });
            return;
        }

        let affected: any = null;
        try {
            affected = await this.changeUSER_AVATAR( req.app.get('DAO'), user_id, avatar );            
        } catch (error) {
            console.log( error );
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

        let _user = ClientUserData.getClientUserData(user);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
            affected: affected,
        });
    }

    public async getUSER( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let user: any = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );
        if (user == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _user = ClientUserData.getClientUserData(user);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
        });
    }

    public async reqREFRESH( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let user: any = await this.getUSER_ByUSER_ID( req.app.get('DAO'), user_id );
        if (user == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _user = ClientUserData.getClientUserData(user);

        let tickets: any = await this.getTICKETS_ByUSER_ID( req.app.get('DAO'), user_id );
        if (tickets == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
            tickets: tickets
        });
    }    
    
    
    
    public async getSETTING( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 || token == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let setting: any = null;
        try {
            setting = await this.getSETTING_BY_USER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.error();
        }


        if ( setting == null || setting == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _setting = ClientUserData.getClientSettingData(setting);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            setting: _setting,
        });
    }
    
    public async updateSETTING( req: any, res: any ) {
        let user_id = req.body.user_id;
        let selected = req.body.setting;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 || token == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let affected: any = null;
        try {
            affected = await this.setSETTING_ByUSER_ID( req.app.get('DAO'), user_id, selected );            
        } catch (error) {
            console.log( error );            
        }

        let setting: any = null;
        try {
            setting = await this.getSETTING_BY_USER_ID( req.app.get('DAO'), user_id );            
        } catch (error) {
            console.log( error );
        }

        if (setting == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _setting = ClientUserData.getClientSettingData(setting);

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            affected: affected,
            setting: _setting,
        });
    }

    public async getSTATICS( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let statics: any = null;
        try {
            statics = await this.getSTATICS_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );            
        }


        if ( statics == null || statics == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _stactics = ClientUserData.getClientStaticsData( statics );
        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            statics: _stactics,
        });
    }

    public async checkTOKEN( req: any, res: any ) {
        let user_id = req.body.user_id;
        let token = req.body.token;

        if ( user_id == null || user_id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'TOKEN_VERIFY_SUCCESS',
        });
    }    

    private sendError( res: any, msg: string ) {
        res.status( 400 ).json ( {
            msg: msg,
        });
    }

    private async getUSER_ByUSER_ID( dao: any, user_id: string ) {
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

    private async getTICKETS_ByUSER_ID( dao: any, user_id: string ) {
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

    private async getTRANSFER_LOGS( dao: any, user_id: string ) {

        return new Promise( (resolve, reject )=>{
            dao.SELECT_POINT_TRANSFER_LOG ( user_id, function(err: any, res: any ) {
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

    private async getRECEIVE_LOGS( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_POINT_RECEIVE_LOG ( user_id, function(err: any, res: any ) {
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

    private async getQNA( dao: any, user_id: string ) {

        return new Promise( (resolve, reject )=>{
            dao.SELECT_QUESTIONS_ByUSER_ID ( user_id, function(err: any, res: any ) {
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
    
    private async sendQNA( dao: any, user: any, data: any ) {

        return new Promise( (resolve, reject )=>{
            dao.INSERT_QNA ( user, data, function(err: any, res: any ) {
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

    private async getUSER_ByLOGIN_ID( dao: any, login_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USERS_BY_LOGIN_ID ( login_id, function(err: any, res: any ) {
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

    private async reqTOKEN_ByLOGIN_ID( dao: any, token: string, login_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_USERS_TOKEN_LOGIN_ID ( token, login_id, function(err: any, res: any ) {
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

    private async updateLOGIN_ByUSER_ID( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_USERS_LOGIN ( data, function(err: any, res: any ) {
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

    private async getJOIN_USER_ByLOGIN_ID( dao: any, login_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_JOINS_BY_LOGIN_ID ( login_id, function(err: any, res: any ) {
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
    
    private async getJOIN_USER_ByNICKNAME( dao: any, nickname: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_JOINS_BY_NICKNAME ( nickname, function(err: any, res: any ) {
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

    private async getUSER_ByNICKNAME ( dao: any, nickname: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USERS_BY_NICKNAME ( nickname, function(err: any, res: any ) {
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

    private async getSETTING_BY_USER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_SETTING_BY_USER_ID ( user_id, function(err: any, res: any ) {
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

    private async setSETTING_ByUSER_ID( dao: any, user_id: string, setting: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_SETTING ( user_id, setting, function(err: any, res: any ) {
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

    private async getSTATICS_ByUSER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_STATICS_BY_USER_ID ( user_id, function(err: any, res: any ) {
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

    private async createJOIN_MEMBER( dao: any, user: any ) {
        return new Promise( (resolve, reject )=>{
            dao.insertJOIN_MEMBER ( user, function(err: any, res: any ) {
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
    
    private async getSTORE_ID_ByCODE( dao: any, code: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_STORE_CODE_ByCODE ( code, function(err: any, res: any ) {
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
    
    private async getPARTNER_ByCODE( dao: any, code: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_PARTNERS_ByCODE ( code, function(err: any, res: any ) {
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

    private async createSETTING( dao: any, user_id: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.INSERT_SETTING( user_id, function( err: any, res: any ) {
                if (!!err ) {
                    reject( {
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }

            });
        });
    }

    private async createSTATICS( dao: any, user_id: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.INSERT_STATICS( user_id, ( err: any, res: any )=> {
                if (!!err ) {
                    reject( {
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }
            });
        });
    }    

    private async changeUSER_AVATAR( dao: any, id: any, avatar: any ) {

        return new Promise ( (resolve, reject ) =>{
            dao.UPDATE_AVATAR( id, avatar, function( err: any, res: any ) {
                if (!!err ) {
                    reject( {
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async reqPOINT_TRANSFER( dao: any, data: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.UPDATE_POINT_TRANSFER( data, function( err: any, res: any ) {
                if (!!err ) {
                    reject( {
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }
            });
        });
    }
    
    private async reqPOINT_TRANSFER_LOG( dao: any, data: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.INSERT_POINT_TRANSFER_LOG( data, function( err: any, res: any ) {
                if (!!err ) {
                    console.log(err);
                    reject( {
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

export default UserController;