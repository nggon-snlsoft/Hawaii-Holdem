import { json } from 'body-parser';
import passport, { use } from 'passport';
import passportLocal from 'passport-local';
const mysql = require('../modules/sqlProxy');

const LocalStrategy = passportLocal.Strategy;

class Passport {
    private dao: any = null;
    private sql: any = null;
    constructor( sql: any ) {
        this.sql = sql;
    }

    public config = ()=> {

        passport.serializeUser(( user: any, done )=>{
            done(null, user.id );
        });

        passport.deserializeUser(( id: any, done )=>{
            let user;
            done( null, user);
        });

        passport.use( new LocalStrategy( {
            usernameField: 'uid',
            passwordField: 'password'
        }, (uid: string, password: string, done: any)=> {
            let query = 'SELECT * FROM users WHERE userId=? AND password=?';
            let args = [uid, password];

            this.sql.query( query, args, (err: any, res: any )=>{
                if ( res == null ) {
                    console.log('INCORRECT_UID');
                    return done(null, false, {message: 'INCORRECT_UID'})
                }

                let result = JSON.stringify( res );
                let user = JSON.parse( result );

                return done(null, user);
            });

        }));
    }

    public auth( req: any, res: any ) {
        passport.authenticate('local', ( err: any, user: any, info: any)=>{

            if (err) {
    
            }
    
            if (!user) {
    
            }
    
            return res.json(user);
        });
    }

    public isAuthenticated = ( req: any, res: any, next: any ) => {
        if (req.isAuthenticated() ) {
            return next();

        }
        res.redirect('/');
    }
}

export default Passport;

