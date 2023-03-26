export class ClientUserData{

	static getClientUserData(dbUserData : any) : any {
		if(null == dbUserData){
			return;
		}

		let user : any = {
			name : dbUserData.firstName + " " + dbUserData.lastName,
			avatar: dbUserData.avatar,
			balance : dbUserData.balance,
			uuid : dbUserData.id,
			tableID : dbUserData.tableID,
			remainTime : dbUserData.remainTime,
			chip: dbUserData.chip
		}

		return user;
	}

	static  getClientSettingData(dbSettingData: any): any {
		let setting: any = {
			uuid: dbSettingData.userId,
			cardFront: dbSettingData.card_type1,
			cardBack: dbSettingData.card_type2,
			board: dbSettingData.board_type,
			bestHand: dbSettingData.best_hands,
		}

		return setting;
	}

	static getClientTableData(dbRoomData: any): any {
        let room: any = {
			id: dbRoomData.id,
			type: dbRoomData.type,
			grade: dbRoomData.grade,
			name: dbRoomData.name,
			password: dbRoomData.password,
			maxPlayers: dbRoomData.maxPlayers,
			players: 0,
			betTimeLimit: dbRoomData.betTimeLimit,
			bigBlind: dbRoomData.bigBlind,
			smallBlind: dbRoomData.smallBlind,
			minBuyIn: dbRoomData.minStakePrice,
			maxBuyIn: dbRoomData.maxStakePrice,
			alive: dbRoomData.alive,
			disable: dbRoomData.disable,
        }
        return room;
    }

	static getClientStaticsData(dbStaticsData: any): any {
        let statics: any = {
			id: dbStaticsData.id,
			hands: dbStaticsData.hands,
			rakes: dbStaticsData.rakes,
			rollings: dbStaticsData.rollings,
			maxPots: dbStaticsData.maxPots,
			win: dbStaticsData.win,
			fold: dbStaticsData.fold,
			draw: dbStaticsData.draw,
			win_preflop: dbStaticsData.win_preflop,
			win_flop: dbStaticsData.win_flop,
			win_turn: dbStaticsData.win_turn,
			win_river: dbStaticsData.win_river,
			win_dealer: dbStaticsData.win_dealer,
			win_smallBlind: dbStaticsData.win_smallBlind,
			win_bigBlind: dbStaticsData.win_bigBlind,
			fold_preflop: dbStaticsData.fold_preflop,
			fold_flop: dbStaticsData.fold_flop,
			fold_turn: dbStaticsData.fold_turn,
			fold_river: dbStaticsData.fold_river,
			best_hands: dbStaticsData.best_hands,
        }
        return statics;
    }
}
