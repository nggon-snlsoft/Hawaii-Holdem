import { _decorator, Component, Node, Sprite, Label, Vec3, Color, Tween, SpriteFrame, UITransform, 
    resources, tween, Quat, bezier, Animation, Button, animation, UIOpacity } from 'cc';
import { Board } from './Board';

import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { UiBettingChips } from './Game/UiBettingChips';
import { UiCard } from './Game/UiCard';
import { UiEntityAvatar } from './Game/UiEntityAvatar';
import { EMOTICON_CHAT_MESSAGE, EMOTICON_TYPE } from './Game/UiGameChatting';
import { UiResultEffect } from './Game/UiResultEffect';
import { NetworkManager } from './NetworkManager';
import { ResourceManager } from './ResourceManager';
import { UiPotChips } from './Game/UiPotChips';
import { Card } from './Game/Card';
import { ENUM_CARD_TYPE } from './HoldemDefines';

const { ccclass, property } = _decorator;

@ccclass('UiEntity')
export class UiEntity extends Component {
    private uiEntityAvatar: UiEntityAvatar = null;

    private isChildRegistered: boolean = false;

    private rootCards: Node = null;

    // public spriteHandCards: Sprite[] = [ null, null ];
    // public uiHandCards: UiCard[] = [null, null];
    // public spriteHandCardsBackground: Sprite[] = [ null, null ];

    // private rootHiddenCard: Node = null;
    // public spriteHiddenCards: Sprite[] = [ null, null ];
    // public vectorHiddenCards: Vec3[] = [ null, null ];
    
    private timerDeltaTime: number = 0;
    private turnDuration: number = 20;
    private playTimeLimitSound: boolean = false;

    private posSymbols: {} = {};

    private rootHandRank: Node = null;
    private labelHandRank: Label = null;
    // private nodeHandRankBackground: Node = null;

    public isFold: boolean = false;
    public isMe: boolean = false;
    public isUiSitOut: boolean = false;

    public bezierPoints: Node[] = [];

    private nodeEmoticon: Node = null;
    private spriteEmoticon: Sprite = null;
    private nodeChatting: Node = null;
    private animationEmoticon: Animation = null;
    private animationChatting: Animation = null;

    private labelChatting: Label = null;
    private buttonAvatar: Button = null;
    private id:number = -1;

    private uiBettingChips: UiBettingChips = null;
    private uiResultEffect: UiResultEffect = null;

    private rootCardDeck: Node = null;
    private rootPotChips: Node = null;
    private vecPotChips: Vec3 = null;
    private timeOutId = -1;
    private uiPotChips: UiPotChips = null;

    callbackProfileOpen: (e: any) => void = null;
    callbackProfileClose: () => void = null;

    public isPlaying: boolean = false;

    private rootHandCards: Node = null;
    private handCards: Card[] = [ null, null ];

    private rootHiddenCards: Node = null;
    private hiddenCards: Card[] = [ null, null ];
    private rootCardDispensing: Node = null;
    

