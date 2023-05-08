
export class SalesReport {

    public async UpdateReportByUser( dao: any, participants: any ) {
        let now: Date = new Date();
        let date = this.GetReportDate( now );

        if ( participants == null ) {
            return;
        }

        for ( let i: number = 0 ; i < participants.length ; i++ ) {
            let id = participants[i].id;
            let row: any = null;
            try {
                row = await this.GetSalesUserFromDB( dao, {
                    id: id,
                    date: date,
                });                
            } catch (error) {
                console.log( error );
            }

            let user_id = participants[i].id;
            let store_id = participants[i].store_id;
            let wins = participants[i].win;
            let bettings = participants[i].totalBet;
            let rakes: number = 0;
            if ( participants[i].rake != null ) {
                rakes = participants[i].rake;
            }

            if ( row != null ) {
                let index = row.id;
                let affected: any = null;
                try {
                    affected = await this.UpdateSalesUserInfo( dao, {
                        index: index,
                        bettings: bettings,
                        wins: wins,
                        rakes: rakes,
                    });
                    
                } catch (error) {
                    console.log( error );
                }

                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }                                

            } else {
                let affected: any = null;
                try {
                    affected = await this.CreateSalesUserInfo( dao, {
                        user_id: user_id,
                        store_id: store_id,
                        bettings: bettings,
                        wins: wins,
                        rakes: rakes,
                        date: date,
                    });                        
                } catch (error) {
                    console.log( error );                    
                }

                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }
            }
        }
    }

    public async UpdateReportByTable( dao: any, participants: any, table_id: number  ) {
        let now: Date = new Date();
        let date = this.GetReportDate( now );
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
            console.log( error );            
        }

        if ( row != null ) {
            let index = row.id;
            let affected: any = null;
            try {
                affected = await this.UpdateSalesTableInfo( dao, {
                    id: index,
                    bettings: bettings,
                    rakes: rakes,
                });
            } catch (error) {
                console.log( error );
            }

            if ( affected != null ) {
                console.log('affected: ' + affected);
            }
        } else {
            let affected: any = null; 
            try {
                affected = await this.CreateSalesTableInfo( dao, {
                    table_id: table_id,
                    store_id: 0,
                    rakes: rakes,
                    bettings: bettings,
                    date: date,
                });
    
            } catch (error) {
                console.log( error );
            }

            if ( affected != null ) {
                console.log('affected: ' + affected);
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

    private GetReportDate( date: Date ): any {
        let timestamp = Number( date );
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        return {
            timestamp: timestamp,
            year: year,
            month: month,
            day: day
        }
    }
}