import { _decorator, Component, Node, Sprite, Label, Vec3, Color, Tween, SpriteFrame, UITransform, 
    resources, tween, Quat, bezier, Animation, Button, animation, UIOpacity } from 'cc';
import { Board } from './Board';

import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { UiBettingChips } from './Game/UiBettingChips';
import { UiEntityAvatar } from './Game/UiEntityAvatar';
import { EMOTICON_CHAT_MESSAGE, EMOTICON_TYPE } from './Game/UiGameChatting';
import { NetworkManager } from './NetworkManager';
import { ResourceManager } from './ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('UiEntity')
export class UiEntity extends Component {
    private uiEntityAvatar: UiEntityAvatar = null;

    private isChildRegistered: boolean = false;

    private rootCards: Node = null;

    public spriteHandCards: Sprite[] = [ null, null ];
    public spriteHandCardsBackground: Sprite[] = [ null, null ];

    private rootHiddenCard: Node = null;
    public spriteHiddenCards: Sprite[] = [ null, null ];
    public vectorHiddenCards: Vec3[] = [ null, null ];
    
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

    private spriteWinAnimation1: Sprite = null;
    private spriteWinAnimation2: Sprite = null;
    private spriteWinAnimation3: Sprite = null;
    private vectorWinAnimation3: Vec3 = new Vec3();

    private nodeWinBadge: Sprite = null;
    private labelWinAmount: Label = null;

    private nodeDrawBadge: Sprite = null;
    private labelDrawAmount: Label = null;

    private nodeReturnBadge: Sprite = null;
    private labelReturnAmount: Label = null;

    private winTweens: Tween<Node>[] = [];
    private timeOutNumber: number = -1;

    private nodeEmoticon: Node = null;
    private spriteEmoticon: Sprite = null;
    private nodeChatting: Node = null;
    private animationEmoticon: Animation = null;
    private animationChatting: Animation = null;

    private labelChatting: Label = null;
    private buttonAvatar: Button = null;
    private id:number = -1;

    private uiBettingChips: UiBettingChips = null;
    private rootCardDeck: Node = null;
    private rootPotChips: Node = null;
    private vecPotChips: Vec3 = null;

    callbackProfileOpen: (e: any) => void = null;
    callbackProfileClose: () => void = null;

    public isPlaying: boolean = false;

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

