import { _decorator, Button, Component, Label, Node, Sprite } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { ResourceManager } from '../ResourceManager';
import * as PokerEvaluator from '../PokerEvaluator';
const { ccclass, property } = _decorator;

let CARD_NAME: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

@ccclass('UiPopupGameProfile')
export class UiPopupGameProfile extends Component {
    @property(Sprite) avatar: Sprite = null;
    @property(Button) buttonExit: Button = null;
    @property(Label) labeNickname: Label = null;

    private rootInfo: Node = null;
    private rootHands: Node = null;
    private statics: any = null;
    private entity: any = null;

    private labelHandCount: Label = null;
    private labelMaxPots: Label = null;
    private labelWin: Label = null;
    private labelFold: Label = null;
    private labelWinPreflop: Label = null;
    private labelWinFlop: Label = null;
    private labelWinTurn: Label = null;
    private labelWinRiver: Label = null;
    private labelFoldPreflop: Label = null;
    private labelFoldFlop: Label = null;
    private labelFoldTurn: Label = null;
    private labelFoldRiver: Label = null;
    private labelHandRankDesc: Label = null;    
    private cards: Sprite[] = [];
    
    public init() {        
        this.statics = null;

        globalThis.lib = {};
        PokerEvaluator.exportToGlobal(globalThis.lib);

        this.RegisterChildren();
        this.InitCards();        

        this.buttonExit.node.on('click', this.onClickExit.bind(this), this);
        this.node.active = false;
    }

    public show( entity: any, statics: any ) {
        this.node.active = true;
        this.avatar.node.active = false;
        this.rootInfo.active = true;
        this.entity = entity;
        this.statics = statics;

        this.SetProfile();
    }

    public GetActivate() :boolean {
        return this.node.active;
    }

    private SetProfile() {
        this.labeNickname.string = this.entity.nickname;
        this.labeNickname.node.active = true;

        this.avatar.spriteFrame = ResourceManager.Instance().getAvatarImage( this.entity.avatar );
        this.avatar.node.active = true;

        let hands = this.statics.hands;
        this.labelHandCount.string = hands.toString();

        let maxPots = CommonUtil.getKoreanNumber(this.statics.maxPots);
        this.labelMaxPots.string = maxPots;

        let win = this.statics.win;
        this.labelWin.string = win.toString() + '  (' + ( win / hands * 100.0 ).toFixed(1) +  '%)';
        if ( win == 0 || win == undefined ) {
            this.labelWinPreflop.string =   (0).toString() + ' (0%)';
            this.labelWinFlop.string =      (0).toString() + ' (0%)';
            this.labelWinTurn.string =      (0).toString() + ' (0%)';
            this.labelWinRiver.string =     (0).toString() + ' (0%)';
        } else {
            let winPreflop = this.statics.win_preflop;
            let winFlop = this.statics.win_flop;
            let winTurn = this.statics.win_turn;
            let winRiver = this.statics.win_river;
    
            this.labelWinPreflop.string = winPreflop.toString() + '  (' + ( winPreflop / win * 100.0 ).toFixed(1) +  '%)';
            this.labelWinFlop.string = winFlop.toString() + '  (' + ( winFlop / win * 100.0 ).toFixed(1) +  '%)';
            this.labelWinTurn.string = winTurn.toString() + '  (' + ( winTurn / win * 100.0 ).toFixed(1) +  '%)';
            this.labelWinRiver.string = winRiver.toString() + '  (' + ( winRiver / win * 100.0 ).toFixed(1) +  '%)';
        }

        let fold = this.statics.fold;
        if ( fold == 0 || fold == undefined ) {
            this.labelFold.string =         (0).toString() + ' (0%)';
            this.labelFoldPreflop.string =   (0).toString() + ' (0%)';
            this.labelFoldFlop.string =      (0).toString() + ' (0%)';
            this.labelFoldTurn.string =      (0).toString() + ' (0%)';
            this.labelFoldRiver.string =     (0).toString() + ' (0%)';            
        } else {

            let foldPreflop = this.statics.fold_preflop;
            let foldFlop = this.statics.fold_flop;
            let foldTurn = this.statics.fold_turn;
            let foldRiver = this.statics.fold_river;

            this.labelFold.string = fold.toString() + '  (' + ( fold / hands * 100.0 ).toFixed(1) +  '%)';            
            this.labelFoldPreflop.string = foldPreflop.toString() + '  (' + ( foldPreflop / fold * 100.0 ).toFixed(1) +  '%)';            
            this.labelFoldFlop.string = foldFlop.toString() + '  (' + ( foldFlop / fold * 100.0 ).toFixed(1) +  '%)';
            this.labelFoldTurn.string = foldTurn.toString() + '  (' + ( foldTurn / fold * 100.0 ).toFixed(1) +  '%)';
            this.labelFoldRiver.string = foldRiver.toString() + '  (' + ( foldRiver / fold * 100.0 ).toFixed(1) +  '%)';
        }

        this.SetHandRank();

        this.rootInfo.active = true;
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    private SetHandRank() {
        let hands = this.statics.best_hands;
        if ( hands == null || hands.length <= 0 ) {
            this.ResetCards();
            this.labelHandRankDesc.string = '등록된 핸드가 없습니다.';

        } else {

            let h = hands.split(',');
            let evaluate: any = this.GetHandsEval(h);
            let pools: number[] = [];

            evaluate['cards'].forEach( (elem)=>{
                let name = elem.value + elem.suit;
                let num = this.ConvertCardNameToIndex( name );
                pools.push( num );
            });

            this.SetCards( pools );
            this.labelHandRankDesc.string = evaluate.descr;
        }
        this.labelHandRankDesc.node.active = true;
        this.rootHands.active = true;
    }

    private ConvertCardNameToIndex( name: string ): number {
		let n: number = -1;
		for ( let i: number = 0 ; i < CARD_NAME.length; i++ ) {
			if ( name == CARD_NAME[i] ) {
				n = i;
				break;
			}
		}
		return n;
	}

    private onClickExit(button: Button) {
        this.hide();
    }

    private InitCards() {
        this.cards = [];
        if ( this.rootInfo != null ) {
            this.rootHands = this.rootInfo.getChildByPath('BEST_HANDS');

            for ( let i: number = 0 ; i < 5 ; i++ ) {
                let s = this.rootHands.getChildByPath(i.toString()).getComponent( Sprite );
                if ( s != null ) {
                    this.cards.push( s );
                }

            }

            this.ResetCards();

            this.labelHandRankDesc = this.rootHands.getChildByPath('LABEL_HAND_RANK').getComponent(Label);
            if ( this.labelHandRankDesc != null ) {
                this.labelHandRankDesc.string = '';
                this.labelHandRankDesc.node.active = false;
            }
        }

        this.rootHands.active = false;
    }

    private ResetCards() {
        this.cards.forEach( (s)=>{
            s.node.active = false;
            CommonUtil.setCardSprite(0, 0, s, ()=>{
                s.node.active = true;
            });

        });
    }

    private SetCards( pools: number[] ) {
        for ( let i: number = 0 ; i < pools.length; i++ )
        {
            let s = this.cards[i];
            s.node.active = false;
            CommonUtil.setCardSprite( 0, pools[i] + 1, s, ()=>{
                s.node.active = true;
            })
        }
    }

    public GetHandsEval( cards: string[] ): string {
        if ( cards.length <= 5 ) {
            return null;
        }

		let rs = cards.join();
		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );
		return handRank;
	}

