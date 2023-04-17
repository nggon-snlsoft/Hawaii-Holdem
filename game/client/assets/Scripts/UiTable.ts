import { _decorator, Component, Node, director, Sprite, Vec3, Label, sys,
    instantiate, bezier, UITransform, tween, SpriteFrame, Color, Quat, Button} from 'cc';
import { Board } from './Board';
import { NetworkManager } from './NetworkManager';

import * as PokerEvaluator from "./PokerEvaluator";
import { UiEntity } from './UiEntity';
import { UiPlayerAction } from './UiPlayerAction';
import { Pot, UiPot } from './UiPot';
import { UiSeats } from './UiSeats';
import { UiBuyIn} from "./Game/UiBuyIn";
import { UiControls} from "./Game/UiControls";
import { UiGameSystemPopup} from "./Game/UiGameSystemPopup";
import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { ENUM_RESERVATION_TYPE, UiPlayerActionReservation } from './Game/UiPlayerActionReservation';
import { EMOTICON_TYPE, UiGameChatting } from './Game/UiGameChatting';
import { UiWinEffect } from './Game/UiWinEffect';
import { UiPotChips } from './Game/UiPotChips';
import { UiRoundPotValue } from './Game/UiRoundPotValue';
import { ResourceManager } from './ResourceManager';
import { UiCard } from './Game/UiCard';
import { UiShowDownEffect } from './Game/UiShowDownEffect';
import { UiEffectShowRiver } from './Game/UiEffectShowRiver';
import { UiCommunityCards } from './Game/UiCommunityCards';
import { ENUM_COMMUNTY_CARD_STATE, ENUM_GAME_STATE } from './HoldemDefines';

const { ccclass, property } = _decorator;

let totalCards: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

@ccclass('UiTable')
export class UiTable extends Component {
    @property(UiSeats) uiSeats: UiSeats = null;
	@property(UiPot) uiPot : UiPot = null;
	@property(UiBuyIn) uiBuyIn: UiBuyIn = null;
	@property(UiPlayerActionReservation) uiPlayerActionReservation: UiPlayerActionReservation = null;
	@property(UiCommunityCards) uiCommunityCards: UiCommunityCards = null;

	@property(Node) nodeCardShuffleMessage: Node = null;
	@property(Button) buttonShowCard: Button = null;
	@property(Button) buttonSitOut: Button = null;
	@property(Button) buttonSitBack: Button = null;
	@property(Button) buttonEmoticon: Button = null;
	@property(Button) buttonAddChips: Button = null;

	@property(UiGameChatting) uiGameChatting: UiGameChatting = null;
	@property(UiWinEffect) uiWinEffect: UiWinEffect = null;	
	@property(UiPotChips) uiPotChips: UiPotChips = null;
	@property(UiRoundPotValue) uiRoundPotValue: UiRoundPotValue = null;
	@property(UiShowDownEffect) uiShowDownEffect: UiShowDownEffect = null;
	@property(UiEffectShowRiver) uiEffectShowRiver: UiEffectShowRiver = null;

	private GAME_STATE: ENUM_GAME_STATE = ENUM_GAME_STATE.SUSPEND;
	private CENTER_CARD_STATE: ENUM_COMMUNTY_CARD_STATE = ENUM_COMMUNTY_CARD_STATE.PREPARE;

    private roundState: string = "";
    private spritePotRoot: Sprite = null;

    private entityUiElements: UiEntity[] = [];

    private uiPlayerAction: UiPlayerAction = null;
    private nodeCardDispensingRoot: Node = null;

    private timerRoot: Node = null;
    private labelReadyMessage: Label = null;

    private objPotMoveToWinnerChips: {} = {};
    private objPotReturnChips: {} = {};

    private curPotValue: number = -1;
    private myChips: number = -1;
    private mySeat: number = -1;
	private myCards: number[] = [-1, -1];
    private myWaitStatus: boolean = false;

    private startBetFromServer: number = -1;
    private betMin: number = -1;
    private seatMax: number = 6;
    private seatPlayers: number[] = [];
    private enableSeats: number[] = [];

    private dealerSeatPosition: number = -1;
    private smallBlindSeatPosition: number = -1;
    private bigBlindSeatPosition: number = -1;

    private room: Colyseus.Room = null;
    private msgWINNERS: string = "";

    private isFold: boolean = false;
    private isAllIn: boolean = false;

    private readyMessageHandler: number = -1;
    private countPlayers: number = -1;

	static seatMaxFromServer : number = 9;

	private isSitOutReservation: boolean = false;
	private labelCurrentPot: Label = null;

	private rootPotChips: Node = null;
    private PLAYER_CARDS: {} = null;


    init() {
        this.seatMax = UiTable.seatMaxFromServer;
        globalThis.lib = {};

        PokerEvaluator.exportToGlobal(globalThis.lib);

        Board.table = this;
        
        this.childRegistered();

        this.uiSeats.init(this.seatMax, this.onClickSeatSelect.bind(this));
		this.uiBuyIn.init();
		this.uiGameChatting.init( this.onClickEmoticon.bind(this), this.onClickEmticonExit.bind(this));
		this.setEmoticonButtinInteractive(true);
		this.uiPlayerActionReservation.init();
		this.uiWinEffect.init();
		this.uiPotChips.init();
		this.uiRoundPotValue.init();
		this.uiShowDownEffect.Init();
		this.uiEffectShowRiver.Init();
		this.uiCommunityCards.Init();

        if ( null == NetworkManager.Instance().room ) {
            return;
        }

        this.registRoomEvent(NetworkManager.Instance().room);

		UiControls.instance.setExitCallback( this.onClickExit.bind(this) );
		UiControls.instance.show();

		let bg: Sprite = this.node.getChildByPath('SPRITE_BACKGROUND').getComponent(Sprite);
        if ( bg != null ) {
            ResourceManager.Instance().setBackgroundImage(bg);
            bg.node.active = true;
        }

        let tb: Sprite = this.node.getChildByPath('SPRITE_TABLE').getComponent( Sprite );
        if ( tb != null ) {
            ResourceManager.Instance().setTableImage(tb);
            tb.node.active = true;            
        }

		this.buttonEmoticon.node.on('click', this.onClickShowEmoticon.bind(this), this);
		this.buttonAddChips.node.on('click', this.onClickAddChips.bind(this), this);

		this.hide();
        this.sendMsg("ONLOAD", {

        });
    }


	onClickShowEmoticon(button: Button) {
		AudioController.instance.ButtonClick();		
		this.uiGameChatting.show();
	}

	onClickEmoticon( type: EMOTICON_TYPE, id: number ) {
		this.sendMsg("SHOW_EMOTICON", { 
			seat : this.mySeat, 
			type: type,
			id: id,
		});
		this.uiGameChatting.hide();		

		let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
		if ( uiEntity != null ) {
			uiEntity.setEmoticon(type, id)
		}
	}

	public setEmoticonButtinInteractive(enable: boolean) {
		this.buttonEmoticon.interactable = enable;
	}

	onClickEmticonExit() {

	}

