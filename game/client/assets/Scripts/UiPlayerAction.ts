import { _decorator, Component, Node, Button, Label, Slider, EventHandler, sys } from 'cc';
import { CommonUtil } from './CommonUtil';
import { ENUM_BETTING_TYPE, UiBettingControl } from './Game/UiBettingControl';
const { ccclass, property } = _decorator;

@ccclass('UiPlayerAction')
export class UiPlayerAction extends Component {
	@property (Node) NodeNativeContoller: Node = null;
	@property (Node) NodeMobileContoller: Node = null;
	
	private uiBettingControl: UiBettingControl = null;

	private nodeRoot: Node = null;

	private isChildRegistered: boolean = false;

	private buttonFold: Button = null;    
	private buttonCheck: Button = null;

	private buttonCall: Button = null;
	private labelCall: Label = null;

	private buttonBet: Button = null;
	private labelBet: Label = null;

	private buttonRaise: Button = null;
	private labelRaise: Label = null;

	private buttonConfirm: Button = null;

	private buttonAllIn: Button = null;

	private numberTurnBet: number = 0;
	private numberMyBet: number = 0;
	private numberMyChips: number = 0;
	private numberPot: number = 0;
	private numberBetMin: number = 0;
	private numberRaiseMin: number = 0;
	private numberBetStart: number = 0;
	private numberRaiseStart: number = 0;
	private numberBetRange: number = 0;
	private numberRaiseRange: number = 0;
	private numberBetDisplayValue: number = 0;
	private numberRaiseDisplayValue: number = 0;

	private sb: number = 0;
	private bb: number = 0;

	cbFold: () => void = null;
	cbCall: (betValue: number) => void = null;
	cbCheck: () => void = null;
	cbBet: ( betValue: number ) => void = null;
	cbRaise: ( betValue: number ) => void = null;
	cbAllIn: ( betValue: number ) => void = null;

    childRegistered() {
		if( true == this.isChildRegistered ) {
			return;
		}

		this.isChildRegistered = true;

		// if (sys.isMobile == true)	{
		// 	this.nodeRoot = this.NodeMobileContoller;
		// 	this.NodeNativeContoller.active = false;
		// } else {
		// 	this.nodeRoot = this.NodeNativeContoller;
		// 	this.NodeMobileContoller.active = false;
		// }

		this.nodeRoot = this.NodeNativeContoller;
		this.NodeMobileContoller.active = false;

		this.buttonFold = this.nodeRoot.getChildByPath( "BUTTON_FOLD" )?.getComponent( Button );
		this.buttonFold?.node.on( "click", this.onClickFold.bind( this ), this );

		this.buttonCheck = this.nodeRoot.getChildByPath( "BUTTON_CHECK" )?.getComponent( Button );
		this.buttonCheck?.node.on( "click", this.onClickCheck.bind( this ), this );

		this.buttonCall = this.nodeRoot.getChildByPath( "BUTTON_CALL" )?.getComponent( Button );
		this.buttonCall?.node.on( "click", this.onClickCall.bind( this ), this );
		this.labelCall = this.buttonCall.node.getChildByPath( "Label" )?.getComponent( Label );

		this.buttonBet = this.nodeRoot.getChildByPath( "BUTTON_BET" )?.getComponent( Button );
		this.buttonBet?.node.on( "click", this.onClickBet.bind( this ), this );
		this.labelBet = this.buttonBet.node.getChildByPath( "Label" )?.getComponent( Label );

		this.buttonRaise = this.nodeRoot.getChildByPath( "BUTTON_RAISE" )?.getComponent( Button );
		this.buttonRaise?.node.on( "click", this.onClickRaise.bind( this ), this );
		this.labelRaise = this.buttonRaise.node.getChildByPath( "Label" )?.getComponent( Label );

		this.buttonConfirm = this.nodeRoot.getChildByPath( "BUTTON_CONFIRM" )?.getComponent( Button );
		this.buttonConfirm.node.on('click', this.onClickConfirm.bind(this) );
		this.buttonConfirm.node.active = false;

		this.buttonAllIn = this.nodeRoot.getChildByPath( "BUTTON_ALLIN" )?.getComponent( Button );
		this.buttonAllIn?.node.on( "click", this.onClickAllin.bind( this ), this );

		this.uiBettingControl = this.nodeRoot.getChildByPath('BETTING_CONTROL').getComponent(UiBettingControl);		
		if ( this.uiBettingControl != null ) {
			this.uiBettingControl.init();
		}

		this.nodeRoot.active = true;
	}

	onLoad() {
		this.childRegistered();
	}

	init( sb: number, bb: number ) {		
		this.sb = sb;
		this.bb = bb;
	}
    
