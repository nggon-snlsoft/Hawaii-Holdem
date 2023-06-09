import { _decorator, Component, Node, Label, Color, native, Sprite, Vec3, Animation, animation, tween, Quat, Tween, bezier, SpriteFrame, color } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

const TIMER_BEGIN_COLOR: Color = Color.YELLOW;
const TIMER_END_COLOR: Color = Color.RED;

export enum ENUM_STATUS_TYPE {
    NONE,
    FOLD,
    WAITING,
    SITOUT,
}

@ccclass('UiEntityAvatar')
export class UiEntityAvatar extends Component {
    @property(SpriteFrame) spriteFrameStatus: SpriteFrame[] = [];

    private entity: any = null;

    private rootSelected: Node = null;
    private rootNameTag: Node = null;
    private rootActions: Node = null;
    private rootStatus: Node = null;

    private spriteAvatarProfile: Sprite = null;
    private spriteTimer: Sprite = null;
    private spriteDimmed: Sprite = null;
    private spriteStatus: Sprite = null;
    private spriteFold: Sprite = null;
    private SPRITE_NAME_TAG: Sprite = null;

    private labelNickname: Label = null;
    private labelChips: Label = null;
    private labelBlind: Label = null;    
    private labelWaitingTimer: Label = null;

    private actions: {} = {};

    private isChildRegisted: boolean = false;
    private isFold: boolean = false;
    private isMe: boolean = false;
    private uiEntity: any = null;

    private SPRITE_FOLD: Sprite = null;
    private SPRITE_ALLIN: Sprite = null;
    private SPRITE_FRAME: Sprite = null;

    init() {
        this.childRegistered();
        this.isFold = false;
        this.node.active = false;
    }

    SetAvatar( uiEntity: any, entity: any, isMe: boolean ) {
        this.uiEntity = uiEntity;
        this.entity = entity;
        this.isMe = isMe;

        this.labelBlind.node.active = false;
        this.labelChips.node.active = true;

        this.SetNickname( entity.nickname );
        this.SetChips( entity.chips );

        this.SetPlayerThumbnail( entity.avatar );

        if ( entity.isSitout == true ) {
            this.SetStatus( ENUM_STATUS_TYPE.SITOUT );
        } else if ( entity.wait == true ) {
            this.SetStatus( ENUM_STATUS_TYPE.WAITING );
        } else {
            this.SetStatus( ENUM_STATUS_TYPE.NONE );
        }
        this.rootNameTag.active = true;
        this.isFold = false;
        this.node.active = true;
    }

    public SetNickname( name: string ) {
        this.labelNickname.string = name;        
    }

    public GetNickname() {
        return this.entity.nickname;
    }

    public SetChips( chips: number ) {
        this.labelChips.color = new Color(255, 200, 70);
        this.labelChips.string = CommonUtil.getKoreanNumber( chips );
    }

    public SetShowChips() {
        this.labelBlind.node.active = false;
        this.labelChips.node.active = true;
    }

    public SetSmallBlind() {
        this.labelBlind.string = '스몰블라인드';
        this.labelBlind.node.active = true;

        this.labelChips.node.active = false;
    }

    public SetBigBlind() {
        this.labelBlind.string = '빅블라인드';
        this.labelBlind.node.active = true;

        this.labelChips.node.active = false;
    }

    private SetPlayerThumbnail ( avatar ) {
        let s = Number( avatar );
        let sf: SpriteFrame = ResourceManager.Instance().getAvatarImage(s);
        if ( sf != null )
        {
            this.spriteAvatarProfile.spriteFrame = ResourceManager.Instance().getAvatarImage(s);
            this.spriteAvatarProfile.node.active = true;
        }
    }

    public clearUiBetValue() {

    }

    public SetAction( action: string ) {
        let keys = Object.keys( this.actions );
        keys.forEach( (e)=> {
            let v: Node = this.actions[ e ];
            v.active = ( e == action );
        } );
        this.rootActions.active = true;
    }

    public SetPlay() {
        this.rootSelected.active = false;

        this.spriteTimer.node.active = true;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

        this.isFold = false;

        this.SetStatus( ENUM_STATUS_TYPE.NONE );
        this.ClearAction();

        this.SET_PLAY();
    }

    public ClearAction() {
        let keys = Object.keys( this.actions );
        keys.forEach ( (e)=> {
            let v: Node = this.actions[e];
            v.active = false;
        });
        this.rootActions.active = false;
    }

    public CLEAR_ROUND_ACTION() {
        let keys = Object.keys( this.actions );
        this.rootActions.active = false;
        keys.forEach ( (e)=> {
            if ( e == 'fold' || e == 'allin') {
                this.rootActions.active = true;
            } else {
                let v: Node = this.actions[e];
                v.active = false;                
            }
        });
    }

    public endTurn() {
        this.rootSelected.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.labelWaitingTimer.node.active = false;
    }

