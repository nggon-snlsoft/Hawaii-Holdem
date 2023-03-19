import express from 'express';
import { sqlProxy } from '../modules/sqlProxy';
import passport, { deserializeUser } from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;

export class UserController {
    public router: any = null;
    private sql: sqlProxy = null;

    constructor( sql: sqlProxy ) {
        this.router = express.Router();
        this.sql = sql;

        this.initRouter();
        this.initPassport();

        console.log('USER_CONTROLLER_INITIALIZED');
    }

    private initRouter() {
        this.router.post( '/login', this.login.bind(this));
    }

    private initPassport() {
        passport.use( new LocalStrategy({
            usernameField: 'uid',
            passwordField: 'password'
        
        }, ( uid, password, done )=>{
            console.log(uid, password );
        
            // let query = 'SELECT * FROM USERS WHERE userId=? AND password=?';
            // let args = [uid, password];
            // this.sql.query(query, args, ( err: any , result: any )=>{
            //     if ( result == null ) {
            //         return done(null, false, { message: 'INCORRECT' });
            //     }
        
            //     let user: any = null;
        
            //     if ( result != null ) {
            //         let j = JSON.stringify( result[0] );
            //         if ( result[0] != null ) {
            //             user = JSON.parse(j);            
            //         }
            //     }
        
            //     return done(null, user);
        
            // } );

            return done (null, null);

        }) );

        passport.serializeUser( (user: any, done: any )=>{
            console.log('serializeUser');
            done( null, user.ID );
        } );
        
        passport.deserializeUser( (id: any, done: any )=>{
            console.log('deserializeUser');    
            done(null, null );
        });
    }

    public async login( req: any, res: any, next: any) {
        passport.authenticate('local', (err: any, user: any, info: any)=> {

            console.log('err: ' + err);
            console.log(user);
            console.log('info: ' + info );

            return res.json(user);
        })(req, res, next);
    }
}

export default UserController;