import { _decorator, Component, Node, Sprite, resources, SpriteFrame, Label } from 'cc';
import { Board } from '../Board';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiWinEffect')
export class UiWinEffect extends Component {
    @property(SpriteFrame) spriteFrameGrades: SpriteFrame[] = [];
    @property(SpriteFrame) spriteFrameRanks: SpriteFrame[] = [];    

    @property(Sprite) spriteWinEffectBackGround: Sprite = null;
    @property(Sprite) spriteWinEffectRank: Sprite = null;

    @property(Node) rootInfo: Node = null;
    @property(Label) labelWinners: Label = null;
    @property(Label) labelHands: Label = null;


    init() {
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;

        this.rootInfo.active = false;
        this.labelWinners.string = '';
        this.labelWinners.node.active = false;

        this.labelHands.string = '';
        this.labelHands.node.active = false;

        this.node.active = false;
    }

    show( winners: any, type: number, e: any ) {
        this.labelWinners.string = '';
        this.labelHands.string = '';

        let wns: string[] = [];
        winners.forEach( (e)=>{
            wns.push( e.nickname );
        });

        let ws = wns.toString();
        this.labelWinners.string = ws;
        this.labelHands.string = e.descr;

        this.labelWinners.node.active = true;
        this.labelHands.node.active = true;

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

        this.rootInfo.active = true;
        this.node.active = true;
    }

    hide() {
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;
        this.node.active = false;
    }
}