    childRegistered() {
        if( true == this.isChildRegistered){
            return;
        }

        this.isChildRegistered = true;
        this.uiEntityAvatar = this.node.getChildByPath('AVATAR').getComponent(UiEntityAvatar);
        if ( this.uiEntityAvatar != null ) {
            this.uiEntityAvatar.init();
        }

        let n = this.node.getChildByPath('BETTING_CHIPS');
        if ( n != null ) {
            this.uiBettingChips = n.getComponent(UiBettingChips);
            if ( this.uiBettingChips != null ) {
                this.uiBettingChips.init();
            }
        }

        let r = this.node.getChildByPath('RESULT_EFFECT');
        if ( r != null ) {
            this.uiResultEffect = r.getComponent(UiResultEffect);
            if ( this.uiResultEffect != null ) {
                this.uiResultEffect.Init();
            }
        }

        this.rootCards = this.node.getChildByPath('CARDS');
        if ( this.rootCards != null ) {
            this.rootHandCards = this.rootCards.getChildByPath('HAND_CARDS');
            if ( this.rootHandCards != null ) {
                for ( let i: number = 0 ; i < 2; i ++ ) {
                    this.handCards[i] = this.rootHandCards.getChildByPath( i.toString() ).getComponent(Card);
                    this.handCards[i].Init( ENUM_CARD_TYPE.PLAYER_HAND );
                }
                this.rootHandCards.active = false;
            }
    
            this.rootHiddenCards = this.rootCards.getChildByPath('HIDDEN_CARDS');
            if ( this.rootHiddenCards != null ) {
                for ( let i: number = 0 ; i < 2; i ++ ) {
                    this.hiddenCards[i] = this.rootHiddenCards.getChildByPath( i.toString() ).getComponent(Card);
                    this.hiddenCards[i].Init( ENUM_CARD_TYPE.PLAYER_HIDDEN );
                }
    
                this.rootCardDispensing = this.rootHiddenCards.getChildByPath('DISPENSING_ROOT');
                this.rootCardDispensing.active = true;
    
                this.rootHiddenCards.active = false;
            }

            this.rootCards.active = false;
        }

        this.rootHandRank = this.node.getChildByPath('HAND_RANK');
        if ( this.rootHandRank != null ) {
            this.labelHandRank = this.rootHandRank.getChildByPath('LABEL_HAND_RANK').getComponent(Label);
            if ( this.labelHandRank != null ) {
                this.labelHandRank.node.on( Node.EventType.SIZE_CHANGED, ()=>{
                    let uiTransLB = this.labelHandRank.node.getComponent(UITransform);
                    let uiTransSpr = this.rootHandRank.getComponent(UITransform);
                    uiTransSpr.setContentSize(uiTransLB.contentSize.width + 40, uiTransSpr.height);        
                }, this);
                this.labelHandRank.node.active = false;
            }
            this.rootHandRank.active = false;
        }

        this.posSymbols['dealer'] = this.node.getChildByPath('BUTTONS/DEALER').getComponent(Sprite);
        this.posSymbols['dealer'].node.active = false;
        
        this.posSymbols['sb'] = this.node.getChildByPath('BUTTONS/SB').getComponent(Sprite);
        this.posSymbols['sb'].node.active = false;
        
        this.posSymbols['bb'] = this.node.getChildByPath('BUTTONS/BB').getComponent(Sprite);
        this.posSymbols['bb'].node.active = false;

        this.bezierPoints = [];
        for(let i=0; i<2; i++){
            let point = this.node.getChildByPath(`BEZIER_POINT${i+1}`);
            this.bezierPoints.push(point);
        }

        this.nodeEmoticon = this.node.getChildByPath('EMOTICON');
        this.nodeEmoticon.active = false;

        this.spriteEmoticon = this.node.getChildByPath('EMOTICON/EMOTICON').getComponent(Sprite);
        this.spriteEmoticon.node.active = false;

        this.animationEmoticon = this.node.getChildByPath('EMOTICON/EMOTICON').getComponent(Animation);
        this.animationEmoticon.on('finished', this.onFinishedEmoticonAnimation.bind(this), this);

        this.nodeChatting = this.node.getChildByPath('EMOTICON/CHATTING');
        this.nodeChatting.active = false;
        
        this.animationChatting = this.node.getChildByPath('EMOTICON/CHATTING').getComponent(Animation);
        this.animationChatting.on('finished', this.onFinishedChattingAnimation.bind(this), this);

        this.labelChatting = this.node.getChildByPath('EMOTICON/CHATTING/LABEL_CHATTING').getComponent(Label);
        this.labelChatting.string = '';

        this.isPlaying = false;
        this.node.active = false;

        this.uiPotChips = this.node.getChildByPath('POT_CHIPS').getComponent( UiPotChips );
        if ( this.uiPotChips != null ) {
            this.uiPotChips.init();
            this.uiPotChips.node.active = false;
        }


        this.rootCardDeck = this.node.getChildByPath('NODE_CARD_DECK');
    }

    onClickAvatar( button: Button ) {
    
    }

    public Init() {
        this.childRegistered();
    }

    setUi( entity: any ) {
        this.childRegistered();

        if( null === entity || undefined === entity  ){
            this.setEscapee();
            return;
        }

        if ( entity != null ) {
            this.id = entity.id;
        }

        this.uiEntityAvatar.setAvatar( this, entity, this.isMe );
        this.endTurn();        
        this.clearUiAction();
        this.clearUiBetValue();    
        this.clearUiHandCards();
        this.clearUiHandRank();

        this.isPlaying = true;

        this.isFold = entity.fold;
        this.node.active = true;

        if ( this.isUiSitOut == true ) {
            this.setUiSitOut();
            return;
        }

        if( true == this.isFold){
            this.setUiFold();
            return;
        }

        if( true == entity.wait ){
            this.setUiWait();
            return;
        }

        this.callbackProfileOpen = null;
        this.callbackProfileClose = null;

    }

