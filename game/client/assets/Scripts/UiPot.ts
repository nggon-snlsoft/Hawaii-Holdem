import { _decorator, Component, Node, Label } from 'cc';
import { CommonUtil } from './CommonUtil';
const { ccclass, property } = _decorator;

@ccclass("Pot")
export class Pot{
    @property(Node) public showRoot : Node = null;
    @property(Label) public valueLabel : Label = null;

    public ClearCallback(){
        // this.showRoot.off(Node.EventType.TOUCH_START);
        // this.showRoot.off(Node.EventType.TOUCH_END);
        // this.showRoot.off(Node.EventType.TOUCH_CANCEL);
    }
}

@ccclass('UiPot')
export class UiPot extends Component {
    @property(Label) public labelMaxPot : Label = null;
    @property(Label) public labelPotCount : Label = null;

    @property(Node) public maxPotRoot : Node = null;
    @property(Node) public potCountRoot : Node = null;

    @property(Pot) private potUi : Pot[] = [];

    public svPots : any[] = null;
    public potCount: number = 0;

    private selectedPot : number = -1;
    private potInfoTimeout : number = null;

    onLoad() {
    }

    public Show( pots : any[])
    {
        if(null === pots || undefined === pots)
        {
            return;
        }

        if(pots.length < 1)
        {
            return;
        }

        let shown : any[] = [];

        pots.sort((a :any, b : any) => {
            if(a.players.length > b.players.length)
            {
                return -1;
            }
            else
            {
                return 1;
            }
        });

        pots.forEach(element => {
            if(element.players.length <= 1){
                return;
            }

            shown.push(element);
        });

        this.SetPotCount(shown.length);
        
        this.svPots = pots;

        for (let i = 0; i < this.potUi.length; i++) {
            const sidePot = this.potUi[i];
            sidePot.ClearCallback();
            
            if(i >= shown.length){
                sidePot.showRoot.active = false;
                continue;
            }

            const potInfo = shown[i];

            sidePot.valueLabel.string = CommonUtil.getKoreanNumber( potInfo.total );
            sidePot.showRoot.active = true;

            if(null == potInfo.rake){
                continue;
            }
        }
    }

    public UpdatePotTotal(totalValue : number){
        this.labelMaxPot.node.active = true;
        this.labelMaxPot.string = CommonUtil.getKoreanNumber(totalValue);
    }

    public GetPots() : Pot[]{
        return this.potUi;
    }

    public SetPotCount(count: number) {
        if (count > 1) {
            this.potCountRoot.active = true;
            this.labelPotCount.string = count.toString();
        } else {
            this.potCountRoot.active = false;
        }
    }
    
    public ClearPotCount() {
        this.potCountRoot.active = false;
        this.labelPotCount.string = "";
    }
    
    public Hide(){
        this.potUi.forEach(element => {
            element.valueLabel.string = "0";
            element.showRoot.active = false;
        });

        this.ClearPotCount();

        this.svPots = null;
        this.maxPotRoot.active = false;
        this.labelMaxPot.node.active = false;
        this.labelMaxPot.string =  "0";//totalValue.toLocaleString().split( "." )[ 0 ];
    }
    
    public HidePotInfo(){

        if(this.potInfoTimeout != null){
            clearTimeout(this.potInfoTimeout);
            this.potInfoTimeout = null;
        }
    }
}


