import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { Client } from "colyseus";

export class EntityState extends Schema {
	@type( "string" ) sid: string = "SESSION_ID";
	@type( "number" ) id: number = 0;
	@type( "number" ) avatar: number = 0;
	@type( "string" ) uid: string = "";
	@type( "string" ) nickname: string = "";
	@type( "number" ) chips: number = 0;
	@type( "number" ) rake: number = 0;
	@type( "boolean" ) wait: boolean = false;
	@type( "number" ) currBet: number = 0;
	@type( "number" ) roundBet: number = 0;
	@type( "boolean" ) fold: boolean = false;
	@type( "boolean" ) hasAction: boolean = false;
	@type( "number" ) allIn: number = 0;
	@type( "number" ) seat: number = -1;

	cardIndex: number[] = [];
	primaryCard: string = "";
	secondaryCard: string = "";
	client: Client = null;
	eval: any = null;

	@type( "boolean" ) leave : boolean = false;
	@type( "boolean" ) connected : boolean = false;	
	@type( "number" ) winAmount : number = 0;
	winHandRank : string = '';
	@type( "boolean" ) enoughChip : boolean = true;
	@type( "number" ) balance : number = 0;
	@type( "number" ) ante : number = 0;	
	@type( "number" ) totalBet : number = 0;		

	waitReconnection : boolean = false;
	lastPingTime : number = -1;
	
	@type("boolean") isSitOut : boolean = false;
	@type("boolean") pendSitout : boolean = false;	
	@type("boolean") isSitBack : boolean = false;
	sitoutTimestamp: number = 0;

	timeLimitCount : number = 0;
	@type("boolean") dealable: boolean = false;
	@type('boolean') isDealer:boolean = false;
	@type('boolean') isSb:boolean = false;
	@type('boolean') isBb:boolean = false;

	isNew: boolean = false;
	longSitOut: boolean = false;
	banned: boolean = false;
	reBuyCount: number = 0;
	pendReBuy: number = 0;
	initRoundChips: number = 0;

	tableInitChips: number = 0;
	tableBuyInAmount: number = 0;
	tableBuyInCount: number = 0;
	background: boolean = false;
	backgroundTimestamp: number = 0;
	rake_back_rate: number = 0;
	
	statics: any = null;

	@type( "boolean" ) missSb: boolean = false;
	@type( "boolean" ) missBb: boolean = false;

	@type( "number" ) oldChips : number = 0;
	@type( "number" ) oldRake : number = 0;
}

export class RoomState extends Schema {
	@type( [ EntityState ] ) entities = new ArraySchema<EntityState>();
	
	@type( "int8" ) gameState : any = 0;
	@type( "number" ) dealerSeat: number = -1;
	@type( "number" ) sbSeat: number = -1;
	@type( "number" ) bbSeat: number = -1;

	@type( "number" ) startBet: number = 0;
	@type( "number" ) maxBet: number = 0;
	@type( "number" ) minRaise: number = 0;
	@type( "string" ) shuffle: string = "";
	@type( "number" ) pot: number = 0;
}