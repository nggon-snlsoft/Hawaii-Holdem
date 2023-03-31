import { _decorator, Component, Node, Sprite, Animation, AnimationState } from 'cc';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiShowDownEffect')
export class UiShowDownEffect extends Component {
    private animation: Animation = null;
    private animState: AnimationState = null;
    private cbDone: ()=> void;

    Init() {
        this.animation = this.node.getComponent(Animation);
        if ( this.animation != null ) {
            this.animState = this.animation.getState('ShowDown');
            this.animState.speed = 1.0;

            this.animation.on('finished', this.onFinished.bind(this), this);
        }

        this.node.active = false;
    }

    Show( cbDone:()=>void ) {
        if ( cbDone != null ) {
            this.cbDone = cbDone;
        }

        this.scheduleOnce(()=>{
            AudioController.instance.playShowDown();
            this.node.active = true;
            this.animation.play();
        }, 1);
    }

    Hide() {
        if ( this.cbDone != null ) {
            this.cbDone = null;
        }

        this.node.active = false;

    }

    onFinished() {
        if ( this.cbDone != null ) {
            this.cbDone();
        }
    }

}