	show( minBet: number, turnBet: number, minRaise: number, pot: number, myBet: number, myChips: number, isLast : boolean, hasAction: boolean) {
		this.childRegistered();

		this.uiBettingControl.hide();
		this.buttonConfirm.node.active = false;

		this.numberBetMin = minBet;
		this.numberTurnBet = turnBet;
		this.numberRaiseMin = minRaise;
		this.numberPot = pot;
		this.numberMyBet = myBet;
		this.numberMyChips = myChips;
		this.numberBetDisplayValue = 0;
		this.numberBetStart = 0;
		this.numberRaiseStart = 0;
		this.numberBetRange = 0;
		this.numberRaiseRange = 0;

		if( turnBet != 0 && myChips <= 0 ) {
			this.buttonFold.node.active = false;
			this.buttonAllIn.node.active = false;

			this.buttonCheck.node.active = false;
			this.buttonCall.node.active = true;
			this.labelCall.string = "콜";

			this.buttonBet.node.active = false;
			this.buttonRaise.node.active = false;

			this.node.active = true;
			return;
		}

		this.buttonFold.node.active = true;
		this.buttonCheck.node.active = ( turnBet == myBet ) && ( true == hasAction );
		this.buttonCall.node.active = ( turnBet > myBet );
		if( this.buttonCall.node.active == true ) {
			let betValue = turnBet - myBet;
			if( betValue >= this.numberMyChips ){
				this.buttonCall.node.active = false;
			}
			else{
				this.labelCall.string = `콜\n${ CommonUtil.getKoreanNumber(betValue) }`;
			}
		}

		this.buttonBet.node.active = ( 0 == turnBet );

		this.numberBetStart = 0 == turnBet ? this.numberBetMin : turnBet * 2;
		this.numberRaiseStart = 0 == turnBet ? this.numberBetMin : minRaise * 2;

		this.numberBetRange = myChips;
		this.numberRaiseRange = myChips;

		this.buttonRaise.node.active = (0 != turnBet && this.numberRaiseRange >= 0) && false === isLast && true == hasAction;
		this.buttonAllIn.node.active = (0 != turnBet && turnBet >= this.numberBetRange );

		if (isLast == true) {
			if (this.buttonCall.node.active == true) {
				this.buttonAllIn.node.active = false;
			}
		}

		if (hasAction == false) {
			if ( this.buttonCall.node.active == true ) {
				this.buttonAllIn.node.active = false;
			}
		}

		if ( this.buttonAllIn.node.active == true ) {
			this.buttonRaise.node.active = false;
			this.buttonBet.node.active = false;
		}

		this.node.active = true;
	}

	hide() {
		this.node.active = false;
	}    

	private onClickFold() {
		if( null == this.cbFold){
			return;
		}

		this.cbFold();
	}

	private onClickCall() {

		let betValue = this.numberTurnBet - this.numberMyBet;
		if( betValue > this.numberMyChips ){
			betValue = this.numberMyChips;
		}
		betValue += this.numberMyBet;

		if( null == this.cbCall){
			return;
		}

		this.cbCall(betValue);
	}

    private onClickAllin() {
		let sendValue = this.numberMyChips + this.numberMyBet;

		if( null == this.cbAllIn){
			return;
		}

		if ( this.buttonCall.node.active == false ) {
			let betValue = this.numberTurnBet - this.numberMyBet;
			if( betValue > this.numberMyChips ){
				betValue = this.numberMyChips;
			}
			betValue += this.numberMyBet;
			this.cbCall( betValue );
		} else {
			this.cbAllIn( sendValue );
		}
	}

    private onClickBet() {

		this.buttonBet.node.active = false;
		this.buttonConfirm.node.active = true;

		this.uiBettingControl.show( this.sb, this.bb, ENUM_BETTING_TYPE.Bet, this.numberBetStart, this.numberBetRange, 
			this.numberPot, this.numberMyChips, ( result: any )=>{

				let sendValue = result.value + this.numberMyBet;
				this.cbBet( sendValue );


			} );
	}


    private onClickRaise() {
		this.buttonRaise.node.active = false;
		this.buttonConfirm.node.active = true;

		this.uiBettingControl.show( this.sb, this.bb, ENUM_BETTING_TYPE.Raise, this.numberRaiseStart, this.numberRaiseRange, 
			this.numberPot, this.numberMyChips, (result: any )=>{

				let sendValue = result.value + this.numberMyBet;
				this.cbRaise( sendValue );

			} );
	}

	private onClickConfirm( button: Button ) {
		let res = this.uiBettingControl.getResult();
		let sendValue = res.result + this.numberMyBet;

		if ( res.type == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( sendValue );

		} else if ( res.type == ENUM_BETTING_TYPE.Raise ) {
			this.cbRaise( sendValue );
		}
		else {
			console.log('error bet')
		}
	}

	private onClickCheck() {
		if( null == this.cbCheck){
			return;
		}

		this.cbCheck();
	}
}


