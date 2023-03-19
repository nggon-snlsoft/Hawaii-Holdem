import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import path from 'path';
import { listenerCount } from 'process';
import session from 'express-session';

const cors = require('cors');
const sql = require( "./modules/sqlProxy" );
const dao = require( "./modules/dao" );

import userRoutes from './routes/UserRouter';

export class HoldemApiServer {
    public app: express.Application;

    constructor() {
        this.app = express();

        this.initMiddleWares();
        this.initRoutes();
    }

    private initRoutes() {

        this.app.use('/users', userRoutes );
        this.app.get('/', (req, res)=>{
			res.send( "It could not be a better day to die" );
        });
    }

    private initMiddleWares() {
        this.app.use ( cors() );
        this.app.use ( bodyParser.json() );
        this.app.use ( bodyParser.urlencoded({
            extended: true 
        }));

        this.app.use ( session ( {
            secret: `@#@$MYSIGN#@$#$`,
            resave: false,
            saveUninitialized: true            
        }));

        this.app.use( passport.initialize());
        this.app.use( passport.session() );

        const SqlClient = sql.init();
        dao.init( SqlClient );

        // this._passport = new Passport( SqlClient );
        // this._passport.config();

        // this.userController = new UserContoller( dao, this._passport );
    }

    public listen( port: number ) {
        this.app.listen( port, ()=>{
            console.log(`Server is running on ${ port }`);
        });
    }

    beforeListen: () => {
	}
}

