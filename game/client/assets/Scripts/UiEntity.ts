import { _decorator, Component, Node, Sprite, Label, Vec3, Color, Tween, SpriteFrame, UITransform, 
    resources, tween, Quat, bezier, Animation, Button, animation, UIOpacity, color } from 'cc';
import { Board } from './Board';

import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { UiBettingChips } from './Game/UiBettingChips';
import { UiCard } from './Game/UiCard';
import { ENUM_STATUS_TYPE, UiEntityAvatar } from './Game/UiEntityAvatar';
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
    private rootButtons: Node = null;

    private timerDeltaTime: number = 0;
    private turnDuration: number = 20;
    private playTimeLimitSound: boolean = false;

    private buttons: {} = {};
    // private posSymbols: {} = {};

    private rootHandRank: Node = null;
    private labelHandRank: Label = null;

    public isFold: boolean = false;
    public isWait: boolean = false;
    public isMe: boolean = false;
    public isSitout: boolean = false;

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
    
    private timeOutId = -1;
    private uiPotChips: UiPotChips = null;

    private cbProfileOpen: (id: number, seat: number) => void = null;
    private cbProfileClose: (seat: number) => void = null;

    public isPlaying: boolean = false;

    private rootHandCards: Node = null;
    private handCards: Card[] = [ null, null ];

    private rootHiddenCards: Node = null;
    private hiddenCards: Card[] = [ null, null ];
    private rootCardDispensing: Node = null;
    private seat: number = -1;
    private rootReserveExit: Node = null;
    private betTimerUnit: number = 10;
    

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

        this.rootButtons = this.node.getChildByPath('BUTTONS');
        if ( this.rootButtons != null ) {

            this.buttons['DEALER'] = this.rootButtons.getChildByPath('DEALER').getComponent(Sprite);
            if ( this.buttons['DEALER'] != null) {
                this.buttons['DEALER'].node.active = false;
            }

            this.buttons['SB'] = this.rootButtons.getChildByPath('SB').getComponent(Sprite);
            if ( this.buttons['SB'] != null ) {
                this.buttons['SB'].node.active = false;
            }

            this.buttons['BB'] = this.rootButtons.getChildByPath('BB').getComponent(Sprite);
            if ( this.buttons['BB'] != null ) {
                this.buttons['BB'].node.active = false;
            }
        }

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

        this.buttonAvatar = this.node.getChildByPath('AVATAR/BUTTON_PROFILE').getComponent(Button);
        if ( this.buttonAvatar != null ) {
            this.buttonAvatar.node.off( 'click' );
            this.buttonAvatar.node.on( 'click', this.onClickAvatar.bind(this), this );
        }

        this.rootReserveExit = this.node.getChildByPath('RESERVE_EXIT');
        if ( this.rootReserveExit != null ) {
            this.rootReserveExit.active = false;
        }
    }

    onClickAvatar( button: Button ) {
        if ( this.cbProfileOpen != null ) {
            this.cbProfileOpen( this.id, this.seat );
        }
    }

    public Init() {
        this.cbProfileOpen = null;
        this.cbProfileClose = null;

        this.childRegistered();
    }

    public SetEntity( entity: any, cbOpen: ( id: number, seat:number )=>void, cbClose:( seat: number )=>void ) {

        this.cbProfileOpen = null;
        this.cbProfileClose = null;        
        this.childRegistered();

        if ( entity == null || entity == undefined ) {
            this.SetEscape();
            return;
        }

        if ( cbOpen != null ) {
            this.cbProfileOpen = cbOpen;
        }

        if ( cbClose != null ) {
            this.cbProfileClose = cbClose;
        }

        this.id = entity.id;
        this.seat = entity.seat;
        this.uiEntityAvatar.SetAvatar( this, entity, this.isMe );

        this.endTurn();
        this.ClearAction();
        this.ClearBetValue();
        this.ClearHands();

        this.isPlaying = true;

        this.isFold = entity.fold;        
        this.isWait = entity.wait;
        this.isSitout = entity.isSitOut;

        this.SetStatus( entity );
        this.node.active = true;

        if ( this.isSitout == true ) {
            this.SetSitout();
            return;
        }

        if( true == entity.wait ){
            this.SetWait( entity );
            return;
        }
    }

    SetClearRound( entity ) {
        if( null === entity || undefined === entity  ){
            return;
        }
        this.endTurn();        

        this.SetChips( entity.chips );

        this.ClearAction();
        this.ClearBetValue();
        this.ClearHands();
        this.ResetResultEffect();        
        this.isFold = false;

        // this.SetFold( this.isFold );

        if( true == entity.wait ){
            this.SetWait( entity );
            return;
        }
        this.SetPlay();
    }

    SetPrepareRound( entity ) {
        if( null === entity || undefined === entity  ){
            return;
        }

        this.endTurn();        
        this.SetChips( entity.chips );
        this.ClearAction();
        this.ClearBetValue();
        this.ClearHands();

        this.isFold = false;
        this.SetFold( this.isFold );        
        this.ResetResultEffect();

        if( true == entity.wait ){
            this.SetWait( entity );
            return;
        }
        this.SetPlay();
    }

    public setChipsMoveToPot(index: number, pot: Node, cb: (idx: number)=>void) {
        if ( this.uiBettingChips != null ) {
            this.uiBettingChips.moveChipsToPot(pot, ()=>{
                if (cb != null ) {
                    cb(index);
                }
            });
        }
    }

    SetEscape() {
        this.uiEntityAvatar.setEscape();

        this.labelHandRank.node.active = false;

        this.buttons['DEALER'].node.active = false;
        this.buttons['SB'].node.active = false;
        this.buttons['BB'].node.active = false;

        this.uiBettingChips.hide();

        this.cbProfileOpen = null;
        this.cbProfileClose = null;        

        this.isPlaying = false;
        this.node.active = false;

        clearTimeout(this.timeOutId);

        this.ResetResultEffect();        
    }

    SetWait( entity: any ) {
        this.ClearAction();
        this.clearUiBetValue();

        this.uiEntityAvatar.SetWait( entity );
    }

    SetPlay() {
        this.uiEntityAvatar.SetPlay();

        this.ClearAction();
        this.clearUiBetValue();
    }
    
    SetNickname ( name: string ) {
        this.uiEntityAvatar.SetNickname( name );
    }

    SetChips( chips: number ) {
        this.uiEntityAvatar.SetChips( chips );
    }

    SetBlindBet( chips: number, isSB: boolean, isBB:boolean ) {

        if ( true == isBB ) {
            this.uiEntityAvatar.SetBigBlind();
        } else {
            this.uiEntityAvatar.SetSmallBlind();
        }

        if ( true == isBB || true == isSB ) {
            this.scheduleOnce(()=>{
                if ( this.uiEntityAvatar != null ) {
                    this.uiEntityAvatar.SetShowChips();
                }
            }, 1.5);
        } else {
            if ( this.uiEntityAvatar != null ) {
                this.uiEntityAvatar.SetShowChips();
            }
        }        
    }

    SetButtons( name: string ) {
        let keys = Object.keys( this.buttons );
        keys.forEach(element => {
            let v: Sprite = this.buttons[element];
            if (element == name) {
                v.node.active = true;
            }
        });

        this.rootButtons.active = true;
    }

    ClearButtons() {
        let keys = Object.keys(this.buttons);
        keys.forEach(element => {
            let v: Sprite = this.buttons[element];
            v.node.active = false;
        });
        this.rootButtons.active = false;
    }

    SetAction( action: string ) {
        this.uiEntityAvatar.SetAction( action );
    }

    ClearAction() {
        this.uiEntityAvatar.ClearAction();        
    }

    CLEAR_ROUND_ACTION() {
        this.uiEntityAvatar.CLEAR_ROUND_ACTION();
    }

    SetStatus( player: any ) {
        if ( player != null ) {
            if ( player.isSitOut == true ) {
                if ( this.uiEntityAvatar != null ) {
                    this.uiEntityAvatar.SetStatus( ENUM_STATUS_TYPE.SITOUT );
                }

            } else if ( player.wait == true ) {
                if ( this.uiEntityAvatar != null ) {
                    this.uiEntityAvatar.SetStatus( ENUM_STATUS_TYPE.WAITING );
                }
            } else {
                if ( this.uiEntityAvatar != null ) {
                    this.uiEntityAvatar.SetStatus( ENUM_STATUS_TYPE.NONE );
                }
            }
            this.SetFold( player.fold );
        }
    }

    SetBetValue( betValue: number, done: ()=> void = null ) {
        if ( betValue > 0 ) {
            this.uiBettingChips.show(betValue, ()=>{
                if ( done != null ) {
                    done();
                }
            });
        }
        else {
            if ( done != null ) {
                done();
            }
        }
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

    ClearHands() {
        this.HideHiddenCard();
        
        this.ResetHands();
        this.HideHandCard();

        this.ClearHandRank()
    }

    SetShowHiddenCard() {
        this.hiddenCards.forEach( (e)=>{
            e.Show();
        });

        this.rootHiddenCards.active = true;
        this.rootCards.active = true;        
    }

    SetHandCardsFold() {
        this.hiddenCards.forEach( (e)=>{
            e.Fold();
        });

        this.rootHandCards.active = true;
    }

    SetHandRank( handEval: any ) {
        if ( handEval == null ) {
            return;
        }

        this.rootHandRank.active = true;
        this.labelHandRank.string = handEval.descr;
        this.labelHandRank.node.active = true;
    }

    ClearHandRank() {
        this.rootHandRank.active = false;
        this.labelHandRank.node.active = false;
        this.labelHandRank.string = '';
    }

    startTurn( duration: number, betTimerUnit: number  ) {
        this.turnDuration = duration / 1000;
        this.betTimerUnit = betTimerUnit;
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

    SetFold( fold: boolean ) {
        this.isFold = fold;        
        this.uiEntityAvatar.SET_UI_FOLD( this.isFold );
        this.timerDeltaTime = 0;

        if ( fold == true ) {
            this.HideHiddenCard();
        }
    }

    SetAllIn() {
        this.uiEntityAvatar.SetAllIn();
        this.timerDeltaTime = 0;
    }

    SetSitout() {
        this.uiEntityAvatar.SetSitout();
        this.HideHiddenCard();
    }

    SetSitback( msg: any ) {
        this.uiEntityAvatar.SetSitback( msg );
    }

    SetSitbackStatus() {
        this.uiEntityAvatar.SetSitbackStatus();
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
        if( this.timerDeltaTime < 0 ){
            this.timerDeltaTime = 0;
            this.uiEntityAvatar.setShowTimer( false );
        }

        let t = (this.timerDeltaTime * 10 ) / this.betTimerUnit ;

        if( this.isMe == true && t <= 6 && this.playTimeLimitSound ){
            this.playTimeLimitSound = false;
            AudioController.instance.PlayTimeLimit();
        }

        if ( t <= 6 ) {
            this.uiEntityAvatar.setWaitingTimerColor(Color.RED);
        } else {
            this.uiEntityAvatar.setWaitingTimerColor(Color.YELLOW);
        }
        this.uiEntityAvatar.setWaitingTimer( t );

        this.uiEntityAvatar.setWaitingTimerProgress( this.timerDeltaTime / this.turnDuration );
    }

    public GetNickname(): string {
        return this.uiEntityAvatar.GetNickname();
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

    ShowHands( cards: number[], done: ()=>void = null  ) {
        this.hiddenCards.forEach( (e)=> {
            e.Hide();
        });

        let cnt: number = 0;

        this.rootHandCards.active = true;
        this.rootCards.active = true;

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

    HideHandCard() {
        this.rootHandCards.active = false;
    }
}


