import { _decorator, Component, Node, Sprite, Vec3, Animation } from 'cc';
import { ENUM_CARD_TYPE } from '../HoldemDefines';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {
    @property(Sprite) spriteCard: Sprite = null;
    @property(Sprite) spriteHighlight: Sprite = null;
    @property(Sprite) spriteDimmed: Sprite = null;

    private vec3Original: Vec3 = null;
    private anim: Animation = null;
    private num: number = 0;
    private type: ENUM_CARD_TYPE = ENUM_CARD_TYPE.NONE;
    private flipDone: ()=>void = null;

    public Init( type: ENUM_CARD_TYPE ) {
        this.type = type;

        this.vec3Original = new Vec3( this.node.position );
        this.spriteCard.node.position = new Vec3(0, 0, 0);
        this.spriteHighlight.node.position = new Vec3(0, 0, 0);
        this.spriteDimmed.node.position = new Vec3(0, 0, 0);

        this.num = 0;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage( this.num );
        this.spriteHighlight.node.active= false;
        this.spriteDimmed.node.active = false;

        if ( this.type != ENUM_CARD_TYPE.NONE && this.type != ENUM_CARD_TYPE.PLAYER_HIDDEN ) {
            this.anim = this.node.getComponent(Animation);
            if ( this.anim != null ) {
                this.anim.on('finished', this.OnFlipFinished.bind(this), this);
            }
        }

        this.spriteCard.node.active = false;
        this.node.active = false;
    }

    public Show() {
        this.spriteCard.node.active = true;
        this.node.active = true;
    }

    public ShowFlip( num: number, delay: number, done: ()=>void = null ) {
        if ( done != null ) {
            this.flipDone = done;
        }

        this.num = num;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage(0);
        this.spriteCard.node.active = true;
        this.node.active = true;

        this.scheduleOnce(()=>{
            this.anim.play();
        }, delay );
    }

    public ShowImmediate( num: number ) {
        this.num = num;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage( this.num + 1 );
        this.spriteCard.node.active = true;
        this.node.active = true;        
    }

    public Fold() {
        this.spriteDimmed.node.active = true;
    }

    public SetWinCard( pools: number[] ) {
        console.log('SetWinCard');

        let c = pools.find( (e)=>{
            return e == this.num;
        });

        if ( c != null ) {
            this.spriteHighlight.node.active = true;
            this.spriteDimmed.node.active = false;

            this.node.position = new Vec3( this.vec3Original.x, this.vec3Original.y + 30, this.vec3Original.z);
        } else {
            this.spriteHighlight.node.active = false;
            this.spriteDimmed.node.active = true;            
        }
    }

    public Hide() {
        this.node.active = false;
    }

    public ResetPosition() {
        this.node.position = new Vec3( this.vec3Original );
        this.spriteCard.node.position = new Vec3(0, 0, 0);
        this.spriteHighlight.node.position = new Vec3(0, 0, 0);
        this.spriteDimmed.node.position = new Vec3(0, 0, 0);
    }

    public Reset() {
        this.anim.stop();

        this.num = 0;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage( this.num );

        this.ResetPosition();

        this.spriteHighlight.node.active = false;
        this.spriteDimmed.node.active = false;

        this.node.active = false;
    }

    OnFlipFinished() {
        this.anim.stop();
        let card: number = this.num + 1;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage( card );
        
        if ( this.flipDone != null ) {
            this.flipDone();
            
            this.flipDone = null;
        }
    }

    OnFlipCentered() {
        let card: number = this.num + 1;
        this.spriteCard.spriteFrame = ResourceManager.Instance().getCardImage( card );
    }

    public GetType(): ENUM_CARD_TYPE {
        return this.type;
    }
}

