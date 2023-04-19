import { _decorator, Component, Node, Vec3 } from 'cc';
import { ENUM_CARD_TYPE } from '../HoldemDefines';
import { Card } from './Card';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;


@ccclass('UiCommunityCards')
export class UiCommunityCards extends Component {
    @property(Card) cards: Card[] = [];

    private numbers: number[] = [];
    private isRegistedChildren: boolean = false;

    public Init() {
        this.isRegistedChildren = false;

        this.RegistedChildren();
        this.node.active = false;
    }

    public Show() {
        this.node.active = true;
    }

    public Ready() {
        this.numbers = [];
    }

    public SetCommunityCards( cards: number[] ) {
        let cnt: number = 0;
        for ( let i: number = 0 ; i < cards.length; i++ ) {
            if ( cards[i] > 0 ) {
                let d = this.numbers.find( ( e )=>{
                    return e == cards[i];
                });

                if ( d != null || this.numbers.length > 5 ) {
                    continue;
                }

                cnt++;
                this.numbers.push( cards[i] );

                let delay: number = 0.2 + ( cnt * 0.1 );
                this.cards[i].ShowFlip( cards[i], delay, ()=>{
                    AudioController.instance.PlaySound('CARD_FLIP');
                } );
            }
        }
        this.Show();
    }

    public ShowFlopCards( cards: number[], cbDone: ()=>void = null ) {
        if ( cards.length != 3 ) {
            return;
        }

        this.Reset();

        let cnt: number = 0;
        let done: number = 0;
        this.Show();

        for ( let i: number = 0 ; i < cards.length; i++ ) {
            if ( cards[i] >= 0 ) {
                let d = this.numbers.find( ( e )=>{
                    return e == cards[i];
                });

                if ( d != null || this.numbers.length > 5 ) {
                    continue;
                }

                cnt++;
                this.numbers.push( cards[i] );

                let delay: number = 0.2 + ( cnt * 0.1 );
                this.cards[i].ShowFlip( cards[i], delay, ()=>{
                    done++;
                    if ( done >= 3 ) {
                        AudioController.instance.PlaySound('CARD_FLIP');
                        if ( cbDone != null ) {
                            cbDone();
                        }
                    }
                } );
            }
        }
    }

    public ShowTurnCard( cards: number[], cbDone: ()=>void = null ) {
        if ( cards.length != 1 ) {
            return;
        }

        this.cards.forEach( (e)=>{
            if ( e.GetType() == ENUM_CARD_TYPE.COMMUNITY_TURN ) {
                let d = this.numbers.find( ( e )=>{
                    return e == cards[0];
                });

                if ( d == null ) {
                    this.numbers.push( cards[0] );                
                    let delay = 0.2;
    
                    e.ShowFlip( cards[0] , delay, ()=>{
                        AudioController.instance.PlaySound('CARD_FLIP');
                        if ( cbDone != null ) {
                            cbDone();
                        }
                    } );    
                }
            }
        } );
    }

    public ShowRiverCard( cards: number[], cbDone: ()=>void = null ) {
        if ( cards.length != 1 ) {
            return;
        }

        this.cards.forEach( (e)=>{
            if ( e.GetType() == ENUM_CARD_TYPE.COMMUNITY_RIVER ) {
                let d = this.numbers.find( ( e )=>{
                    return e == cards[0];
                });

                if ( d == null ) {
                    this.numbers.push( cards[0] );

                    let delay = 0.2;
                    e.ShowFlip( cards[0] , delay, ()=>{
                        AudioController.instance.PlaySound('CARD_FLIP');
                        if ( cbDone != null ) {
                            cbDone();
                        }                    
                    } );    
                }
                else {
                    if ( cbDone != null ) {
                        cbDone();
                    }
                }
            }
        } );
    }

    public ShowRiverCardImmediate( cards: number[] ) {
        if ( cards.length != 1 ) {
            return;
        }

        this.cards.forEach( (e)=>{
            if ( e.GetType() == ENUM_CARD_TYPE.COMMUNITY_RIVER ) {
                let d = this.numbers.find( ( e )=>{
                    return e == cards[0];
                });

                if ( d == null ) {
                    this.numbers.push( cards[0] );
                    e.ShowImmediate( cards[0] );
                    AudioController.instance.PlaySound('CARD_FLIP');
                }
            }
        } );
    }

    public SetWinCards( pools: number[] ) {
        this.cards.forEach( (e)=> {
            e.SetWinCard( pools );
        });
    }

    public GetCommunityCards(): number[] {
        return this.numbers;
    }

    public Hide() {
        this.node.active = false;
    }

    public Reset() {
        this.cards.forEach( (e)=>{
            e.Reset();
        } );

        this.numbers = [];
        this.node.active = false;
    }

    private RegistedChildren() {
        if ( this.isRegistedChildren == true ) {
            return;
        }

        this.cards[0].Init( ENUM_CARD_TYPE.COMMUNITY_FLOP );
        this.cards[1].Init( ENUM_CARD_TYPE.COMMUNITY_FLOP );
        this.cards[2].Init( ENUM_CARD_TYPE.COMMUNITY_FLOP );
        this.cards[3].Init( ENUM_CARD_TYPE.COMMUNITY_TURN );
        this.cards[4].Init( ENUM_CARD_TYPE.COMMUNITY_RIVER );

        this.isRegistedChildren = true;
    }
}
