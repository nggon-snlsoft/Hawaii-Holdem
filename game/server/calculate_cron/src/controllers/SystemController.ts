import { sqlProxy } from '../modules/sqlProxy';

export class SystemController {
    public router: any = null;
    private sql: sqlProxy = null;
    private conf: any = null;

    constructor( sql: sqlProxy ) {
        this.sql = sql;
        console.log('SYSTEM_CONTROLLER_INITIALIZED');
    }

    public async reqTRANSFER_TICKETS( req: any, res: any ) {
        let tickets: any = null;
        try {
            tickets = await this.getTICKETS( req.app.get('DAO'), 575, 655 );            
        } catch (error) {
            console.log(error);
            return;
        }

        let sales_users: any[] = [];

        for ( let i = 0 ; i < tickets.length ; i++ ) {
            let user: any = null;
            user = await this.getUSER( req.app.get('DAO'), tickets[i].user_id );
            if ( user == null ) {
                continue;
            }

            let ts = new Date(tickets[i].updateDate);
            let timestamp = Math.floor(ts.getTime() / 1000 );
            let day = ts.getDate();
    
            sales_users.push({
                user_id: tickets[i].user_id,
                store_id: -1,
                distributor_id: user.distributor_id,
                partner_id: user.partner_id,
                year: 2023,
                month: 6,
                day: day,
                timestamp: timestamp,
                charge: tickets[i].charge,
                transfer: tickets[i].transfer,
                return: tickets[i].return,
                useTicket: 1,
                updateDate: tickets[i].updateDate,
                createDate: tickets[i].createDate,
            });
        }

        let ite = sales_users.length;
        for (let i = 0 ; i < ite ; i ++ ) {
            let affected = await this.INSERT_SALES_USER( req.app.get('DAO'), sales_users[i] );
            if ( affected != null ) {
                console.log('insert');
            }
        }
		res.send( 'complete' );
    }

    private async getTICKETS( dao: any, s: number, e: number ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_TICKETS_BY_ID ( s, e, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( err );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async getUSER( dao: any, user_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USER_BY_USER_ID ( user_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( err );
                } else {
                    resolve ( res[0] );
                }
            });
        });
    }

    private async INSERT_SALES_USER( dao: any, data: any ) {
        console.log('INSERT_SALES_USER');
        return new Promise( (resolve, reject )=>{
            dao.INSERT_SALES_USER_BY_TICKET ( data, function(err: any, res: any ) {
                if ( !!err ) {
                    reject(err);
                } else {
                    resolve ( res );
                }
            });
        });
    }    
}

export default SystemController;