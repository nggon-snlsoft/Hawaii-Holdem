
export class SalesReport {

    public async UpdateReportByUser( dao: any, winners: any, storeId: number, rake: number  ) {
        let now: Date = new Date();
        let date = this.GetReportDate( now );
        let rakePercent = rake * 0.01;
        let store = storeId;

        let pools: any[] = [];

        if ( winners == null ) {
            return;
        }

        winners.forEach( ( w: any )=>{
            if ( w.rake != null && isNaN( w.rake) == false && w.rake > 0 ) {
                let dup = pools.find( (e)=>{
                    return w.id == e;
                });
    
                if ( dup == null ) {
                    pools.push( w.id );
                }
            }
        });

        for ( let i: number = 0 ; i < pools.length ; i ++ ) {
            let ws = winners.filter( ( e: any  )=>{
                return pools[i] == e.id;
            });

            let id = pools[i];
            let win: number = 0;
            let rake: number = 0;

            ws.forEach( ( i: any )=>{
                win += i.winAmount;
                rake += i.rake;
            });

            if ( isNaN(rake) == true ) {
                rake = ( win * ( rakePercent  * 0.01) );
            }

            let row = await this.GetSalesUserFromDB( dao, {
                id: id,
                date: date,
            });

            if ( row != null ) {
                let index = row.id;
                let affected = await this.UpdateSalesUserInfo( dao, {
                    index: index,
                    win: win,
                    rake: rake,
                });

                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }                
            }
            else {
                let affected = await this.CreateSalesUserInfo( dao, {
                    id: id,
                    store: store,
                    win: win,
                    rake: rake,
                    date: date,
                });

                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }
            }
        }
    }

    public async UpdateReportByTable( dao: any, winners: any, tableId: number, rake: number  ) {
        let now: Date = new Date();
        let date = this.GetReportDate( now );
        let rakePercent = rake * 0.01;
        let table = tableId;

        let wins: number = 0;
        let rakes: number = 0;

        if ( winners == null ) {
            return;
        }

        winners.forEach( ( w: any )=>{
            if ( w.rake != null && isNaN( w.rake) == false && w.rake > 0 ) {
                wins += w.winAmount;
                rakes += w.rake;
            }
        });

        let row = await this.GetSalesTableFromDB( dao, {
            table: table,
            date: date,
        });

        if ( row != null ) {
            try {
                let index = row.id;
                let affected = await this.UpdateSalesTableInfo( dao, {
                    index: index,
                    win: wins,
                    rake: rakes,
                });
    
                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }                
                    
            } catch (error) {
                console.log( error );
            }

        } else {
            try {
                let affected = await this.CreateSalesTableInfo( dao, {
                    table: table,
                    store: 1,
                    rake: rakes,
                    date: date,
                });
    
                if ( affected != null ) {
                    console.log('affected: ' + affected);
                }                
            } catch (error) {
                console.log( error );                
            }
        }
    }    

    private async GetSalesUserFromDB( dao: any, data: any  ) {
        return new Promise<any>( ( resolve, reject )=>{
            dao.SelectSalesUserInfo( data, (err: any, res: any)=>{
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
            dao.CreateSalesUserInfo( data, (err: any, res: any)=>{
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
            dao.UpdateSalesUserInfo( data, (err: any, res: any)=>{
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
            dao.SelectSalesTableInfo( data, (err: any, res: any)=>{
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
            dao.CreateSalesTableInfo( data, (err: any, res: any)=>{
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
            dao.UpdateSalesTableInfo( data, (err: any, res: any)=>{
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