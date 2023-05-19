export class ClientUserData{

	static getClientUserData(dbUserData : any) : any {
		if(null == dbUserData){
			return;
		}

		let user : any = {
            id: dbUserData.id,
			login_id: dbUserData.login_id,
			nickname: dbUserData.nickname,
			login_ip: dbUserData.login_ip,
			avatar: dbUserData.avatar,
			grade: dbUserData.grade,
            balance: dbUserData.balance,
            chip: dbUserData.chip,
			point: dbUserData.point,
			table_id: dbUserData.table_id,
			wins: dbUserData.wins,
			bettings: dbUserData.bettings,
			rake: dbUserData.rake,
			store_id: dbUserData.store_id,
			distributor_id: dbUserData.distributor_id,
			partner_id: dbUserData.partner_id,			
			phone: dbUserData.phone,
            bank: dbUserData.bank,
            holder: dbUserData.holder,
            account: dbUserData.account,
			join_ip: dbUserData.join_ip
		}

		return user;
	}

	static  getClientSettingData(dbSettingData: any): any {
		let setting: any = {
			id: dbSettingData.id,
			user_id: dbSettingData.user_id,			
			sound: dbSettingData.sound,
			mode: dbSettingData.mode,
			card: dbSettingData.card_type,
			board: dbSettingData.board_type,
			background: dbSettingData.bg_type,
		}

		return setting;
	}

	static getClientTableData(dbRoomData: any): any {
        let room: any = {
			id: dbRoomData.id,
			name: dbRoomData.name,			
			type: dbRoomData.type,			
			grade: dbRoomData.grade,
			password: dbRoomData.password,			
			maxPlayers: dbRoomData.maxPlayers,
			betTimeLimit: dbRoomData.betTimeLimit,
			ante: dbRoomData.ante,
			smallBlind: dbRoomData.smallBlind,			
			bigBlind: dbRoomData.bigBlind,
			minBuyIn: dbRoomData.minStakePrice,
			maxBuyIn: dbRoomData.maxStakePrice,
			rake: dbRoomData.rake,
			alive: dbRoomData.alive,
			disable: dbRoomData.disable,
        }
        return room;
    }

	static getClientStaticsData(dbStaticsData: any): any {
        let statics: any = {
			id: dbStaticsData.id,
			user_id: dbStaticsData.user_id,			
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
			maxPot_hands: dbStaticsData.maxPot_hands,
        }
        return statics;
    }

	static getClientStoreData( dbStoreData: any): any {
        let statics: any = {
			id: dbStoreData.id,
			name: dbStoreData.name,
			bank: dbStoreData.bank,
			holder: dbStoreData.holder,
			account: dbStoreData.account,
        }
        return statics;
    }
}