    private RegisterChildren() {
        this.rootInfo = this.node.getChildByPath('INFO_PANEL');
        if ( this.rootInfo != null ) {
            this.labelHandCount = this.rootInfo.getChildByPath('VALUE/HAND_COUNT').getComponent(Label);
            this.labelHandCount.string = '0';

            this.labelMaxPots = this.rootInfo.getChildByPath('VALUE/MAX_POT').getComponent(Label);
            this.labelMaxPots.string = '0';

            this.labelWin = this.rootInfo.getChildByPath('VALUE/WIN').getComponent(Label);
            this.labelWin.string = '0';

            this.labelFold = this.rootInfo.getChildByPath('VALUE/FOLD').getComponent(Label);
            this.labelFold.string = '0';

            this.labelWinPreflop = this.rootInfo.getChildByPath('VALUE/WIN_PREFLOP').getComponent(Label);
            this.labelWinPreflop.string = '0';

            this.labelWinFlop = this.rootInfo.getChildByPath('VALUE/WIN_FLOP').getComponent(Label);
            this.labelWinFlop.string = '0';

            this.labelWinTurn = this.rootInfo.getChildByPath('VALUE/WIN_TURN').getComponent(Label);
            this.labelWinTurn.string = '0';

            this.labelWinRiver = this.rootInfo.getChildByPath('VALUE/WIN_RIVER').getComponent(Label);
            this.labelWinRiver.string = '0';

            this.labelFoldPreflop = this.rootInfo.getChildByPath('VALUE/FOLD_PREFLOP').getComponent(Label);
            this.labelFoldPreflop.string = '0';

            this.labelFoldFlop = this.rootInfo.getChildByPath('VALUE/FOLD_FLOP').getComponent(Label);
            this.labelFoldFlop.string = '0';

            this.labelFoldTurn = this.rootInfo.getChildByPath('VALUE/FOLD_TURN').getComponent(Label);
            this.labelFoldTurn.string = '0';

            this.labelFoldRiver = this.rootInfo.getChildByPath('VALUE/FOLD_RIVER').getComponent(Label);
            this.labelFoldRiver.string = '0';
    
            this.rootInfo.active = false;
        }
    }
}

