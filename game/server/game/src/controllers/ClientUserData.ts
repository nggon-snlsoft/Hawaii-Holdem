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
}
