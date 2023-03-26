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
import { UiProfile } from './Game/UiProfile';
import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { UiPlayerActionReservation } from './Game/UiPlayerActionReservation';
import { EMOTICON_TYPE, UiGameChatting } from './Game/UiGameChatting';
import { UiWinEffect } from './Game/UiWinEffect';

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
	@property(UiProfile) uiProfile: UiProfile = null;
	@property(UiPlayerActionReservation) uiPlayerActionReservation: UiPlayerActionReservation = null;

	@property(Label) labelTableInformation: Label = null;
	@property(Node) nodeCardShuffleMessage: Node = null;

	@property(Button) buttonShowCard: Button = null;
	@property(Button) buttonSitOut: Button = null;
	@property(Button) buttonSitBack: Button = null;
	
	@property(Button) buttonEmoticon: Button = null;
	@property(Button) buttonAddChips: Button = null;

	@property(UiGameChatting) uiGameChatting: UiGameChatting = null;
	@property(UiWinEffect) uiWinEffect: UiWinEffect = null;	

    private roundState: string = "";
    private spritePotRoot: Sprite = null;
    // private spritePotChips: Sprite = null;

    private entityUiElements: UiEntity[] = [];

    private spriteCommunityCards: Sprite[] = [ null, null, null, null, null ];
    private vectorCommunityCards: Vec3[] = [ null, null, null, null, null ];
    private numberCommunityCards: number[] = [ -1, -1, -1, -1, -1 ];
    private uiPlayerAction: UiPlayerAction = null;
    private nodeCardDispensingRoot: Node = null;

    private timerRoot: Node = null;
    private labelRemainTime: Label = null;
    private labelReadyMessage: Label = null;
    private datePassEnd: Date = null;
    private startTime: number = 0;
    private deltaTime: number = 0;

    private objPotMoveToWinnerChips: {} = {};
    private objPotReturnChips: {} = {};

    private cardRes: {} = {};
    private chipRes: {} = {};	

    private curPotValue: number = -1;
    private myChips: number = -1;
    private myBet: number = -1;
    private mySeat: number = -1;
    private myWaitStatus: boolean = false;

    private startBetFromServer: number = -1;
    private betMin: number = -1;
    private seatMax: number = 6;
    private seatPlayers: number[] = [];
    private enableSeats: number[] = [];

    private myPrimaryCardIndex: number = -1;
    private mySecondaryCardIndex: number = -1;

    private dealerSeatPosition: number = -1;
    private smallBlindSeatPosition: number = -1;
    private bigBlindSeatPosition: number = -1;

    private room: Colyseus.Room = null;
    private msgWINNERS: string = "";
    private playersCARD: {} = null;

    private isFold: boolean = false;
    private isAllIn: boolean = false;

    private readyMessageHandler: number = -1;
    private countPlayers: number = -1;

	static seatMaxFromServer : number = 9;
    static preLoadCardRes: {} = {};
    static preLoadChipRes: {} = {};	

	private isSitOutReservation: boolean = false;

	onClickShowEmoticon(button: Button) {
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

	onLoad() {
		
	}

    start() {
        this.seatMax = UiTable.seatMaxFromServer;
        
        globalThis.lib = {};
        PokerEvaluator.exportToGlobal(globalThis.lib);

        Board.table = this;
        this.cardRes = UiTable.preLoadCardRes;
        
        this.childRegistered();

        this.uiSeats.init(this.seatMax, this.onClickSeatSelect.bind(this));
		this.uiBuyIn.init();
		this.uiGameChatting.init( this.onClickEmoticon.bind(this), this.onClickEmticonExit.bind(this));
		this.setEmoticonButtinInteractive(true);
		this.uiPlayerActionReservation.init();
		this.uiWinEffect.init();

        if (null == NetworkManager.Instance().room) {
            return;
        }

        this.registRoomEvent(NetworkManager.Instance().room);

		UiControls.instance.setExitCallback( this.onClickExit.bind(this) );
		this.buttonEmoticon.node.on('click', this.onClickShowEmoticon.bind(this), this);
		this.buttonAddChips.node.on('click', this.onClickAddChips.bind(this), this);

        this.hide();
        this.sendMsg("ONLOAD", {

        });
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

		playerMe.isMe = true;
		this.entityUiElements.push( playerMe );
		for( let i = 1; i < this.seatMax; i++ ) {
			let elem = this.node.getChildByPath( `${ entitiesRootPath }/ENTITY_${ i }` ).getComponent( UiEntity );
			elem.isMe = false;
			this.entityUiElements.push( elem );
		}

		for ( let i = 1; i < this.entityUiElements.length; i++ ) {
			let entity = this.entityUiElements[i];
			if (entity != null) {
				entity.setEscapee();
			}
		}

		for( let i = 0; i < this.spriteCommunityCards.length; i++ ) {
			let uiCard = this.node.getChildByPath( `COMMUNITY_CARDS/${ i + 1 }` ).getComponent( Sprite );

			this.spriteCommunityCards[ i ] = uiCard;
			this.vectorCommunityCards[ i ] = uiCard.node.position;
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

		// this.btnHistory.node.off("click");
		// this.btnHistory.node.on("click", this.onClickHistory.bind(this), this);

		this.nodeCardShuffleMessage.active = false;
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
		this.buttonSitBack.node.active = false;
		this.buttonSitOut.node.active = false;

		this.isSitOutReservation = false;
    }

    onClickAddChips() {
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

    private show() {
        this.node.active = true;
    }

    private hide() {
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
		room.onMessage( "SHOW_FLOP", this.onSHOW_FLOP.bind( this ) );
		room.onMessage( "SHOW_TURN", this.onSHOW_TURN.bind( this ) );
		room.onMessage( "SHOW_RIVER", this.onSHOW_RIVER.bind( this ) );
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

			if ( code == 1005 ) {
				director.loadScene("LobbyScene");
			}
			else {
				director.loadScene("LoginScene");
			}
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
		this.playersCARD = null;
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
		this.clearUiTimer();
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

		this.setUiCommunityCards( msg[ "openCards" ] );		

		this.myPrimaryCardIndex = msg["primCard"];
		this.mySecondaryCardIndex = msg["secCard"];

		let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
		if (this.myPrimaryCardIndex != -1 && this.mySecondaryCardIndex != -1) {
			this.setAniOpenHand(uiEntity.spriteHandCards[0], this.cardRes[this.myPrimaryCardIndex + 1], () => {
			});
			this.setAniOpenHand(uiEntity.spriteHandCards[1], this.cardRes[this.mySecondaryCardIndex + 1], () => {
				uiEntity.spriteHandCardShadow.node.active = true;
				let handRank = this.getHandRank(this.myPrimaryCardIndex, this.mySecondaryCardIndex, this.numberCommunityCards);
				uiEntity.setUiHandRank(handRank);
			});

			if (myEntity.fold === true) {
				uiEntity.setUiHandCardsFold();
			}
		}

		if (msg["centerCardState"] != 0) {
			msg["entities"].forEach(element => {
				let seatNumber = element.seat;
				let entity = this.getUiEntityFromSeat(seatNumber);

				if (seatNumber === this.mySeat || true === element.wait) {
					return;
				}

				entity.spriteHiddenCards[0].node.active = true;
				entity.spriteHiddenCards[1].node.active = true;
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

        let myEntity = msg["yourself"];

        Board.balance = myEntity.balance;
        Board.big = msg["big"];
        Board.small = msg["small"];
        Board.minStakePrice = msg["minStakePrice"];
        Board.maxStakePrice = msg["maxStakePrice"];
        Board.passPrice = msg["passPrice"];

        this.room = room;
        this.mySeat = myEntity.seat;
        this.myChips = myEntity.chips;
        this.myWaitStatus = myEntity.wait;
        this.isFold = false;
        this.seatPlayers = [];
        this.msgWINNERS = "";
        this.playersCARD = null;
        this.isAllIn = false;

        this.dealerSeatPosition = msg["dealer"];
        this.smallBlindSeatPosition = msg["sb"];
        this.bigBlindSeatPosition = msg["bb"];
		this.curPotValue = msg['pot'];

		this.uiPot.UpdatePotTotal( this.curPotValue );

        for ( let i = 0; i < this.seatMax ; i++) {
            let seat = this.mySeat + i;
            this.seatPlayers.push( seat % this.seatMax );
        }

		this.clearUiTimer();

        let players: any = msg["entities"];
        this.setUiEntities( players );
        this.countPlayers = players.length;

		this.setUiCommunityCards( msg[ "openCards" ] );

        if ( true === myEntity.isSitOut ) {
			this.buttonSitOut.node.active = false;
			this.buttonSitBack.node.active = true;

        } else {
			this.buttonSitOut.node.active = true;
			this.buttonSitBack.node.active = false;
        }
		this.buttonShowCard.node.active = false;

        let dealer = this.getUiEntityFromSeat( this.dealerSeatPosition );
		dealer?.setUiPosSymbol( "dealer" );

		let smallBlind = this.getUiEntityFromSeat( this.smallBlindSeatPosition );
		smallBlind?.setUiPosSymbol( "sb" );

		let bigBlind = this.getUiEntityFromSeat( this.bigBlindSeatPosition );
		bigBlind?.setUiPosSymbol( "bb" );

        let gameState : number = msg["gameState"];

        if(gameState != 0 && gameState != 1){
			msg["entities"].forEach(element => {
				let seatNumber = element.seat;
				let entity = this.getUiEntityFromSeat(seatNumber);

				if (seatNumber === this.mySeat || true === element.wait) {
					return;
				}

				entity.spriteHiddenCards[0].node.active = true;
				entity.spriteHiddenCards[1].node.active = true;

				if(element.fold === false){
					return;
				}

				entity.setUiHandCardsFold();
			});
		}

		this.setTableInformation();

		let cnt = 0;
		msg['entities'].forEach( e => {
			if ( e.seat > 0) {
				cnt++;
			}
		});

		if ( msg['gameState'] == 0) {
			this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
			this.labelReadyMessage.node.active = true;

			this.uiPot.Hide();
		}

		if ( msg['gameState'] == 0 ) {
			this.uiPot.maxPotLabelRoot.active = false;
		} else {
			this.uiPot.maxPotLabelRoot.active = true;
		}

		this.uiPlayerAction.init(Board.small, Board.big);
    }

    leaveRoom(code: any) {
        this.room = null;
        this.clearUiEntities();

		this.clearUiCommunityCards();
		this.clearUiPot();
		this.clearUiTimer();

		this.uiPlayerAction.hide();
		this.uiBuyIn.node.active = false;
		this.isAllIn = false;
    }

    private setUiEntities(entities: any) {
        for (let i = 0; i < this.seatPlayers.length; i++ ) {
            let seat = this.seatPlayers[i];
            let entity = entities?.find((e) => e.seat === seat );
            let uiEntity = this.getUiEntityFromSeat( seat );
            uiEntity?.setUi( entity );
            if (null !== uiEntity && undefined !== uiEntity ) {
                uiEntity.callbackProfileOpen = ( e ) => {
                    // this.uiProfileCard.show( e, seat );
                }

                uiEntity.callbackProfileClose = () => {
                    // this.uiProfileCard.hide();
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
			// this.spritePotChips.node.active = false;
		}
    }

    private clearUiPot() {
		this.spritePotRoot.node.active = false;
		// this.spritePotChips.node.active = false;
		this.uiPot.Hide();
    }

    private clearUiTimer() {
		// this.labelRemainTime.string = "00:00";
		this.datePassEnd = null;
		this.startTime = 0;
		this.deltaTime = 0;
    }

    private clearPosSymbol() {
		this.entityUiElements.forEach( element => element.clearUiPositionSymbol() );        
    }

    private setUiCommunityCards( cards: number[] ) {

		for( let i = 0; i < this.spriteCommunityCards.length; i++ ) {
			let uiCard = this.spriteCommunityCards[ i ];
			if( i >= cards.length ) {
				UiTable.setUiCard( uiCard, null );
				this.numberCommunityCards[ i ] = -1;
				continue;
			}

			UiTable.setUiCard( uiCard, this.getCardImage( cards[ i ] + 1 ) );
			this.numberCommunityCards[ i ] = cards[ i ];
		}
    }

    private clearUiCommunityCards() {
		this.spriteCommunityCards.forEach( element => {
			element.spriteFrame = null;
		} );

		for( let i = 0; i < this.numberCommunityCards.length; i++ ) {
			this.numberCommunityCards[ i ] = -1;
		}
    }

    private static setUiCard( uiCard: Sprite, cardImg: SpriteFrame ) {
		let uiTransform = uiCard.getComponent( UITransform );
		let w = uiTransform.width;
		let h = uiTransform.height;

		uiCard.spriteFrame = cardImg;
		uiCard.node.active = true;

		uiTransform.width = w;
		uiTransform.height = h;
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
		console.log(handRank);
		return handRank.descr;
    }

	public getHandsEval( hands: number[], communities: number[] ): string {
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
		console.log('getHandsEval');
		console.log(rs);
		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );

		return handRank;
	}

    private setUiMyHandRank() {
		let rankName = this.getHandRank( this.myPrimaryCardIndex, this.mySecondaryCardIndex, this.numberCommunityCards );
		let uiEntity = this.getUiEntityFromSeat( this.mySeat );
		uiEntity?.setUiHandRank( rankName );
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

    private getCardImage( num: number): SpriteFrame {
		return this.cardRes[ num ];
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

		this.myPrimaryCardIndex = msg[ "primaryCard" ];
		this.mySecondaryCardIndex = msg[ "secondaryCard" ];
		
		this.setAniCardDispensing();
    }

    private onYOUR_TURN( msg ) {
		console.log('onYOUR_TURN');

		let seat = msg[ "player" ];
		let duration = msg["duration"];

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let uiEntity = this.entityUiElements[ i ];
			if( seat == this.seatPlayers[ i ] ) {
				uiEntity?.startTurn(duration);
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

			AudioController.instance.playMyTurn();

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

			if ( this.uiPlayerActionReservation.checkReservation() == true ) {
				this.uiPlayerActionReservation.excute(myBet, curBet, seat );
				this.uiPlayerActionReservation.hide();
				this.uiPlayerAction.hide();

				return;				
			}

			this.uiPlayerActionReservation.hide();

			this.uiPlayerAction.show( this.betMin, curBet, minRaise, curPot, myBet, chips, isLast, hasAction);
			this.uiPlayerAction.cbCheck = () => {
				let obj = {
					seat: this.mySeat,
				};
				this.sendMsg( "CHECK", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbCall = ( betValue ) => {
				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "CALL", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbBet = ( betValue ) => {
				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "BET", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbRaise = ( betValue ) => {
				let obj = {
					betAmount: betValue,
					seat: this.mySeat
				};
				this.sendMsg( "RAISE", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbAllIn = ( betValue) => {
				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "ALLIN", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbFold = () => {
				let obj = {
					seat: this.mySeat
				};
				this.sendMsg( "FOLD", obj );
				this.uiPlayerAction.hide();
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
			}			

			if ( this.uiPlayerActionReservation.isOpenReservation() == false &&  isSitOutStatus == false ) {
				let curBet = msg[ "maxBet" ];
				let myBet = msg[ "currBet" ];
				this.uiPlayerActionReservation.show( myBet, myBet);
			}
		}
    }

    private onBLIND_BET( msg ) {
		this.roundState = "BLIND_BET";

		this.betMin = msg[ "maxBet" ];

		this.clearUiEntitiesAction();
		this.clearUiEntitiesBetValue();

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
						ui?.setMissSmallBlindButton(false);
					}
				}
			}
		}

		let player = msg["player"];
		for ( let i: number = 0 ; i < player.length ; i++ ) {
			let ui = this.getUiEntityFromSeat(player[i]);
			if (null != ui) {
				ui?.clearMissButton();
			}
		}

		this.curPotValue = msg[ "pot" ];
		this.uiPot.UpdatePotTotal(this.curPotValue);
    }

    private onSUSPEND_ROUND( msg ) {
		this.roundState = "SUSPEND_ROUND";
		console.log(this.roundState);

		this.labelReadyMessage.node.active = false;

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;
		this.myPrimaryCardIndex = -1;
		this.mySecondaryCardIndex = -1;

		this.enableSeats = [];

		this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
		this.labelReadyMessage.node.active = true;

		this.nodeCardShuffleMessage.active = false;

		this.uiPot.Hide();

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let entity = entities.find( elem => elem.seat == seat );
			let uiEntity = this.entityUiElements[ i ];

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			uiEntity?.setUiPrepareRound( entity );
			uiEntity?.setMissSmallBlindButton(false);
			uiEntity?.setMissBigBlindButton(false);

			if( seat == this.mySeat ) {
				this.myWaitStatus = entity.wait;
				this.isFold = false;
			}

			this.enableSeats.push( entity.seat );
		}
    }

    private onREADY_ROUND( msg ) {
		this.roundState = "READY_ROUND";

		console.log(this.roundState);

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

		this.roundState = "PREPARE_ROUND";

		console.log(this.roundState);

		this.nodeCardShuffleMessage.active = false;
		this.labelReadyMessage.node.active = false;

		this.dealerSeatPosition = msg[ "dealerSeatPos" ];
		this.smallBlindSeatPosition = msg[ "sbSeatPos" ];
		this.bigBlindSeatPosition = msg[ "bbSeatPos" ];

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.startBetFromServer = msg[ "startBet" ];
		this.betMin = msg[ "startBet" ];

		this.myPrimaryCardIndex = -1;
		this.mySecondaryCardIndex = -1;

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

			let missSb = entity.missSb;
			let missBb = entity.missBb;
			uiEntity.setMissSmallBlindButton(missSb);
			uiEntity.setMissBigBlindButton(missBb);

			if( true == entity.wait ) {
				uiEntity.setUiWait();
				continue;
			}

			uiEntity?.setUiSitBack();
			this.enableSeats.push( entity.seat );
			uiEntity?.setUiPrepareRound( entity );
		}

		this.clearUiCommunityCards();
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

    private onSHOW_FLOP( msg ) {
		this.roundState = "SHOW_FLOP";
		console.log(this.roundState);

		this.uiPlayerActionReservation.reset();

		this.clearUiEntitiesAction();
		this.setAniChipsMoveToPot( false, msg["dpPot"]);

		let cards = msg[ "cards" ];

		this.uiPot.UpdatePotTotal(msg["potTotal"]);

		for( let i = 0; i < 3; i++ ) {

			let cardNumber = cards[ i ];
			let uiCard = this.spriteCommunityCards[ i ];

			this.numberCommunityCards[ i ] = cardNumber;

			setTimeout( () => {
				this.setAniDropOpenCard( uiCard, 100, this.getCardImage( 0 ), this.getCardImage( cardNumber + 1 ), i == 2 ? () => {
					if( false == this.isEnableSeat( this.mySeat ) ) {
						return;
					}
					this.setUiMyHandRank();
				} : null );
			}, 1000 + (i * 50) );
		}
    }

    private onSHOW_TURN( msg ) {
		this.roundState = "SHOW_TURN";
		console.log(this.roundState);		

		this.uiPlayerActionReservation.reset();		

		this.clearUiEntitiesAction();
		this.setAniChipsMoveToPot( false, msg["dpPot"]);

		let cards = msg[ "cards" ];
		this.numberCommunityCards[ 3 ] = cards[ 0 ];

		setTimeout( () => {
			this.setAniDropOpenCard( this.spriteCommunityCards[ 3 ], 100, this.getCardImage( 0 ), this.getCardImage( cards[ 0 ] + 1 ), () => {
				if( false == this.isEnableSeat( this.mySeat ) ) {
					return;
				}
				this.setUiMyHandRank();
			} );
		}, 1000);
    }

    private onSHOW_RIVER( msg ) {
		this.roundState = "SHOW_RIVER";
		console.log(this.roundState);

		this.uiPlayerActionReservation.reset();		
		this.clearUiEntitiesAction();
		this.setAniChipsMoveToPot( false, msg["dpPot"] );


		let cards = msg[ "cards" ];
		this.numberCommunityCards[ 4 ] = cards[ 0 ];
		// this.historyManager.CommunityCards(this.roundState, this.numCommunityCards.slice(0, 4), cards.slice(0, 1));

		setTimeout( () => {
			this.setAniDropOpenCard( this.spriteCommunityCards[ 4 ], 100, this.getCardImage( 0 ), this.getCardImage( cards[ 0 ] + 1 ), () => {
				if (false == this.isEnableSeat(this.mySeat)) {
					return;
				}
				this.setUiMyHandRank();
			});
		}, 1000 );
    }

    private async ShowAll (cards: number[], dpPot: any ) {

		this.isAllIn = true

		this.uiPlayerActionReservation.reset();		
		this.setAniChipsMoveToPot( true, dpPot);

		let newCardCount = 0;
	
		await new Promise(ret => setTimeout(ret, 1500));

		for( let idx = 0; idx < this.numberCommunityCards.length; idx++ ) {
			let cardNumber = this.numberCommunityCards[ idx ];

			if( cards[ idx ] == cardNumber ) {
				continue;
			}

			newCardCount++;

			let delay = 0;

			if(idx < 3){
				//Flop
				delay = 50;
			}
			else if(idx < 4){
				delay = 1000;
			}
			else{
				delay = 2000;
			}

			await new Promise(ret => setTimeout(ret, delay));

			this.setAniDropOpenCard(this.spriteCommunityCards[idx], 100, this.getCardImage(0), this.getCardImage(cards[idx] + 1), () => {
				if (false == this.isEnableSeat(this.mySeat)) {
					return;
				}

				this.numberCommunityCards[idx] = cards[idx];

				this.enableSeats.forEach(seat => {
					let uiEntity = this.getUiEntityFromSeat(seat);

					if (true == uiEntity.isFold) {
						return;
					}

					let getPlayerCard = this.playersCARD[seat];

					let handRank = this.getHandRank(getPlayerCard.primaryCard, getPlayerCard.secondaryCard, this.numberCommunityCards);
					uiEntity.setUiHandRank(handRank);
				});
			});
		}

		this.entityUiElements.forEach(element => element.endTurn());
		this.setUiWinners();
		this.uiPlayerAction.hide();
    }

    private onCLEAR_ROUND( msg ) {
		console.log('onCLEAR_ROUND');

		this.labelReadyMessage.node.active = false;

		this.nodeCardShuffleMessage.active = false;

		this.uiWinEffect.hide();

		this.isAllIn = false;
		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.uiPlayerActionReservation.reset();

		this.nodeCardShuffleMessage.active = true;
		AudioController.instance.playShufflingCard();

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];
			let uiEntity = this.getUiEntityFromSeat( seat );
			let entity = entities.find( elem => elem.seat == seat );

			if( null == entity ) {
				uiEntity?.setEscapee();
				continue;
			}

			uiEntity?.setUiPrepareRound( entity );

			if( seat == this.mySeat ) {
				this.myChips = entity.chips;
			}
		}

		this.setUiHideHiddenCard();
		this.clearUiCommunityCards();
		this.clearUiPot();

		let me = entities.find( elem => elem.seat == this.mySeat );

		if(me === null || me === undefined)	{
			return;
		}

		Board.balance = me.balance;
		if( me.enoughChip == false ) {

			if( Board.balance + me.chips < Board.minStakePrice ) {
				UiGameSystemPopup.instance.showOkPopup('리 바이인', '최소 바이인을 할 수 없습니다.\r\n테이블에서 나갑니다.', ()=>{
					UiGameSystemPopup.instance.closePopup();
					self.room?.leave();
				} );

				return;
			}

			let self = this;
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
		this.uiPot.UpdatePotTotal(this.curPotValue);

		AudioController.instance.playCheck();

		let seat = msg[ "seat" ];
		let uiEntity = this.getUiEntityFromSeat( seat );

		if(null === uiEntity || undefined === uiEntity){
			return;
		}

		uiEntity?.setUiAction( "check" );
    }

    private onRAISE( msg ) {

		this.clearUiEntitiesAction();
		this.curPotValue = msg[ "pot" ];

		AudioController.instance.playRaise();

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
		}
		else {
			uiEntity?.setUiAction( "raise" );
		}

		this.setUiPot(msg["dpPot"]);
		this.uiPot.UpdatePotTotal(this.curPotValue);

		uiEntity?.setUiBetValue( msg[ "bet" ], Color.GRAY );
    }

    private onFOLD( msg ) {
		AudioController.instance.playFold();

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

		uiEntity.spriteHiddenCards[0].color = Color.GRAY;
		uiEntity.spriteHiddenCards[1].color = Color.GRAY;
    }

    private onCALL ( msg ) {
		AudioController.instance.playCall();

		this.curPotValue = msg[ "pot" ];

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
		}
		else {
			uiEntity?.setUiAction( "call" );
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);

		uiEntity?.setUiBetValue( msg[ "bet" ], Color.GRAY );
    }

    private onBET ( msg ) {
		AudioController.instance.playBet();

		this.clearUiEntitiesAction();
		this.curPotValue = msg[ "pot" ];

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
		}
		else {
			uiEntity?.setUiAction( "bet" );
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

		if(seatNumber !== this.mySeat){
			let uiEntity = this.getUiEntityFromSeat(seatNumber);
			uiEntity?.setUiSitOut();
			return;
		}

		this.buttonSitOut.node.active = false;
		this.buttonSitBack.node.active = true;
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
		if( false == this.isEnableSeat( seat) || this.mySeat == seat) {
			if (this.mySeat == seat) {
				let handRank = this.getHandRank( cards[0], cards[1], this.numberCommunityCards );
			}
			return;
		}

		this.playersCARD = {};

		let uiEntity = this.getUiEntityFromSeat( seat );
		if( null == uiEntity ) {
			return;
		}

		let primaryCard = cards[ 0 ];
		let secondaryCard = cards[ 1 ];
		this.playersCARD[ seat ] = { primaryCard: primaryCard, secondaryCard: secondaryCard };

		uiEntity.spriteHandCards[ 0 ].spriteFrame = this.cardRes[ primaryCard + 1 ];
		uiEntity.spriteHandCards[ 1 ].spriteFrame = this.cardRes[ secondaryCard + 1 ];

		uiEntity.spriteHandCards[ 0 ].node.active = true;
		uiEntity.spriteHandCards[ 1 ].node.active = true;
		uiEntity.spriteHandCardShadow.node.active = false;

		let handRank = this.getHandRank( primaryCard, secondaryCard, this.numberCommunityCards );
		uiEntity.setUiHandRank( handRank );

		uiEntity.spriteHiddenCards[ 0 ].node.active = false;
		uiEntity.spriteHiddenCards[ 1 ].node.active = false;

		AudioController.instance.playShowHands();
    }

    private onPLAYER_CARDS( msg ) {
		console.log('onPLAYER_CARDS');
		console.log(msg);

		let cards = msg[ "cards" ];
		let winners = msg[ "winners" ];
		let allin = msg[ "allin" ];

		let keys = Object.keys( cards );

		this.playersCARD = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			let uiEntity = this.getUiEntityFromSeat( seat );
			if( null == uiEntity ) {
				return;
			}

			this.playersCARD[ seat ] = { primaryCard: cards[ key ][ 0 ], secondaryCard: cards[ key ][ 1 ] };

			let primaryCard = cards[ key ][ 0 ];
			let secondaryCard = cards[ key ][ 1 ];
			let playerCards: number[] = [cards[ key ][ 0 ], cards[ key ][ 1 ]];

			let show = true;
			if ( false == allin && winners[seat] == false) {
				show = false;
			}

			let handRank:string = "";
			if ( allin == true ) {
				handRank = this.getHandRank( primaryCard, secondaryCard, msg["communities"]);
			} else
			{
				handRank = this.getHandRank( primaryCard, secondaryCard, this.numberCommunityCards);
			}

			if( this.mySeat == seat ) {
				return;
			}

			this.setAniOpenHand( uiEntity.spriteHandCards[ 0 ], this.cardRes[ primaryCard + 1 ], () => {
			} );
			this.setAniOpenHand( uiEntity.spriteHandCards[ 1 ], this.cardRes[ secondaryCard + 1 ], () => {
				uiEntity.spriteHandCardShadow.node.active = false;
				let handRank = this.getHandRank( primaryCard, secondaryCard, this.numberCommunityCards );

				uiEntity.setUiHandRank( handRank );
			} );

			let stopPos = new Vec3( uiEntity.vectorHiddenCards[ 0 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 0 ], stopPos, 0.1, () => {
			} );

			stopPos = new Vec3( uiEntity.vectorHiddenCards[ 1 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 1 ], stopPos, 0.1, () => {
			} );
		} );

		this.entityUiElements.forEach( element => element.endTurn() );
		this.clearUiEntitiesAction();
		this.clearUiEntitiesBetValue();
		this.uiPlayerAction.hide();
    }

    private onWINNERS ( msg ) {
		console.log('onWINNERS');

		this.msgWINNERS = msg;
		let isMyCardExist = this.myPrimaryCardIndex != -1 && this.mySecondaryCardIndex != -1

		this.uiPlayerActionReservation.reset();

		if (msg["isAllInMatch"] === false)
		{
			this.setUiWinners();
		}
		else 
		{
			this.ShowAll(msg["cards"], msg["dpPot"]);
		}

		this.uiPlayerAction.hide();

		for (let i = 0; i < msg["dpPot"].length; i++) {
			let pot = msg["dpPot"][i];
			let winners: string[] = [];
			let owners: string[] = [];

			for (let j = 0; j < pot.players.length; j++) {
				let uiEnt = this.getUiEntityFromSeat(pot.players[j]);

				let isWinner = null != pot.winner.find((element) => { return element == pot.players[j];});

				if (null == uiEnt) {
					continue;
				}

				if (isWinner == true) {
					winners.push(uiEnt.labelNickname.string);

				}
				owners.push(uiEnt.labelNickname.string);
			}
		}

		let potLength = msg["dpPot"].length;

		if(false == isMyCardExist) {
			return;
		}

		let me = msg.winners.find((elem) => {return elem.seat === this.mySeat});

		if(false == msg.skip){
			if ( this.buttonShowCard == null ) {
				return;
			}

			if (this.isAllIn == true) {
				this.buttonShowCard.node.active = false;

				let folders = msg["folders"];
				for( let i = 0; i < folders.length; i++ ) {
					if( folders[ i ] == this.mySeat ) {
						this.buttonShowCard.node.active = true;
						break;
					}
				}
			} else {
				let timer:number = 0;
				timer = setTimeout( () => {
					this.buttonShowCard.node.active = true;
					clearTimeout(timer);
				}, 1500 );
			}

			return;
		} else {
			//msg.skip == true;
		}

		this.buttonShowCard.node.active = true;
    }

    private onClickShowCard( button: Button ) {
		button.node.active = false;

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

			let stopPos = new Vec3( uiEntity.vectorHiddenCards[ 0 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 0 ], stopPos, 0.1, () => {
			} );

			stopPos = new Vec3( uiEntity.vectorHiddenCards[ 1 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 1 ], stopPos, 0.1, () => {
			} );
		} );
    }

    private setUiWinners() {

		this.myPrimaryCardIndex = -1;
		this.mySecondaryCardIndex = -1;

		let entities = this.msgWINNERS[ "winners" ];

		this.uiWinEffect.set(this.msgWINNERS);

		this.entityUiElements.forEach( element => element.endTurn() );

		this.ResultPotAnimation(entities, this.msgWINNERS["dpPot"]).then(() =>{
			this.setAniPotUiFadeOut();
		});

		this.uiWinEffect.show();
		AudioController.instance.playWin();
    }

    private async ResultPotAnimation( winners: any[], pot: any[] ) {
		let uiPots : Pot[] = this.uiPot.GetPots();

		if(this.msgWINNERS["skip"] === true){
			
			for(let i = 0; i < winners.length; i++){
				let winner = winners[i];

				let uiEntity = this.getUiEntityFromSeat( winner.seat );

				if(null == uiEntity){
				}

				uiEntity?.setUiPlay();
				this.uiPot.UpdatePotTotal( winner.winAmount );

				let isReturn : boolean = winner.fold;
				if (isReturn === true) {
					uiEntity?.SetReturn(winner.winAmount);
				}
				else {

					uiEntity?.setAniWinner(winner.winAmount);
				}

				this.setAniPotMoveToWinner(this.uiPot.maxPotLabelRoot, winner.seat, i, winner.chips, true , isReturn);
			}
			
			uiPots.forEach(element => {
				element.ClearCallback();
			});

			this.uiPot.UpdatePotTotal(0);
			this.uiPot.HidePotInfo();

			await new Promise(ret => setTimeout(ret, 2000));
			return;
		}
		
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
	
			uiEntity?.SetReturn(pot.total);
			
			let winnerInfo = winners.find((elem) => { return elem.seat == pot.players[0]; });

			this.setAniPotMoveToWinner(this.uiPot.labelMaxPot.node, pot.players[0], retAnimCount, winnerInfo == null ? pot.total : winnerInfo.chips, retAnimCount == 0, true, 0.8);
			retAnimCount++;
		}

		await new Promise(ret => setTimeout(ret, 1500));

		for(let i = 0; i < showPot.length; i++){
			let pot = showPot[i];
			
			for(let j = 0; j < pot.winner.length; j++){
				let chip = pot.rake == undefined ? pot.total / pot.winner.length : (pot.total - pot.rake) / pot.winner.length;
				
				let uiEntity = this.getUiEntityFromSeat(  pot.winner[j] );
				
				if(null == uiEntity){
				}

				uiEntity?.setUiPlay();

				if (pot.winner.length > 1) {
					uiEntity?.SetDraw(chip);
				} else {
					uiEntity?.setAniWinner(chip);
				}

				let winnerInfo = winners.find((elem) => {return elem.seat ==pot.winner[j];});

				this.setAniPotMoveToWinner(uiPots[0].showRoot, pot.winner[j], j, winnerInfo == null ? pot.total : winnerInfo.chips, j == 0 , false);
			}

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
				ui.valueLabel.string = undefined == potInfo.rake ? CommonUtil.getNumberStringWithComma(potInfo.total) : CommonUtil.getNumberStringWithComma(potInfo.total - potInfo.rake) + " / " + CommonUtil.getNumberStringWithComma(potInfo.rake);
				ui.valueLabel.string = undefined == potInfo.rake ? potInfo.total.toString() : 
				(potInfo.total - potInfo.rake).toString() + " / " + (potInfo.rake).toString();
				count++;
			}

			this.uiPot.HidePotInfo();

			await new Promise(ret => setTimeout(ret, 2000));
		}
    }

    private setAniDropOpenCard( sprite: Sprite, dropDistance: number, hiddenCard: SpriteFrame, openCard: SpriteFrame,
        onFinished: ()=> void ) {
			let uiTransform = sprite.getComponent( UITransform );
			let w = uiTransform.width;
			let h = uiTransform.height;

			AudioController.instance.playShowCommunityCards();
			AudioController.instance.playFlipCommnityCards();
	
			sprite.spriteFrame = openCard;
	
			if(null == onFinished){
				return;
			}
	
			onFinished();			

    }

    private setAniCardDispensing(): void {
		let enableIdx = 0;

		if( null == this.nodeCardDispensingRoot ) {
			return;
		}

		let dispensingInterval: number = 100;
		let moveDuration = 0.2;

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( false == this.isEnableSeat( seat ) ) {
				continue;
			}

			enableIdx++;
			let uiEntity = this.entityUiElements[ i ];

			setTimeout( () => {

				let uiCard = uiEntity.spriteHiddenCards[ 0 ];
				let startPos = this.nodeCardDispensingRoot.parent.getComponent( UITransform ).convertToWorldSpaceAR( this.nodeCardDispensingRoot.position );
				startPos = uiCard.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( startPos );

				AudioController.instance.playCardDispensing();

				this.setAniMoveToPos( uiCard, startPos, uiEntity.vectorHiddenCards[ 0 ], moveDuration, this.getCardImage( 0 ),
					seat == this.mySeat ? () => {
						AudioController.instance.playPutHandCard();
					} : null );

			}, enableIdx * dispensingInterval );
		}

		for( let i = 0; i < this.seatPlayers.length; i++ ) {
			let seat = this.seatPlayers[ i ];

			if( false == this.isEnableSeat( seat ) ) {
				continue;
			}

			enableIdx++;
			let uiEntity = this.entityUiElements[ i ];

			setTimeout( () => {

				let uiCard = uiEntity.spriteHiddenCards[ 1 ];
				let startPos = this.nodeCardDispensingRoot.parent.getComponent( UITransform ).convertToWorldSpaceAR( this.nodeCardDispensingRoot.position );
				startPos = uiCard.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( startPos );

				AudioController.instance.playCardDispensing();

				this.setAniMoveToPos( uiCard, startPos, uiEntity.vectorHiddenCards[ 1 ], moveDuration, this.getCardImage( 0 ),
					seat == this.mySeat ? () => {
						AudioController.instance.playPutHandCard();
					} : null );

			}, enableIdx * dispensingInterval );
		}

		// MY_CARD_OPEN
		setTimeout( () => {
			if( -1 == this.myPrimaryCardIndex ) {
				return;
			}

			let uiEntity = this.getUiEntityFromSeat( this.mySeat );
			if( null == uiEntity ) {
				return;
			}

			AudioController.instance.playHideHiddenCard();

			let stopPos = new Vec3( uiEntity.vectorHiddenCards[ 0 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 0 ], stopPos, 0.1, () => {
			} );

			stopPos = new Vec3( uiEntity.vectorHiddenCards[ 1 ] );
			stopPos.y -= 30;
			this.setAniHideHiddenCard( uiEntity.spriteHiddenCards[ 1 ], stopPos, 0.1, () => {
				AudioController.instance.playFlipHandCard();
			} );

			this.setAniOpenHand( uiEntity.spriteHandCards[ 0 ], this.cardRes[ this.myPrimaryCardIndex + 1 ], () => {
			} );
			this.setAniOpenHand( uiEntity.spriteHandCards[ 1 ], this.cardRes[ this.mySecondaryCardIndex + 1 ], () => {
				uiEntity.spriteHandCardShadow.node.active = true;
				let handRank = this.getHandRank( this.myPrimaryCardIndex, this.mySecondaryCardIndex, this.numberCommunityCards );
				uiEntity.setUiHandRank( handRank );
			} );

		}, 1000 );
    }

    private setAniMoveToPos( sprite: Sprite, startPosition: Vec3, stopPosition: Vec3, duration: number, 
        hiddenCard: SpriteFrame, onFinished: ()=>void ) {

			sprite.node.active = true;

			sprite.spriteFrame = hiddenCard;
			sprite.color = new Color( 255, 255, 255, 0 );
			let euler = { x: 0, y: 0, z: 0 };
			Quat.toEuler( euler, sprite.node.rotation );
	
			let scale = new Vec3( sprite.node.scale );
			let tw = tween( sprite.node )
				.set( {
					position: new Vec3( startPosition ),
					scale: new Vec3( 0.2, 0.2, 1 )
				} )
				.to( duration, {
					position: stopPosition,
					scale: scale,
				}, {
					// easing: 'expoOut',
					onUpdate: ( target: Node, ratio: number ) => {
						Quat.fromEuler( sprite.node.rotation, 0, 0, euler.z * ratio );
						let a = 255 * ratio * 3;
						if( a > 255 ) {
							a = 255;
						}
						sprite.color = new Color( 255, 255, 255, a );
					}
				} );
	
			if( null != onFinished ) {
				tw.call( onFinished );
			}
	
			tw.union();
			tw.start();
    }
    
    private setAniOpenHand( sprite: Sprite, openCard: SpriteFrame, onFinished: ()=>void ) {
		sprite.node.active = true;
		sprite.spriteFrame = openCard;

		if(null == onFinished)
		{
			return;
		}

		onFinished();
    }

    private setAniHideHiddenCard( sprite: Sprite, stopPos: Vec3, duration: number, onFinished: ()=>void ) {
		if( false == sprite.node.active ) {
			return;
		}

		tween( sprite.node )
			.to( duration, { position: stopPos }, )
			.call( () => {
				sprite.node.active = false;
				if( null != onFinished ) {
					onFinished();
				}
			} ).union()
			.start();		
    }

    private setAniChipsMoveToPot( isShowAll, pots ) {
		let aniDuration: number = -1;
		this.entityUiElements.forEach( element => {
			aniDuration = element.setAnimationChipsMoveToPot(this.uiPot.maxPotLabelRoot);
		} );

		if( -1 != aniDuration ) {
			AudioController.instance.playChipMoveStart();
		}

		setTimeout( () => {
			this.setUiPot( pots );
		}, aniDuration * 1000 );
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
	
					let fromNode = null === startNode || undefined === startNode ? this.uiPot.maxPotLabelRoot : startNode;
	
					let pos = fromNode.parent.getComponent(UITransform).convertToWorldSpaceAR(fromNode.position);
					pos = moveTarget.node.parent.getComponent(UITransform).convertToNodeSpaceAR(pos);
	
					let to = uiEntity.node.parent.getComponent(UITransform).convertToWorldSpaceAR(uiEntity.node.position);
					to = uiEntity.node.parent.getComponent(UITransform).convertToNodeSpaceAR(to);
	
	
					let isLast = i == obj.sprChips.length - 1;
					let dur = 0.8;
					this.setTweenMoveFromTo(moveTarget, new Color(Color.WHITE), pos, to, delay, dur, this.easeOutQuart, () => {
						if (true == isPlaySound) {
							AudioController.instance.playChipMoveStart();

						}
					}, isLast ? () => {
						uiEntity?.setUiChips(chips);
						if (true == isPlaySound) {
							AudioController.instance.playChipMoveEnd();

						}
					} : () => {
						if (true == isPlaySound) {
							AudioController.instance.playChipMoveEnd();

						}
					});
				}
	
				return;
			}
	
			let bezierPathNodes: Node[] = [];
			bezierPathNodes.push( null=== startNode || undefined === startNode ? this.uiPot.maxPotLabelRoot : startNode);
	
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
						AudioController.instance.playChipMoveStart();
					}
				}, isLast ? () => {
					uiEntity?.setUiChips( chips );
					if( true == isPlaySound ) {
						AudioController.instance.playChipMoveEnd();
					}
				} : () => {
					if( true == isPlaySound ) {
						AudioController.instance.playChipMoveEnd();
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
		console.log(msg);

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

				// this.uiProfileCard.updateChips(this.myChips);
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

			// this.uiProfileCard.updateChips( this.myChips );

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
		this.uiProfile.open(id);
	}

	setTableInformation() {
        let sb = CommonUtil.getNumberStringWithComma(Board.small);
        let bb = CommonUtil.getNumberStringWithComma(Board.big);

        this.labelTableInformation.string = Board.info.name + ' / ' + Board.id.toString() + ' / (SB: ' + sb + ") / (BB: " + bb + ')';
		this.labelTableInformation.node.active = true;
    }
}