    private childRegistered() {
		this.uiPlayerAction = this.node.getChildByPath( "PLAYER_ACTION" ).getComponent( UiPlayerAction );
		this.uiPlayerAction.hide();

		this.nodeCardDispensingRoot = this.node.getChildByPath( "CARD_DISPENSING_ROOT" );

		let entitiesRoot9 = this.node.getChildByPath( `ENTITIES_9` );
		// let entitiesRoot6 = this.node.getChildByPath( `entities_6p` );

		//let entitiesRootPath = `ENTITIES(${ this.seatMax })`;
		let entitiesRootPath = `ENTITIES_9`;

		if( entitiesRoot9.name === entitiesRootPath ) {
			entitiesRoot9.active = true;
			// entitiesRoot6.active = false;
		}
		else {
			entitiesRoot9.active = false;
			// entitiesRoot6.active = true;
		}

		this.entityUiElements = [];
		let playerMe = this.node.getChildByPath( `${ entitiesRootPath }/ENTITY_ME` ).getComponent( UiEntity );
		if ( playerMe != null ) {
			playerMe.isMe = true;
			playerMe.Init();
			this.entityUiElements.push( playerMe );
		}

		for( let i = 1; i < this.seatMax; i++ ) {
			let elem = this.node.getChildByPath( `${ entitiesRootPath }/ENTITY_${ i }` ).getComponent( UiEntity );
			if ( elem != null ) {
				elem.isMe = false;
				elem.Init();
				this.entityUiElements.push( elem );				
			}
		}

		this.rootPotChips = this.node.getChildByPath('ROUND_POT/POT_CHIPS');

		for ( let i = 1; i < this.entityUiElements.length; i++ ) {
			let entity = this.entityUiElements[i];
			if (entity != null) {
				entity.setEscapee();
			}
		}

		this.spritePotRoot = this.node.getChildByPath( "POT" ).getComponent( Sprite );
		this.spritePotRoot.node.active = false;

		let winnerChips = this.node.getChildByPath( "WINNER_CHIPS" );
		let keys = Object.keys( this.objPotMoveToWinnerChips );
		keys.forEach( elem => {
			let obj = this.objPotMoveToWinnerChips[ elem ];
			for( let i = 0; i < obj.sprChips.length; i++ ) {
				let spr: Sprite = obj.sprChips[ i ];
				spr.node.destroy();
				spr.node.removeFromParent();
			}
			obj.sprChips = [];
		} );

		this.objPotMoveToWinnerChips = {};

		let originalSprChipsCount = winnerChips.children.length;
		for( let loopIdx: number = 0; loopIdx < 10; loopIdx++ ) {
			let cloneSprArray: Sprite[] = [];
			for( let i = 0; i < originalSprChipsCount; i++ ) {
				let node: Node = winnerChips.children[ i ];
				if( false == node.isValid ) {
					continue;
				}

				node.active = false;
				let newNode = instantiate( node );
				newNode.setParent( node.parent );
				newNode.position = new Vec3( node.position );
				newNode.scale = new Vec3( node.scale );
				newNode.name = `sprChip_${ loopIdx }_${ i }`;
				cloneSprArray.push( newNode.getComponent( Sprite ) );
			}

			this.objPotMoveToWinnerChips[ loopIdx ] = { sprChips: cloneSprArray };
		}

		let returnChips = this.node.getChildByPath("RETURN_CHIPS");
		let rKeys = Object.keys(this.objPotReturnChips);

		rKeys.forEach(elem => {
			let obj = this.objPotReturnChips[ elem ];
			for(let i = 0 ; i < obj.sprChips.length; i++){
				let spr : Sprite = obj.sprChips[i];
				spr.node.destroy();
				spr.node.removeFromParent();
			}

			obj.sprChips = [];
		})

		this.objPotReturnChips = {};
		
		let originSprReturnChipsCount = returnChips.children.length;
		for(let i = 0; i < 10;i++){
			let clone: Sprite[] = [];
			for(let j = 0; j < originSprReturnChipsCount; j++){
				let node : Node = returnChips.children[ j ];

				if(false == node.isValid){
					continue;
				}

				node.active = false;
				let newNode = instantiate(node);
				newNode.setParent(node.parent);
				newNode.position = new Vec3(node.position);
				newNode.scale = new Vec3(node.scale);
				newNode.name = `sprChip_${ i }_${ j }`;
				clone.push( newNode.getComponent( Sprite ) );
			}

			this.objPotReturnChips[ i ] = {sprChips : clone};
		}
		/////////////////////////

		this.labelReadyMessage = this.node.getChildByPath("LABLE_READY_MESSAGE").getComponent( Label );
		this.labelReadyMessage.string = "";
		this.labelReadyMessage.node.active = false;

		let isOn = true;

		this.buttonShowCard.node.off('click');
		this.buttonShowCard.node.on('click', this.onClickShowCard.bind(this));
		this.buttonShowCard.node.active = false;

		this.buttonSitOut.node.off('click');
		this.buttonSitOut.node.on('click', this.onClickSitOut.bind(this));
		this.buttonSitOut.node.active = false;

		this.buttonSitBack.node.off('click');
		this.buttonSitBack.node.on('click', this.onClickSitBack.bind(this));
		this.buttonSitBack.node.active = false;

		this.nodeCardShuffleMessage.active = false;

		this.labelCurrentPot = this.node.getChildByPath('LABEL_CURRENT_POT').getComponent(Label);
		this.labelCurrentPot.string = '0';
		this.labelCurrentPot.node.active = false;
    }

    private onClickSeatSelect(no: number)
    {
        this.sendMsg("SEAT_SELECT", {
            selected: no,
        });
    }

    private onSHOW_SELECT_SEAT(msg: any) {
        let limitTime = msg["limitTime"];
        this.uiSeats.startSeatsSelect(limitTime);

		this.node.active = false;
    }

    private onSELECT_SEAT_ERROR(msg: any) {
        this.uiSeats.onResultFail();
    }

    private onUPDATE_SELECT_SEAT(msg: any) {
        this.uiSeats.updateSeatInfo( msg["entities"], msg["seatInfo"], msg["bbSeat"], msg["sbSeat"], msg["dealerSeat"]);
    }

    public onClickSitOut() {
		this.sendMsg("SIT_OUT", { 
			seat : this.mySeat 
		});

		AudioController.instance.ButtonClick();
		this.buttonSitOut.node.active = false;
		this.buttonSitBack.node.active = true;

		let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
		if ( uiEntity != null ) {
			uiEntity.setUiSitOut();
		}
    }

    public onClickSitBack() {
		this.sendMsg("SIT_BACK", {
			seat : this.mySeat
		});

		AudioController.instance.ButtonClick();
		this.buttonSitBack.node.active = false;
		this.buttonSitOut.node.active = false;

		this.isSitOutReservation = false;
    }

    onClickAddChips() {
		AudioController.instance.ButtonClick();
		this.sendMsg( "ADD_CHIPS_REQUEST", {seat: this.mySeat } );
    }

