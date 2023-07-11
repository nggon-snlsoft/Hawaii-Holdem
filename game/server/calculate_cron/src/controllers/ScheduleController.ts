import { sqlProxy } from '../modules/sqlProxy';
import * as cron from 'cron';

export class ScheduleController {
    public router: any = null;
    private job: any = null;
    private dao: any = null;
    private startDate: Date = null;

    constructor( dao: any ) {
        this.dao = dao;
    }

    public InitSCHEDULE() {
        this.RegistCRON();
    }

    public async RegistCRON() {
        this.job = new cron.CronJob('* * * * *', ()=>{
            this.startDate = new Date();
            this.InsertADMINS(()=>{
                this.UpdateCALCULATOR();
            });

        }, null, true, 'Asia/Tokyo');

        this.job.start();
    }

    private async InsertADMINS( done:()=>void) {        
        let admins: any = null;
        try {
            admins = await this.getADMINS( this.dao );
            if( admins != null ) {

                for( let i: number = 0 ; i < admins.length; i ++ ) {
                    let calculators: any = null;
                    calculators = await this.getCALCULATORS( this.dao, admins[i].id );
                    if ( calculators != null ) {

                    } else {
                        let distributor: any = null;
                        let partner: any = null;

                        let distributor_id: number = -1;
                        let partner_id: number = -1;

                        if ( admins[i].type == 0 ) {

                        } else if ( admins[i].type == 1 ) {
                            distributor = await this.getDISTRIBUTOR_ByADMIN_ID(this.dao, admins[i].id);
                            if ( distributor != null ) {
                                distributor_id = distributor.id;
                            }
                        } else {
                            partner = await this.getPARTNER_ByADMIN_ID(this.dao, admins[i].id);
                            if ( partner != null ) {
                                distributor_id = partner.distributor_id;
                                partner_id = partner.id;
                            }
                        }

                        console.log('distributor_id: ' + distributor_id + ' partner_id: ' + partner_id );

                        let affected: any = null;
                        affected = await this.insertCALCULATORS( this.dao, {
                            admin_id: admins[i].id,
                            login_id: admins[i].login_id,
                            distributor_id: distributor_id,
                            partner_id: partner_id,
                            type: admins[i].type,
                            name: admins[i].name,
                            disable: admins[i].disable
                        });

                        if ( affected != null && affected > 0 ) {                            
                            console.log('insert success');
                        }
                    }
                }
            }                        
        } catch (error) {
            console.log(error);
            return;
        }

        if ( done != null ) {
            done();
        }
    }