    SetClearRound( entity ) {
        if( null === entity || undefined === entity  ){
            return;
        }
        this.endTurn();        

        this.SetChips( entity.chips );

        this.ClearAction();
        this.ClearBetValue();
        this.ResetHands();

        
        

        // this.isFold = false;
        // this.uiEntityAvatar.clearUiAction();



        // this.clearUiBetValue();
        // this.clearUiHandCards();
        this.clearUiHandRank();

        if( true == entity.wait ){
            this.setUiWait();
            return;
        }

        this.ResetResultEffect();
        this.setUiPlay(); 
    }    

    setUiPrepareRound( entity ) {
        //Maybe Deplicate
        if( null === entity || undefined === entity  ){
            return;
        }

        this.setUiChips(entity.chips);

        this.isFold = false;
        this.uiEntityAvatar.clearUiAction();

        this.endTurn();

        this.clearUiAction();
        this.clearUiBetValue();

        this.clearUiHandCards();
        this.clearUiHandRank();

        if( true == entity.wait ){
            this.setUiWait();
            return;
        }

        this.ResetResultEffect();
        this.setUiPlay(); 
    }

    // public setShowHiddenCard( show: boolean ) {
    //     this.spriteHiddenCards[0].node.active = show;
    //     this.spriteHiddenCards[1].node.active = show;
        
    //     this.rootHiddenCard.active = show;
    // }

    public setChipsMoveToPot(index: number, pot: Node, cb: (idx: number)=>void) {
        if ( this.uiBettingChips != null ) {
            this.uiBettingChips.moveChipsToPot(pot, ()=>{
                if (cb != null ) {
                    cb(index);
                }
            });
        }
    }

    setEscapee() {
        this.uiEntityAvatar.setEscape();

        // this.spriteHandCards[0].node.active = false;
        // this.spriteHandCards[1].node.active = false;
        // this.spriteHandCards[0].node.active = false;
        // this.spriteHandCards[1].node.active = false;

        // this.uiHandCards[0].hide();
        // this.uiHandCards[1].hide();

        this.labelHandRank.node.active = false;
        this.posSymbols['dealer'].node.active = false;
        this.posSymbols['sb'].node.active = false;
        this.posSymbols['bb'].node.active = false;

        this.uiBettingChips.hide();

        this.callbackProfileOpen = null;
        this.callbackProfileClose = null;

        this.isPlaying = false;
        this.node.active = false;

        clearTimeout(this.timeOutId);

        this.ResetResultEffect();
    }

    setUiWait() {
        this.uiEntityAvatar.setUiWait();

        this.clearUiAction();
        this.clearUiBetValue();
    }

    setUiPlay() {
        this.uiEntityAvatar.setUiPlay();

        this.clearUiAction();
        this.clearUiBetValue();
    }

    setNickname ( name: string ) {
        this.uiEntityAvatar.setNickname( name );
    }

    SetChips( chips: number ) {
        this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
    }

    setUiChips( chips: number ) {
        // this.chips = chips;
        // if ( this.labelChips != null ) {
        //     this.labelChips.color = new Color(255, 200, 70);

        //     this.labelChips.string = CommonUtil.getKoreanNumber(chips);
        //     if ( this.isUiSitOut == true ) {
        //         this.setUiSitOut();
        //     } else {
        //         this.setUiSitBack();
        //     }
        // }
        this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
    }

    setUiBlindBet( chips: number, isSB: boolean, isBB:boolean ) {
        if ( this.isUiSitOut == true ) {
            this.setUiSitOut();
        } else {
            this.setUiSitBack();
        }

        if ( true == isBB ) {
            this.uiEntityAvatar.setBigBlind();
        } else {
            this.uiEntityAvatar.setSmallBlind();
        }

        if ( true == isBB || true == isSB ) {
            this.timeOutId = setTimeout(() => {
                clearTimeout( this.timeOutId);
                if ( this.uiEntityAvatar != null ) {
                    this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
                }

            }, 2000);
        } else {
            if ( this.uiEntityAvatar != null ) {
                this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
            }
        }
    }

    setUiPosSymbol( symbolName: string ) {
        let keys = Object.keys(this.posSymbols);
        keys.forEach(element => {
            let v: Sprite = this.posSymbols[element];
            if (element == symbolName) {
                v.node.active = true;
            }
        });
    }

    clearUiPositionSymbol() {
        let keys = Object.keys(this.posSymbols);
        keys.forEach(element => {
            let v: Sprite = this.posSymbols[element];
            v.node.active = false;
        });
    }