        this.rootCards = this.node.getChildByPath('CARDS');
        if ( this.rootCards != null ) {
            this.spriteHandCards[0] = this.rootCards.getChildByPath('CARD_0').getComponent(Sprite);
            if ( this.spriteHiddenCards[0] != null ) {
                this.spriteHandCards[0].node.active = false;
            }

            this.spriteHandCards[1] = this.rootCards.getChildByPath('CARD_1').getComponent(Sprite);
            if ( this.spriteHiddenCards[1] != null ) {
                this.spriteHandCards[1].node.active = false;
            }

            this.spriteHandCardsBackground[0] = this.rootCards.getChildByPath('CARD_0_BACKGROUND').getComponent(Sprite);
            if ( this.spriteHandCardsBackground[0] != null ) {
                this.spriteHandCardsBackground[0].node.active = false;
            }

            this.spriteHandCardsBackground[1] = this.rootCards.getChildByPath('CARD_1_BACKGROUND').getComponent(Sprite);
            if ( this.spriteHandCardsBackground[1] != null ) {
                this.spriteHandCardsBackground[1].node.active = false;
            }

            this.rootHiddenCard = this.rootCards.getChildByPath('HIDDEN_CARD');
            if ( this.rootHiddenCard != null ) {
                this.spriteHiddenCards[0] = this.rootHiddenCard.getChildByPath('CARD_0').getComponent(Sprite);
                if ( this.spriteHiddenCards[0] != null ) {
                    let sf = ResourceManager.Instance().getCardImage(0);
                    this.spriteHiddenCards[0].spriteFrame = sf;

                    this.vectorHiddenCards[0] = new Vec3( this.spriteHiddenCards[0].node.position );
                    this.spriteHiddenCards[0].node.active = false;            
                }

                this.spriteHiddenCards[1] = this.rootHiddenCard.getChildByPath('CARD_1').getComponent(Sprite);
                if ( this.spriteHiddenCards[1] != null ) {
                    let sf = ResourceManager.Instance().getCardImage(0);
                    this.spriteHiddenCards[0].spriteFrame = sf;
                    
                    this.vectorHiddenCards[1] = new Vec3( this.spriteHiddenCards[1].node.position );
                    this.spriteHiddenCards[1].node.active = false;            
                }
                this.rootHiddenCard.active = false;
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

        this.rootCardDeck = this.node.getChildByPath('NODE_CARD_DECK');

        // this.buttonAvatar = this.node.getChildByPath('AVATAR').getComponent(Button);
        // this.buttonAvatar.node.on('click', this.onClickAvatar.bind(this), this );

        // this.spriteBetValueBackground = this.node.getChildByPath('SPRITE_ACTION_VALUE').getComponent(Sprite);
        // this.spriteBetValueBackground.node.active = false;

        // this.labelBetValue = this.node.getChildByPath('SPRITE_ACTION_VALUE/Label').getComponent(Label);
        // this.labelBetValue.node.active = false;

        // this.spriteBetChip = this.node.getChildByPath('SPRITE_ACTION_VALUE/SPRITE_CHIP').getComponent(Sprite);
        // this.spriteBetChip.node.active = false;

        // this.spriteBetChipAniGoToPotUi = this.node.getChildByPath('SPRITE_BET_CHIP_ANI_GOTO_POT').getComponent(Sprite);
        // this.spriteBetChipAniGoToPotUi.node.active = false;


        // this.spriteWinAnimation1 = this.node.getChildByPath('SPRITE_WIN_ANI1').getComponent(Sprite);
        // this.spriteWinAnimation1.node.active = true;
        // this.spriteWinAnimation1.color = new Color(255,255,255,1);

        // this.spriteWinAnimation2 = this.node.getChildByPath('SPRITE_WIN_ANI2').getComponent(Sprite);
        // this.spriteWinAnimation2.node.active = true;
        // this.spriteWinAnimation2.color = new Color(255,255,255,1);

        // this.spriteWinAnimation3 = this.node.getChildByPath('SPRITE_WIN_ANI3').getComponent(Sprite);
        // this.spriteWinAnimation3.node.active = true;
        // this.spriteWinAnimation3.color = new Color(255,255,255,1);
        // this.vectorWinAnimation3 = new Vec3(this.spriteWinAnimation3.node.position);

        // this.nodeWinBadge = this.node.getChildByPath('SPRITE_WIN').getComponent(Sprite);
        // this.nodeWinBadge.node.active = false;

        // this.labelWinAmount = this.node.getChildByPath('SPRITE_WIN/LABEL_VALUE').getComponent(Label);
        // this.labelWinAmount.node.active = true;

        // this.nodeDrawBadge = this.node.getChildByPath('SPRITE_DRAW').getComponent(Sprite);
        // this.nodeDrawBadge.node.active = false;

        // this.labelDrawAmount = this.node.getChildByPath('SPRITE_DRAW/LABEL_VALUE').getComponent(Label);
        // this.labelDrawAmount.node.active = true;

        // this.nodeReturnBadge = this.node.getChildByPath('SPRITE_RETURN').getComponent(Sprite);
        // this.nodeReturnBadge.node.active = false;

        // this.labelReturnAmount = this.node.getChildByPath('SPRITE_RETURN/LABEL_VALUE').getComponent(Label);
        // this.labelReturnAmount.node.active = true;
    }

    onClickAvatar( button: Button ) {
        // Board.table.openUserProfile( this.id );
    }

    onLoad() {
        this.childRegistered();
    }

    setUi( entity ) {
        this.childRegistered();

        if( null === entity || undefined === entity  ){
            this.setEscapee();
            return;
        }

        if ( entity != null ) {
            this.id = entity.id;
        }

        this.uiEntityAvatar.setAvatar( entity );
        this.endTurn();        
        this.clearUiAction();
        this.clearUiBetValue();    
        this.clearUiHandCards();
        this.clearUiHandRank();

        this.isPlaying = true;

        this.isFold = entity.fold;
        this.node.active = true;

        if( true == this.isFold){
            this.setUiFold();
            return;
        }
        else {
            this.uiEntityAvatar.setUiFold( false );
        }

        if( true == entity.wait ){
            this.setUiWait();
            return;
        }
        else {
            this.uiEntityAvatar.setUiFold( false );
        }

        this.setUiPlay();

        this.callbackProfileOpen = null;
        this.callbackProfileClose = null;

    }

    setUiPrepareRound( entity ) {
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

        this.setUiPlay(); 
    }

    public setShowHiddenCard( show: boolean ) {
        this.spriteHiddenCards[0].node.active = show;
        this.spriteHiddenCards[1].node.active = show;
        
        this.rootHiddenCard.active = show;
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

    setEscapee() {
        this.uiEntityAvatar.setEscape();

        // this.labelSitOut.node.active = false;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].node.active = false;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].node.active = false;
        this.labelHandRank.node.active = false;
        this.posSymbols['dealer'].node.active = false;
        this.posSymbols['sb'].node.active = false;
        this.posSymbols['bb'].node.active = false;
        // this.spriteActionValueRoot.node.active = false;

        this.uiBettingChips.hide();

        this.callbackProfileOpen = null;
        this.callbackProfileClose = null;

        this.isPlaying = false;

        this.node.active = false;

        // this.ResetBadges();
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
        let timeOutId: number = -1;
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
            timeOutId = setTimeout(() => {
                clearTimeout(timeOutId);
                this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
            }, 2000);
        } else {
            this.uiEntityAvatar.setUiChips( chips, this.getIsUiSitOut() );
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

    clearUiAction() {
        this.uiEntityAvatar.clearUiAction();
    }

    setUiBetValue( betValue: number, color?: Color ) {

        this.uiBettingChips.show(betValue, ()=>{

        });
    }

    clearUiBetValue() {
        this.uiBettingChips.hide();
    }

    clearUiHandCards() {
        this.spriteHandCards[0].spriteFrame = null;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].spriteFrame = null;   
        this.spriteHandCards[1].node.active = false;

        this.spriteHandCards[0].color = Color.WHITE;
        this.spriteHandCards[1].color = Color.WHITE;
    }

    setUiHandCardsFold() {
        this.spriteHandCards[0].color = Color.GRAY;
        this.spriteHandCards[1].color = Color.GRAY;
    }

    setUiHandRank( rankName: string ) {
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
        this.timerDeltaTime = this.turnDuration;
        this.playTimeLimitSound = true;
    }

    endTurn() {
        this.uiEntityAvatar.endTurn();

        this.timerDeltaTime = 0;
        AudioController.instance.stopTimeLimitForSec();
    }

    setUiFold() {
        this.isFold = true;        
        this.uiEntityAvatar.setUiFold( true );
        this.timerDeltaTime = 0;
    }

    public setUiFoldCardAnimation() {

        let from: Node = this.rootHiddenCard;
        let to: Node = this.rootCardDeck;

        let original:Vec3 = new Vec3(from.position);

        let op: UIOpacity = from.getComponent(UIOpacity);
        if ( op != null ) {
            op.opacity = 255;
        }
        
        let duration = 0.2;
        let tw = tween( from )
        .set ({
            position: from.position,

        }).to ( duration, {
            position: to.position,
        }, {
            easing: this.easeOutQuad,
            onUpdate: ( target: Node, ratio: number )=> {
                let o = 255 - 255 * ratio;
                op.opacity = o;
            },
        });

        tw.call( ()=>{
            from.active = false;
            from.position = new Vec3(original);

            op.opacity = 255;
        } );
        tw.start();
    }

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
        if( 0 >= this.timerDeltaTime){
            return;
        }

        this.timerDeltaTime -= dt;
        if( 0 > this.timerDeltaTime){
            this.timerDeltaTime = 0;
            this.uiEntityAvatar.setShowTimer( false );
        }

        if( this.isMe == true && 4 >= this.timerDeltaTime && this.playTimeLimitSound ){
            this.playTimeLimitSound = false;
            AudioController.instance.playTimeLimitForSec();
        }

        if ( this.timerDeltaTime < 10 ) {
            if ( this.timerDeltaTime <= 5 ) {
                this.uiEntityAvatar.setWaitingTimerColor(Color.RED);
            } else {
                this.uiEntityAvatar.setWaitingTimerColor(Color.YELLOW);
            }

            this.uiEntityAvatar.setWaitingTimer(this.timerDeltaTime);
        }

        this.uiEntityAvatar.setWaitingTimerProgress( this.timerDeltaTime / this.turnDuration );
    }

    public getNickname(): string {
        return this.uiEntityAvatar.getNickname();
    }

    // setAnimationChipsMoveToPot( potChipUiNode: Node ): number {
    //     if( false == this.spriteActionValueRoot.node.active){
    //         return -1;
    //     }

    //     let target: Sprite = this.spriteBetChipAniGoToPotUi;

    //     let from = this.spriteBetChip.node.parent.getComponent( UITransform ).convertToWorldSpaceAR( this.originalBetChipPostition );
    //     from = target.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( from );

    //     let to = potChipUiNode.parent.getComponent( UITransform ).convertToWorldSpaceAR( potChipUiNode.position );
    //     to = target.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( to );

    //     let duration: number = 0.3;

    //     this.clearUiBetValue();

    //     this.setTweenFadeInFromToMove(target, new Color(Color.WHITE), from, to, duration, 1.5, this.easeOutQuad, ()=>{
    //         this.spriteBetChipAniGoToPotUi.node.active = false;            
    //     });

    //     return duration;
    // }

    public ResetBadges() {
        clearTimeout(this.timeOutNumber);

        this.nodeWinBadge.node.active = false;
        this.nodeDrawBadge.node.active = false;
        this.nodeReturnBadge.node.active = false;

        this.labelDrawAmount.string = "";
        this.labelWinAmount.string = "";
        this.labelReturnAmount.string = "";
    }

    public SetDraw( winAmount: number ) {

        this.ResetBadges();
        
        this.nodeDrawBadge.node.active = true;
        this.labelDrawAmount.string = "+" + CommonUtil.getKoreanNumber(winAmount);

        this.timeOutNumber = setTimeout(() => {
            this.ResetBadges();
        }, 2000);
    }

    public SetReturn( returnAmount: number ) {
        this.ResetBadges();

        this.nodeReturnBadge.node.active = true;
        this.labelReturnAmount.string =  "+" + CommonUtil.getKoreanNumber(returnAmount);

        this.timeOutNumber = setTimeout(() => {
            this.ResetBadges();
        }, 1200);
    }

    setAniWinner( winAmount: number ) {
        this.winTweens.forEach( elem => elem.stop() );

        this.winTweens = [];

        this.ResetBadges();

        this.nodeWinBadge.node.active = true;
        this.labelWinAmount.string =  "+" + CommonUtil.getKoreanNumber(winAmount);

        let ani1Tween = tween(this.spriteWinAnimation1.node)
        .call( () => {
            this.spriteWinAnimation1.color = new Color(255,255,255,1);
        })
        .to( 0.5, {}, {
            onUpdate: (target?: object, ratio?: number) => 
            {
                let a = 255 * ratio;
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation1.color = new Color(255,255,255,a);
            },
        }).union();

        let ani3Tween = tween(this.spriteWinAnimation3.node)
        .call( () => {
            this.spriteWinAnimation3.color = new Color(255,255,255,1);
            this.spriteWinAnimation3.node.position = new Vec3(this.vectorWinAnimation3);
        })
        .set( { 
            position: new Vec3(this.vectorWinAnimation3),
            scale: new Vec3(0.5, 0.5, 0.5)
        } )
        .to( 0.5, {
            scale: new Vec3(1,1,1)
        }, {
            easing: 'backOut',
            onUpdate: (target?: object, ratio?: number) =>
            {
                let a = 255 * ratio;
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation3.color = new Color(255,255,255,a);
            }
        })
        .to(3, {
            // position: new Vec3(this.vecWinAni3.x+20,this.vecWinAni3.y,this.vecWinAni3.z),
        }, {
            easing: "linear",
            onUpdate: (target?: object, ratio?: number) => 
            {
                let a = 255 * (1 - ratio);
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation3.color = new Color(255,255,255,a);
                this.spriteWinAnimation1.color = new Color(255,255,255,a);
            },
        }).union();

        let dest: Quat = Quat.IDENTITY.clone();

        let ani2Tween = tween( this.spriteWinAnimation2.node)
        .call( () => {
            this.spriteWinAnimation2.color = new Color(255,255,255,1);
            // this.sprWinAni2.node.scale = new Vec3( 0.5, 0.5, 0.5);
            this.spriteWinAnimation2.node.scale = new Vec3(1.15,1.15,1.15);
            this.spriteWinAnimation2.node.setRotation(dest);
        })
        .to( 2, {
            scale: new Vec3(0.7,0.7,0.7)
        }, {
            // easing: 'backOut',
            onUpdate: (target?: object, ratio?: number) =>
            {
                Quat.fromEuler( dest, 0, 0, 360 * 12 * ratio);
                this.spriteWinAnimation2.node.setRotation(dest);
            
                let a = bezier(0,500,255,0,ratio);
                let max: number = 255 * 0.7;
                if( a > max ){
                    a = max;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation2.color = new Color( 255,255,255, a); 
            },
        }).union();

        ani1Tween.start();
        ani3Tween.start();
        ani2Tween.start();

        this.winTweens.push(ani1Tween);
        this.winTweens.push(ani2Tween);
        this.winTweens.push(ani3Tween);

        this.timeOutNumber = setTimeout(() => {
            this.ResetBadges();
        }, 2000);
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

    prepareCardDispense() {
        this.spriteHiddenCards[0].node.active = false;
        this.spriteHiddenCards[1].node.active = false;

        this.spriteHandCardsBackground[0].node.active = false;
        this.spriteHandCardsBackground[1].node.active = false;

        this.rootHiddenCard.active = true;
        this.rootCards.active = true;
    }

    moveDeckToHiddenCard( card: number, index: number, duration: number, delay: number, cb: (idx: number)=>void ) {
        let target = this.spriteHiddenCards[card].node;

        let from = new Vec3(this.rootCardDeck.position);
        let to = new Vec3(this.spriteHiddenCards[card].node.position);

        target.active = false;

        if ( from == null || to == null ) {
            return;
        }

        AudioController.instance.playCardDispensing();                
        
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

    showPlayerCard() {
        this.hiddenCardFadeOut( this.spriteHiddenCards[0].node, 0.5, 1.0 );
        this.hiddenCardFadeOut( this.spriteHiddenCards[1].node, 0.5, 1.0 );
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

            // if (cb != null ) {
            //     cb( index );
            // }
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

}


