import express from 'express';
import { sqlProxy } from '../modules/sqlProxy';
// import passport, { deserializeUser } from 'passport';
// import passportLocal from 'passport-local';
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
        this.router.post( '/login', this.login.bind(this));
        this.router.post( '/join', this.join.bind(this));
        this.router.post( '/checkUID', this.checkUID.bind(this));
        this.router.post( '/checkNickname', this.checkNickname.bind(this));
        this.router.post( '/getInitialData', this.getInitialData.bind(this));
        this.router.post( '/updateAvatar', this.updateAvatar.bind(this));

        this.router.post( '/getUserInfo', this.getUserInfo.bind(this));        
        this.router.post( '/getSetting', this.getSetting.bind(this));
        this.router.post( '/updateSetting', this.updateSetting.bind(this));

        this.router.post( '/getStatics', this.getStatics.bind(this));
    }

    private async getIp( req: any, next: (ip: string )=>void ) {
        let ip: string = await requestIp.getClientIp( req );
        next( ip );
    }

    // private initPassport() {
    //     passport.use( new LocalStrategy({
    //         usernameField: 'uid',
    //         passwordField: 'password'
    //     }, ( uid, password, done )=>{
 
    //         let query = 'SELECT * FROM USERS WHERE UID=? AND PASSWORD=?';
    //         let args = [uid, password];
    //         this.sql.query(query, args, ( err: any , result: any )=>{

    //             if ( result == undefined || result == null || result.length <= 0 ) {
    //                 return done(null, false, { message: 'INCORRECT' });
    //             }
        
    //             let user: any = null;
        
    //             if ( result != null ) {
    //                 let j = JSON.stringify( result[0] );
    //                 if ( result[0] != null ) {
    //                     user = JSON.parse(j);            
    //                 }
    //             }
        
    //             return done(null, user);
        
    //         } );

    //         return done (null, null);

    //     }) );

    //     passport.serializeUser( (user: any, done: any )=>{
    //         console.log('serializeUser');
    //         done( null, user.ID );
    //     } );
        
    //     passport.deserializeUser( (id: any, done: any )=>{
    //         console.log('deserializeUser');    
    //         done(null, null );
    //     });
    // }

    public async login( req: any, res: any ) {
        let uid = req.body.uid;
        let pass = req.body.password;
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

        if ( uid == null || uid.length < 4 ) {
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

        if ( pass != data.password ) {
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

    public async getInitialData( req: any, res: any ) {
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

        let setting: any = await this.getSettingByUserID( req.app.get('DAO'), id );

        if ( setting == undefined ) {
            const r: any = await this.createUserSetting( req.app.get('DAO'), id );
            setting = await this.getSettingByUserID( req.app.get('DAO'), id );

            if ( setting == undefined ) {
                res.status( 200 ).json({
                    code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                    msg: 'LOAD_SETTING_ERROR'
                });
                return;
            }
        }

        let _setting = ClientUserData.getClientSettingData(setting);

        let statics: any = await this.getStaticsByUserID( req.app.get('DAO'), id );
        if ( statics == undefined ) {
            console.log('statics == undefined');
            const r: any = await this.createUserStatics( req.app.get('DAO'), id );

            statics = await this.getStaticsByUserID( req.app.get('DAO'), id );

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

    public async join( req: any, res: any) {
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

        let data: any = await this.getUserByUID( req.app.get('DAO'), uid );
        if (data != undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DUPLICATE_UID'
            });
            return;
        }

        data = await this.getUserByNickname( req.app.get('DAO'), nickname );
        if (data != undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DUPLICATE_NICKNAME'
            });
            return;
        }

        let result: any = await this.createNewUserAccount( req.app.get('DAO'), user );

        if ( result == undefined ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'DB_ERROR'
            });
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.SUCCESS,
            msg: 'SUCCESS'
        });
    }

    public async checkUID( req: any, res: any) {
        let uid = req.body.uid;
        if ( uid == null || uid.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_UID'
            });
            return;
        }

        let data: any = await this.getUserByUID( req.app.get('DAO'), uid );
        if (data == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS'
            });
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            msg: 'DUPLICATE'
        });
    }

    public async checkNickname( req: any, res: any) {
        let nickname = req.body.nickname;
        if ( nickname == null || nickname.length < 1 ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_NICKNAME'
            });
            return;
        }

        let data: any = await this.getUserByNickname( req.app.get('DAO'), nickname );
        if (data == undefined) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS'
            });
            return;
        }

        res.status( 200 ).json({
            code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
            msg: 'DUPLICATE'
        });
    }

    public async updateAvatar( req: any, res: any ) {
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

    public async getUserInfo( req: any, res: any ) {
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
    
    public async getSetting( req: any, res: any ) {
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
    
    public async updateSetting( req: any, res: any ) {
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

    public async getStatics( req: any, res: any ) {
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

    private async createNewUserAccount( dao: any, user: any ) {
        return new Promise( (resolve, reject )=>{
            dao.insertAccountForPending ( user, function(err: any, res: any ) {
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
}

export default UserController;