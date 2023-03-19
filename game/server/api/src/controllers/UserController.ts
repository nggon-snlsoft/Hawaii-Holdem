import exp from 'constants';
import express from 'express';
import passport, { deserializeUser } from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;

const sql = require( '../modules/SqlProxy');

passport.serializeUser( (user: any, done: any )=>{
    console.log('serializeUser');
    done( null, user.ID );
} );

passport.deserializeUser( (id: any, done: any )=>{
    console.log('deserializeUser');    
    done(null, null );
});

passport.use( new LocalStrategy({
    usernameField: 'uid',
    passwordField: 'password'

}, ( uid, password, done )=>{
    console.log(uid, password );

    let query = 'SELECT * FROM USERS WHERE userId=? AND password=?';
    let args = [uid, password];

    const SqlClient = sql.init();    
    SqlClient.query(query, args, ( err: any , result: any )=>{
        if ( result == null ) {
            return done(null, false, { message: 'INCORRECT' });
        }

        let user: any = null;

        if ( result != null ) {
            let j = JSON.stringify( result[0] );
            if ( result[0] != null ) {
                user = JSON.parse(j);            
            }
        }

        return done(null, user);

    } );
}) );

export async function auth( req: any, res: any, next: any ) {
    passport.authenticate('local', (err: any, user: any, info: any)=>{


        console.log('err: ' + err);
        console.log(user);
        console.log('info: ' + info );

        if (err) {

        }

        if (!user) {

        }

        return res.json(user);
    })(req, res, next );
}