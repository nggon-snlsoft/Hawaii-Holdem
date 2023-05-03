import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerActionInformation')
export class PlayerActionInformation extends Component {
    @property(Label) labelMinBet: Label = null;    
    @property(Label) labelCurBet: Label = null;    
    @property(Label) labelPlayerChips: Label = null;
    @property(Label) labelMaxChips: Label = null;
    @property(Label) labelMaxBet: Label = null;
    @property(Label) labelMinRaise: Label = null;
    @property(Label) labelCurrentPot: Label = null;
    @property(Label) labelCurrentBet: Label = null;

    public Init() {
        this.labelMinBet.string = 'minBet: ';
        this.labelCurBet.string = 'currBet: ';    
        this.labelPlayerChips.string = 'chips: ';
        this.labelMaxChips.string = 'maxChips: ';
        this.labelMaxBet.string = 'maxBet: ' ;
        this.labelMinRaise.string = 'minRaise: ';
        this.labelCurrentPot.string = 'currentPot: ';
        this.labelCurrentBet.string = 'currentBet: ';

        this.node.active = false;
    }

    public Set(minBet: number, info: any ) {

        this.labelMinBet.string = 'minBet: ' + minBet.toString() + ', ';
        this.labelCurBet.string = 'currBet: ' + info.currBet.toString() + ', ';
        this.labelPlayerChips.string = 'chips: ' + info.chips.toString() + ', ';
        this.labelMaxBet.string = 'maxBet: ' + info.maxBet.toString() + ', ';
        this.labelMaxChips.string = 'maxChip: ' + info.maxChip.toString() + ', ';
        this.labelMinRaise.string = 'minRaise: ' + info.minRaise.toString() + ', ';
    }


    public Show() {
        this.node.active = true;

    }

    public Hide() {
        this.node.active = false;
    }
}

