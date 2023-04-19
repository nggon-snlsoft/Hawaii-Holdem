const logger = require( "../util/logger" );

export class DealerCalculation {
    private dealer: number = -1;
    private sb: number = -1;
    private bb: number = -1;
    private maxSeats: number = 9;
    private players: number = -1;

    private firstRound: boolean = false;

    public init(maxSeats: number):number {
        this.dealer = 0;
        this.sb = -1;
        this.bb = -1;
        this.maxSeats = maxSeats;
        this.firstRound = true;
        return this.dealer;
    }

    public moveButtons(entities: any[] ) :number[] {
        // Moving Button Rule
        // 1. When the table is opened, seat 0 becomes a dealer button
        // 2. If there are two players who participated,
        // the dealer will receive a small blind and the other player will be a big blind
        // 3. The dealer button moves to the player who last released the small blind and big blind
        // 4. Players do not receive the same blinds in a row
        // 5. A new player cannot start between a dealer and a button
        // (When sitting at the table, the dealer button must pass through the player to receive the hand)
        // 6. New players must post big blinds to receive hands except when they start in the big blind spot
        // 7. If a player sit out misses the blind, he or she should post the missed blind
        // 8. Sit out players cannot start between Small Blind and Big Blind.

        let players: number = 0;
        entities.forEach(element => {
            if (element.wait == false) {
                players++;
            }
        });

        this.players = players;
        this.dealer = this.moveDealer(entities);
        this.sb = this.moveSmallBlind(entities);
        this.bb = this.moveBigBlind(entities);
        this.updateButtonEntity(entities);

        if (this.firstRound == true) {
            this.firstRound = false;
        }

        return [this.dealer, this.sb, this.bb];
    }

    private moveDealer(entities: any[]): number {
        let dealer: number = 0;
        if ( this.firstRound == true ) {
            for ( let i = 0 ; i < this.maxSeats ; i++ ) {
                let e = this.FindEntityFromSeat( entities, i % this.maxSeats );
                if (null === e || undefined === e) {
                    continue;
                }

                if ( false === e.wait ) {
                    dealer = e.seat;
                    e.isDealer = true;
                    //e.isBb = true;
                    e.dealable = true;
                    return dealer;
                }
            }
        }

        if (this.players == 2 ) {
            dealer = this.FindEnablePlayer(entities);
            let e = this.FindEntityFromSeat( entities, dealer );
            if (null === e || undefined === e) {
                return 0;
            }
            e.isDealer = true;
            e.isSb = true;
            e.isBb = true;
            e.dealable = false;

            return dealer;
        }

        let seat = this.FindLastBlinder(entities);
        if (seat >= 0) {
            let e = this.FindEntityFromSeat( entities, seat );
            if ( null === e || undefined === e) {
                return 0;
            }
            e.isDealer = true;
            e.dealable = true;

            dealer = seat;
        } else {
            dealer = this.FindSeatNoLastBlinder(entities);
            let e = this.FindEntityFromSeat( entities, dealer );
            if (null === e || undefined === e) {
                return 0;
            }

            e.isDealer = true;
            e.missSb = true;
            e.missBb = true;
            e.dealable = true;

            return dealer;
        }
        return dealer;
    }

    private moveSmallBlind(entities: any[]): number {
        if ( this.dealer < 0) {
            return null;
        }

        let sb: number = -1;
        let st: number = -1;
        if ( this.firstRound == true) {
            if ( this.players == 2 ) {
                return this.dealer;
            } else {
                st = this.dealer;
                for ( let i = 0 ; i < this.maxSeats ; i++ ) {
                    let e = this.FindEntityFromSeat( entities, (st + i + 1) % this.maxSeats );
                    if (null === e || undefined === e) {
                        continue;
                    }

                    if (false === e.wait ) {
                        sb = e.seat;
                        e.isSb = true;
                        e.dealable = true;
                        return sb;
                    } else {
                        e.missSb = true;
                        e.dealable = false;
                    }
                }
            }
            return sb;
        }

        let res: boolean = false;

        if (this.players == 2) {
            sb = this.dealer;
            return sb;
        }

        st = this.dealer;
        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let e = this.FindEntityFromSeat( entities, ( st + i + 1) % this.maxSeats);
            if (null === e || undefined === e) {
                continue;
            }

            let play = this.CheckWaitOrSitOut(e);
            if ( play == true ) {
                if ( false === e.wait ) {
                    if ( true === e.isBb ) {
                        res = true;
                        sb = e.seat;
                        e.isSb = true;
                        e.dealable = true;
                        return sb;
                    } else {
                        if ( true === e.isNew || true === e.isSitBack ) {
                            e.wait = true;
                            e.dealable = false;
                            if (true === e.isSitBack ) {
                                e.missSb = true;
                            }
                            this.players = this.countPlayablePlayers(entities);
                            if (this.players == 2) {
                                sb = this.dealer;
                                return  sb;
                            }
                        }
                    }
                } else {
                    e.missSb = true;
                    e.dealable = false;
                }
            } else {
                e.missSb = true;
                e.dealable = false;
            }
        }

