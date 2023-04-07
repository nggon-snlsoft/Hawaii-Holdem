import { _decorator, Component, Node, Button, Label, Slider, EventHandler, sys } from 'cc';
import { CommonUtil } from './CommonUtil';
import { ENUM_BETTING_KIND, ENUM_BETTING_TYPE, UiBettingControl } from './Game/UiBettingControl';
import { ENUM_DEVICE_TYPE, GameManager } from './GameManager';
import { AudioController } from './Game/AudioController';
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
	// private labelCall: Label = null;

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

	private buttonQuater: Button = null;
	private buttonHalf: Button = null;
	private buttonFull: Button = null;
	private buttonMax: Button = null;

	private labelCallValue: Label = null;
	private labelQuaterValue: Label = null;
	private labelHalfValue: Label = null;
	private labelFullValue: Label = null;
	private labelMaxValue: Label = null;

	private quaterValue: number = 0;
	private halfValue: number = 0;
	private fullValue: number = 0;
	private maxValue: number = 0;
	private betType: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;

	private sb: number = 0;
	private bb: number = 0;

	private rotateType: ENUM_DEVICE_TYPE = ENUM_DEVICE_TYPE.MOBILE_PORTRAIT;

	cbFold: () => void = null;
	cbCall: (betValue: number) => void = null;
	cbCheck: () => void = null;
	cbBet: ( betValue: number ) => void = null;
	cbRaise: ( betValue: number ) => void = null;
	cbAllIn: ( betValue: number ) => void = null;
	cbBetAnnounce: ( kind: ENUM_BETTING_KIND )=> void = null;

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
		// this.labelCall = this.buttonCall.node.getChildByPath( "Label" )?.getComponent( Label );
		this.labelCallValue = this.buttonCall.node.getChildByPath('LABEL_VALUE').getComponent( Label );

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

		let info = GameManager.Instance().GetInfo();
		this.rotateType = info.device;
		if ( this.rotateType == ENUM_DEVICE_TYPE.PC_LANDSCAPE ) {
			this.buttonQuater = this.nodeRoot.getChildByPath('BUTTON_QUATER').getComponent( Button );
			if ( this.buttonQuater != null ) {
				this.buttonQuater.node.on( 'click', this.onClickQuater.bind( this ), this );
				this.buttonQuater.node.active = false;
			}

			this.buttonHalf = this.nodeRoot.getChildByPath('BUTTON_HALF').getComponent( Button );
			if ( this.buttonHalf != null ) {
				this.buttonHalf.node.on( 'click', this.onClickHalf.bind( this ), this );
				this.buttonHalf.node.active = false;
			}

			this.buttonFull = this.nodeRoot.getChildByPath('BUTTON_FULL').getComponent( Button );
			if ( this.buttonFull != null ) {
				this.buttonFull.node.on( 'click', this.onClickFull.bind( this ), this );
				this.buttonFull.node.active = false;
			}

			this.buttonMax = this.nodeRoot.getChildByPath('BUTTON_MAX').getComponent( Button );
			if ( this.buttonMax != null ) {
				this.buttonMax.node.on( 'click', this.onClickMax.bind( this ), this );
				this.buttonMax.node.active = false;
			}			

			this.labelQuaterValue = this.nodeRoot.getChildByPath('BUTTON_QUATER/LABEL_VALUE').getComponent( Label );
			if ( this.labelQuaterValue != null ) {
				this.labelQuaterValue.string = '';
				this.labelQuaterValue.node.active = false;
			}

			this.labelHalfValue = this.nodeRoot.getChildByPath('BUTTON_HALF/LABEL_VALUE').getComponent( Label );
			if ( this.labelHalfValue != null ) {
				this.labelHalfValue.string = '';
				this.labelHalfValue.node.active = false;
			}

			this.labelFullValue = this.nodeRoot.getChildByPath('BUTTON_FULL/LABEL_VALUE').getComponent( Label );
			if ( this.labelFullValue != null ) {
				this.labelFullValue.string = '';
				this.labelFullValue.node.active = false;
			}

			this.labelMaxValue = this.nodeRoot.getChildByPath('BUTTON_MAX/LABEL_VALUE').getComponent( Label );
			if ( this.labelMaxValue != null ) {
				this.labelMaxValue.string = '';
				this.labelMaxValue.node.active = false;
			}
		}

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

		this.quaterValue  = 0;
		this.halfValue = 0;
		this.fullValue = 0;
		this.maxValue = 0;
		this.betType =  ENUM_BETTING_TYPE.None;

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
			//이 경우는 나올 수가 없음
			this.buttonFold.node.active = false;
			this.buttonAllIn.node.active = false;

			this.buttonCheck.node.active = false;
			this.buttonCall.node.active = true;
			this.labelCallValue.string = '';

			this.buttonBet.node.active = false;
			this.buttonRaise.node.active = false;

			this.node.active = true;
			return;
		}

		//폴드는 항상 활성화
		this.buttonFold.node.active = true;

		//체크랑 콜은 두개중에 선택
		this.buttonCheck.node.active = ( turnBet == myBet ) && ( true == hasAction );
		this.buttonCall.node.active = ( turnBet > myBet );

		if( this.buttonCall.node.active == true ) {
			let betValue = turnBet - myBet;
			if( betValue >= this.numberMyChips ){
				this.buttonCall.node.active = false;
				//올인 조건
				//콜버튼 대신 올인을 띄운다
			}
			else{
				this.labelCallValue.string = CommonUtil.getKoreanNumber( betValue );
				// this.labelCall.string = `콜\n${ CommonUtil.getKoreanNumber(betValue) }`;
			}
		}

		let isBet: boolean = ( 0 == turnBet );

		if ( this.rotateType == ENUM_DEVICE_TYPE.MOBILE_PORTRAIT ) {
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

		} else {
			this.buttonBet.node.active = false;
			this.buttonRaise.node.active = false;
			this.buttonConfirm.node.active = false;

			this.numberBetStart = 0 == turnBet ? this.numberBetMin : turnBet * 2;
			this.numberRaiseStart = 0 == turnBet ? this.numberBetMin : minRaise * 2;
	
			this.numberBetRange = myChips;
			this.numberRaiseRange = myChips;
	
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

				this.buttonQuater.node.active = false;
				this.buttonHalf.node.active = false;
				this.buttonFull.node.active = false;
				this.buttonMax.node.active = false;
				
			} else {
				//그냥 여기서 계산하자
				let quater: number = 0;
				let half: number = 0;
				let full: number = 0;
				let max: number = 0;

				if ( isBet == true ) {
					quater = pot * 0.25;
					quater = Math.max( quater, this.numberBetStart);
					quater = Math.min( quater, this.numberBetRange);

					half = pot * 0.5;
					half = Math.max( half, this.numberBetStart);
					half = Math.min( half, this.numberBetRange);

					full = pot * 0.5;
					full = Math.max( full, this.numberBetStart);
					full = Math.min( full, this.numberBetRange);

					max = this.numberBetRange;

				} else {
					quater = pot * 0.25;
					quater = Math.max( quater, this.numberRaiseStart);
					quater = Math.min( quater, this.numberRaiseRange);

					half = pot * 0.5;
					half = Math.max( half, this.numberRaiseStart);
					half = Math.min( half, this.numberRaiseRange);

					full = pot * 0.5;
					full = Math.max( full, this.numberRaiseStart);
					full = Math.min( full, this.numberRaiseRange);

					max = this.numberRaiseRange;
				}

				this.quaterValue  = quater;
				this.halfValue = half;
				this.fullValue = full;
				this.maxValue = max;
				this.betType = ( isBet == true ) ? ENUM_BETTING_TYPE.Bet : ENUM_BETTING_TYPE.Raise;

				this.labelQuaterValue.string = CommonUtil.getKoreanNumber( quater );
				this.labelHalfValue.string = CommonUtil.getKoreanNumber( half );
				this.labelFullValue.string = CommonUtil.getKoreanNumber( full );
				this.labelMaxValue.string = CommonUtil.getKoreanNumber( max );

				this.labelQuaterValue.node.active = true;
				this.labelHalfValue.node.active = true;
				this.labelFullValue.node.active = true;
				this.labelMaxValue.node.active = true;

				this.buttonQuater.node.active = true;
				this.buttonHalf.node.active = true;
				this.buttonFull.node.active = true;
				this.buttonMax.node.active = true;				
			}
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

	private onClickQuater( button: Button ) {
		if ( this.betType == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( this.quaterValue );

		} else {
			this.cbRaise( this.quaterValue );
		}
		AudioController.instance.PlaySound('VOICE_BETTING_QUATER');
		// this.cbBetAnnounce( ENUM_BETTING_KIND.QUATER );
	}

	private onClickHalf( button: Button ) {
		if ( this.betType == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( this.halfValue );

		} else {
			this.cbRaise( this.halfValue );
		}
		AudioController.instance.PlaySound('VOICE_BETTING_HALF');

		// this.cbBetAnnounce( ENUM_BETTING_KIND.HALF );
	}

	private onClickFull( button: Button ) {
		if ( this.betType == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( this.fullValue );

		} else {
			this.cbRaise( this.fullValue );
		}
		AudioController.instance.PlaySound('VOICE_BETTING_FULL');		
		// this.cbBetAnnounce( ENUM_BETTING_KIND.FULL );
	}

	private onClickMax( button: Button ) {
		if ( this.betType == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( this.maxValue );

		} else {
			this.cbRaise( this.maxValue );
		}
		AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');				
		// this.cbBetAnnounce( ENUM_BETTING_KIND.MAX );
	}
}