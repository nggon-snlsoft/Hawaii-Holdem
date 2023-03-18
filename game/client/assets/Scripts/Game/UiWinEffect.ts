import { _decorator, Component, Node, Sprite, resources, SpriteFrame } from 'cc';
import { Board } from '../Board';
const { ccclass, property } = _decorator;

const gradeSpriteFileName: string[] = ['hand_grade_1',
'hand_grade_2',
'hand_grade_3'];

const rankSpriteFileName: string[] = ['hand_high_card',
'hand_one_pair',
'hand_two_pair',
'hand_three_of_a kind', 
'hand_straight', 
'hand_flush', 
'hand_full_house', 
'hand_four_of_a_kind', 
'hand_straight_flush'];    

@ccclass('UiWinEffect')
export class UiWinEffect extends Component {
    @property(Sprite) spriteWinEffectBackGround: Sprite = null;
    @property(Sprite) spriteWinEffectRank: Sprite = null;
    
    private msg: any = null;
    private eval: string = '';
    private rank: number = 0;
    private backFileName: string = '';
    private rankFileName: string = '';

    init() {
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;
        this.node.active = false;
    }

    set(msg: any) {
        this.msg = msg;

        if ( this.msg['skip'] == true) {
            return;
        }

        let communities = this.msg['cards'];
        let winner = msg['winners'][0];
        let cards = winner.cards;
        
        this.eval = Board.table.getHandsEval(cards, communities);
        this.rank = this.eval['rank'];

        if ( this.rank - 1 >= 0) {
            this.rankFileName = rankSpriteFileName[this.rank - 1];

            let grade = Math.floor((this.rank - 1) / 3);
            this.backFileName = gradeSpriteFileName[grade];
        }
    }

    show() {
        if ( this.msg['skip'] == true || this.rank <= 0) {
            return;
        }

        this.setSpriteFrame(this.backFileName, this.spriteWinEffectBackGround, ()=>{
            this.spriteWinEffectBackGround.node.active = true;
        });

        this.setSpriteFrame(this.rankFileName, this.spriteWinEffectRank, ()=>{
            this.spriteWinEffectRank.node.active = true;
        });

        console.log();
        this.node.active = true;
    }

    setSpriteFrame( fileName: string, sf: Sprite, cb: ()=>void = null ) {
        if ( fileName.length <= 0) {
            return;
        }

        let url = 'Sprites/Winner/' + fileName + '/spriteFrame';
        console.log(url);
        resources.load<SpriteFrame>( url, ( err, res ) => {
            sf.spriteFrame = res;
            
            if (cb != null) {
                cb();
            }
        });
    }

    hide() {
        this.eval = null;
        this.backFileName = '';
        this.rankFileName = '';
        this.spriteWinEffectBackGround.node.active = false;
        this.spriteWinEffectRank.node.active = false;
        this.node.active = false;
    }
}


