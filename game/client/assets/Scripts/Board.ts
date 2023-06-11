import { UiTable } from "./UiTable";

export class Board {
	// static autoBuyIn: boolean = false;
	// static autoBuyInAmount: number = 0;
	static balance: number = 0;
	static buyin: number = 0;
	static small: number = 0;
	static big: number = 0;
	static passPrice : number = 0;
	static passTerm : number = 0;
	static id: number = 0;
	static table_id: number = 0;
	static room: Colyseus.Room = null;
	static table : UiTable = null;
	static minStakePrice : number = 0;
	static maxStakePrice : number = 0;
	static reserveSeat: number = -1;
	static isPublic: boolean = false;
	static info: any = null;
	static ante: number = 0;
	static ip: string = '';

	static setInfo( info: any ) {
		Board.info = info;
		Board.id = info.id;
		Board.table_id = info.id;
		Board.table_id = info.id;

		Board.small = info.smallBlind;
		Board.big = info.bigBlind;
		Board.ante = info.ante;
	}
}


