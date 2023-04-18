
export const GAME_STATE_SUSPEND: number = 0;
export const GAME_STATE_READY: number = 1;
export const GAME_STATE_PREPARE: number = 2;

export const GAME_STATE_PREFLOP: number = 3;
export const GAME_STATE_BET: number = 4;
export const GAME_STATE_FLOP: number = 5;
export const GAME_STATE_TURN: number = 6;
export const GAME_STATE_RIVER: number = 7;

export const GAME_STATE_RESULT: number = 8;
export const GAME_STATE_SHOWDOWN: number = 9;
export const GAME_STATE_CLEAR: number = 10;

export enum ENUM_COMMUNTY_CARD_STATE {
	PREPARE = 0,
	PRE_FLOP = 1,
	FLOP = 2,
	TURN = 3,
	RIVER = 4,
	SHOWDOWN = 5
}

export enum ENUM_CARD_TYPE {
    NONE = 0,
	PLAYER_HIDDEN = 1,
	PLAYER_HAND = 2,
	COMMUNITY_FLOP = 3,
	COMMUNITY_TURN = 4,
	COMMUNITY_RIVER = 5,
}