import { _decorator, Component, Node, Animation, AnimationClip, animation, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { ResourceManager } from '../ResourceManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiCard')
export class UiCard extends Component {
    @property(AnimationClip) clip: AnimationClip = null;
    @property(Sprite) spriteWin: Sprite = null;

    private anim: Animation = null;
    private sprite: Sprite = null;
    private card: number = -1;
    private cb: ()=> void;
    private originalPos: Vec3 = null;

    init() {
        this.anim = this.node.getComponent(Animation);
        if ( this.anim == null) {
            return;
        }

        this.sprite = this.node.getComponent(Sprite);
        this.anim.on('finished', this.onCardFlipFinished.bind(this), this);
        this.originalPos = new Vec3( this.node.position.x, this.node.position.y, this.node.position.z );
        if ( this.spriteWin != null ) {
            this.spriteWin.node.active = false;
            this.spriteWin.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );
        }

        this.node.active = false;
    }

    show( card: number, cb:()=>void,  delay: number = 0.0 ) {
        if ( cb != null ) {
            this.cb = cb;
        }

        this.anim.stop();

        this.card = card;
        this.sprite.spriteFrame = ResourceManager.Instance().getCardImage(0);
        this.sprite.node.active = true;
        this.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );

        if ( this.spriteWin != null ) {
            this.spriteWin.node.active = false;
            this.spriteWin.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );
        }

        this.node.active = true;

        this.scheduleOnce(()=>{
            this.anim.play();
        }, delay );
    }

    ShowImmediate( card: number ) {
        this.card = card;
        this.sprite.spriteFrame = ResourceManager.Instance().getCardImage(this.card + 1);
        this.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );

        if ( this.spriteWin != null ) {
            this.spriteWin.node.active = false;
            this.spriteWin.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );
        }

        this.node.active = true;
    }
    
    SetWinCard( pools: any ) {
        this.Reset();

        let c = pools.find( ( e )=>{
            return this.card == e;
        });

        if ( c != null ) {
            this.spriteWin.node.active = true;

            // let pos = new Vec3(this.node.position.x, this.node.position.y, this.node.position.z);
            this.node.position = new Vec3( this.originalPos.x, this.originalPos.y + 30, this.originalPos.z );
            this.spriteWin.node.position = new Vec3( this.originalPos.x, this.originalPos.y + 30, this.originalPos.z );
        }
    }

    private Reset() {
        this.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );
        
        if ( this.spriteWin != null ) {
            this.spriteWin.node.active = false;
            this.spriteWin.node.position = new Vec3( this.originalPos.x, this.originalPos.y, this.originalPos.z );
        }
    }

    onCardFlipFinished() {
        if ( this.cb != null ) {
            this.cb();
        }
    }

    onCardFlippCenter() {
        let sf: SpriteFrame = ResourceManager.Instance().getCardImage(this.card + 1);

        if ( sf != null ) {
            this.sprite.spriteFrame = sf;
        }
    }

    hide() {
        if ( this.cb != null ) {
            this.cb = null;
        }

        this.sprite.spriteFrame = ResourceManager.Instance().getCardImage(0);

        if ( this.spriteWin != null ) {
            this.spriteWin.node.active = false;
        }

        this.node.active = false;
    }
}