        if (res == false) {
            sb = -1;
        }
        return sb;
    }

    public moveBigBlind(entities: any[]): number {
        if ( this.dealer < 0) {
            return null;
        }

        let bb: number = -1;
        let st: number;

        if ( this.firstRound == true) {
            st = this.sb;
            for ( let i = 0 ; i < this.maxSeats ; i++ ) {
                let e = this.FindEntityFromSeat( entities, (st + i + 1) % this.maxSeats );
                if (null === e || undefined === e) {
                    continue;
                }

                let play = this.CheckWaitOrSitOut(e);
                if ( play == true ) {
                    bb = e.seat;
                    e.isBb = true;

                    if (this.players == 2) {
                        e.dealable = true;
                    }

                    return bb;
                } else {
                    e.missBb = true;
                }
            }
            return bb;
        }

        if (this.players == 2) {
            st = this.dealer;
            for ( let i = 0 ; i < this.maxSeats ; i++ ) {
                let entity = this.FindEntityFromSeat( entities, (st + i + 1 ) % this.maxSeats);
                if (null === entity || undefined === entity) {
                    continue;
                }

                if ( true == this.CheckWaitOrSitOut(entity) ) {
                    bb = entity.seat;
                    entity.isBb = true;
                    entity.dealable = true;
                    return bb;
                } else {
                    entity.missSb = true;
                    entity.dealable = false;
                }
            }
            return bb;
        }

        if (this.sb < 0) {
            st = this.dealer;
        } else {
            st = this.sb;
        }

        let res: boolean = false;

        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let entity = this.FindEntityFromSeat(entities, ( st + i + 1) % this.maxSeats );
            if (null === entity || undefined === entity) {
                continue;
            }

            if ( true == this.CheckWaitOrSitOut(entity) ) {
                res = true;
                entity.isBb = true;
                bb = entity.seat;
                return bb;
            } else {
                if (entity.missBb == false) {
                    entity.missBb = true;
                } else {
                    // logger.error("This player(seat:%s, name:%s)  may be leave",
                    //     entity.seat.toString(), entity.name);
                    // entity.leave = true;
                    // entity.longSitOut = true;
                }
            }
        }

        if (res == false) {
            bb = -1;
        }

        return bb;
    }

    public getDealer():number {
        return this.dealer;
    }

    public getSb():number {
        return this.sb;
    }

    public getBb():number {
        return this.bb;
    }

    private FindLastBlinder(entities: any[]) : number{
        if ( this.dealer < 0) {
            return -1;
        }

        let seat:number = -1;
        let st = this.sb;
        if ( st < 0 ) {
            st = this.dealer;
        }

        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let e = this.FindEntityFromSeat( entities, (this.maxSeats +  st - i) % this.maxSeats );
            if (null === e || undefined === e) {
                continue;
            }

            if ( e.dealable == true && e.wait == false && e.isSitOut == false) {
                seat = e.seat;
                //logger.error("Last Blinder is %s ", e.seat)
                break;
            }
        }

        return seat;
    }

    private FindSeatNoLastBlinder(entities: any[]): number {
        if ( this.dealer < 0) {
            return -1;
        }

        let seat:number = -1;
        let st = this.bb;

        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let e = this.FindEntityFromSeat( entities, (this.maxSeats +  st - i) % this.maxSeats );
            if (null === e || undefined === e) {
                continue;
            }

            if ( e.wait === false && e.isSitOut === false) {
                logger.error("No Last Blinder is %s ", e.seat)
                seat = e.seat;
                break;
            }
        }

        return seat;
    }

    private FindEntityFromSeat(entities: any[], seat: number): any {
        let entity: any = null;
        entities.forEach(element => {
            if (element.seat == seat) {
                entity = element;
            }
        });
        return entity;
    }

    private CheckWaitOrSitOut(entity: any): boolean{
        return (false === entity.wait) && ( false === entity.isSitOut);
    }

    public IsPlayableSeat(entities: any[], seat: number): boolean{
        let st = this.dealer;
        let ret: boolean = true;

        if ( seat == this.sb || seat == this.dealer || seat == this.bb) {
            return true;
        }

        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let entity = this.FindEntityFromSeat( entities, ( st + i + 1) % this.maxSeats );
            if (null === entity || undefined === entity) {
                continue;
            }

            if ( entity.seat == seat &&  this.dealer != seat && this.sb != seat ) {
                ret = false;
                break;
            }

            if ( entity.seat == this.bb) {
                ret = true;
                break;
            }
        }
        return  ret;
    }

    private FindEnablePlayer(entities: any[]): number {
        let st = this.dealer;
        let seat = -1;
        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let entity = this.FindEntityFromSeat( entities, (st + i + 1) % this.maxSeats );
            if (null === entity || undefined === entity) {
                continue;
            }

            if ( false === entity.wait && false === entity.isSitOut) {
                seat = entity.seat;
                break;
            } else {
                entity.dealable = false;
            }
        }
        return seat;
    }

    private countPlayablePlayers(entities: any[]): number {
        let c: number = 0;
        entities.forEach(e => {
            if (e.wait == false && e.isSitOut == false) {
                c++;
            }
        });

        return c;
    }

    private updateButtonEntity(entities: any[]) {
        for ( let i = 0 ; i < this.maxSeats ; i++ ) {
            let e = this.FindEntityFromSeat( entities, i % this.maxSeats );
            if (null === e || undefined === e) {
                continue;
            }

            e.isDealer = false;
            e.isSb = false;
            e.isBb = false;

            if (e.seat == this.bb ) {
                e.isBb = true;
                e.isNew = false;
                e.missBb = false;
                if (this.players == 2) {
                    e.dealable = true;
                } else {
                    e.dealable = false;
                }
            }

            if (e.seat == this.sb ) {
                e.isSb = true;
                e.missSb = false;
                e.dealable = true;
            }

            if ( e.seat == this.dealer ) {
                e.isDealer = true;
                if ( this.players == 2) {
                    e.isSb = true;
                    e.isBb = true;
                    e.dealable = false
                }
            }

            if ( e.isNew == true && e.isBb != true && e.wait == false) {
                e.isNew = false;
                e.missBb = true;
            }
        }
    }
}