    public setEscape() {
        // this.labelSitout.node.active = false;
        this.rootActions.active = false;
        this.hide();
    }

    public startTurn() {
        this.rootSelected.active = true;

        this.spriteTimer.node.active = true;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.color = TIMER_BEGIN_COLOR;
        this.spriteTimer.node.active = true;
    }

    public SET_UI_FOLD( isFold: boolean ) {
        this.isFold = isFold;

        if ( isFold == true ) {
            this.ClearAction();

            this.spriteTimer.fillRange = 0;
            this.spriteTimer.node.active = false;
            // this.rootSelected.active = false;
            this.SetAction('fold');

            // this.spriteDimmed.node.active = true;
            // this.spriteFold.node.active = true;
            // this.rootStatus.active = true;
            
            this.SET_FOLD();
        } else {
            this.SPRITE_FOLD.node.active = false;
            // this.spriteFold.node.active = false;
            // if ( this.spriteStatus.node.active == true ) {
            //     this.spriteDimmed.node.active = true;
            // } else {
            //     this.spriteDimmed.node.active = false;
            //     this.rootStatus.active = false;
            // }
        }
    }

    private SET_FOLD() {
        this.SPRITE_FOLD.node.active = true;
        this.SPRITE_ALLIN.node.active = false;

        // if ( this.isMe != true ) {
        //     this.labelChips.node.active = false;
        //     this.labelNickname.node.active = false;
        //     this.labelBlind.node.active = false;
        // }

        this.SET_DIMMED( true );
    }

    private SET_PLAY() {
        this.SPRITE_FOLD.node.active = false;
        this.SPRITE_ALLIN.node.active = false;

        this.labelChips.node.active = true;
        this.labelNickname.node.active = true;

        this.SET_DIMMED( false );
    }

    public SetWait( entity: any ) {
        this.spriteTimer.node.active = false;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

        this.endTurn();

        if ( entity != null ) {
            this.entity = entity;
            if ( entity.isSitOut == true ) {
                this.SetStatus( ENUM_STATUS_TYPE.SITOUT );
            } else {
                this.SetStatus( ENUM_STATUS_TYPE.WAITING );
            }
        }
    }

    public SetAllIn() {
        this.ClearAction();

        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;

        this.SetAction('allin');
        this.SET_ALLIN();
    }

    private SET_ALLIN() {
        this.SPRITE_ALLIN.node.active = true;        
        this.SPRITE_FOLD.node.active = false;

        // if ( this.isMe != true ) {
        //     this.labelChips.node.active = false;
        //     this.labelNickname.node.active = false;
        //     this.labelBlind.node.active = false;
        // }

        this.SET_DIMMED( true );
    }

    private SET_DIMMED( isDimmed: boolean ) {
        if ( isDimmed == true ) {
            this.SPRITE_FRAME.color = new Color(80, 80, 80);
            this.spriteAvatarProfile.color = new Color(80, 80, 80);

            this.labelChips.color = new Color(80, 80, 80);
            this.labelNickname.color = new Color(80, 80, 80);

            this.SPRITE_NAME_TAG.color = new Color(80, 80, 80, 80);

        } else {
            this.SPRITE_FRAME.color = new Color(255, 255, 255);
            this.spriteAvatarProfile.color = new Color(255, 255, 255);

            this.labelChips.color = new Color(255, 200, 70);
            this.labelNickname.color = new Color(255, 255, 255);

            this.SPRITE_NAME_TAG.color = new Color(255, 255, 255);
        }        
    }

    public SetSitout() {
        this.SetStatus(ENUM_STATUS_TYPE.SITOUT);
    }

    public SetSitback( msg: any ) {
        let wait = msg['wait'];
        let fold = msg['fold'];

        if ( wait == true ) {
            this.SetStatus(ENUM_STATUS_TYPE.WAITING);
        }
        else if ( fold == true ) {
            this.SET_UI_FOLD( fold );
        } else {
            this.SetStatus(ENUM_STATUS_TYPE.NONE);
        }
    }

    public SetSitbackStatus() {
        this.SetStatus(ENUM_STATUS_TYPE.NONE);
    }

    public setShowTimer( show: boolean ) {
        this.spriteTimer.node.active = show;
    }

    public setWaitingTimerColor(color: Color) {
        this.labelWaitingTimer.color = color;
    }

    public setWaitingTimer(delta: number) {
        this.labelWaitingTimer.string = Math.floor( delta ).toString();
        this.labelWaitingTimer.node.active = true;
    }

