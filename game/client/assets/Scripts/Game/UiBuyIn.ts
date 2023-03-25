import { _decorator, Component, Node, Label, Button, Slider, EventHandler } from 'cc';
import {CommonUtil} from "../CommonUtil";
import {Board} from "../Board";
import {UiGameInput} from "./UiGameInput";
const { ccclass, property } = _decorator;

const limitTime: number = 60;

@ccclass('UiBuyIn')
export class UiBuyIn extends Component {
    @property( Label ) labelTitle: Label = null;    
    @property( Label ) labelUserChips: Label = null;
    @property( Label ) labelBlind: Label = null;
    @property( Button ) buttonExit: Button = null;
    @property( Button ) buttonBuyIn: Button = null;
    @property(Label) labelMinStakePrice: Label = null;
    @property(Label) labelMaxStakePrice: Label = null;
    @property(Label) labelBuyIn: Label = null;

    @property(Button) buttonMin: Button = null;
    @property(Button) buttonMax: Button = null;
    @property(Button) buttonInput: Button = null;

    @property(Slider) sliderBuyIn: Slider = null;

    private minStakePrice: number = -1;
    private maxStakePrice: number = -1;
    private buyInRange: number = -1;
    private buyInResult: number;

    private cbExit: ()=>void = null;
    private cbBuyIn: (res: number)=>void = null;

    private initialized: boolean = false;

    init() {
        this.buttonExit.node.on('click', this.onClickExit.bind(this));
        this.buttonBuyIn.node.on('click', this.onClickBuyIn.bind(this));
        this.buttonMin.node.on('click', this.onClickMin.bind(this));
        this.buttonMax.node.on('click', this.onClickMax.bind(this));
        this.buttonInput.node.on('click', this.onClickInput.bind(this));

        const sliderEventHandler = new EventHandler();
        sliderEventHandler.target = this.node;
        sliderEventHandler.component = "UiBuyIn";
        sliderEventHandler.handler = "onSliderChangeValue";
        sliderEventHandler.customEventData = "???";
        this.sliderBuyIn?.slideEvents.push( sliderEventHandler );

        this.initialized = true;
        this.node.active = false;
    }

    public buyIn(cbBuyIn: (res: number)=>void, cbExit: ()=>void) {
        if ( this.initialized == false ) {
            this.init();
        }

        this.labelBuyIn.string = '바이인';

        this.clear();

        if ( cbBuyIn != null ) {
            this.cbBuyIn = cbBuyIn;
        }

        if (cbExit != null) {
            this.cbExit = cbExit;
        }

        this.labelUserChips.string = CommonUtil.getKoreanNumber( Board.balance );
        this.labelBlind.string = CommonUtil.getKoreanNumber( Board.small ) + ' / ' +
            CommonUtil.getKoreanNumber( Board.big );

        this.minStakePrice = Number( Board.minStakePrice );

        let b: number = Number ( Board.balance );
        let m: number = Number ( Board.maxStakePrice );
        this.maxStakePrice = Math.min(b, m);

        this.labelMinStakePrice.string = CommonUtil.getKoreanNumber( this.minStakePrice );
        this.labelMaxStakePrice.string = CommonUtil.getKoreanNumber( this.maxStakePrice );

        this.buyInRange = this.maxStakePrice - this.minStakePrice;

        this.setBuyInRatio( 0 );        
        this.node.active = true;
    }

    private onSliderChangeValue( slider: Slider ) {
        this.setBuyInRatio( slider.progress );
    }

    public addChips( balance: number, amount: number, cbBuyIn: (res: number)=>void ) {
        if ( this.initialized == false ) {
            this.init();
        }
        this.labelTitle.string = '칩 추가';

        if ( cbBuyIn != null ) {
            this.cbBuyIn = cbBuyIn;
        }

        this.labelUserChips.string = CommonUtil.getKoreanNumber( Board.balance );
        this.labelBlind.string = CommonUtil.getKoreanNumber( Board.small ) + ' / ' +
            CommonUtil.getKoreanNumber( Board.big );

        this.minStakePrice = 0;

        let b: number = balance;
        let m: number = amount;

        this.maxStakePrice = Math.min(b, m);

        this.labelMinStakePrice.string = CommonUtil.getKoreanNumber( this.minStakePrice );
        this.labelMaxStakePrice.string = CommonUtil.getKoreanNumber( this.maxStakePrice );

        this.buyInRange = this.maxStakePrice - this.minStakePrice;

        this.setBuyInRatio( 0 );
        this.node.active = true;
    }

    public reBuyIn( balance: number, chips: number, cbBuyIn: (res: number)=>void, cbExit: ()=>void ) {
        if ( this.initialized == false ) {
            this.init();
        }
        this.labelTitle.string = '리바이인';

        if ( cbBuyIn != null ) {
            this.cbBuyIn = cbBuyIn;
        }

        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        this.labelUserChips.string = CommonUtil.getKoreanNumber( Board.balance );
        this.labelBlind.string = CommonUtil.getKoreanNumber( Board.small ) + ' / ' +
            CommonUtil.getKoreanNumber( Board.big );

        let minValue = Board.minStakePrice - chips;
        this.minStakePrice = minValue;

        let b: number = balance;
        let m: number = Board.maxStakePrice - chips;

        this.maxStakePrice = Math.min(b, m);

        this.labelMinStakePrice.string = CommonUtil.getKoreanNumber( this.minStakePrice );
        this.labelMaxStakePrice.string = CommonUtil.getKoreanNumber( this.maxStakePrice );

        this.buyInRange = this.maxStakePrice - this.minStakePrice;

        this.setBuyInRatio( 0 );
        this.node.active = true;
    }

    buyInDone() {

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

        this.sliderBuyIn.progress = ratio;
        this.labelBuyIn.string = CommonUtil.getKoreanNumber(this.buyInResult);
    }

    private  onClickExit( button: Button ) {
        if ( this.cbExit != null ) {
            this.cbExit();
        }

        this.cbExit = null;
        this.node.active = false;
    }

    private  onClickBuyIn( button: Button ) {
        if ( this.cbBuyIn != null ) {
            this.cbBuyIn( this.buyInResult );
        }

        this.node.active = false;
    }

    public closePopup() {
        this.clear();
        this.node.active = false;
    }

    private clear() {
        this.cbExit = null;
        this.cbBuyIn = null;
    }

    private  onClickMin( button: Button ) {
        this.setBuyInRatio(0);
    }

    private  onClickMax( button: Button ) {
        this.setBuyInRatio(1);
    }

    private  onClickInput( button: Button ) {
        // UiGameInput.instance.show();
    }

}


