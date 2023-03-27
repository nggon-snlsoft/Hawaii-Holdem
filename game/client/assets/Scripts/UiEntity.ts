import { _decorator, Component, Node, Sprite, Label, Vec3, Color, Tween, SpriteFrame, UITransform, 
    resources, tween, Quat, bezier, Animation, Button, animation, UIOpacity } from 'cc';
import { Board } from './Board';

import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { UiBettingChips } from './Game/UiBettingChips';
import { EMOTICON_CHAT_MESSAGE, EMOTICON_TYPE } from './Game/UiGameChatting';
import { NetworkManager } from './NetworkManager';

const { ccclass, property } = _decorator;

@ccclass('UiEntity')
export class UiEntity extends Component {

    private isChildRegistered: boolean = false;
    private spriteAvatar: Sprite = null;
    private nodeNameTag: Node = null;
    public labelNickname: Label = null;
    private labelChips: Label = null;
    private labelSitOut: Label = null;
    public spriteHandCards: Sprite[] = [ null, null ];
    public spriteHandCardShadow: Sprite = null;

    private rootHiddenCard: Node = null;
    public spriteHiddenCards: Sprite[] = [ null, null ];
    public vectorHiddenCards: Vec3[] = [ null, null ];

    private spriteSelected: Sprite = null;
    private spriteTimer: Sprite = null;

    private timerBeginColor: Color = Color.YELLOW;
    private timerEndColor: Color = Color.RED;
    private timerDeltaTime: number = 0;
    private turnDuration: number = 20;
    private playTimeLimitSound: boolean = false;

    private posSymbols: {} = {};
    private dealable: Sprite = null;
    private spriteMissSmallBlind: Sprite = null;
    private spriteMissBigBlind: Sprite = null;
    private actions: {} = {};
    private actionFold: Sprite = null;
    private actionAllIn: Sprite = null;

    private spriteActionValueRoot: Sprite = null;
    private originalBetChipRootColor: Color = new Color( Color.WHITE );
    private originalBetChipRootPos: Vec3 = new Vec3( Vec3.ZERO );
    private spriteBetValueBackground: Sprite = null;
    private labelBetValue: Label = null;
    private spriteBetChip: Sprite = null;
    private spriteMuck: Sprite = null;
    private originalBetChipPostition: Vec3 = new Vec3( Vec3.ZERO );
    private spriteBetChipAniGoToPotUi: Sprite = null;

    private labelHandRank: Label = null;
    private nodeHandRankBackground: Node = null;

    public isFold: boolean = false;
    public isMe: boolean = false;
    public isUiSitOut: boolean = false;

    private spriteFoldCover: Node = null;

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

    private chips: number = 0;

    private nodeEmoticon: Node = null;
    private spriteEmoticon: Sprite = null;
    private nodeChatting: Node = null;
    private animationEmoticon: Animation = null;
    private animationChatting: Animation = null;

    private labelChatting: Label = null;
    private buttonAvatar: Button = null;
    private id:number = -1;

    private uiBettingChips: UiBettingChips = null;
    private labelWaitingTimer: Label = null;
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

        this.nodeNameTag = this.node.getChildByPath('NAME_TAG');
        this.nodeNameTag.active = false;

        this.labelNickname = this.node.getChildByPath('NAME_TAG/LABEL_NAME').getComponent(Label);
        this.labelNickname.string = 'EMPTY';
        this.labelChips = this.node.getChildByPath('NAME_TAG/LABEL_CHIPS').getComponent(Label);
        this.labelChips.node.active = false;
        this.labelSitOut = this.node.getChildByPath('NAME_TAG/LABEL_SIT_OUT').getComponent(Label);
        this.labelSitOut.node.active = false;
        this.spriteTimer = this.node.getChildByPath('SPRITE_TIMER').getComponent(Sprite);
        this.spriteTimer.node.active = false;
        this.spriteSelected = this.node.getChildByPath('SPRITE_SELECTED').getComponent(Sprite);
        this.spriteSelected.node.active = false;
        this.spriteAvatar = this.node.getChildByPath('AVATAR/SPRITE/SPRITE_AVATAR').getComponent(Sprite);
        this.buttonAvatar = this.node.getChildByPath('AVATAR').getComponent(Button);
        this.buttonAvatar.node.on('click', this.onClickAvatar.bind(this), this );
        this.spriteAvatar.node.active = false;
        this.chips = 0;

