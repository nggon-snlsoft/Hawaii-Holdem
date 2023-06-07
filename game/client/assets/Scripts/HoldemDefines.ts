
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

export const VOLUMNE_MULTIPLIER:number = 10.0;

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

export enum ENUM_BET_SOUND {
	BET_FOLD,
	BET_CHECK,
	BET_CALL,
	BET_QUATER,
	BET_HALF,
	BET_FULL,
	BET_MAX,
	BET_ALLIN,
}

export enum ENUM_LEAVE_REASON {
    LEAVE_NONE = -1,    
    LEAVE_UNKNOWN = 0,
    LEAVE_TOKEN_EXPIRE = 1,
    LEAVE_VERSION_MISMATCH = 2,
	LEAVE_LONG_AFK = 3,
	LEAVE_DISABLE_ACCOUNT = 4,
}

export enum ENUM_DEVICE_TYPE {
    MOBILE_PORTRAIT = 0,
    PC_LANDSCAPE = 1,
}

export enum ENUM_CURRENT_SCENE {
    LOGIN_SCENE = 0,
    LOBBY_SCENE = 1,
    GAME_SCENE = 2,
}