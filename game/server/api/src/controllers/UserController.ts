import express from 'express';
import { sqlProxy } from '../modules/sqlProxy';
import { ENUM_RESULT_CODE } from '../main';
import { send } from 'process';
import { ClientUserData } from './ClientUserData';
import { resolve } from 'path';
import { rejects } from 'assert';

const requestIp = require('request-ip');

// const LocalStrategy = passportLocal.Strategy;
const gameConf = require('../config/gameConf.json');

export class UserController {
    public router: any = null;
    private sql: sqlProxy = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;

        this.initRouter();
        // this.initPassport();

        console.log('USER_CONTROLLER_INITIALIZED');
    }

    private initRouter() {
        this.router.post( '/login', this.reqLOGIN.bind(this));
        this.router.post( '/join', this.reqJOIN.bind(this));

        this.router.post( '/check/login_id', this.checkLOGIN_ID.bind(this));
        this.router.post( '/check/nickname', this.checkUSER_NICKNAME.bind(this));

        this.router.post( '/point/transfer', this.transferPOINT.bind(this));
        this.router.post( '/point/transferLog', this.getPOINT_TRANSFER_LOG.bind(this));
        this.router.post( '/point/receiveLog', this.getPOINT_RECEIVE_LOG.bind(this));        

        this.router.post( '/getInitData', this.getINIT_DATA.bind(this));
        this.router.post( '/updateAvatar', this.updateAVATAR.bind(this));

        this.router.post( '/getUserInfo', this.getUSER.bind(this));
        this.router.post( '/getSetting', this.getSETTING.bind(this));
        this.router.post( '/updateSetting', this.updateSETTING.bind(this));

        this.router.post( '/getStatics', this.getSTATICS.bind(this));
    }

    private async getIp( req: any, next: (ip: string )=>void ) {
        let ip: string = await requestIp.getClientIp( req );
        next( ip );
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

        let version: string = req.body.version;
        console.log( 'CLIENT_VERSION: ' + version );
        // let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if ( login_id == null || login_id.length < 4 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let clientIp: string = '';

        await this.getIp( req, ( ip: string )=>{
            clientIp = ip;
        });

        let data: any = await this.getUserByUID( req.app.get('DAO'), uid );
        if (data == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_UID'
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

        if ( data.pending == 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'PENDING_ACCOUNT'
            });
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS',
            id: data.id,
            ip: clientIp,
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

        let user: any = await this.getUserByID( req.app.get('DAO'), user_id );
        if (user == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'NO_EXIST_ID'
            });
            return;
        }

        let _user = ClientUserData.getClientUserData(user);

        let setting: any = await this.getSettingByUserID( req.app.get('DAO'), user_id );

        if ( setting == undefined ) {
            const r: any = await this.createUserSetting( req.app.get('DAO'), user_id );
            setting = await this.getSettingByUserID( req.app.get('DAO'), user_id );

            if ( setting == undefined ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'LOAD_SETTING_ERROR'
                });
                return;
            }
        }

        let _setting = ClientUserData.getClientSettingData(setting);

        let statics: any = await this.getStaticsByUserID( req.app.get('DAO'), user_id );
        if ( statics == undefined ) {
            console.log('statics == undefined');
            const r: any = await this.createUserStatics( req.app.get('DAO'), user_id );

            statics = await this.getStaticsByUserID( req.app.get('DAO'), user_id );

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
        if ( user.uid == null || user.uid.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        if ( user.uid.length <= 0 || user.nickname <= 0 || user.password.length <= 0  ||
            user.trans.length <= 0 || user.phone.length <= 0 || user.bank.length <= 0 ||
            user.holder.length <= 0 || user.account.length <= 0 || user.recommender.length <= 0 ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_FORM'
                });
                return;
        }

        let uid: string = user.uid;
        let nickname: string = user.nickname;        
        let data: any = null;

        try {
            data = await this.getUserByUID( req.app.get('DAO'), uid );
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
            data = await this.getJoinUserByUID( req.app.get('DAO'), uid );
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
            data = await this.getUserByNickname( req.app.get('DAO'), nickname );
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
            data = await this.getJoinUserByNickname( req.app.get('DAO'), nickname );
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

        let result: any = null;
        try {
            result = await this.joinMember( req.app.get('DAO'), user );
            if ( result != null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.SUCCESS,
                    msg: 'SUCCESS'
                });        
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
        let uid = req.body.uid;
        if ( uid == null || uid.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUserByUID( req.app.get('DAO'), uid );            
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
            join = await this.getJoinUserByUID( req.app.get('DAO'), uid );            
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
            user = await this.getUserByNickname( req.app.get('DAO'), nickname );            
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
            join = await this.getJoinUserByNickname( req.app.get('DAO'), nickname );            
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
        let userId = req.body.id;
        let value = req.body.value;
        let desc = req.body.desc;
        if ( desc == null ) {
            desc = "";
        }

        if ( userId == null || value == null || value <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let user: any = null;
        try {
            user = await this.getUserByID( req.app.get('DAO'), userId );            
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
            let affected = await this.updatePointTransfer( req.app.get('DAO'), {
                id: user.id,
                point: remainPoint,
                balance: newBalance,
            } );

            if ( Number( affected ) < 1 ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });
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
            user = await this.getUserByID( req.app.get('DAO'), userId );

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
            logs = await this.insertPointTransferLog( req.app.get('DAO'), {
                id: user.id,
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
            user: user,
            logs: logs

        });
        return;
    }
    
    public async getPOINT_TRANSFER_LOG( req: any, res: any) {
        let id = req.body.id;
        console.log('getPOINT_TRANSFER_LOG id: ' + id);

        if ( id == null || id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let logs: any = null;
        try {
            logs = await this.getTransferLog( req.app.get('DAO'), id );
            if ( logs == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });                
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
        let id = req.body.id;

        if ( id == null || id < 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let logs: any = null;
        try {
            logs = await this.getPointReceiveLog( req.app.get('DAO'), id );
            if ( logs == null ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'INVALID_UID'
                });                
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


    public async updateAVATAR( req: any, res: any ) {
        let id = req.body.id;
        let avatar = req.body.avatar;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
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

        let affected = await this.updateUserAvatar( req.app.get('DAO'), id, avatar );
        let user: any = await this.getUserByID( req.app.get('DAO'), id );
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
            affected: affected,
        });
    }

    public async getUSER( req: any, res: any ) {
        let id = req.body.id;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
            });
            return;
        }

        let user: any = await this.getUserByID( req.app.get('DAO'), id );
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
    
    public async getSETTING( req: any, res: any ) {
        let id = req.body.id;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
            });
            return;
        }

        let setting: any = await this.getSettingByUserID( req.app.get('DAO'), id );
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
            setting: _setting,
        });
    }
    
    public async updateSETTING( req: any, res: any ) {
        let id = req.body.id;
        let selected = req.body.setting;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
            });
            return;
        }

        let affected = await this.updateSettingByUserID( req.app.get('DAO'), id, selected );
        let setting: any = await this.getSettingByUserID( req.app.get('DAO'), id );
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
        let id = req.body.id;

        if ( id == null || id <= 0 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_ID'
            });
            return;
        }

        let statics: any = await this.getStaticsByUserID( req.app.get('DAO'), id );
        if (statics == undefined) {
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

    private sendError( res: any, msg: string ) {
        res.status( 400 ).json ( {
            msg: msg,
        });
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

    private async getTransferLog( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectPointTransferLog ( id, function(err: any, res: any ) {
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

    private async getPointReceiveLog( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectPointReceiveLog ( id, function(err: any, res: any ) {
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

    private async getUserByUID( dao: any, uid: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectAccountByUID ( uid, function(err: any, res: any ) {
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

    private async getJoinUserByUID( dao: any, uid: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectJoinUserByUID ( uid, function(err: any, res: any ) {
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
    
    private async getJoinUserByNickname( dao: any, nickname: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectJoinUserByNickname ( nickname, function(err: any, res: any ) {
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

    private async getUserByNickname( dao: any, nickname: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectAccountByNickname ( nickname, function(err: any, res: any ) {
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

    private async getSettingByUserID( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectSettingByID ( id, function(err: any, res: any ) {
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

    private async updateSettingByUserID( dao: any, id: string, setting: any ) {
        console.log(setting);
        return new Promise( (resolve, reject )=>{
            dao.updateSettingByID ( id, setting, function(err: any, res: any ) {
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

    private async getStaticsByUserID( dao: any, id: string ) {
        return new Promise( (resolve, reject )=>{
            dao.selectStaticsByID ( id, function(err: any, res: any ) {
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

    private async joinMember( dao: any, user: any ) {
        return new Promise( (resolve, reject )=>{
            dao.insertJoinMember ( user, function(err: any, res: any ) {
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

    private async createUserSetting( dao: any, id: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.insertInitialSetting( id, function( err: any, res: any ) {
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

    private async createUserStatics( dao: any, id: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.insertUserStatics( id, ( err: any, res: any )=> {
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

    private async updateUserAvatar( dao: any, id: any, avatar: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.updateAvatar( id, avatar, function( err: any, res: any ) {
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

    private async updatePointTransfer( dao: any, data: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.updateTransferPoint( data, function( err: any, res: any ) {
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
    
    private async insertPointTransferLog( dao: any, data: any ) {
        return new Promise ( (resolve, reject ) =>{
            dao.insertPointTransfer( data, function( err: any, res: any ) {
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