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
			roomID : dbUserData.roomID,
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
}
