export class ClientUserData{

	static getClientUserData(dbUserData : any) : any {
		if(null == dbUserData){
			return;
		}

		let user : any = {
            id: dbUserData.id,
			uid: dbUserData.uid,
			nickname: dbUserData.nickname,
			avatar: dbUserData.avatar,
			grade: dbUserData.grade,
            balance: dbUserData.balance,
            chip: dbUserData.chip,
			roomID: dbUserData.roomID,
			rake: dbUserData.rake,
			store: dbUserData.store,
            bank: dbUserData.bank,
            holder: dbUserData.holder,
            account: dbUserData.account,			
		}


		return user;
	}

	static  getClientSettingData(dbSettingData: any): any {
		let setting: any = {
			id: dbSettingData.userId,
			sound: dbSettingData.sound,
			card: dbSettingData.card_type1,
			cardBack: dbSettingData.card_type2,
			board: dbSettingData.board_type,
			background: dbSettingData.bg_type,			
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
			betTimeLimit: dbRoomData.betTimeLimit,
			bigBlind: dbRoomData.bigBlind,
			smallBlind: dbRoomData.smallBlind,
			ante: dbRoomData.ante,
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
			win_allin: dbStaticsData.win_allin,
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
			best_rank: dbStaticsData.best_rank,
			best_hands: dbStaticsData.best_hands,
        }
        return statics;
    }

	static getClientStoreData( dbStoreData: any): any {
        let statics: any = {
			uid: dbStoreData.uid,
			name: dbStoreData.name,
			bank: dbStoreData.bank,
			holder: dbStoreData.holder,
			account: dbStoreData.account,
        }
        return statics;
    }
}
