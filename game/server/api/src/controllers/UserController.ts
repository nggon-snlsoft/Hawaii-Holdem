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

        this.router.post( '/unread', this.reqUNREAD_COUNT.bind(this));

        this.router.post( '/qna/get', this.reqGET_QNA.bind(this));
        this.router.post( '/qna/send', this.reqSEND_QNA.bind(this));
        this.router.post( '/qna/read', this.reqREAD_QNA.bind(this));
        this.router.post( '/qna/delete', this.reqDELETE_QNA.bind(this));
        
        this.router.post( '/message/get', this.reqGET_MESSAGE.bind(this));
        this.router.post( '/message/unread', this.reqGET_UNREAD_MESSAGE.bind(this));
        this.router.post( '/message/read', this.reqREAD_MESSAGE.bind(this));

        this.router.post( '/getData', this.getDATA.bind(this));
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
        let platform = req.body.platform;
        let os = req.body.os;

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

        if ( req.body.version == null ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_VERSION'
            });
            return;
        }

        let cv: string = req.body.version;
        let sv = this.conf.version;
        let VERSION = parseInt(cv);        

        if ( cv != sv ) {
            if ( VERSION < 18) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    referal: data.recommender,
                    msg: 'INVALID_VERSION'
                });
                return;
            } else {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    referal: data.recommender,
                    msg: 'VERSION_MISMATCH'
                });
                return;
            }
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

        let rake_back_rate: any = 50;
        if ( data != null ) {
            let distributor_id = data.distributor_id;
            let distributor: any = null;
            try {
                distributor = await this.getDISTRIBUTOR_ByDISTRIBUTOR_ID( req.app.get('DAO'), distributor_id );            
            } catch (error) {
                console.log(error);
            }
            
            if ( distributor != null ) {
                let enable_rake_back = distributor.enable_rake_back;
                if ( enable_rake_back == 1 ) {
                    rake_back_rate = 50;
                } else {
                    rake_back_rate = 0;
                }
            }

            let partner_id = data.partner_id;
            let partner: any = null;
            try {
                partner = await this.getPARTNERS_ByPARTNER_ID( req.app.get('DAO'), partner_id );
                if ( partner != null ) {
                    if ( partner.alive == 0 ) {
                        data.disable = 1;
                        await this.reqUSER_DISABLE( req.app.get('DAO'), partner_id );                        
                        res.status( 200 ).json({
                            code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'DISABLE_ACCOUNT'
                        });
                        return;
                    }
                }            
            } catch (error) {
                console.log(error);
            }
        }

        if ( platform == null ) {
            platform = '';
        }

        if ( os == null ) {
            os = '';
        }

        affected = null;
        try {
            affected = await this.updateLOGIN_ByUSER_ID( req.app.get('DAO'), {
                user_id: data.id,
                login_ip: clientIp,
                platform: platform,
                os: os,
                rake_back_rate: rake_back_rate,
            } );
        } catch (error) {
            console.log(error);
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            id: data.id,
            ip: clientIp,
            user: data,
            token: token,
        });
    }

    public async getDATA( req: any, res: any ) {
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
        let platform = req.body.platform;
        if ( platform == null ) {
            platform = '';
        }
        user.platform = platform;

        let os = req.body.os;
        if ( os == null ) {
            os = '';
        }
        user.os = os;

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
            user.rake_back_rate = partner.rake_back_rate;

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

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

    public async reqUNREAD_COUNT( req: any, res: any) {
        let user_id = req.body.user_id;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let unread_answer: any = null;
        try {
            unread_answer = await this.getUNREAD_ANSWER_ByUSER_ID( req.app.get('DAO'), user_id );
            if ( unread_answer == null ) {
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

        if ( unread_answer == null ) {
            unread_answer = 0;
        }

        let unread_message: any = null;
        try {
            unread_message = await this.getUNREAD_MESSAGE_ByUSER_ID( req.app.get('DAO'), user_id );
            if ( unread_message == null ) {
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

        if ( unread_message == null ) {
            unread_message = 0;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            unread_answer: unread_answer,
            unread_message: unread_message,
        });

        return;
    }

    public async reqGET_QNA( req: any, res: any) {
        let user_id = req.body.user_id;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
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

    public async reqGET_MESSAGE( req: any, res: any) {
        let user_id = req.body.user_id;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let messages: any = null;
        try {
            messages = await this.getMESSAGES( req.app.get('DAO'), user_id );
            if ( messages == null ) {
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
            messages: messages

        });

        return;
    }    

    public async reqGET_UNREAD_MESSAGE( req: any, res: any) {
        let user_id = req.body.user_id;

        if ( user_id == null || user_id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let unread_messages: any = null;
        try {
            unread_messages = await this.getUNREAD_MESSAGE_COUNT( req.app.get('DAO'), user_id );
            if ( unread_messages == null ) {
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
            unread_messages: unread_messages

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

    public async reqREAD_QNA( req: any, res: any) {
        let id = req.body.id;

        let affected: any = null;
        try {
            affected = await this.setQNA_READ( req.app.get('DAO'), id );
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
    
    public async reqREAD_MESSAGE( req: any, res: any) {
        let id = req.body.id;

        let affected: any = null;
        try {
            affected = await this.setMESSAGE_READ( req.app.get('DAO'), id );
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

    public async reqDELETE_QNA( req: any, res: any) {
        let id = req.body.id;

        let affected: any = null;
        try {
            affected = await this.setQNA_DELETE( req.app.get('DAO'), id );
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

        let tickets: any = null;
        try {
            tickets = await this.getTICKETS_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }

        if ( tickets == null || tickets == undefined ) {
            tickets = null;
        }

        let points: any = null;
        try {
            points = await this.getPENDING_POINT_RECEIVES_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }

        let point_receives: any = [];

        try {
            if ( points != null && points.length > 0 ) {
                let affected: any = 0;
                for ( let i = 0 ; i < points.length ; i++ ) {
                    affected = await this.updetePOINT_ByUSER_ID( req.app.get('DAO'), {
                        id: points[i].id,
                        user_id: user_id,
                        point: points[i].point,
                    });

                    if ( affected > 0 ) {
                        point_receives.push(points[i]);
                    };
                    affected = 0;
                }
            }
                        
        } catch (error) {
            console.log( error );
        }

        let unreads_answer: any = null;
        try {
            unreads_answer = await this.getUNREAD_ANSWER_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }        

        if ( unreads_answer == null || unreads_answer == undefined ) {
            unreads_answer = 0;
        }

        let unreads_message: any = null;
        try {
            unreads_message = await this.getUNREAD_MESSAGE_ByUSER_ID( req.app.get('DAO'), user_id );
        } catch (error) {
            console.log( error );
        }        

        if ( unreads_message == null || unreads_message == undefined ) {
            unreads_message = 0;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            user: _user,
            tickets: tickets,
            point_receives: point_receives,
            unreads: unreads_answer + unreads_message,
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

    private async getPENDING_POINT_RECEIVES_ByUSER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_PENDING_POINT_RECEIVES_ByUSER_ID ( user_id, function(err: any, res: any ) {
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
    
    private async updetePOINT_ByUSER_ID( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_POINT_ByPOINT_RECEIVES ( data, function(err: any, res: any ) {
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

    private async getUNREAD_ANSWER_ByUSER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_UNREAD_ANSWER_ByUSER_ID ( user_id, function(err: any, res: any ) {
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

    private async getUNREAD_MESSAGE_ByUSER_ID( dao: any, user_id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_UNREAD_MESSAGE_ByUSER_ID ( user_id, function(err: any, res: any ) {
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

    private async getMESSAGES( dao: any, user_id: string ) {

        return new Promise( (resolve, reject )=>{
            dao.SELECT_MESSAGES_ByUSER_ID ( user_id, function(err: any, res: any ) {
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

    private async getUNREAD_MESSAGE_COUNT( dao: any, user_id: string ) {

        return new Promise( (resolve, reject )=>{
            dao.SELECT_UNREAD_MESSAGE_ByUSER_ID ( user_id, function(err: any, res: any ) {
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

    private async setQNA_READ( dao: any, id: any ) {

        return new Promise( (resolve, reject )=>{
            dao.UPDATE_QNA_READ ( id, function(err: any, res: any ) {
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

    private async setMESSAGE_READ( dao: any, id: any ) {

        return new Promise( (resolve, reject )=>{
            dao.UPDATE_MESSAGE_READ ( id, function(err: any, res: any ) {
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

    private async setQNA_DELETE( dao: any, id: any ) {

        return new Promise( (resolve, reject )=>{
            dao.UPDATE_QNA_DELETE ( id, function(err: any, res: any ) {
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

    private async getDISTRIBUTOR_ByDISTRIBUTOR_ID( dao: any, id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_DISTRIBUTORS_ByDISTRIBUTOR_ID ( id, function(err: any, res: any ) {
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

    private async getPARTNERS_ByPARTNER_ID( dao: any, id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_PARTNERS_ByPARTNERS_ID ( id, function(err: any, res: any ) {
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

    private async reqUSER_DISABLE( dao: any, id: any ) {

        return new Promise ( (resolve, reject ) =>{
            dao.UPDATE_USERS_DISABLE( id, function( err: any, res: any ) {
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