    private async UpdateCALCULATOR() {
        
        let crons_info: any = null;
        try {
            crons_info = await this.getCRONS_INFO( this.dao );
            if ( crons_info != null ) {
                let deal_rate = crons_info.deal_rate;

                let sales: any = null;                
                sales = await this.getSALES_INFO( this.dao, crons_info.end_index );

                let start_index = crons_info.end_index;
                let last_index = crons_info.end_index;
                let count: number = 0;
                let deal_money: number = 0;
                let deal_stores: number = 0;
                let deal_distributors: number = 0;
                let deal_partners: number = 0;

                if ( sales != null && sales.length > 0 ) {
                    start_index = sales[0].id;
                    for ( let i = 0 ; i < sales.length ; i++ ) {
                        console.log(sales[i]);
                        last_index = sales[i].id;

                        let user: any = null;
                        user = await this.getUSER_ByID(this.dao, sales[i].user_id);

                        let commision = deal_rate - user.rake_back_rate;
                        
                        let rolling_rakes = sales[i].rolling_rakes;
                        if ( rolling_rakes > 0 ) {
                            deal_money += rolling_rakes;

                            let distributor: any = null;
                            distributor = await this.getDISTRIBUTOR( this.dao, sales[i].distributor_id);

                            let partner: any = null;
                            partner = await this.getPARTNER( this.dao, sales[i].partner_id);

                            let distributor_rakes = Math.floor( rolling_rakes * (( distributor.commision - partner.commision ) / commision ));
                            let partner_rakes = Math.floor( rolling_rakes * ( partner.commision / commision ));
                            let store_rakes =  Math.floor( rolling_rakes - distributor_rakes - partner_rakes );

                            if ( store_rakes >= 0 ) {
                                let affected: any = null;
                                affected = await this.updateSTORE_CALCULATE( this.dao, {
                                    rate: deal_rate,
                                    rakes: store_rakes,
                                });
                                if ( affected != null && affected > 0 ) {
                                    deal_stores += store_rakes;
                                }
                            }

                            if ( distributor_rakes >= 0 ) {
                                let affected: any = null;
                                affected = await this.updateDISTRIBUTOR_CALCULATE( this.dao, 
                                    {
                                        admin_id: distributor.admin_id,
                                        rate: distributor.commision,
                                        rakes: distributor_rakes,

                                    });
                                if ( affected != null && affected > 0 ) {
                                    deal_distributors += distributor_rakes;                                    
                                }
                            }

                            if ( partner_rakes >= 0 ) {
                                let affected: any = null;
                                affected = await this.updatePARTNER_CALCULATE( this.dao, {
                                    admin_id: partner.admin_id,
                                    rate: partner.commision,
                                    rakes: partner_rakes
                                } );

                                if ( affected != null && affected > 0 ) {
                                    deal_partners += partner_rakes;
                                }
                            }
                        }
                    }

                    console.log( sales.length );
                    console.log( sales[sales.length - 1]);

                    let affected: any = null;
                    affected = await this.updateCALCULATE_CRON( this.dao, {
                        start_index: start_index,
                        end_index: last_index,
                        deal_money: deal_money,
                        deal_stores: deal_stores,
                        deal_distributors: deal_distributors,
                        deal_partners: deal_partners,
                        startDate: this.startDate,
                    });

                    if ( affected > 0 ) {
                        let completeData = new Date();
                        console.log('Calculate cron update success: ' + completeData );
                    }
                } else {
                    console.log('there is no new data!');
                }

            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    // private async UpdateCALCULATOR() {
        
    //     let crons_info: any = null;
    //     try {
    //         crons_info = await this.getCRONS_INFO( this.dao );
    //         if ( crons_info != null ) {
    //             let deal_rate = crons_info.deal_rate;

    //             let sales: any = null;                
    //             sales = await this.getSALES_INFO( this.dao, crons_info.end_index );

    //             let start_index = crons_info.end_index;
    //             let last_index = crons_info.end_index;
    //             let count: number = 0;
    //             let deal_money: number = 0;
    //             let deal_stores: number = 0;
    //             let deal_distributors: number = 0;
    //             let deal_partners: number = 0;

    //             if ( sales != null && sales.length > 0 ) {
    //                 start_index = sales[0].id;
    //                 for ( let i = 0 ; i < sales.length ; i++ ) {
    //                     last_index = sales[i].id;

    //                     if ( sales[i].useTicket == 1 ) {
    //                         continue;
    //                     }

    //                     let user: any = null;
    //                     user = await this.getUSER_ByID(this.dao, sales[i].user_id);

    //                     let commision = deal_rate - user.rake_back_rate;
                        
    //                     let rolling_rakes = sales[i].rolling_rakes;
    //                     if ( rolling_rakes > 0 ) {
    //                         deal_money += rolling_rakes;

    //                         let distributor: any = null;
    //                         distributor = await this.getDISTRIBUTOR( this.dao, sales[i].distributor_id);

    //                         let partner: any = null;
    //                         partner = await this.getPARTNER( this.dao, sales[i].partner_id);

    //                         let distributor_rakes = Math.floor( rolling_rakes * (( distributor.commision - partner.commision ) / commision ));
    //                         let partner_rakes = Math.floor( rolling_rakes * ( partner.commision / commision ));
    //                         let store_rakes =  Math.floor( rolling_rakes - distributor_rakes - partner_rakes );

    //                         if ( store_rakes >= 0 ) {
    //                             let affected: any = null;
    //                             affected = await this.updateSTORE_CALCULATE( this.dao, {
    //                                 rate: deal_rate,
    //                                 rakes: store_rakes,
    //                             });
    //                             if ( affected != null && affected > 0 ) {
    //                                 deal_stores += store_rakes;
    //                             }
    //                         }

    //                         if ( distributor_rakes >= 0 ) {
    //                             let affected: any = null;
    //                             affected = await this.updateDISTRIBUTOR_CALCULATE( this.dao, 
    //                                 {
    //                                     admin_id: distributor.admin_id,
    //                                     rate: distributor.commision,
    //                                     rakes: distributor_rakes,

    //                                 });
    //                             if ( affected != null && affected > 0 ) {
    //                                 deal_distributors += distributor_rakes;                                    
    //                             }
    //                         }

    //                         if ( partner_rakes >= 0 ) {
    //                             let affected: any = null;
    //                             affected = await this.updatePARTNER_CALCULATE( this.dao, {
    //                                 admin_id: partner.admin_id,
    //                                 rate: partner.commision,
    //                                 rakes: partner_rakes
    //                             } );

    //                             if ( affected != null && affected > 0 ) {
    //                                 deal_partners += partner_rakes;
    //                             }
    //                         }
    //                     }
    //                 }

    //                 let affected: any = null;
    //                 affected = await this.updateCALCULATE_CRON( this.dao, {
    //                     start_index: start_index,
    //                     end_index: last_index,
    //                     deal_money: deal_money,
    //                     deal_stores: deal_stores,
    //                     deal_distributors: deal_distributors,
    //                     deal_partners: deal_partners,
    //                     startDate: this.startDate,
    //                 });

    //                 if ( affected > 0 ) {
    //                     let completeData = new Date();
    //                     console.log('Calculate cron update success: ' + completeData );

    //                 }
    //             } else {
    //                 console.log('there is no new data!');
    //             }

    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return;
    //     }
    // }

    private async getADMINS( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_ADMINS ( function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }    

    private async getCALCULATORS( dao: any, admin_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_CALCULATES_ByADMIN_ID ( admin_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res[0] );
                }
            });
        });
    }

    private async insertCALCULATORS( dao: any, calculator: any ) {
        return new Promise( (resolve, reject )=>{
            dao.INSERT_CALCULATES_ByDATA ( calculator, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }
    
    private async updateSTORE_CALCULATE( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_STORE_CALCULATE ( data, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async updateDISTRIBUTOR_CALCULATE( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_DISTRIBUTOR_CALCULATE_ByADMIN_ID ( data, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async updatePARTNER_CALCULATE( dao: any, data: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_PARTNER_CALCULATE_ByADMIN_ID ( data, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async updateCALCULATE_CRON( dao: any, cron_info: any ) {
        return new Promise( (resolve, reject )=>{
            dao.UPDATE_CALCULATE_CRON ( cron_info, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async getCRONS_INFO( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_CRONS_INFO ( function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res[0] );
                }
            });
        });
    }    

    private async getSALES_INFO( dao: any, latest_index: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_SALES_INFOS ( latest_index, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async getSALES_USERS( dao: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_ALL_SALES_USER ( function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }
    
    private async getDISTRIBUTOR( dao: any, distributor_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_DISTRIBUTORS_ByDISTRIBUTOR_ID ( distributor_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }
    
    private async getPARTNER( dao: any, partner_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_PARTNERS_ByPARTNERS_ID ( partner_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async getUSER_ByID( dao: any, user_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_USER_By_ID ( user_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    private async getDISTRIBUTOR_ByADMIN_ID( dao: any, distributor_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_DISTRIBUTOR_ID_ByADMIN_ID ( distributor_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }

    // private async getDISTRIBUTOR_ByPARTNER_ID( dao: any, distributor_id: any ) {
    //     return new Promise( (resolve, reject )=>{
    //         dao.SELECT_DISTRIBUTOR_ID_ByPARTNER_ADMIN_ID ( distributor_id, function(err: any, res: any ) {
    //             if ( !!err ) {
    //                 reject( 'BAD_ACCESS_TOKEN' );
    //             } else {
    //                 resolve ( res );
    //             }
    //         });
    //     });
    // }
    
    private async getPARTNER_ByADMIN_ID( dao: any, partner_id: any ) {
        return new Promise( (resolve, reject )=>{
            dao.SELECT_PARTNERS_ByADMIN_ID ( partner_id, function(err: any, res: any ) {
                if ( !!err ) {
                    reject( 'BAD_ACCESS_TOKEN' );
                } else {
                    resolve ( res );
                }
            });
        });
    }
}

export default ScheduleController;