    onClickExit() {
		if ( this.uiSeats.node.active == true ) {
			UiGameSystemPopup.instance.showYesNoPopup("게임종료", "게임을 나가시겠습니까?", ()=>{
				this.uiSeats.end();
				this.room?.leave( false );

				UiGameSystemPopup.instance.closePopup();
			}, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		} else {
			UiGameSystemPopup.instance.showYesNoPopup("게임종료", "게임을 나가시겠습니까?", ()=>{
				this.room?.leave( false );

				UiGameSystemPopup.instance.closePopup();
			}, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
		clearInterval(this.readyMessageHandler);        
        this.node.active = false;
    }

    sitOut() {
		this.sendMsg("SIT_OUT", { 
			seat : this.mySeat 
		});

		this.buttonSitOut.node.active = false;
		this.buttonSitBack.node.active = true;
    }

    registRoomEvent(room: Colyseus.Room ) {
        this.room = room;
        room.onMessage( "NEW_ENTITY", this.onNEW_ENTITY.bind( this ) );
		room.onMessage( "HANDLE_ESCAPEE", this.onHANDLE_ESCAPEE.bind( this ) );

		room.onMessage( "SUSPEND_ROUND", this.onSUSPEND_ROUND.bind( this ) );
		room.onMessage( "READY_ROUND", this.onREADY_ROUND.bind( this ) );
		room.onMessage( "PREPARE_ROUND", this.onPREPARE_ROUND.bind( this ) );        
        room.onMessage( "CARD_DISPENSING", this.onCARD_DISPENSING.bind( this ) );
		room.onMessage( "BLIND_BET", this.onBLIND_BET.bind( this ) );
		room.onMessage( "PRE_FLOP_END", this.onPRE_FLOP_END.bind( this ) );

		room.onMessage( "SHOW_FLOP", this.onSHOW_FLOP.bind( this ) );
		room.onMessage( "FLOP_END", this.onFLOP_END.bind( this ) );

		room.onMessage( "SHOW_TURN", this.onSHOW_TURN.bind( this ) );
		room.onMessage( "TURN_END", this.onTURN_END.bind( this ) );

		room.onMessage( "SHOW_RIVER", this.onSHOW_RIVER.bind( this ) );
		room.onMessage( "RIVER_END", this.onRIVER_END.bind( this ) );

		room.onMessage( 'SHOWDOWN_START', this.onSHOWDOWN_START.bind(this) );		
		room.onMessage( 'SHOWDOWN_FLOP', this.onSHOWDOWN_FLOP.bind(this) );
		room.onMessage( 'SHOWDOWN_TURN', this.onSHOWDOWN_TURN.bind(this) );
		room.onMessage( 'SHOWDOWN_RIVER', this.onSHOWDOWN_RIVER.bind(this) );
		room.onMessage( 'SHOWDOWN_END', this.onSHOWDOWN_END.bind(this) );

		room.onMessage( "CLEAR_ROUND", this.onCLEAR_ROUND.bind( this ) );
        
        //PLAYER ACTION
		room.onMessage( "YOUR_TURN", this.onYOUR_TURN.bind( this ) );
		room.onMessage( "FOLD", this.onFOLD.bind( this ) );
		room.onMessage( "CHECK", this.onCHECK.bind( this ) );
		room.onMessage( "CALL", this.onCALL.bind( this ) );
		room.onMessage( "BET", this.onBET.bind( this ) );
		room.onMessage( "RAISE", this.onRAISE.bind( this ) );
		room.onMessage( "SHOW_CARD", this.onSHOW_CARD.bind( this ) );
		room.onMessage( "PLAYER_CARDS", this.onPLAYER_CARDS.bind( this ) );
		room.onMessage( "WINNERS", this.onWINNERS.bind( this ) );

        room.onMessage( "BUY_IN", this.onBUY_IN.bind( this ) );
		room.onMessage( "RES_BUY_IN", this.onRES_BUY_IN.bind( this ) );
		room.onMessage( "RES_RE_BUY", this.onRES_RE_BUY.bind( this ) );
		
		room.onMessage( "RE_BUY_IN", this.onRE_BUY_IN.bind( this ) );
		room.onMessage( "RES_ADD_CHIPS_REQUEST", this.onRES_ADD_CHIPS_REQUEST.bind( this ) );
		room.onMessage( "RES_ADD_CHIPS", this.onRES_ADD_CHIPS.bind( this ) );

		// room.onMessage( "RES_ADD_CHIPS_PEND", this.onRES_ADD_CHIPS_PEND.bind( this ) );

		room.onMessage( "SIT_OUT", this.onSitOut.bind(this));
		room.onMessage( "SIT_BACK", this.onSitBack.bind(this));

        room.onMessage( "SHOW_SELECT_SEAT", this.onSHOW_SELECT_SEAT.bind(this));
        room.onMessage( "UPDATE_SELECT_SEAT", this.onUPDATE_SELECT_SEAT.bind(this));
		room.onMessage( "SELECT_SEAT_ERROR", this.onSELECT_SEAT_ERROR.bind(this));
		room.onMessage( "SHOW_EMOTICON", this.onSHOW_EMOTICON.bind(this));		
        
        this.room.onMessage( "JOIN", msg => {
            this.onJOIN(room, msg);
        });

        this.room.onMessage( "REJOIN", msg => {
            this.onRE_JOIN(room, msg);
        });

        room.onLeave((code)=>{
            this.leaveRoom(code);
            this.hide();

			if ( this.uiSeats.isSeatsSelectOpen() == true ) {
				this.uiSeats.leave();
			}

            NetworkManager.Instance().room.removeAllListeners();
            NetworkManager.Instance().leaveReason = code;

			director.loadScene("LobbyScene");
        });

        room.onMessage( "ping", this.onPING.bind( this ) );
    }

	private onSHOW_EMOTICON(msg) {
		let seat = msg['seat'];
		if ( seat == this.mySeat ) {
			return;
		}

		let type = msg['type'];
		let id = msg['id'];

		let uiEntity =  this.getUiEntityFromSeat( seat );
		if ( uiEntity != null ) {
			if (type == 0 ) {
				uiEntity.setEmoticon(EMOTICON_TYPE.Emoticon, id);
			} else {
				uiEntity.setEmoticon(EMOTICON_TYPE.Chatting, id);
			}
		}
	}

	public LoadLobby() {
		director.loadScene("LobbyScene");		
	}

    private onPING() {

    }

    public onRE_JOIN(room, msg) {
		console.log('onRE_JOIN');

		return;

		let myEntity = msg[ "yourself" ];

		Board.balance = myEntity.balance;
		Board.big = msg[ "big" ];
		Board.small = msg[ "small" ];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];
		Board.passPrice = msg[ "passPrice" ];

		this.timerRoot.active = msg["useTimePass"];

		this.room = room;
		this.mySeat = myEntity.seat;
		this.myChips = myEntity.chips;
		this.myWaitStatus = myEntity.wait;
		this.isFold = false;
		this.seatPlayers = [];
		this.msgWINNERS = "";
		// this.playersCARD = null;
		this.isAllIn = false;
		this.curPotValue = msg["pot"];

		this.betMin = msg["minBet"];
		this.startBetFromServer = msg["minBet"];

		this.dealerSeatPosition = msg["dealer"];
		this.smallBlindSeatPosition = msg["sb"];
		this.bigBlindSeatPosition = msg["bb"];

		for( let i = 0; i < this.seatMax; i++ ) {
			let seat = this.mySeat + i;
			this.seatPlayers.push( seat % this.seatMax );
		}

		if (true === myEntity.isSitOut) {
			this.buttonSitOut.node.active = false;
			this.buttonSitBack.node.active = true;
		} else {
			this.buttonSitOut.node.active = true;
			this.buttonSitBack.node.active = false;
		}

		this.buttonShowCard.node.active = false;
		let players: any = msg[ "entities" ];
		this.setUiEntities( players );
		this.countPlayers = players.length;
		this.enableSeats = [];

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let entity =  msg[ "entities" ].find( elem => elem.seat == seat );
			let uiEntity = this.entityUiElements[ i ];

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			this.enableSeats.push( entity.seat );
		}		

		// this.setUiCommunityCards( msg[ "openCards" ] );

		// this.myPrimaryCardIndex = msg["primCard"];
		// this.mySecondaryCardIndex = msg["secCard"];

		// let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
		// if (this.myPrimaryCardIndex != -1 && this.mySecondaryCardIndex != -1) {
		// 	let sf: SpriteFrame = ResourceManager.Instance().getCardImage(this.myPrimaryCardIndex + 1);
		// 	// this.setAniOpenHand(uiEntity.spriteHandCards[0], sf, () => {
		// 	// });

		// 	sf = ResourceManager.Instance().getCardImage( this.mySecondaryCardIndex + 1 );


		// 	// this.setAniOpenHand(uiEntity.spriteHandCards[1], sf, () => {
		// 	// 	let handRank = this.getHandRank(this.myPrimaryCardIndex, this.mySecondaryCardIndex, this.numberCommunityCards);
		// 	// 	uiEntity.setUiHandRank(handRank);
		// 	// });

		// 	if (myEntity.fold === true) {
		// 		uiEntity.setUiHandCardsFold();
		// 	}
		// }

		if (msg["centerCardState"] != 0) {
			msg["entities"].forEach(element => {
				let seatNumber = element.seat;
				let entity = this.getUiEntityFromSeat(seatNumber);

				if (seatNumber === this.mySeat || true === element.wait) {
					return;
				}

				// entity.setShowHiddenCard( true );
			});
		}

		let uiDeal = this.getUiEntityFromSeat( this.dealerSeatPosition );
		uiDeal?.setUiPosSymbol( "dealer" );

		let uiSB = this.getUiEntityFromSeat( this.smallBlindSeatPosition );
		uiSB?.setUiPosSymbol( "sb" );

		let uiBB = this.getUiEntityFromSeat( this.bigBlindSeatPosition );
		uiBB?.setUiPosSymbol( "bb" );

		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.show();
    }

    public onJOIN( room, msg) {
		console.log('onJOIN')
		console.log( msg );

		Board.big = msg["big"];
		Board.small = msg["small"];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];

        this.room = room;
		this.GAME_STATE = msg['gameState'];
		this.CENTER_CARD_STATE = msg['centerCardState'];

		//INTIALIZE_TABLE
		this.uiCommunityCards.Reset();
		this.uiPot.maxPotRoot.active = false;
		this.labelCurrentPot.node.active = false;
		this.buttonShowCard.node.active = false;

		this.uiPot.Hide();
		this.uiPotChips.hide();
		this.uiRoundPotValue.hide();

		this.msgWINNERS = '';
		// this.playersCARD = null;

		//INITALIZE_CONTROLS
		this.uiPlayerAction.init( Board.small, Board.big );
		this.uiPlayerAction.hide();
		this.uiPlayerActionReservation.hide();

		//INITALIZE_ENTITIES
		let myEntity = msg["yourself"];		
		Board.balance = myEntity.balance;
		this.mySeat = myEntity.seat;
		this.myChips = myEntity.chips;
		this.myWaitStatus = myEntity.wait;
        this.isFold = false;
		this.isAllIn = false;

        let players: any = msg["entities"];
		this.countPlayers = players.length;
        this.seatPlayers = [];

        for ( let i = 0; i < this.seatMax ; i++) {
            let seat = this.mySeat + i;
            this.seatPlayers.push( seat % this.seatMax );
        }

        this.setUiEntities( players );

		if ( this.GAME_STATE == ENUM_GAME_STATE.SUSPEND ) {
			this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
			this.labelReadyMessage.node.active = true;

			this.uiPot.Hide();
		} else {
			this.dealerSeatPosition = msg["dealer"];
			let dealer = this.getUiEntityFromSeat( this.dealerSeatPosition );
			dealer?.setUiPosSymbol( "dealer" );

			this.smallBlindSeatPosition = msg["sb"];
			let smallBlind = this.getUiEntityFromSeat( this.smallBlindSeatPosition );
			smallBlind?.setUiPosSymbol( "sb" );

			this.bigBlindSeatPosition = msg["bb"];
			let bigBlind = this.getUiEntityFromSeat( this.bigBlindSeatPosition );
			bigBlind?.setUiPosSymbol( "bb" );

			if ( this.GAME_STATE != ENUM_GAME_STATE.PREPARE && 
				 this.GAME_STATE != ENUM_GAME_STATE.READY ) {

				this.curPotValue = msg['pot'];
				this.uiPotChips.show( this.curPotValue );
				this.uiRoundPotValue.show( this.curPotValue );

				players.forEach( (e)=> {
					if ( e.seat != this.mySeat && e.wait != true ) {
						let uiEntity = this.getUiEntityFromSeat( e.seat );							
						if ( uiEntity != null ) {
							uiEntity.SetShowHiddenCard();

							if ( e.fold == true ) {
								uiEntity.SetHandCardsFold();
							}
						}

					}
				});
				this.SetUiCommunityCards( msg[ "openCards" ] );					
			}
		}

        if ( myEntity.isSitOut == true ) {
			this.buttonSitOut.node.active = false;
			this.buttonSitBack.node.active = true;

        } else {
			this.buttonSitOut.node.active = true;
			this.buttonSitBack.node.active = false;
        }

		this.scheduleOnce(()=>{
			AudioController.instance.PlaySound('VOICE_WELCOME');
		}, 0.5);

    }

    leaveRoom(code: any) {
        this.room = null;
        this.clearUiEntities();
		this.clearUiPot();

		this.uiPlayerAction.hide();
		this.uiBuyIn.node.active = false;
		this.isAllIn = false;
    }

    private setUiEntities(entities: any) {
        for (let i = 0; i < this.seatPlayers.length; i++ ) {
            let seat = this.seatPlayers[i];
            let entity = entities?.find( (e) => e.seat === seat );
            let uiEntity = this.getUiEntityFromSeat( seat );
            uiEntity?.setUi( entity );
            if (null !== uiEntity && undefined !== uiEntity ) {
                uiEntity.callbackProfileOpen = ( e ) => {
                }
                uiEntity.callbackProfileClose = () => {
                }
            }
        }
    }

    private clearUiEntities() {
        for ( let i = 0; i < this.seatPlayers.length; i++ ) {
            let seat = this.seatPlayers[ i ];
            let uiEntity = this.getUiEntityFromSeat( seat );
            uiEntity?.setUi( null );
        }
    }

    private setUiPot(pots: any[]) {
		this.spritePotRoot.node.active = true;
		if (null !== pots || undefined !== pots) {
			this.uiPot.Show(pots);
		}
    }