        this.spriteHandCards[0] = this.node.getChildByPath('SPRITE_HANDCARD_01').getComponent(Sprite);
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1] = this.node.getChildByPath('SPRITE_HANDCARD_02').getComponent(Sprite);
        this.spriteHandCards[1].node.active = false;
        
        this.spriteHandCardShadow = this.node.getChildByPath('SPRITE_HANDCARD_03').getComponent(Sprite);
        this.spriteHandCardShadow.node.active = false;

        this.rootHiddenCard = this.node.getChildByPath('HIDDEN_CARD');
        if ( this.rootHiddenCard != null ) {
            this.rootHiddenCard.active = false;
        }

        this.spriteHiddenCards[0] = this.node.getChildByPath('HIDDEN_CARD/CARD_01').getComponent(Sprite);
        if ( this.spriteHiddenCards[0] != null ) {
            this.vectorHiddenCards[0] = new Vec3(this.spriteHiddenCards[0].node.position);
            this.spriteHiddenCards[0].node.active = false;            
        }

        this.spriteHiddenCards[1] = this.node.getChildByPath('HIDDEN_CARD/CARD_02').getComponent(Sprite);
        if ( this.spriteHiddenCards[1] != null ) {
            this.vectorHiddenCards[1] = new Vec3(this.spriteHiddenCards[1].node.position);
            this.spriteHiddenCards[1].node.active = false;            
        }

        this.nodeHandRankBackground = this.node.getChildByPath('SPRITE_HAND_RANK');
        this.nodeHandRankBackground.active = false;

        this.labelHandRank = this.node.getChildByPath('SPRITE_HAND_RANK/LABEL_HAND_RANK').getComponent(Label);
        this.labelHandRank.node.on(Node.EventType.SIZE_CHANGED, () => {
            let uiTransLB = this.labelHandRank.node.getComponent(UITransform);
            let uiTransSpr = this.nodeHandRankBackground.getComponent(UITransform);
            uiTransSpr.setContentSize(uiTransLB.contentSize.width + 40, uiTransSpr.height);
        }, this);
        this.labelHandRank.node.active = false;
        
        this.spriteFoldCover = this.node.getChildByPath('AVATAR/SPRITE/SPRITE_FOLD');
        this.spriteFoldCover.active = false;

        this.actionFold = this.node.getChildByPath('ACTION_FOLD').getComponent(Sprite);
        this.actionFold.node.active = false;
        this.actionAllIn = this.node.getChildByPath('ACTION_ALLIN').getComponent(Sprite);
        this.actionAllIn.node.active = false;

        this.actions['call'] = this.node.getChildByPath('ACTION_CALL').getComponent(Sprite);
        this.actions['call'].node.active = false;
        this.actions['check'] = this.node.getChildByPath('ACTION_CHECK').getComponent(Sprite);
        this.actions['check'].node.active = false;
        this.actions['bet'] = this.node.getChildByPath('ACTION_BET').getComponent(Sprite);
        this.actions['bet'].node.active = false;
        this.actions['raise'] = this.node.getChildByPath('ACTION_RAISE').getComponent(Sprite);
        this.actions['raise'].node.active = false;
        
        this.posSymbols['dealer'] = this.node.getChildByPath('DEALER_BUTTON').getComponent(Sprite);
        this.posSymbols['dealer'].node.active = false;
        
        this.posSymbols['sb'] = this.node.getChildByPath('BLIND_SMALL').getComponent(Sprite);
        this.posSymbols['sb'].node.active = false;
        
        this.posSymbols['bb'] = this.node.getChildByPath('BLIND_BIG').getComponent(Sprite);
        this.posSymbols['bb'].node.active = false;

        this.dealable = this.node.getChildByPath('DEALABLE').getComponent(Sprite);
        this.dealable.node.active = false;

        this.spriteMissSmallBlind = this.node.getChildByPath('BLIND_SMALL_MISS').getComponent(Sprite);
        this.spriteMissSmallBlind.node.active = false;

        this.spriteMissBigBlind = this.node.getChildByPath('BLIND_BIG_MISS').getComponent(Sprite);
        this.spriteMissBigBlind.node.active = false;

        this.spriteActionValueRoot = this.node.getChildByPath('SPRITE_ACTION_VALUE').getComponent(Sprite);
        this.spriteActionValueRoot.node.active = false;
        
        this.spriteBetValueBackground = this.node.getChildByPath('SPRITE_ACTION_VALUE').getComponent(Sprite);
        this.spriteBetValueBackground.node.active = false;

        this.labelBetValue = this.node.getChildByPath('SPRITE_ACTION_VALUE/Label').getComponent(Label);
        this.labelBetValue.node.active = false;

        this.spriteBetChip = this.node.getChildByPath('SPRITE_ACTION_VALUE/SPRITE_CHIP').getComponent(Sprite);
        this.spriteBetChip.node.active = false;

        this.spriteMuck = this.node.getChildByPath('SPRITE_MUCK').getComponent(Sprite);
        this.spriteMuck.node.active = false;

        this.spriteBetChipAniGoToPotUi = this.node.getChildByPath('SPRITE_BET_CHIP_ANI_GOTO_POT').getComponent(Sprite);
        this.spriteBetChipAniGoToPotUi.node.active = false;

        this.originalBetChipPostition = new Vec3(this.spriteBetChip.node.position);

        this.originalBetChipRootColor = new Color( this.spriteActionValueRoot.color);
        this.originalBetChipRootPos = new Vec3(this.spriteActionValueRoot.node.position);

        this.bezierPoints = [];
        for(let i=0; i<2; i++){
            let point = this.node.getChildByPath(`BEZIER_POINT${i+1}`);
            this.bezierPoints.push(point);
        }

        this.spriteWinAnimation1 = this.node.getChildByPath('SPRITE_WIN_ANI1').getComponent(Sprite);
        this.spriteWinAnimation1.node.active = true;
        this.spriteWinAnimation1.color = new Color(255,255,255,1);

        this.spriteWinAnimation2 = this.node.getChildByPath('SPRITE_WIN_ANI2').getComponent(Sprite);
        this.spriteWinAnimation2.node.active = true;
        this.spriteWinAnimation2.color = new Color(255,255,255,1);

        this.spriteWinAnimation3 = this.node.getChildByPath('SPRITE_WIN_ANI3').getComponent(Sprite);
        this.spriteWinAnimation3.node.active = true;
        this.spriteWinAnimation3.color = new Color(255,255,255,1);
        this.vectorWinAnimation3 = new Vec3(this.spriteWinAnimation3.node.position);

        this.nodeWinBadge = this.node.getChildByPath('SPRITE_WIN').getComponent(Sprite);
        this.nodeWinBadge.node.active = false;

        this.labelWinAmount = this.node.getChildByPath('SPRITE_WIN/LABEL_VALUE').getComponent(Label);
        this.labelWinAmount.node.active = true;

        this.nodeDrawBadge = this.node.getChildByPath('SPRITE_DRAW').getComponent(Sprite);
        this.nodeDrawBadge.node.active = false;

        this.labelDrawAmount = this.node.getChildByPath('SPRITE_DRAW/LABEL_VALUE').getComponent(Label);
        this.labelDrawAmount.node.active = true;

        this.nodeReturnBadge = this.node.getChildByPath('SPRITE_RETURN').getComponent(Sprite);
        this.nodeReturnBadge.node.active = false;

        this.labelReturnAmount = this.node.getChildByPath('SPRITE_RETURN/LABEL_VALUE').getComponent(Label);
        this.labelReturnAmount.node.active = true;

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

        this.labelWaitingTimer = this.node.getChildByPath('LABEL_WAITING_TIMER').getComponent(Label);
        this.labelWaitingTimer.string = '';
        this.labelWaitingTimer.node.active = false;

        let n = this.node.getChildByPath('BETTING_CHIPS');
        if ( n != null ) {
            this.uiBettingChips = n.getComponent(UiBettingChips);
            if ( this.uiBettingChips != null ) {
                this.uiBettingChips.init();
            }
        }

        this.isPlaying = false;
        this.node.active = false;

        this.rootCardDeck = this.node.getChildByPath('NODE_CARD_DECK');
    }

    setPotChips( target: Node ) {
        if ( target != null ) {
            this.uiBettingChips.setPotChips(target);
        }
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

        let s = Number(entity.avatar);
        CommonUtil.setAvatarSprite(s, this.spriteAvatar, ()=>{
            this.spriteAvatar.node.active = true;
        });

        this.setNickname( entity.nickname );
        this.setUiChips( entity.chips );

        this.nodeNameTag.active = true;

        this.endTurn();
        this.clearUiAction();
        this.clearUiBetValue();
    
        this.clearUiHandCards();
        this.clearUiHandRank();
        this.clearMissButton();

        this.clearUiMuck();

        this.isPlaying = true;

        this.isFold = entity.fold;
        this.node.active = true;

        if( true == this.isFold){
            this.setUiFold();
            return;
        }
        else {
            this.spriteFoldCover.active = false;            
        }

        if( true == entity.wait ){
            this.setUiWait();
            return;
        }
        else {
            this.spriteFoldCover.active = false;                        
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
        this.actionAllIn.node.active = false;
        this.actionFold.node.active = false;

        this.endTurn();

        this.clearUiAction();
        this.clearUiBetValue();

        this.clearUiHandCards();
        this.clearUiHandRank();
        this.clearUiMuck();

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

    public setChipsMoveToPot() {
        if ( this.uiBettingChips != null ) {
            this.uiBettingChips.moveChipsToPot();
        }
    }

    setEscapee() {
        this.labelNickname.string = 'empty';
        this.labelChips.node.active = false;
        this.labelSitOut.node.active = false;
        this.spriteTimer.node.active = false;
        this.spriteSelected.node.active = false;
        this.spriteAvatar.node.active = false;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].node.active = false;
        this.spriteHandCardShadow.node.active = false;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].node.active = false;
        this.nodeHandRankBackground.active = false;
        this.labelHandRank.node.active = false;
        this.spriteFoldCover.active = true;
        this.actionFold.node.active = false;
        this.actionAllIn.node.active = false;
        this.actions['call'].node.active = false;
        this.actions['check'].node.active = false;
        this.actions['bet'].node.active = false;
        this.actions['raise'].node.active = false;
        this.posSymbols['dealer'].node.active = false;
        this.posSymbols['sb'].node.active = false;
        this.posSymbols['bb'].node.active = false;
        this.dealable.node.active = false;
        this.clearMissButton();
        //this.lbWinAmount.node.active = false;
        this.spriteActionValueRoot.node.active = false;
        this.spriteBetValueBackground.node.active = false;
        this.labelBetValue.node.active = false;
        this.spriteBetChip.node.active = false;
        this.spriteMuck.node.active = false;
        this.callbackProfileOpen = null;
        this.callbackProfileClose = null;
        this.chips = 0;

        this.isPlaying = false;

        this.node.active = false;

        this.ResetBadges();
    }

    setUiWait() {
        this.spriteFoldCover.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

        this.clearUiAction();
        this.clearUiBetValue();
    }

    setUiPlay() {
        this.actionAllIn.node.active = false;
        this.actionFold.node.active = false;

        this.spriteFoldCover.active = false;
        this.spriteSelected.node.active = false;
        this.spriteTimer.node.active = true;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

        this.clearUiAction();
        this.clearUiBetValue();
    }

    setNickname ( name: string ) {
        this.labelNickname.string = name;
    }

    setUiChips( chips: number ) {
        this.chips = chips;
        if ( this.labelChips != null ) {
            this.labelChips.color = new Color(255, 200, 70);

            this.labelChips.string = CommonUtil.getKoreanNumber(chips);
            if ( this.isUiSitOut == true ) {
                this.setUiSitOut();
            } else {
                this.setUiSitBack();
            }
        }
    }

    setUiBlindBet( chips: number, isSB: boolean, isBB:boolean ) {
        let timeOutId: number = -1;
        if ( this.isUiSitOut == true ) {
            this.setUiSitOut();
        } else {
            this.setUiSitBack();
        }

        if ( true === isBB ) {
            this.labelChips.color = new Color(100, 150, 180);
            this.labelChips.string = "빅블라인드"
        } else {
            if ( true === isSB ) {
                this.labelChips.color = new Color(100, 150, 180);
                this.labelChips.string = "스몰블라인드"
            }
        }

        if ( true === isBB || true === isSB ) {
            timeOutId = setTimeout(() => {
                clearTimeout(timeOutId);
                this.setUiChips(chips);
            }, 2000);
        } else {
            this.setUiChips(chips);
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

    setDealable( show: boolean ) {
        this.dealable.node.active = show;
    }

    clearUiPositionSymbol() {
        let keys = Object.keys(this.posSymbols);
        keys.forEach(element => {
            let v: Sprite = this.posSymbols[element];
            v.node.active = false;
        });
    }

    setUiAction( action: string ) {
        let keys = Object.keys(this.actions);
        keys.forEach(element => {
            let v: Sprite = this.actions[element];
            v.node.active = (element == action);
        });
    }

    clearUiAction() {
        let keys = Object.keys(this.actions);
        keys.forEach(element => {
            let v: Sprite = this.actions[element];
            v.node.active = false;
        });
    }

    setUiBetValue( betValue: number, color?: Color ) {

        this.uiBettingChips.show(betValue, ()=>{
            this.spriteActionValueRoot.node.active = (betValue > 0);
            this.labelBetValue.string = CommonUtil.getKoreanNumber(betValue);
            this.labelBetValue.node.active = (betValue > 0);
            this.spriteBetChip.node.active = (betValue > 0);
        });
    }

    clearUiBetValue() {
        this.uiBettingChips.hide();
        
        this.spriteActionValueRoot.node.active = false;
        this.labelBetValue.string = '0';
        this.labelBetValue.node.active = false;
        this.spriteBetChip.node.active = false;
    }

    setUiMuck() {
        this.spriteMuck.node.active = true;
    }

    clearUiMuck() {
        this.spriteMuck.node.active = false;
    }

    clearUiHandCards() {
        this.spriteHandCards[0].spriteFrame = null;
        this.spriteHandCards[0].node.active = false;
        this.spriteHandCards[1].spriteFrame = null;   
        this.spriteHandCards[1].node.active = false;
        this.spriteHandCardShadow.node.active = false;

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
        this.nodeHandRankBackground.active = true;
        this.labelHandRank.string = rankName;
        this.labelHandRank.node.active = true;
    }

    clearUiHandRank() {
        this.nodeHandRankBackground.active = false;
        this.labelHandRank.node.active = false;
        this.labelHandRank.string = '';
    }

    setAvatarImage( avatar: SpriteFrame ) {
        this.spriteAvatar.spriteFrame = avatar;
        this.spriteAvatar.node.active = null != avatar ;
    }

    clearAvatarImage() {
        this.spriteAvatar.spriteFrame = null;
        this.spriteAvatar.node.active = false;
    }

    setMissSmallBlindButton( sb: boolean) {
        this.spriteMissSmallBlind.node.active = sb;
    }

    setMissBigBlindButton( bb: boolean ) {
        this.spriteMissBigBlind.node.active = bb;
    }

    clearMissButton() {
        this.spriteMissSmallBlind.node.active = false;
        this.spriteMissBigBlind.node.active = false;
    }

    startTurn( duration: number ) {
        this.turnDuration = duration / 1000;
        this.spriteSelected.node.active = true;
        this.spriteTimer.node.active = true;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.color = this.timerBeginColor;
        this.spriteTimer.node.active = true;
        this.timerDeltaTime = this.turnDuration;
        this.playTimeLimitSound = true;
    }

    endTurn() {
        this.spriteSelected.node.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.timerDeltaTime = 0;

        this.labelWaitingTimer.node.active = false;
        AudioController.instance.stopTimeLimitForSec();
    }

    setUiFold() {
        this.clearUiAction();
        this.isFold = true;
        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.spriteFoldCover.active = true;
        this.spriteSelected.node.active = false;
        this.timerDeltaTime = 0;
        this.actionFold.node.active = true;

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
        this.clearUiAction();
        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.spriteSelected.node.active = false;
        
        this.timerDeltaTime = 0;
        this.actionAllIn.node.active = true;
    }

    setUiSitOut() {
        this.isUiSitOut = true;
        this.labelChips.node.active = false;
        this.labelSitOut.node.active = true;
    }

    public getIsUiSitOut(): boolean {
        return this.isUiSitOut;
    }

    setUiSitBack() {
        this.isUiSitOut = false;
        this.labelChips.node.active = true;
        this.labelSitOut.node.active = false;
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
            this.spriteTimer.node.active = false;
        }

        if( this.isMe == true && 4 >= this.timerDeltaTime && this.playTimeLimitSound ){
            this.playTimeLimitSound = false;
            AudioController.instance.playTimeLimitForSec();
        }

        if ( this.timerDeltaTime < 10 ) {
            if ( this.timerDeltaTime <= 5 ) {
                this.labelWaitingTimer.color = Color.RED;

            } else {
                this.labelWaitingTimer.color = Color.YELLOW;
            }

            this.labelWaitingTimer.string = Math.floor( this.timerDeltaTime ).toString();
            this.labelWaitingTimer.node.active = true;
        }

        this.spriteTimer.fillRange = this.timerDeltaTime / this.turnDuration;

        Color.lerp(this.spriteTimer.color, this.timerEndColor, this.timerBeginColor,this.timerDeltaTime / this.turnDuration);
    }

    setAnimationChipsMoveToPot( potChipUiNode: Node ): number {
        if( false == this.spriteActionValueRoot.node.active){
            return -1;
        }

        let target: Sprite = this.spriteBetChipAniGoToPotUi;

        let from = this.spriteBetChip.node.parent.getComponent( UITransform ).convertToWorldSpaceAR( this.originalBetChipPostition );
        from = target.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( from );

        let to = potChipUiNode.parent.getComponent( UITransform ).convertToWorldSpaceAR( potChipUiNode.position );
        to = target.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( to );

        let duration: number = 0.3;

        this.clearUiBetValue();

        this.setTweenFadeInFromToMove(target, new Color(Color.WHITE), from, to, duration, 1.5, this.easeOutQuad, ()=>{
            this.spriteBetChipAniGoToPotUi.node.active = false;            
        });

        return duration;
    }

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
        this.rootHiddenCard.active = true;
        this.spriteHiddenCards[0].node.active = false;
        this.spriteHiddenCards[1].node.active = false;
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