    setUiAction( action: string ) {
        this.uiEntityAvatar.setUiAction( action );
    }

    ClearAction() {
        this.uiEntityAvatar.ClearAction();        
    }

    clearUiAction() {
        this.uiEntityAvatar.clearUiAction();
    }

    setUiBetValue( betValue: number, color?: Color ) {

        this.uiBettingChips.show(betValue, ()=>{

        });
    }

    ClearBetValue() {
        this.uiBettingChips.hide();        
    }

    clearUiBetValue() {
        this.uiBettingChips.hide();
    }

    ResetHands() {
        this.handCards.forEach( (e)=>{
            e.Reset();
        });
    }

    clearUiHandCards() {
        // this.spriteHandCards[0].spriteFrame = null;
        // this.spriteHandCards[1].spriteFrame = null;   

        // this.spriteHandCards[0].color = Color.WHITE;
        // this.spriteHandCards[1].color = Color.WHITE;

        // this.spriteHiddenCards[0].color = Color.WHITE;
        // this.spriteHiddenCards[1].color = Color.WHITE;

        // this.spriteHandCards[0].node.active = false;
        // this.spriteHandCards[1].node.active = false;

        // this.uiHandCards[0].hide();
        // this.uiHandCards[1].hide();
    }

    setUiHandCardsFold() {
        // this.spriteHandCards[0].color = Color.GRAY;
        // this.spriteHandCards[1].color = Color.GRAY;
    }

    SetShowHiddenCard() {
        this.hiddenCards.forEach( (e)=>{
            e.Show();
        });
    }

    SetHandCardsFold() {
        this.hiddenCards.forEach( (e)=>{
            e.Fold();
        });
    }

    SetHandRank( handEval: any ) {
        if ( handEval == null ) {
            return;
        }

        this.rootHandRank.active = true;
        this.labelHandRank.string = handEval.descr;
        this.labelHandRank.node.active = true;
    }

    setUiHandRank( rankName: string ) {
        //deplicate
        if(rankName === "" || rankName === null){
            return;
        }
        this.rootHandRank.active = true;
        this.labelHandRank.string = rankName;
        this.labelHandRank.node.active = true;
    }

    clearUiHandRank() {
        this.rootHandRank.active = false;
        this.labelHandRank.node.active = false;
        this.labelHandRank.string = '';
    }

    startTurn( duration: number ) {
        this.turnDuration = duration / 1000;
        this.uiEntityAvatar.startTurn();
    }

    public StartActionTimer() {
        this.timerDeltaTime = this.turnDuration;
        this.playTimeLimitSound = true;
    }

    endTurn() {
        this.uiEntityAvatar.endTurn();

        this.timerDeltaTime = 0;
        AudioController.instance.StopTimeLimit();
    }

    setUiFold() {
        this.isFold = true;        
        this.uiEntityAvatar.setUiFold( true );
        this.timerDeltaTime = 0;
    }

    // public setUiFoldCardAnimation() {

    //     let from: Node = this.rootHiddenCard;
    //     let to: Node = this.rootCardDeck;

    //     let original:Vec3 = new Vec3(from.position);

    //     let op: UIOpacity = from.getComponent(UIOpacity);
    //     if ( op != null ) {
    //         op.opacity = 255;
    //     }
        
    //     let duration = 0.2;
    //     let tw = tween( from )
    //     .set ({
    //         position: from.position,

    //     }).to ( duration, {
    //         position: to.position,
    //     }, {
    //         easing: this.easeOutQuad,
    //         onUpdate: ( target: Node, ratio: number )=> {
    //             let o = 255 - 255 * ratio;
    //             op.opacity = o;
    //         },
    //     });

    //     tw.call( ()=>{
    //         from.active = false;
    //         from.position = new Vec3(original);

    //         op.opacity = 255;
    //     } );
    //     tw.start();
    // }

    setUiAllIn() {
        this.uiEntityAvatar.setUiAllin();
        this.timerDeltaTime = 0;
    }

    setUiSitOut() {
        this.isUiSitOut = true;
        this.uiEntityAvatar.setUiSitout();
    }

    public getIsUiSitOut(): boolean {
        return this.isUiSitOut;
    }

    setUiSitBack() {
        this.isUiSitOut = false;
        this.uiEntityAvatar.setUiSitback();
    }

