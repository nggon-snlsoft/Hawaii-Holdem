import { _decorator, Component, Node, Sprite, resources, SpriteFrame } from 'cc';
import { Board } from '../Board';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiWinEffect')
export class UiWinEffect extends Component {
    @property(SpriteFrame) spriteFrameGrades: SpriteFrame[] = [];
    @property(SpriteFrame) spriteFrameRanks: SpriteFrame[] = [];    

    @property(Sprite) spriteWinEffectBackGround: Sprite = null;
    @property(Sprite) spriteWinEffectRank: Sprite = null;

    init() {
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;
        this.node.active = false;
    }

    show( type: number ) {


        if ( type > 0 ) {
            type = ( type - 1 );
            
            this.spriteWinEffectRank.spriteFrame = this.spriteFrameRanks[ type ];
            this.spriteWinEffectRank.node.active = true;
            let grade = Math.floor( ( type ) / 3 );

            this.spriteWinEffectBackGround.spriteFrame = this.spriteFrameGrades[ grade ];
            this.spriteWinEffectBackGround.node.active = true;
        }

        switch ( type ) {
            case 0:
                AudioController.instance.PlaySound('VOICE_RANK_TOP');
                break;
            case 1:
                AudioController.instance.PlaySound('VOICE_RANK_ONEPAIR');                
                break;
            case 2:
                AudioController.instance.PlaySound('VOICE_RANK_TWOPAIR');                
                break;
            case 3:
                AudioController.instance.PlaySound('VOICE_RANK_TRIPLE');                
                break;
            case 4:
                AudioController.instance.PlaySound('VOICE_RANK_STRAIGHT');                
                break;
            case 5:
                AudioController.instance.PlaySound('VOICE_RANK_FLUSH');                
                break;
            case 6:
                AudioController.instance.PlaySound('VOICE_RANK_FULL_HOUSE');                
                break;
            case 7:
                AudioController.instance.PlaySound('VOICE_RANK_FOURCARD');
                break;                
            case 8:
                AudioController.instance.PlaySound('VOICE_RANK_STRAIGHT_FLUSH');
                break;
       }

        this.node.active = true;
    }

    hide() {
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;
        this.node.active = false;
    }
}