    private clearUiPot() {
		this.spritePotRoot.node.active = false;
		this.labelCurrentPot.node.active = false;
		this.uiPot.Hide();
    }

    private clearPosSymbol() {
		this.entityUiElements.forEach( element => element.clearUiPositionSymbol() );        
    }

	private SetUiCommunityCards( cards: number[] ) {
		if ( cards != null ) {
			this.uiCommunityCards.SetCommunityCards( cards );
		}
	}

    private getUiEntityFromSeat( seat: number ) {
        let idx = this.seatPlayers.findIndex( (e)=> e == seat );
        if ( -1 == idx )
        {
            return;
        }
        let uiEntity = this.entityUiElements[ idx ];
        return uiEntity;
    }

    private getHandRank( primaryCard: number, secondaryCard, communityCards: number[] ): string {
		if(-1 === primaryCard || -1 === secondaryCard){
			return "";
		}

		let array = [];
		communityCards.forEach( elem => {
			if( -1 == elem ) {
				return;
			}
			array.push( totalCards[ elem ] );
		} );

		array.push( totalCards[ primaryCard ] );
		array.push( totalCards[ secondaryCard ] );

		let rs = array.join();
		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );
		return handRank.descr;
    }

	public GetHandsEval( hands: number[], communities: number[] ): string {
		if ( hands == null || hands.length != 2) {
			return;
		}

		if ( communities == null ) {
			return;
		}

		let array = [];

		hands.forEach( e => {
			if( -1 == e ) {
				return;
			}
			array.push( totalCards[ e ] );
		} );

		communities.forEach( e => {
			if( -1 == e ) {
				return;
			}
			array.push( totalCards[ e ] );
		} );

		let rs = array.join();
		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );
		return handRank;
	}

	public getHandsEval( hands: number[], communities: number[] ): string {
		//deplicated
		if ( hands == null || hands.length != 2) {
			return;
		}

		if ( communities == null || communities.length != 5 ) {
			return;
		}

		let array = [];

		hands.forEach( e => {
			if( -1 == e ) {
				return;
			}
			array.push( totalCards[ e ] );
		} );

		communities.forEach( e => {
			if( -1 == e ) {
				return;
			}
			array.push( totalCards[ e ] );
		} );

		let rs = array.join();

		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );
		return handRank;
	}

	private SetMyHandRank() {
		let hand = this.myCards;
		let communities = this.uiCommunityCards.GetCommunityCards();

		let evaluate: any = this.GetHandsEval( hand, communities);
		let uiEntity = this.getUiEntityFromSeat( this.mySeat );
		if ( uiEntity != null ) {
			uiEntity.SetHandRank( evaluate );
		}
    }

	private SetPlayerHandRank( cards: number[], uiEntity: any ) {
		let hand = cards;
		let communities = this.uiCommunityCards.GetCommunityCards();

		let evaluate: any = this.GetHandsEval( hand, communities);
		if ( uiEntity != null ) {
			uiEntity.SetHandRank( evaluate );
		}
	}

	private ClearUiEntities() {
		this.entityUiElements.forEach( element => {
			element.endTurn();
			element.clearUiAction();
			element.clearUiBetValue();			
		} );		
	}

    private clearUiEntitiesAction() {
		this.entityUiElements.forEach( element => {
			element.clearUiAction();
		} );
    }

    private clearUiEntitiesBetValue() {
		this.entityUiElements.forEach( element => {
			element.clearUiBetValue();
		} );
    }

    private isEnableSeat( seat: number ): boolean {
		return null != this.enableSeats.find( elem => elem == seat );
    }

    public sendMsg(key: string, msg: object) {
        this.room.send(key, msg);
    }

    private onNEW_ENTITY( msg ) {
		let newEntity = msg[ "newEntity" ];
		let uiEntity = this.getUiEntityFromSeat( newEntity.seat );
		uiEntity?.setUi( newEntity );
    }

    private onCARD_DISPENSING( msg ) {
		console.log('onCARD_DISPENSING');
		this.uiCommunityCards.Reset();

		this.myCards = [msg[ "primary" ], msg[ "secondary" ]];
		this.CardDispensing();
    }

    private onYOUR_TURN( msg ) {
		console.log('onYOUR_TURN');

		let seat = msg[ "player" ];
		let duration = msg["duration"];

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let uiEntity = this.entityUiElements[ i ];
			if( seat == this.seatPlayers[ i ] ) {
				uiEntity?.startTurn(duration);
				uiEntity?.StartActionTimer();
				continue;
			}
			uiEntity?.endTurn();
		}

		if( this.mySeat == seat ) {

			let curBet = msg[ "maxBet" ];
			let myBet = msg[ "currBet" ];
			let minRaise = msg[ "minRaise" ];
			let chips = msg[ "chips" ];
			let curPot = msg[ "currPot" ];
			let isLast = msg["isLast"];
			let hasAction = msg["action"];

			AudioController.instance.PlaySound('MY_TURN');

			let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
			if ( uiEntity != null ) {
				if ( uiEntity.getIsUiSitOut() == true ) {
					let obj = {
						seat: this.mySeat
					};
					this.sendMsg( "FOLD", obj );
					this.uiPlayerAction.hide();
					return;					
				}
			}

			let reservation = this.uiPlayerActionReservation.checkReservation( myBet, curBet );
			if ( reservation != ENUM_RESERVATION_TYPE.RESERVATION_NONE ) {

				this.uiPlayerActionReservation.hide();
				this.uiPlayerAction.hide();

				this.entityUiElements.forEach( element => element.endTurn() );					
				if ( reservation == ENUM_RESERVATION_TYPE.RESERVATION_FOLD ) {

					let obj = {
						seat: this.mySeat
					};

					this.uiPlayerActionReservation.reset( true );
					this.scheduleOnce(()=>{
						this.sendMsg( "FOLD", obj );
					}, 1);
					
				} else if ( reservation == ENUM_RESERVATION_TYPE.RESERVATION_CHECK ) {

					let obj = {
						seat: this.mySeat,
					};

					this.uiPlayerActionReservation.reset( true );
					this.scheduleOnce(()=>{
						this.sendMsg( "CHECK", obj );
					}, 1);
				}				
				return;

			} else {
				uiEntity.StartActionTimer();
			}

			this.uiPlayerActionReservation.hide();
			this.uiPlayerAction.show( this.betMin, curBet, minRaise, curPot, myBet, chips, isLast, hasAction);
			this.uiPlayerAction.cbCheck = () => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					seat: this.mySeat,
				};
				this.sendMsg( "CHECK", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbCall = ( betValue ) => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "CALL", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbBet = ( betValue ) => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};

				this.sendMsg( "BET", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbRaise = ( betValue ) => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					seat: this.mySeat
				};

				this.sendMsg( "RAISE", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbAllIn = ( betValue) => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "ALLIN", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbFold = () => {
				this.entityUiElements.forEach( element => element.endTurn() );

				let obj = {
					seat: this.mySeat
				};
				this.sendMsg( "FOLD", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbBetAnnounce = ( kind )=> {
				let obj = {
					seat: this.mySeat,
					kind: kind,
				};

				// this.sendMsg('BET_ANNOUNCE', obj);
			};
		}
		else {
			this.uiPlayerAction.hide();
			let isSitOutStatus: boolean = false;

			let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
			if ( uiEntity != null ) {
				if ( uiEntity.getIsUiSitOut() == true ) {
					isSitOutStatus = true;
				}

				if ( uiEntity.isFold == true || this.myWaitStatus == true ) {
					return;
				}

				let curBet = msg[ "maxBet" ];
				let myBet = msg[ "currBet" ];

				this.uiPlayerActionReservation.show( myBet, curBet);
			}
		}
    }

    private onBLIND_BET( msg ) {
		this.roundState = "BLIND_BET";

		this.betMin = msg[ "maxBet" ];

		this.clearUiEntitiesAction();
		this.clearUiEntitiesBetValue();

		this.uiPlayerActionReservation.reset();
		this.uiPlayerActionReservation.showCheck( false );

		let sb = msg[ "smallBlind" ];
		if ( sb != null ) {
			let uiSB = this.getUiEntityFromSeat( sb.seat );
			if (null != uiSB) {
				uiSB?.setUiBetValue(sb.currBet, Color.GRAY);
				uiSB?.setUiBlindBet(sb.chips, true, false );
			}

			if( this.mySeat == sb.seat ) {
				this.myChips = sb.chips;
			}
		}

		let bb = msg[ "bigBlind" ];
		if ( bb != null ) {
			let uiBB = this.getUiEntityFromSeat( bb.seat );
			if (null != uiBB) {
				uiBB?.setUiBetValue(bb.currBet, Color.GRAY);
				uiBB?.setUiBlindBet(bb.chips, false, true );
			}

			if( this.mySeat == bb.seat ) {
				this.myChips = bb.chips;
				this.uiPlayerActionReservation.showCheck( true );

			}
		}

		let missSb = msg["missSb"];
		let missBb = msg["missBb"];
		if ( missBb != null ) {
			for ( let i: number = 0 ; i < missBb.length ; i++ ) {
				let ui = this.getUiEntityFromSeat(missBb[i].seat);
				if (null != ui) {
					ui?.setUiBetValue(bb.currBet, Color.GRAY);
					ui?.setUiBlindBet(missBb[i].chips, false, true );
				}
			}
		}

		if ( missSb != null ) {
			for ( let i: number = 0 ; i < missSb.length ; i++ ) {
				let ui = this.getUiEntityFromSeat(missSb[i].seat);
				if (null != ui) {
					let isBB: boolean = false;
					for ( let j: number = 0; j < missBb.length ; j++) {
						if ( missSb[i].seat == missBb[j].seat ) {
							isBB = true;
							break;
						}
					}

					if ( false === isBB ) {
						ui?.setUiBlindBet(missSb[i].chips, true, false );
					} else {
						// ui?.setMissSmallBlindButton(false);
					}
				}
			}
		}

		let player = msg["player"];
		for ( let i: number = 0 ; i < player.length ; i++ ) {
			let ui = this.getUiEntityFromSeat(player[i]);
			if (null != ui) {
				// ui?.clearMissButton();
			}
		}

		this.curPotValue = msg[ "pot" ];
		this.uiPot.UpdatePotTotal(this.curPotValue);

		this.uiPotChips.show( this.curPotValue );
		this.uiRoundPotValue.show( this.curPotValue );
    }

    private onSUSPEND_ROUND( msg ) {
		console.log('onSUSPEND_ROUND');

		this.roundState = "SUSPEND_ROUND";
		this.labelReadyMessage.node.active = false;

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.enableSeats = [];

		this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
		this.labelReadyMessage.node.active = true;

		this.nodeCardShuffleMessage.active = false;

		this.uiPot.Hide();
		this.labelCurrentPot.node.active = false;

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let entity = entities.find( elem => elem.seat == seat );
			let uiEntity = this.entityUiElements[ i ];

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			uiEntity?.setUiPrepareRound( entity );

			if( seat == this.mySeat ) {
				this.myWaitStatus = entity.wait;
				this.isFold = false;
			}

			this.enableSeats.push( entity.seat );
		}
    }

    private onREADY_ROUND( msg ) {
		console.log('onREADY_ROUND');		
		this.roundState = "READY_ROUND";

		let timeMs = msg[ "timeMS" ] / 1000;
		let lb:string = "새로운 게임이 " + timeMs + " 초 후에 시작합니다";

		this.labelReadyMessage.string = lb;
		this.labelReadyMessage.node.active = true;

		this.readyMessageHandler = setInterval(()=> {
			timeMs--;
			lb = "새로운 게임이 " + timeMs + " 초 후에 시작합니다";
			this.labelReadyMessage.string = lb;
			if (timeMs < 0) {
				this.labelReadyMessage.node.active = false;
				clearInterval(this.readyMessageHandler);
			}
		}, 1000);
    }

    private onPREPARE_ROUND( msg ) {
		console.log('onPREPARE_ROUND');
		this.roundState = "PREPARE_ROUND";

		this.nodeCardShuffleMessage.active = false;
		this.labelReadyMessage.node.active = false;

		this.dealerSeatPosition = msg[ "dealerSeatPos" ];
		this.smallBlindSeatPosition = msg[ "sbSeatPos" ];
		this.bigBlindSeatPosition = msg[ "bbSeatPos" ];

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.startBetFromServer = msg[ "startBet" ];
		this.betMin = msg[ "startBet" ];

		// this.myPrimaryCardIndex = -1;
		// this.mySecondaryCardIndex = -1;

		this.enableSeats = [];
		this.isAllIn = false;

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let entity = entities.find( elem => elem.seat == seat );
			let uiEntity = this.entityUiElements[ i ];

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			if( seat == this.mySeat ) {
				this.myWaitStatus = entity.wait;
				this.isFold = false;
			}

			if( true == entity.wait ) {
				uiEntity.setUiWait();
				continue;
			}

			uiEntity?.setUiSitBack();
			this.enableSeats.push( entity.seat );
			uiEntity?.setUiPrepareRound( entity );
		}

		// this.clearUiCommunityCards();
		this.clearUiPot();
		this.clearPosSymbol();

		let uiDeal = this.getUiEntityFromSeat( this.dealerSeatPosition );
		uiDeal?.setUiPosSymbol( "dealer" );

		let uiSB = this.getUiEntityFromSeat( this.smallBlindSeatPosition );
		uiSB?.setUiPosSymbol( "sb" );

		let uiBB = this.getUiEntityFromSeat( this.bigBlindSeatPosition );
		uiBB?.setUiPosSymbol( "bb" );
    }

    private onHANDLE_ESCAPEE( msg ) {
		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );
		uiEntity?.setEscapee();
    }

	private onPRE_FLOP_END( msg ) {
		console.log('onPRE_FLOP_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.getUiEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.show( potValue );
						}
					});
				}
			}
		}
    }

    private onSHOW_FLOP( msg ) {
		console.log('onSHOW_FLOP');
		this.roundState = "SHOW_FLOP";

		this.uiPlayerActionReservation.resetCheck();

		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];
		console.log(cards);

		this.uiCommunityCards.ShowFlopCards( cards, ()=>{
			this.SetMyHandRank();
		} );

		let pot = msg['potTotal'];
		this.uiPot.UpdatePotTotal( pot );
    }

	private onFLOP_END( msg ) {
		console.log('onFLOP_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.getUiEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );
						}
					});
				}
			}
		}
    }

    private onSHOW_TURN( msg ) {
		console.log( 'onSHOW_TURN' );		
		this.roundState = "SHOW_TURN";

		this.uiPlayerActionReservation.resetCheck();
		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];
		console.log('onSHOW_TURN');
		console.log(cards);

		this.uiCommunityCards.ShowTurnCard( cards, ()=>{
			this.SetMyHandRank();
		} );
    }

	private onTURN_END( msg ) {
		console.log('onTURN_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.getUiEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );
						}
					});
				}
			}
		}
    }	

    private onSHOW_RIVER( msg ) {
		console.log('onSHOW_RIVER');
		this.roundState = "SHOW_RIVER";

		this.uiPlayerActionReservation.resetCheck();
		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];

		this.uiCommunityCards.ShowRiverCard( cards, ()=>{
			this.SetMyHandRank();
		});
    }

	private onRIVER_END( msg ) {
		console.log('onRIVER_END');
		let potValue = msg['pot'];

		this.clearUiEntitiesAction();

		let cnt = 0;

		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.getUiEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );							
						}
					});
				}
			}
		}
    }

	private onSHOWDOWN_START ( msg ) {
		console.log('onSHOWDOWN_START');
		console.log( msg );

		let pot: any = msg['pot'];

		this.uiPlayerActionReservation.reset();
		this.uiPlayerAction.hide();
		this.entityUiElements.forEach(element => element.endTurn());

		let hands = msg['hands'];
		let keys = Object.keys( hands );
		this.PLAYER_CARDS = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			this.PLAYER_CARDS[ seat ] = {
				cards: [ hands[key][0], hands[key][1] ],
			};
		} );

		this.ChipsMoveToPot( pot, ()=>{
			this.uiRoundPotValue.show(pot);
			this.uiShowDownEffect.Show(()=>{
				this.ShowPlayersHand();
			});
		});
	}

	private onSHOWDOWN_FLOP( msg ) {
		console.log('onSHOWDOWN_FLOP');
		console.log(msg);
		let cards = msg['cards'];

		this.uiCommunityCards.ShowFlopCards(cards, ()=>{
			this.UpdatePlayerHandRank();
		});
	}

	private onSHOWDOWN_TURN( msg ) {
		console.log('onSHOWDOWN_FLOP');
		console.log(msg);
		let cards = msg['cards'];

		this.uiCommunityCards.ShowTurnCard( cards, ()=>{
			this.UpdatePlayerHandRank();			
		});
	}

	private onSHOWDOWN_RIVER( msg ) {
		console.log('onSHOWDOWN_FLOP');
		console.log(msg);
		let cards = msg['cards'];
		let river = cards[0];

		this.uiEffectShowRiver.Show( river, ()=>{
			this.uiCommunityCards.ShowRiverCardImmediate( cards );
			this.UpdatePlayerHandRank();
		});
	}

	private onSHOWDOWN_END( msg ) {

	}
	
	private ChipsMoveToPot( value, cbDone: ()=>void ) {
		let cnt = 0;

		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.getUiEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( value );
							this.uiRoundPotValue.updatePotVaule( value );

							if ( cbDone != null ) {
								cbDone();
							}
						}
					});
				}
			}
		}		
	}

    private onCLEAR_ROUND( msg ) {
		console.log('onCLEAR_ROUND');

		this.uiCommunityCards.Reset();

		this.labelReadyMessage.node.active = false;
		this.nodeCardShuffleMessage.active = false;

		this.uiWinEffect.hide();
		this.uiPotChips.hide();
		this.uiRoundPotValue.hide();

		this.isAllIn = false;
		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.uiPlayerActionReservation.reset();

		this.nodeCardShuffleMessage.active = true;
		AudioController.instance.PlaySound('CARD_SHUFFLE');

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let uiEntity = this.getUiEntityFromSeat( seat );
			let entity = entities.find( elem => elem.seat == seat );

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			uiEntity.SetClearRound( entity );
			if( seat == this.mySeat ) {
				this.myChips = entity.chips;
			}
		}

		this.setUiHideHiddenCard();
		this.clearUiPot();

		let me = entities.find( elem => elem.seat == this.mySeat );

		if(me === null || me === undefined)	{
			return;
		}

		Board.balance = me.balance;
		if( me.enoughChip == false ) {

			let self = this;
			let leave: boolean = false;
			if( Board.balance + me.chips < Board.minStakePrice ) {

				this.scheduleOnce(()=>{
					if ( self != null ) {
						UiGameSystemPopup.instance.closePopup();
						self.room?.leave(false);						
					}

				}, 5 );

				UiGameSystemPopup.instance.showOkPopup('리 바이인', '최소 바이인을 할 수 없습니다.\r\n테이블에서 나갑니다.', ()=>{
					UiGameSystemPopup.instance.closePopup();
					self.room?.leave(false);
					self = null;
				} );

				return;
			}


			this.uiBuyIn.reBuyIn( Board.balance, this.myChips , (res)=>{
				this.sendMsg('RE_BUY', {
					seat: this.mySeat,
					amount: res,
				});
			}, ()=>{
				self.room?.leave();
			});
		}
		this.buttonShowCard.node.active = false;
    }

    private onCHECK( msg ) {
		console.log('onCHECK');

		this.curPotValue = msg[ "pot" ];
		this.labelCurrentPot.string = CommonUtil.getKoreanNumber( this.curPotValue );
		this.uiPot.UpdatePotTotal(this.curPotValue);

		AudioController.instance.PlaySound('VOICE_ACTION_CHECK');
		this.uiPlayerActionReservation.showCheck( true );

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );

		if(null === uiEntity || undefined === uiEntity){
			return;
		}

		uiEntity?.setUiAction( "check" );
    }

    private onRAISE( msg ) {

		// this.clearUiEntitiesAction();
		this.curPotValue = msg[ "pot" ];
		this.labelCurrentPot.string = CommonUtil.getKoreanNumber( this.curPotValue );
		this.uiPlayerActionReservation.showCheck( false );

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );
		if( null == uiEntity ) {
			return;
		}

		let chips = Number.parseInt( msg[ "chips" ] );
		
		uiEntity?.setUiChips( chips );
		if( this.mySeat == seat ) {
			this.myChips = chips;
		}

		if( true == msg[ "allin" ] ) {
			uiEntity?.setUiAllIn();			
			AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
		}
		else {
			uiEntity?.setUiAction( "raise" );
			AudioController.instance.PlaySound('BET_CHIPS');			
		}

		this.setUiPot(msg["dpPot"]);
		this.uiPot.UpdatePotTotal(this.curPotValue);

		uiEntity?.setUiBetValue( msg[ "bet" ], Color.GRAY );
    }

    private onFOLD( msg ) {
		AudioController.instance.PlaySound('VOICE_ACTION_DIE');

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );
		if( null == uiEntity ) {
			return;
		}

		uiEntity.clearUiAction();

		if( this.mySeat != seat ) {
			uiEntity.clearUiHandCards();
		}
		else {
			uiEntity.setUiHandCardsFold();
			this.isFold = true;
		}

		uiEntity.setUiFold();

		if( this.mySeat == seat ) {
			return;
		}
    }

    private onCALL ( msg ) {

		this.curPotValue = msg[ "pot" ];
		this.labelCurrentPot.string = CommonUtil.getKoreanNumber( this.curPotValue );

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );
		
		if(null === uiEntity || undefined === uiEntity){
			return;
		}

		let chips = Number.parseInt( msg[ "chips" ] );
		uiEntity?.setUiChips( chips );

		if( this.mySeat == seat ) {
			this.myChips = chips;
		}

		if( true == msg[ "allin" ] ) {
			uiEntity?.setUiAllIn();
			AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
		}
		else {
			uiEntity?.setUiAction( "call" );
			AudioController.instance.PlaySound('VOICE_ACTION_CALL');
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);

		uiEntity?.setUiBetValue( msg[ "bet" ], Color.GRAY );
    }

    private onBET ( msg ) {

		this.curPotValue = msg[ "pot" ];
		this.labelCurrentPot.string = CommonUtil.getKoreanNumber( this.curPotValue );
		this.uiPlayerActionReservation.showCheck( false );

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );
		if( null == uiEntity ) {
			return;
		}

		let chips = Number.parseInt( msg[ "chips" ] );
		uiEntity?.setUiChips( chips );

		if( this.mySeat == seat ) {
			this.myChips = chips;
		}

		if( true == msg[ "allin" ] ) {
			uiEntity?.setUiAllIn();
			AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
		}
		else {
			uiEntity?.setUiAction( "bet" );
			AudioController.instance.PlaySound('BET_CHIPS');
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);

		uiEntity?.setUiBetValue( msg[ "bet" ], Color.GRAY );
    }

    private onSitOut( msg: any ) {
		console.log('onSitOut');

		let seatNumber = msg["seat"];

		if(null === seatNumber || undefined === seatNumber){
			return;
		}

		let uiEntity = this.getUiEntityFromSeat(seatNumber);
		uiEntity?.setUiSitOut();

		if(seatNumber == this.mySeat){
			this.buttonSitOut.node.active = false;
			this.buttonSitBack.node.active = true;	
		}
    }

    private onSitBack( msg: any ) {
		let seatNumber = msg["seat"];
		
		if(null === seatNumber || undefined === seatNumber){
			return;
		}

		if(seatNumber !== this.mySeat){
			let uiEntity = this.getUiEntityFromSeat(seatNumber);
			uiEntity?.setUiSitBack();
			return;
		}
		else {
			let uiEntity = this.getUiEntityFromSeat(seatNumber);
			uiEntity?.setUiSitBack();			
		}

		this.buttonSitOut.node.active = true;
		this.buttonSitBack.node.active = false;
    }

    private onSHOW_CARD( msg ) {
		let seat = msg[ "seat" ];
		let cards = msg[ "cards" ];

		// if( false == this.isEnableSeat( seat) || this.mySeat == seat) {
		// 	if (this.mySeat == seat) {
		// 		let handRank = this.getHandRank( cards[0], cards[1], this.numberCommunityCards );
		// 	}
		// 	return;
		// }

		// this.playersCARD = {};

		let uiEntity = this.getUiEntityFromSeat( seat );
		if( null == uiEntity ) {
			return;
		}

		let primaryCard = cards[ 0 ];
		let secondaryCard = cards[ 1 ];
		// this.playersCARD[ seat ] = { primaryCard: primaryCard, secondaryCard: secondaryCard };

		// uiEntity.spriteHandCards[ 0 ].spriteFrame = ResourceManager.Instance().getCardImage( primaryCard + 1 );
		// uiEntity.spriteHandCards[ 1 ].spriteFrame = ResourceManager.Instance().getCardImage( secondaryCard + 1 );

		// uiEntity.spriteHandCards[ 0 ].node.active = true;
		// uiEntity.spriteHandCards[ 1 ].node.active = true;

		// let handRank = this.getHandRank( primaryCard, secondaryCard, this.numberCommunityCards );
		// uiEntity.setUiHandRank( handRank );
		// uiEntity.setShowHiddenCard( false );

		AudioController.instance.PlaySound('CARD_SHOW');
    }

    private onPLAYER_CARDS( msg ) {
		console.log( 'onPLAYER_CARDS ');

		let allin = msg[ "allin" ];

		if ( allin == true ) {
			return;
		}

		let cards = msg[ "cards" ];
		let keys = Object.keys( cards );
		this.PLAYER_CARDS = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			this.PLAYER_CARDS[ seat ] = {
				cards: [ cards[key][0], cards[key][1] ],
			};
		} );

		this.ShowPlayersHand();
		this.ClearUiEntities();
    }

    private onWINNERS ( msg ) {
		console.log('onWINNERS');
		this.msgWINNERS = msg;

		this.uiPlayerActionReservation.reset();
		this.uiPlayerAction.hide();

		this.SetWinners();

		// this.setUiWinners();

		// let me = msg.winners.find((elem) => {return elem.seat === this.mySeat});

		// if( msg.skip == true ){
		// 	if ( this.buttonShowCard == null ) {
		// 		return;
		// 	}

		// 	if (this.isAllIn == true) {
		// 		this.buttonShowCard.node.active = false;

		// 		let folders = msg["folders"];
		// 		for( let i = 0; i < folders.length; i++ ) {
		// 			if( folders[ i ] == this.mySeat ) {
		// 				this.buttonShowCard.node.active = true;
		// 				break;
		// 			}
		// 		}
		// 	} else {
		// 		let timer:number = 0;
		// 		timer = setTimeout( () => {
		// 			if ( this.buttonShowCard != null ) {
		// 				this.buttonShowCard.node.active = true;
		// 			}

		// 			clearTimeout(timer);
		// 		}, 1500 );
		// 	}
		// 	return;
		// } else {
		// 	//msg.skip == true;
		// }
		// this.buttonShowCard.node.active = true;

    }

    private onClickShowCard( button: Button ) {
		button.node.active = false;
		AudioController.instance.ButtonClick();		
		if(null == this.msgWINNERS){
			return;
		}

		let obj = {
			seat: this.mySeat
		};

		this.sendMsg( "SHOW_CARD", obj );
    }

    private setUiHideHiddenCard() {
		this.enableSeats.forEach( seat => {

			let uiEntity = this.getUiEntityFromSeat( seat );
			if( null == uiEntity ) {
				return;
			}

			if( this.mySeat == seat ) {
				return;
			}

			// uiEntity.spriteHiddenCards[ 0 ].node.active = false;
			// uiEntity.spriteHiddenCards[ 1 ].node.active = false;
		} );
    }

    private SetWinners() {
		console.log('SetWinners');

		let entities = this.msgWINNERS[ "winners" ];

		if ( this.msgWINNERS['skip'] == true ) {
			let cnt: number = 0;
			let potValue = this.msgWINNERS['pot'];

			for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
				let seat = this.seatPlayers[ i ];

				if( this.isEnableSeat( seat ) == true ) {
					let uiEntity = this.getUiEntityFromSeat(seat);
					if ( uiEntity != null ) {
						cnt++;
						uiEntity.setChipsMoveToPot( cnt, this.uiRoundPotValue.node , ( idx: number )=>{
							uiEntity.clearUiBetValue();

							if ( (cnt) == idx) {
								this.uiPotChips.show( potValue );
								this.uiRoundPotValue.show( potValue );

								this.scheduleOnce(()=>{
									this.ResultSkipAnimation( entities, this.msgWINNERS["dpPot"] );
								}, 1.0 );
							}
						});
					}
				}
			}
		} else {
			this.ResultPotAnimation( entities, this.msgWINNERS["dpPot"]).then(() =>{
				this.setAniPotUiFadeOut();
			});
		}
    }

	private async ResultSkipAnimation ( winners: any[], pot: any[] ) {
		let uiPots : Pot[] = this.uiPot.GetPots();		
		for(let i = 0; i < winners.length; i++){
			let winner = winners[i];

			let uiEntity = this.getUiEntityFromSeat( winner.seat );

			uiEntity?.setUiPlay();
			this.uiPot.UpdatePotTotal( winner.winAmount );

			let isReturn : boolean = winner.fold;
			if ( isReturn == false ) {
				uiEntity.SetWinner( this.uiRoundPotValue.node , winner.winAmount );
				AudioController.instance.PlaySound('WIN');
			}
		}
		
		uiPots.forEach(element => {
			element.ClearCallback();
		});

		this.uiPot.UpdatePotTotal(0);
		this.uiPot.HidePotInfo();
		await new Promise(ret => setTimeout(ret, 2000));
	}

    private async ResultPotAnimation(winners: any[], pot: any[] ) {

		let uiPots : Pot[] = this.uiPot.GetPots();
		
		this.setUiPot(pot);

		let svPots : any[] = this.uiPot.svPots;

		let returnPot : any[] = [];
		let showPot : any[] = [];

		let totalPotValue = 0;

		svPots.forEach(element => {
			totalPotValue += element.total;

			if(element.rake != null){
				totalPotValue -= element.rake;
			}

			if(element.players.length <= 1){
				returnPot.push(element);
				return;
			}

			showPot.push(element);
		});

		let potCount = showPot.length;

		this.uiPot.UpdatePotTotal(totalPotValue);
		this.uiPot.SetPotCount(potCount);

		let retAnimCount = 0;

		for (let i = 0; i < returnPot.length; i++) {
			let pot: any = returnPot[i];

			if (pot.players.length > 1) {
				continue;
			}

			totalPotValue -= pot.rake != null ? pot.total - pot.rake : pot.total;

			this.uiPot.UpdatePotTotal(totalPotValue);

			let uiEntity = this.getUiEntityFromSeat(pot.players[0]);

			uiEntity?.setUiPlay();	
			uiEntity?.SetReturn( pot.total );
			retAnimCount++;
		}

		await new Promise( ret => setTimeout(ret, 1500) );

		for(let i = 0; i < showPot.length; i++){
			let pot = showPot[i];

			let info: any = null;
			for(let j = 0; j < pot.winner.length; j++){
				let chip = pot.rake == undefined ? pot.total / pot.winner.length : (pot.total - pot.rake) / pot.winner.length;
				
				let uiEntity = this.getUiEntityFromSeat( pot.winner[j] );
				
				if(uiEntity != null ){
					uiEntity?.setUiPlay();
					uiEntity.SetWinner( this.uiRoundPotValue.node , chip );
				}
			}

			info = winners.find((elem) => {return elem.seat == pot.winner[0];});
			if ( info != null ) {
				this.uiWinEffect.show( info.eval.handType );
			}

			let wns: any[] = [];
			for ( let w: number = 0 ; w < pot.winner.length ; w++ ) {
				let e = winners.find ( (elem) => { 
					return elem.seat == pot.winner[w];
				});

				if ( e != null ) {
					wns.push(e);
				}
			}

			this.ShowWinningCards(wns);
			AudioController.instance.PlaySound('WIN');

			potCount--;
			this.uiPot.SetPotCount(potCount);

			totalPotValue -=  pot.rake != null ? pot.total - pot.rake : pot.total;

			this.uiPot.UpdatePotTotal(totalPotValue);

			let count = i + 1;

			for(let j = 0; j < uiPots.length; j++){
				let ui = uiPots[j];
				ui.ClearCallback();
				
				if(count >= showPot.length){
					ui.showRoot.active = false;
					continue;
				}

				let potInfo = showPot[count];

				ui.showRoot.active = true;
				ui.valueLabel.string = undefined == potInfo.rake ? CommonUtil.getKoreanNumber(potInfo.total) : CommonUtil.getKoreanNumber(potInfo.total - potInfo.rake) + " / " + CommonUtil.getKoreanNumber(potInfo.rake);
				ui.valueLabel.string = undefined == potInfo.rake ? potInfo.total.toString() : 
				(potInfo.total - potInfo.rake).toString() + " / " + (potInfo.rake).toString();
				count++;
			}

			this.uiPot.HidePotInfo();
			await new Promise(ret => setTimeout(ret, 2000));
		}
    }

	private ShowWinningCards( wns: any ) {
		console.log('ShowWinningCards');

		let cards: any = this.msgWINNERS['cards'];
		console.log(cards);		

		let pools: number[] = [];
		wns.forEach( ( e )=>{
			let c: any = this.getHandsEval( e.cards, cards )['cards'];
			c.forEach( (elem)=> {
				let name = elem.value + elem.suit;
				let num = this.ConvertCardNameToIndex( name );

				pools.push(num);
			});

			this.uiCommunityCards.SetWinCards( pools );

			let uiEntity = this.getUiEntityFromSeat(e.seat);
			if ( uiEntity != null ) {
				uiEntity.SetWinCards(pools);
			}
		});
	}

	private ConvertCardNameToIndex( name: string ): number {
		let n: number = -1;
		for ( let i: number = 0 ; i < totalCards.length; i++ ) {
			if ( name == totalCards[i] ) {
				n = i;
				break;
			}
		}
		return n;
	}

	private CardDispensing() {
		let seats: number[] = [];
		for( let i: number = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if ( this.isEnableSeat ( seat) == false ) {
				continue;
			}

			seats.push(i);
			let uiEntity = this.entityUiElements[i];
			if ( uiEntity != null ) {

				uiEntity.PrepareDispensingCards();
			}
		}

		this.SetDispensingAnimation( seats, 0, ()=>{
			this.SetDispensingAnimation( seats, 1, ()=>{

				if ( this.isEnableSeat ( this.mySeat ) == true ) {
					this.ShowMyHands();
				}
			});
		});
	}

	private SetDispensingAnimation( seats: any, card: number, cb: ()=> void ) {
		let interval = 0.1;
		let duration = 0.2;

		for ( let i: number = 0 ; i < seats.length; i++ ) {
			let uiEntity = this.entityUiElements[ seats[i] ];
			if (uiEntity != null ) {

				uiEntity.CardDispensing( card, i, duration, i * interval, (idx)=>{
					if ( (seats.length - 1 ) == idx ) {
						if ( cb != null ) {
							cb();
						}
					}
				});
			}
		}
	}

	private ShowPlayersHand() {
		let keys = Object.keys( this.PLAYER_CARDS );
		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if ( seat != this.mySeat ) {
				let uiEntity = this.getUiEntityFromSeat( seat );
				if ( uiEntity != null ) {
					uiEntity.HideHiddenCard();

					uiEntity.ShowHands( this.PLAYER_CARDS[key].cards, ()=>{
						this.SetPlayerHandRank( this.PLAYER_CARDS[key].cards, uiEntity );
					} );
				}
			}
		} );
	}

	private UpdatePlayerHandRank() {
		let keys = Object.keys( this.PLAYER_CARDS );
		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if ( seat != this.mySeat ) {
				let uiEntity = this.getUiEntityFromSeat( seat );
				if ( uiEntity != null ) {
					this.SetPlayerHandRank( this.PLAYER_CARDS[key].cards, uiEntity );
				}
			}
			else {
				this.SetMyHandRank();
			}
		} );
	}

	private ShowMyHands() {

		let uiEntity = this.getUiEntityFromSeat( this.mySeat );
		if ( uiEntity != null ) {

			uiEntity.ShowHands( this.myCards, ()=>{
				this.SetMyHandRank();
			} );
		}
	}
    
    private setAniPotMoveToWinner( startNode: Node, seat: number, movingChipsIdx: number, chips: number, 
        isPlaySound: boolean, isReturn: boolean, duration: number = 1) {

			let obj = false === isReturn ?  this.objPotMoveToWinnerChips[ movingChipsIdx ] : this.objPotReturnChips[ movingChipsIdx ];
			let uiEntity = this.getUiEntityFromSeat( seat );
	
			if(null == uiEntity){
				return;
			}
	
			if (true === isReturn) {
	
				for (let i = 0; i < obj.sprChips.length; i++) {
					let moveTarget = obj.sprChips[i];
					let delay = i * 0.05;
	
					let fromNode = null === startNode || undefined === startNode ? this.uiPot.maxPotRoot : startNode;
	
					let pos = fromNode.parent.getComponent(UITransform).convertToWorldSpaceAR(fromNode.position);
					pos = moveTarget.node.parent.getComponent(UITransform).convertToNodeSpaceAR(pos);
	
					let to = uiEntity.node.parent.getComponent(UITransform).convertToWorldSpaceAR(uiEntity.node.position);
					to = uiEntity.node.parent.getComponent(UITransform).convertToNodeSpaceAR(to);
	
					let isLast = i == obj.sprChips.length - 1;
					let dur = 0.8;
					this.setTweenMoveFromTo(moveTarget, new Color(Color.WHITE), pos, to, delay, dur, this.easeOutQuart, () => {
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_START');

						}
					}, isLast ? () => {
						uiEntity?.setUiChips(chips);
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_END');

						}
					} : () => {
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_END');
						}
					});
				}
	
				return;
			}
	
			let bezierPathNodes: Node[] = [];
			bezierPathNodes.push( null=== startNode || undefined === startNode ? this.uiPot.maxPotRoot : startNode);
	
			uiEntity.bezierPoints.forEach(elem => bezierPathNodes.push(elem));
	
			bezierPathNodes.push(uiEntity.node);
	
			for( let i = 0; i < obj.sprChips.length; i++ ) {
				let moveTarget = obj.sprChips[ i ];
				let delay = i * 0.05;
	
				let bezierPts = [];
				for( let i = 0; i < bezierPathNodes.length; i++ ) {
					let pos = bezierPathNodes[ i ].parent.getComponent( UITransform ).convertToWorldSpaceAR( bezierPathNodes[ i ].position );
					pos = moveTarget.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( pos );
					bezierPts.push( pos );
				}
	
				let isLast = i == obj.sprChips.length - 1;
	
				this.setTweenFadeInOutFromToMove( moveTarget, new Color( Color.WHITE ), bezierPts, delay, duration, this.easeOutQuart, () => {
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_START');
					}
				}, isLast ? () => {
					uiEntity?.setUiChips( chips );
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_END');
					}
				} : () => {
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_END');
					}
				} );
			}
    }

    private setAniPotUiFadeOut() {
		if (this.spritePotRoot != null ) {
			this.spritePotRoot.node.active = false;
		}
    }

    setTweenMoveFromTo( sprite: Sprite, originalColor, from: Vec3, to: Vec3, delay: number,
        duration: number, easingFunc: ( k: number )=> number, onStart: ()=>void, onFinished: ()=>void ) {

			sprite.node.active = true;
			sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, 0 );
	
			let tw = tween( sprite.node )
				.set( {
					position: from
				} )
				.delay( delay );
	
			if( null != onStart ) {
				tw.call( onStart );
			}
	
			tw.to( duration, {
				position: to,
			}, {
				onUpdate: ( target: Node, ratio: number ) => {
	
					let tv = bezier( 0, 0.25, 0.25, 1, ratio );
	
					let a = bezier( 255, 255, 255, 0, tv );
					if( a > originalColor.a ) {
						a = originalColor.a;
					}
					sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, a );
				},
			} );
	
			if( null != onFinished ) {
				tw.call( onFinished );
			}
	
			tw.union();
			tw.start();
    }

	setTweenFadeInOutFromToMove( sprite: Sprite, originalColor: Color, bezierPath: Vec3[], delay: number,
		duration: number, easingFunc: ( k: number ) => number, onStart: () => void, onFinished: () => void ) {

		sprite.node.active = true;

		sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, 0 );

		let tw = tween( sprite.node )
			.set( {
				position: bezierPath[ 0 ]
			} )
			.delay( delay );

		if( null != onStart ) {
			tw.call( onStart );
		}

		tw.to( duration, {
			// position: to,
		}, {
			onUpdate: ( target: Node, ratio: number ) => {

				let tv = bezier( 0, 0.25, 0.25, 1, ratio );
				let x = bezier( bezierPath[ 0 ].x, bezierPath[ 1 ].x, bezierPath[ 2 ].x, bezierPath[ 3 ].x, tv );
				let y = bezier( bezierPath[ 0 ].y, bezierPath[ 1 ].y, bezierPath[ 2 ].y, bezierPath[ 3 ].y, tv );
				sprite.node.position = new Vec3( x, y, 0 );

				let a = bezier( 255, 255, 255, 0, tv );
				if( a > originalColor.a ) {
					a = originalColor.a;
				}
				sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, a );
			},
		} );

		if( null != onFinished ) {
			tw.call( onFinished );
		}

		tw.union();
		tw.start();
	}


    easeOutQuart( x: number ): number {
		return 1 - Math.pow( 1 - x, 4 );        
    }

	getBezierSampleValue( points: Vec3[], t: number ): Vec3 {
		let x = bezier( points[ 0 ].x, points[ 1 ].x, points[ 2 ].x, points[ 3 ].x, t );
		let y = bezier( points[ 0 ].y, points[ 1 ].y, points[ 2 ].y, points[ 3 ].y, t );
		return new Vec3( x, y, 0 );
	}

    private onBUY_IN( msg ) {

		Board.balance = Number.parseInt( msg[ "balance" ] );
		Board.small = Number.parseInt( msg[ "small" ] );
		Board.big = Number.parseInt( msg[ "big" ] );
		Board.id = Number.parseInt( msg[ "id" ] );
		Board.passPrice = msg[ "passPrice" ];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];

		let self =this;
		this.uiBuyIn.buyIn((res)=>{
			Board.room.send( "BUY_IN", { id: Board.id, buyInAmount: res } );
			this.uiBuyIn.closePopup();

		}, ()=>{
			self.room.send('CANCEL_BUY_IN');
			this.uiSeats.onResultFail();
			this.uiBuyIn.closePopup();
		});
    }

    private onRES_BUY_IN( msg ) {
        let ret: number = msg["ret"];
        if (ret === -1) {

        } else {
			this.uiBuyIn.buyInDone();
            this.uiSeats.end();
            this.show();

			if ( ret != 0 ) {
				this.room?.leave();
				return;
			}
        }
    }

    private onRES_RE_BUY( msg ) {
		this.uiSeats.end();

		if ( 0 != msg['resultCode'] ) {
			return;
		}

		Board.balance = Number.parseInt( msg['balance ']);
		let uiEntity = this.getUiEntityFromSeat( this.mySeat );
		let chips = Number.parseInt( msg ['chip'] );
		uiEntity.setUiChips( chips);
		this.myChips = chips;
    }

    private onRE_BUY_IN( msg ) {

    }

    private onRES_ADD_CHIPS_REQUEST( msg ) {
		let code = msg["code"];

		if ( code === -1 ) {
			return;
		}

		if ( code > 0 ) {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();

			});
		} else {

			let balance: number = msg["balance"];
			let chips: number = msg["initChips"];
			let amount:number = msg["amount"];

			this.uiBuyIn.addChips( balance, amount, (res)=>{
				if ( res > 0 ) {
					this.sendMsg('ADD_CHIPS', {
						seat: this.mySeat,
						amount: res,
					});
				} else {
					UiGameSystemPopup.instance.showOkPopup('칩 추가', '칩 추가가 취소되었습니다', ()=>{
						UiGameSystemPopup.instance.closePopup();
					});
				}
			});
		}
    }

    private onRES_ADD_CHIPS( msg ) {
		this.uiSeats.end();
		let code: number = msg[ "code" ];
		if ( 0 === code ) {
			let pending: boolean = msg["pending"];
			let balance = msg[ "balance" ];
			let chips = msg[ "chips" ];
			let amount = msg[ "amount" ];
			if ( true === pending ) {
				let message: string = "칩은 현재 핸드가 종료된 다음에 적용됩니다.";
				UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
					UiGameSystemPopup.instance.closePopup();
				});

			} else {
				let uiEntity = this.getUiEntityFromSeat( this.mySeat );
				Board.balance = balance;
				uiEntity.setUiChips( chips );
				this.myChips = chips;

				let message: string = CommonUtil.getNumberStringWithComma(amount) + " 칩이 추가되었습니다.";
				UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
					UiGameSystemPopup.instance.closePopup();
				});
			}
		} else {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    private RES_ADD_CHIPS_PEND( msg ) {
		let code: number = msg[ "code" ];
		if ( 0 === code ) {
			let uiEntity = this.getUiEntityFromSeat( this.mySeat );
			let balance = msg[ "balance" ];
			let chips = msg[ "chips" ];
			let amount = msg[ "amount" ];

			Board.balance = balance;
			uiEntity.setUiChips( chips );
			this.myChips = chips;

			let tableBuyInAmount = msg["tableBuyInAmount"];
			let tableBuyInCount = msg["tableBuyInCount"];

			let message: string = CommonUtil.getNumberStringWithComma(amount) + " 칩이 추가되었습니다.";
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		} else {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    private onPing ( msg ) {
		this.room.send( "pong", { seat: this.mySeat } );
    }

    public leave() {
		this.room?.leave();
    }

    private getAddChipsErrorMessage( code: number ) : string {
		let ret: string = "UNKNOWN MESSAGE";
		switch (code) {
			case -1:
				ret = "플레이어 정보가 없거나 잘못되었습니다";
				break;
			case 1:
				ret = "바이인 할 수 없습니다. 다시 신청해주세요";
				break;
			case 2:
				ret = "이미 바이인 요청이 있습니다.";
				break;
			case 3:
 				ret = "더 이상 바이인을 할 수 없습니다.";
				break;
			case 4:
				ret = "바이인할 칩이 없습니다.";
				break;
			case 5:
				ret = "더 이상 바이인 할 수 없습니다.";
				break;
			case 6:
				ret = "최대 바이인 횟수에 도달했습니다.";
				break;

		}
		return ret;
    }

	public openUserProfile(id :number ) {

	}

	public onEVENT_SHOW() {

	}

	public onEVENT_HIDE() {

	}
}