    setEmoticon( type: EMOTICON_TYPE, id: number ) {
        Board.table.setEmoticonButtinInteractive(false);
        if (type == EMOTICON_TYPE.Emoticon ) {

            CommonUtil.setEmoticonSprite( id, this.spriteEmoticon, ()=>{
                this.spriteEmoticon.node.active = true;
                this.nodeEmoticon.active = true;
                this.animationEmoticon.play();

            });

        } else if ( type == EMOTICON_TYPE.Chatting ) {
            this.labelChatting.string = EMOTICON_CHAT_MESSAGE[id];
            this.nodeChatting.active = true;
            this.nodeEmoticon.active = true;            
            this.animationChatting.play();
        }
    }

    onFinishedEmoticonAnimation() {
        this.animationEmoticon.stop();
        Board.table.setEmoticonButtinInteractive(true);
    }

    onFinishedChattingAnimation() {
        this.animationChatting.stop();
        Board.table.setEmoticonButtinInteractive(true);
    }

    update( dt: number ) {
        this.updateTimer(dt);
    }

    updateTimer( dt: number ) {
        if( 0 >= this.timerDeltaTime ){
            return;
        }

        this.timerDeltaTime -= dt;
        if( 0 > this.timerDeltaTime){
            this.timerDeltaTime = 0;
            this.uiEntityAvatar.setShowTimer( false );
        }

        if( this.isMe == true && this.timerDeltaTime <= 6 && this.playTimeLimitSound ){
            this.playTimeLimitSound = false;
            AudioController.instance.PlayTimeLimit();
        }

        // if ( this.timerDeltaTime < 10 ) {
        if ( this.timerDeltaTime <= 6 ) {
            this.uiEntityAvatar.setWaitingTimerColor(Color.RED);
        } else {
            this.uiEntityAvatar.setWaitingTimerColor(Color.YELLOW);
        }
        this.uiEntityAvatar.setWaitingTimer(this.timerDeltaTime);
        // }

        this.uiEntityAvatar.setWaitingTimerProgress( this.timerDeltaTime / this.turnDuration );
    }

    public getNickname(): string {
        return this.uiEntityAvatar.getNickname();
    }

    public ResetResultEffect() {
        this.uiResultEffect.ResetResultEffect();
    }

    public SetDraw( value: number ) {
        this.uiResultEffect.SetDrawEffect( value );
    }

    public SetReturn( value: number ) {
        this.uiResultEffect.SetReturnEffect( value );
    }

    public SetWinner( from: Node, value: number) {
        this.uiPotChips.MovePotToEntity( from, this.node, value );
        this.uiResultEffect.SetWinEffect( value );
    }

    public SetWinCards( pools: any ) {
        this.handCards.forEach( (e)=>{
            e.SetWinCard( pools );
        });
    }

    setAniWinner( value: number ) {
        this.uiResultEffect.SetWinEffect( value );
    }

    setTweenFadeInFromToMove( sprite: Sprite, originalColor: Color, from: Vec3, to: Vec3, duration: number, 
        fadeInRatio: number, easingFunc: ( k: number ) => number, onFinished: ()=> void ) {
            sprite.node.active = true;

            sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, 0 );
        
