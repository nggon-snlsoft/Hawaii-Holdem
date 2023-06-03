import logger from "../util/logger";
const moment = require('moment')
const timeZone = 'Asia/Tokyo';

export class SalesReport {
    private dao: any = null;
    private tableid: string = '';

    constructor( dao: any, tableid: string  ) {
        this.dao = dao;
        this.tableid = tableid;
    }    

    public async UpdateUser( dao: any, participants: any, rakePercentage: number  ) {
        if ( participants == null ) {
            return;
        }

        let totalPotRake: number = 0;
        let totalRollingRake: number = 0;

        for ( let i: number = 0 ; i < participants.length ; i++ ) {
            let id = participants[i].id;
            let win = participants[i].win;
            let betting = participants[i].totalBet;
            let rolling = participants[i].roundBet;
            let rake = participants[i].rake;
            let rake_back_rate = participants[i].rake_back_rate;
            let rake_back = Math.trunc( rolling * rake_back_rate );
			let rolling_rake = Math.trunc( rolling * rakePercentage ) - rake_back;

			participants[i].rolling += rolling;
			participants[i].rolling_rake += rolling_rake;
			participants[i].rake_back += rake_back;
			participants[i].roundBet = 0;

            totalPotRake += participants[i].rake;
            totalRollingRake += participants[i].rolling_rake;

            let res = 'id: ' + id.toString() + ' ,rake_back_rate: ' + participants[i].rake_back_rate.toString() + ' ,rake_back: ' + participants[i].rake_back.toString();
            logger.info( this.tableid + '[RAKE] rake info %s', res );

            let affected: any = null;
            try {
                affected = this.UPDATE_USERS_BETTINGS( dao, {
                    id: id,
                    win: win,
                    betting: betting,
                    rolling: rolling,
                    rake: rake,
                    rake_back: rake_back,
                    rolling_rake: rolling_rake
                });                
            } catch (error) {
                console.log(  this.tableid + error );                
            }
        }

        if ( Math.abs( totalPotRake - totalRollingRake) > 10 ) {
            let err: string = 'pot rake: ' + totalPotRake.toString() + ' / rolling rake: ' + totalRollingRake.toString();
            logger.error( this.tableid + '[RAKE] diff rake %s', err );
        } else {
            let err: string = 'pot rake: ' + totalPotRake.toString() + ' / rolling rake: ' + totalRollingRake.toString();
            logger.error( this.tableid + '[RAKE] rake %s', err );
        }
    }

    public async UpdateReportByUser( dao: any, participants: any ) {
        if ( participants == null || participants.length == 0 ) {
            return;
        }
        let date = this.GetReportDate();

        for ( let i: number = 0 ; i < participants.length ; i++ ) {
            let id = participants[i].id;
            let row: any = null;
            try {
                row = await this.GetSalesUserFromDB( dao, {
                    id: id,
                    date: date,
                });                
            } catch (error) {
                console.log( this.tableid + error );
            }

            let user_id = participants[i].id;
            let store_id = participants[i].store_id;
            let distributor_id = participants[i].distributor_id;
            let partner_id = participants[i].partner_id;
            let wins = participants[i].win;
            let bettings = participants[i].totalBet;
            let rollings = participants[i].rolling;
            let rake_back = participants[i].rake_back;            
            let rolling_rake = participants[i].rolling_rake;
            let point = rake_back;

            let rakes: number = 0;
            if ( participants[i].rake != null ) {
                rakes = participants[i].rake;
            }

            if ( row != null ) {
                let index = row.id;
                let affected: any = null;
                try {
                    affected = this.UpdateSalesUserInfo( dao, {
                        index: index,
                        bettings: bettings,
                        wins: wins,
                        rollings: rollings,
                        rake_back: rake_back,
                        rakes: rakes,
                        point: point,
                        rolling_rake: rolling_rake
                    });
                    
                } catch (error) {
                    console.log( this.tableid + error );
                }

            } else {
                let affected: any = null;
                try {
                    affected = this.CreateSalesUserInfo( dao, {
                        user_id: user_id,
                        store_id: store_id,
                        distributor_id: distributor_id,
                        partner_id: partner_id,
                        bettings: bettings,
                        wins: wins,
                        rakes: rakes,
                        rollings: rollings,
                        rake_back: rake_back,
                        point: point,
                        rolling_rake: rolling_rake,
                        date: date,
                    });                        
                } catch (error) {
                    console.log( this.tableid + error );
                }
            }
        }
    }

    public async UpdateReportByTable( dao: any, participants: any, table_id: number  ) {
        let date = this.GetReportDate();
        let rakes: number = 0;
        let bettings: number = 0;

        if ( participants == null ) {
            return;
        }

        participants.forEach( (player: any)=>{
            bettings += player.totalBet;
            rakes += player.rake;
        } );

        let row: any = null;
        try {
            row = await this.GetSalesTableFromDB( dao, {
                table_id: table_id,
                date: date,
            });            
        } catch (error) {
            console.log(  this.tableid + error );            
        }

        if ( row != null ) {
            let index = row.id;
            let affected: any = null;
            try {
                affected = this.UpdateSalesTableInfo( dao, {
                    id: index,
                    bettings: bettings,
                    rakes: rakes,
                });
            } catch (error) {
                console.log( this.tableid + error );
            }
        } else {
            let affected: any = null; 
            try {
                affected = this.CreateSalesTableInfo( dao, {
                    table_id: table_id,
                    store_id: 0,
                    rakes: rakes,
                    bettings: bettings,
                    date: date,
                });
    
            } catch (error) {
                console.log( this.tableid + error );
            }
        }
    }

    private async GetSalesUserFromDB( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SELECT_SALES_USER( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async CreateSalesUserInfo( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.INSERT_SALES_USER( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async UPDATE_USERS_BETTINGS( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.UPDATE_USERS_BETTINGS( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async UpdateSalesUserInfo( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.UPDATE_SALES_USER( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }
    
    private async GetSalesTableFromDB( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SELECT_SALES_TABLE( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async CreateSalesTableInfo( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.INSERT_SALES_TABLE( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }

    private async UpdateSalesTableInfo( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.UPDATE_SALES_TABLE( data, (err: any, res: any)=>{
                if ( err != null ) {
                    reject( err );
                    return;
                }
                resolve( res ); 
            });
        });
    }    

    private GetReportDate(): any {
        moment().tz(timeZone);

        let timestamp = moment().format('x');
        let year = moment().format('YYYY');
        let month = moment().format('M');
        let day = moment().format('D');

        return {
            timestamp: timestamp,
            year: year,
            month: month,
            day: day
        }
    }
}