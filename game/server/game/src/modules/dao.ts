let _client: any = null;
const dao = module.exports;

const moment = require('moment-timezone');
const timeZone = 'Asia/Tokyo';

dao.init = function ( sql: any ) {
    console.log('DAO INITIALIZED');
    _client = sql;

    let query = 'UPDATE USERS SET ACTIVESESSIONID = ?'
	let arg = '';

    _client.query( query, arg, function ( err: any, res: any ) {
        if ( !!err ) {
            return;
        }
    });

    return dao;
};

dao.selectTables = function( cb: any ) {
	let sql = 'SELECT * FROM TABLES WHERE DISABLE = 0 AND ALIVE = 1';

	_client.query( sql, null, (err: any, res: any) => {
		if(err != null){
			cb(err, null);
			return;
		}

		if(res.length < 1){
			cb(null, null);
			return;
		}

		cb(null, res);
	});
}

dao.selectTableInfo = ( id: any, cb: any )=> {
	let sql = 'SELECT * FROM TABLES WHERE DISABLE = 0 AND ALIVE = 1 AND ID = ?';
    let arg = [id];

	_client.query( sql, arg, (err: any, res: any) => {
		if(err != null){
			cb(err, null);
			return;
		}

		if(res.length < 1){
			cb(null, null);
			return;
		}

		cb(null, res[0]);
	});
}