            let tw = tween( sprite.node )
            .set( { 
                position: from 
            })
            .to( duration, {
                position: to,
            }, {
                easing: easingFunc,
                onUpdate: ( target: Node, ratio: number ) => {
                    let a = originalColor.a * ratio * fadeInRatio;
                    if( a > originalColor.a ) {
                        a = originalColor.a;
                    }
                    sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, a );
                },
            });
    
            if( null != onFinished){
                tw.call( onFinished );
            }
    
            tw.union()
            tw.start();            

    }

    PrepareDispensingCards() {
        console.log('PrepareDispensingCards');
        this.handCards.forEach( ( e )=> {
            if ( e != null ) {
                e.Hide();
            }
        });

        this.hiddenCards.forEach( ( e )=> {
            if ( e != null ) {
                e.Hide();
            }
        });

        this.rootHiddenCards.active = true;
        this.rootHandCards.active = true;

        this.rootCards.active = true;
    }

    // prepareCardDispense() {
    //     this.spriteHiddenCards[0].node.active = false;
    //     this.spriteHiddenCards[1].node.active = false;

    //     this.uiHandCards[0].hide();
    //     this.uiHandCards[1].hide();

    //     this.spriteHandCardsBackground[0].node.active = false;
    //     this.spriteHandCardsBackground[1].node.active = false;

    //     this.rootHiddenCard.active = true;
    //     this.rootCards.active = true;
    // }

    // moveDeckToHiddenCard( card: number, index: number, duration: number, delay: number, cb: (idx: number)=>void ) {
    //     let target = this.spriteHiddenCards[card].node;

    //     let from = new Vec3(this.rootCardDeck.position);
    //     let to = new Vec3(this.spriteHiddenCards[card].node.position);

    //     target.active = false;

    //     if ( from == null || to == null ) {
    //         return;
    //     }
       
    //     let tw = tween( target )
    //     .delay(delay)
    //     .set ({
    //         position: from,
    //         active: true,

    //     }).to ( duration, {
    //         position: to,
    //     }, {
    //         easing: this.easeOutQuad,
    //         onUpdate: ( target: Node, ratio: number )=> {

    //         },
    //     });

    //     tw.call( ()=>{
    //         if (cb != null ) {
    //             cb( index );
    //         }
    //     } );
    //     tw.start();
    // }

    CardDispensing( card: number, index: number, duration: number, delay: number, cb: (idx: number)=>void ) {
        this.hiddenCards[card].Show();        
        let target = this.hiddenCards[card].node;

        let from = new Vec3( this.rootCardDispensing.position );
        let to = new Vec3( this.hiddenCards[card].node.position );

        target.active = false;

        if ( from == null || to == null ) {
            return;
        }
       
        let tw = tween( target )
        .delay(delay)
        .set ({
            position: from,
            active: true,

        }).to ( duration, {
            position: to,
        }, {
            easing: this.easeOutQuad,
            onUpdate: ( target: Node, ratio: number )=> {

            },
        });

        tw.call( ()=>{
            if (cb != null ) {
                cb( index );
            }
        } );
        tw.start();
    }

    // showPlayerCard() {
    //     this.spriteHiddenCards[0].node.active = false;
    //     this.spriteHiddenCards[1].node.active = false;
    // }

    // ShowPlayerCards( card: any ) {
    //     this.spriteHiddenCards[0].node.active = false;
    //     this.spriteHiddenCards[1].node.active = false;
        
    //     this.uiHandCards[0].show( card.primary, null, 0.2 );
    //     this.uiHandCards[1].show( card.secondary, null, 0.4 );

    //     this.rootCards.active = true;
    // }

    ShowHands( cards: number[], done: ()=>void = null  ) {
        this.hiddenCards.forEach( (e)=> {
            e.Hide();
        });

        let cnt: number = 0;
        for ( let i = 0 ; i < cards.length; i ++ ) {
            this.handCards[i].ShowFlip( cards[i], 0.2 + 0.1 * i, ()=>{
                cnt++;
                if ( cnt >= cards.length ) {
                    if ( done != null ) {
                        done();
                    }
                }
            });
        }
    }

    // ShowdownPlayerCards( card: any, cb:()=>void ) {
    //     this.spriteHiddenCards[0].node.active = false;
    //     this.spriteHiddenCards[1].node.active = false;

    //     let cnt: number = 0;
    //     let end: boolean = false;
        
    //     this.uiHandCards[0].show( card.primary, ()=>{
    //         cnt++;

    //         if ( cnt >= 2 && end == false ) {
    //             end = true;
    //             cb();
    //         }

    //     }, 0.1 );

    //     this.uiHandCards[1].show( card.secondary, ()=>{
    //         cnt++;

    //         if ( cnt >= 2 && end == false ) {
    //             end = true;
    //             cb();
    //         }
    //     }, 0.1 );

    //     this.rootCards.active = true;
    // }


    hiddenCardFadeOut( target: Node, duration: number, delay: number ) {
        if ( target == null ) {
            return;
        }

        let sprite: Sprite = target.getComponent(Sprite);
        sprite.color = new Color( 255, 255, 255, 255);
        
        let tw = tween( target )
        .delay(delay)
        .set ({

        }).to ( duration, {

        }, {
            easing: this.easeOutQuad,
            onUpdate: ( target: Node, ratio: number )=> {
                let a = 255 - ratio * 255;
                sprite.color = new Color(255, 255, 255, a);
            },
        });

        tw.call( ()=>{
            target.active = false;
            sprite.color = new Color( 255, 255, 255, 255);
        } );
        tw.start();
    }

    easeOutBack(x: number ): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    easeOutQuad( x: number ): number {
        return 1 - (1 - x) * (1 - x);
    }

    HideHiddenCard() {
        this.rootHiddenCards.active = false;
    }
}


