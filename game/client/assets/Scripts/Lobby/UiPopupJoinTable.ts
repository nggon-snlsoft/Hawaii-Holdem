import { _decorator, Component, Node, Button, Label, Slider, EventHandler } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiPopupJoinTable')
export class UiPopupJoinTable extends Component {
    @property(Button) buttonExit: Button = null;
    @property(Button) buttonJoin: Button = null;
    @property(Label) labelPlayerBalance: Label = null;
    @property(Label) labelBlind: Label = null;
    @property(Label) labelMinStakePrice: Label = null;
    @property(Label) labelMaxStakePrice: Label = null;
    @property(Label) labelBuyIn: Label = null;    
    
    @property(Button) buttonMin: Button = null;
    @property(Button) buttonMax: Button = null;
    @property(Button) buttonInput: Button = null;
    
    @property(Slider) sliderBuyIn: Slider = null;
    
    private table: any = null;
    private minStakePrice: number = -1;
    private maxStakePrice: number = -1;
    private buyInRange: number = -1;
    private buyInResult: number = 0;

    private cbExit: ()=>void = null;
    private cbJoin: (table: any, buyIn: number)=>void = null;

    public init( cbExit: ()=> void, cbJoin:( table: any, buyIn: number )=> void ) {
        this.cbExit = cbExit;
        this.cbJoin = cbJoin;

        this.buttonExit.node.on('click', this.onClickExit.bind(this), this);
        this.buttonJoin.node.on('click', this.onClickJoin.bind(this), this);

        const sliderEventHandler = new EventHandler();
        sliderEventHandler.target = this.node;
        sliderEventHandler.component = "UiPopupJoinTable";
        sliderEventHandler.handler = "onSliderChangeValue";
        sliderEventHandler.customEventData = "???";
        this.sliderBuyIn?.slideEvents.push( sliderEventHandler );

        this.node.active = false;
    }

    private onSliderChangeValue( slider: Slider ) {
		this.setBuyInRatio( slider.progress );
	}

    private setBuyInRatio( ratio: number ) {
        let buyInRemain: number = 0;

        if ( ratio >= 1) {
            ratio = 1;
            this.buyInResult = this.maxStakePrice;

        } else {
            this.buyInResult = this.minStakePrice + Math.floor( ratio * this.buyInRange );
            buyInRemain = this.buyInResult % 100;

            this.buyInResult = this.buyInResult - buyInRemain;
        }

        this.labelBuyIn.string = CommonUtil.getNumberStringWithComma(this.buyInResult);
    }

    private onClickExit(button: Button) {
        this.node.active = false;
        if ( this.cbExit != null ) {
            this.cbExit();
        }
    }

    private onClickJoin(button: Button) {
        if ( this.cbJoin != null ) {
            this.cbJoin( this.table, this.buyInResult );
        }
    }

    public show( table: any ) {
        this.table = table;

        let info = NetworkManager.Instance().getUserInfo();
        if (info != null) {
            this.labelPlayerBalance.string = CommonUtil.getNumberStringWithComma(info.balance);
        }

        this.labelBlind.string = CommonUtil.getNumberStringWithComma(table.info.smallBlind) + '/' + 
        CommonUtil.getNumberStringWithComma(table.info.bigBlind);

        this.minStakePrice = Number( table.info.minStakePrice );

        let b: number = Number( info.balance );
        let m: number = Number( table.info.maxStakePrice );
        
        this.maxStakePrice = Math.min(b, m);

        this.labelMinStakePrice.string = CommonUtil.getNumberStringWithComma(this.minStakePrice);
        this.labelMaxStakePrice.string = CommonUtil.getNumberStringWithComma(this.maxStakePrice);

        this.sliderBuyIn.progress = 1;
        this.labelBuyIn.string = CommonUtil.getNumberStringWithComma( this.maxStakePrice );

        this.buyInRange = this.maxStakePrice - this.minStakePrice;
        this.buyInResult = this.maxStakePrice;

        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
}