    public setWaitingTimerProgress( progress: number ) {
        this.spriteTimer.fillRange = progress;
        Color.lerp(this.spriteTimer.color, TIMER_END_COLOR, TIMER_BEGIN_COLOR, progress );
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    SetStatus( type: ENUM_STATUS_TYPE ) {
        switch ( type ) {
            case ENUM_STATUS_TYPE.NONE:
                {
                    this.spriteStatus.node.active = false;
                    this.rootStatus.active = false;
                }
                break;
            case ENUM_STATUS_TYPE.WAITING:
                {
                    let sf: SpriteFrame = this.spriteFrameStatus[1];
                    this.spriteStatus.spriteFrame = sf;
                    this.spriteStatus.node.active = true;
                    this.rootStatus.active = true;
                }

                break;
            case ENUM_STATUS_TYPE.SITOUT:
                {
                    let sf: SpriteFrame = this.spriteFrameStatus[2];
                    this.spriteStatus.spriteFrame = sf;
                    this.spriteStatus.node.active = true;
                    this.rootStatus.active = true;

                    // if ( this.isMe == true ) {
                    //     this.SET_UI_FOLD( false );
                    // }
                }

                break;
            default:
                this.spriteStatus.node.active = false;
                this.rootStatus.active = false;
                this.SET_DIMMED( false );
        }
    }

    childRegistered() {
        if ( this.isChildRegisted == true ) {
            return;
        }

        this.rootSelected = this.node.getChildByPath('SELECTED');
        if (this.rootSelected != null ) {
            this.rootSelected.active = false;
        }

        this.SPRITE_FRAME = this.node.getChildByPath('FRAME').getComponent(Sprite);
        if (this.SPRITE_FRAME != null ) {
            this.SPRITE_FRAME.node.active = true;
        }

        this.spriteAvatarProfile = this.node.getChildByPath('THUMBNAIL/SPRITE_AVATAR').getComponent(Sprite);
        if ( this.spriteAvatarProfile != null ) {
            this.spriteAvatarProfile.node.active = false;
        }

        this.spriteTimer = this.node.getChildByPath('SPRITE_TIMER').getComponent(Sprite);
        if ( this.spriteTimer != null ) {
            this.spriteTimer.node.active = false;
        }

        this.labelWaitingTimer = this.node.getChildByPath('LABEL_WAITING_TIMER').getComponent(Label);
        if ( this.labelWaitingTimer != null ) {
            this.labelWaitingTimer.node.active = false;
        }

        this.rootNameTag = this.node.getChildByPath('NAME_TAG');
        if ( this.rootNameTag != null ) {
            this.labelNickname = this.rootNameTag.getChildByPath('LABEL_NAME').getComponent(Label);
            this.labelChips = this.rootNameTag.getChildByPath('LABEL_CHIPS').getComponent(Label);
            this.labelBlind = this.rootNameTag.getChildByPath('LABEL_BLIND').getComponent(Label);

            this.SPRITE_NAME_TAG = this.rootNameTag.getChildByPath('NAME_TAG_BACK').getComponent(Sprite);
            if ( this.SPRITE_NAME_TAG != null ) {
                this.SPRITE_NAME_TAG.node.active = true;
            }

            this.SPRITE_FOLD = this.rootNameTag.getChildByPath('SPRITE_FOLD').getComponent( Sprite );
            if ( this.SPRITE_FOLD != null ) {
                this.SPRITE_FOLD.node.active = false;
            }

            this.SPRITE_ALLIN = this.rootNameTag.getChildByPath('SPRITE_ALLIN').getComponent( Sprite );
            if ( this.SPRITE_ALLIN != null ) {
                this.SPRITE_ALLIN.node.active = false;
            }

            this.rootNameTag.active = false;
        }

        this.rootActions = this.node.getChildByPath('ACTIONS');
        if ( this.rootActions != null ) {
            this.actions['call'] = this.rootActions.getChildByPath('CALL');
            this.actions['call'].active = false;

            this.actions['check'] = this.rootActions.getChildByPath('CHECK');
            this.actions['check'].active = false;

            this.actions['bet'] = this.rootActions.getChildByPath('BET');
            this.actions['bet'].active = false;

            this.actions['raise'] = this.rootActions.getChildByPath('RAISE');
            this.actions['raise'].active = false;

            this.actions['fold'] = this.rootActions.getChildByPath('FOLD');
            this.actions['fold'].active = false;

            this.actions['allin'] = this.rootActions.getChildByPath('ALLIN');
            this.actions['allin'].active = false;            

            this.rootActions.active = false;
        }

        this.rootStatus = this.node.getChildByPath('STATUS');
        if ( this.rootStatus != null ) {
            this.spriteDimmed = this.rootStatus.getChildByPath('DIMMED').getComponent(Sprite);
            if ( this.spriteDimmed != null ) {
                this.spriteDimmed.node.active = false;
            }

            this.spriteFold = this.rootStatus.getChildByPath('SPRITE_FOLD').getComponent( Sprite );
            if ( this.spriteFold != null ) {
                this.spriteFold.node.active = false;
            }

            this.spriteStatus = this.rootStatus.getChildByPath('SPRITE_STATUS').getComponent(Sprite);
            if ( this.spriteStatus != null ) {
                this.spriteStatus.node.active = false;
            }

            this.rootStatus.active = false;
        }

        this.isChildRegisted = true;
    }
}

