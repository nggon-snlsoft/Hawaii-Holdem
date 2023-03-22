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
            bank: dbUserData.bank,
            holder: dbUserData.holder,
            account: dbUserData.account,
		}

		return user;
	}

	static  getClientSettingData(dbSettingData: any): any {
		let setting: any = {
			id: dbSettingData.userId,
			cardFront: dbSettingData.card_type1,
			cardBack: dbSettingData.card_type2,
			board: dbSettingData.board_type,
			bestHand: dbSettingData.best_hands,
		}

		return setting;
	}

    static getClientRoomData(dbRoomData: any): any {
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
			minBuyIn: dbRoomData.minStakePrice,
			maxBuyIn: dbRoomData.maxStakePrice,
			alive: dbRoomData.alive,
			disable: dbRoomData.disable,
        }
        return room;
    }
}
