let _client = null;
const dao = module.exports;
const logger = require("../util/logger");
var moment = require('moment-timezone');
//const timeZone = "America/Los_Angeles";
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

dao.buyIn = function (uid, adminID,  roomID, name, oldBalance, balance, oldChip, chip, amount, cb) {
	let sql = "INSERT INTO buyIn_Table (adminID, userID, roomID, name, oldBalance, balance, oldChip, chip, amount, createDate) values ( ?,?,?,?,?,?,?,?,?,? )";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [adminID, uid, roomID, name, oldBalance, balance, oldChip, chip, amount, now];

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

dao.updateBalance = function (uid, balance, cb) {
	let sql = "UPDATE user_table set balance = ?, updateDate = ? WHERE id = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [balance, now, uid];

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

dao.selectRoomByUID = function (uid, cb) {
	let sql = "SELECT * FROM room_table WHERE alive=1 and disable=0 and isPrivate = 1 and id = ?";
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

dao.selectRoom = function(id, callback) {
	let sql = "select * from room_table where disable = 0 and isPrivate = 0 and id = " + id;

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