dao.selectAccountByID = function (id: any, cb: any) {

	let sql = "SELECT * FROM USERS WHERE ALIVE = 1 AND DISABLE = 0 AND ID = ?";
	let args = [id];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.selectAccountByPendingID = function (pendingID: any, cb: any ) {
	let sql = "SELECT * FROM USERS WHERE PENDINGSESSIONID = ?";
	let args = [pendingID];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.updateAccountPending = function ( data: any, cb: any ) {

	let sql = "UPDATE USERS SET PENDINGSESSIONID = ?,  PENDINGSESSIONTIMESTAMP = ?, UPDATEDATE = ? WHERE ID = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [data["pendingSessionId"], data["pendingSessionTimestamp"], now, data["id"]];

	console.log(data["pendingSessionId"]);
	console.log(data["pendingSessionTimestamp"]);
	console.log(now);
	console.log(data["id"]);

	_client.query(sql, args, (err: any, res: any)=> {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updateTableID = function ( data: any, cb: any ){
	let sql = 'UPDATE USERS SET ROOMID = ?, UPDATEDATE = ? WHERE ID = ?';
	let now = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
	let args = [data['roomID'], now, data['id']];

	_client.query(sql, args, function (err: any, res: any) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updateActiveSessionID = function (sid: any, cb: any) {
	let sql = 'UPDATE USERS SET ACTIVESESSIONID = ?, PENDINGSESSIONID = ?, UPDATEDATE = ?, LOGINDATE = ? WHERE PENDINGSESSIONID = ?';
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [sid, "", now, now, sid];

	_client.query(sql, args, function (err: any, res: any) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.clearActiveSessionID = function( id: any ){
	let sql = "UPDATE USERS SET ACTIVESESSIONID = ? WHERE ID = ?";
	let args = ['', id];
	
	_client.query(sql, args, function (err: any, res: any) {
	 	if ( !!err ) {
	 		return;
	 	}
	 });
}

dao.chipOut = function(chip: any, id: any){
	let query = 'SELECT * FROM USERS WHERE ID = ?';
	let args = [id];

	_client.query(query, args, (err: any, res: any) => {
		if(err != null){
			return;
		}

		if(res.length < 1){
			return;
		}

		let user = res[0];

		let outChip = chip;
		if(user.chip != chip){
			outChip = user.chip;
		}
		
		user.balance += outChip;
		user.chip = 0;

		query = "UPDATE USERS SET BALANCE = ?, CHIP = ? WHERE ID = ?";
		args = [user.balance, user.chip, user.id];

		_client.query( query, args, (err: any, res: any) => {
			if(err != null){
				return;
			}
		});
	});
}

dao.updateChip = function (uid: any, chip: any, cb: any) {
	let query = "UPDATE USERS SET CHIP = ?, UPDATEDATE = ? WHERE ID = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [chip, now, uid];

	_client.query(query, args, (err: any, res: any )=>{
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.selectBalanceByUID = (id: any, cb: any)=> {
	let sql = "SELECT balance FROM USERS WHERE ID = ?";
	let args = [id];

	_client.query(sql, args, (err: any, res: any)=> {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.buyIn = ( userID: any, tableID: any , oldBalance: any, balance: any, oldChip: any, chip: any, amount: any, cb: any)=>{
	let query = "INSERT INTO BUYINS (USERID, TABLEID, OLDBALANCE, BALANCE, OLDCHIP, CHIP, AMOUNT, CREATEDATE) VALUES ( ?,?,?,?,?,?,?,? )";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [userID, tableID, oldBalance, balance, oldChip, chip, amount, now];

	_client.query(query, args, (err: any, res: any)=> {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
}

dao.updateBalance = (id: any, balance: any, cb: any)=> {
	let query = "UPDATE USERS SET BALANCE = ?, UPDATEDATE = ? WHERE ID = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [balance, now, id];

	_client.query(query, args, (err: any, res: any)=> {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};


/*

let _client = null;
const dao = module.exports;

const logger = require("../util/logger");
var moment = require('moment-timezone');
const timeZone = "America/New_York";

dao.init = function (sqlClient) {
	console.log("dao.init");
	let sql = "UPDATE user_table set activeSessionId = ?";
	let arg = "";
	_client = sqlClient;
	_client.query(sql, arg, function (err, res) {
	 	if ( !!err ) {
	 		return;
	 	}
	 });
	return  dao;
};

dao.timePurchase = function (uid, adminID, roomID, name, oldBalance, balance, oldChip, chip, amount, term, cb) {
	let sql = "INSERT INTO time_purchase (adminID, userID, roomID, name, oldBalance, balance, oldChip, chip, amount, term, createDate) values ( ?,?,?,?,?,?,?,?,?,?,?)";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [adminID, uid, roomID, name, oldBalance, balance, oldChip, chip, amount, term, now];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
}

dao.selectBalanceByUID = function (uid, cb) {
	let sql = "SELECT balance FROM user_table WHERE id = ?";
	let args = [uid];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};



dao.updateChip = function (uid,  chip, cb) {
	let sql = "UPDATE user_table set chip = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [chip, now, uid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updatePublicChip = function (uid,  chip, cb) {
	let sql = "UPDATE user_table set publicChip = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [chip, now, uid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updateRemainTime = function (uid,  time, cb) {
	let remainTime = Math.ceil( time * 0.001 );
	remainTime = Math.max( remainTime, 0 )

	let sql = "UPDATE user_table set remainTime = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [remainTime, now, uid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updatePublicRemainTime = function (uid,  time, cb) {
	let remainTime = Math.ceil( time * 0.001 );
	remainTime = Math.max( remainTime, 0 )

	let sql = "UPDATE user_table set publicRemainTime = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [remainTime, now, uid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updateRake  = function (uid,  rake, cb) {
	let sql = "UPDATE user_table set rake = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [rake, now, uid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};



dao.selectAccountByUID = function (uid, cb) {
	//using pin
	let sql = "SELECT * FROM user_table WHERE alive=1 and disable=0 and code = ?";
	let args = [uid];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.selectAccountByIndex = function (uid, cb) {
	//using index
	let sql = "SELECT * FROM user_table WHERE alive=1 and disable=0 and id = ?";
	let args = [uid];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.selectSettingByUUID = function (uuid, cb) {
	let sql = "SELECT * FROM setting WHERE userId = ?";
	let args = [uuid];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.selectAccountByPendingID = function (pendingID, cb) {
	let sql = "SELECT * FROM user_table  WHERE pendingSessionId = ?";
	let args = [pendingID];

	_client.query(sql, args, function (err, res) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.updateAccountPending = function (data, cb) {
	let sql = "UPDATE user_table set pendingSessionId = ?,  pendingSessionTimestamp = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [data["pendingSessionId"], data["pendingSessionTimestamp"], now, data["id"]];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updatePublicRoomID = function ( data, callback){
	let sql = "UPDATE user_table set publicRoomID = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [data["publicRoomID"], now, data["id"]];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			callback(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		}
	});
};

dao.updateSetting = function ( uuid, setting , callback){
	let id = uuid;
	let front = setting.cardFront;
	let back = setting.cardBack;
	let table = setting.tableType;

	let sql = "UPDATE setting set card_type1 = ?, card_type2 = ?, board_type = ? WHERE userId = ? ";
	let args = [front, back, table, id];

	_client.query(sql, args, function (err, res) {

		if (err !== null) {
			callback(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		}
	});
};

dao.updateAvatarType = function ( uuid, avatar , callback){
	let sql = "UPDATE user_Table set avatar = ? WHERE id = ? ";
	let args = [avatar, uuid];

	_client.query(sql, args, function (err, res) {

		if (err !== null) {
			callback(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		}
	});
};

dao.updateAccountBalanceByID = function (data, cb) {
	// let sql = "UPDATE user_table set balance = ?, chip = ?, activeSessionId = ? WHERE id = ?";
	// let args = [parseInt(data["balance"]), parseInt(data["chip"]), "", data["id"]];

	let sql = "UPDATE user_table set chip = ?, activeSessionId = ?, updateDate = ?, logoutDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [parseInt(data["chip"]), "", now, now, data["id"]];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.updateActiveSessionID = function (sid, cb) {
	let sql = "UPDATE user_table set activeSessionId = ?, pendingSessionId = ?, updateDate = ?, loginDate = ? WHERE pendingSessionId = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [sid, "", now, now, sid];

	_client.query(sql, args, function (err, res) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);
			} else {
				cb(null, false);
			}
		}
	});
};

dao.clearActiveSessionID = function(userID){
	let sql = "UPDATE user_table set activeSessionId = ? where id = " + userID;
	let arg = "";
	
	_client.query(sql, arg, function (err, res) {
	 	if ( !!err ) {
	 		return;
	 	}
	 });
}

dao.selectPublicRoomList = function(callback) {
	let sql = "select * from room_table where disable = 0 and isPrivate = 0";

	_client.query(sql, null, (err, res) => {
		if(err != null){
			callback(err, null);
			return;
		}

		if(res.length < 1){
			callback(null, null);
			return;
		}

		callback(null, res);
	});
};

dao.publicChipOut = function(chip, id){

	let sqlUser = "select * from user_table where id = " + id;

	_client.query(sqlUser, null, (err, res) => {
		if(err != null){
			logger.error(err);
			return;
		}

		if(res.length < 1){
			logger.error("user " + id + " not found from public Chip out");
			return;
		}

		let user = res[0];

		let outChip = chip;
		if(user.publicChip != chip){
			logger.error("chip is Diff " + outChip + "  " +  user.publicChip);
			outChip = user.publicChip;
		}
		
		user.balance += outChip;
		user.publicChip = 0;
		user.publicRemainTime = 0;

		let sqlUpdate = "update user_table set balance = ?, publicChip = ?, publicRemainTime = ? where id = " + id;
		let args = [user.balance, user.publicChip, user.publicRemainTime];

		_client.query(sqlUpdate,args, (err2, res2) => {
			if(err2 != null){
				logger.error(err2);
				return;
			}

			logger.info("Successe chip out user " + id + " outChip : " + outChip + " balance : " + user.balance);
		});
	});
}



dao.insertUserSetting = function (uid, cb) {
	let sql = "INSERT INTO setting ( userId, card_type1, card_type2, board_type, best_hands) values ( ?,?,?,?,? )";
	let args = [ uid, '0', '0', '0', ' '];

	_client.query(sql, args, function (err, res) {
		console.log(res);
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
}


*/