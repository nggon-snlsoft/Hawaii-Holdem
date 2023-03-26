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
	let sql = 'UPDATE USERS SET TABLEID = ?, UPDATEDATE = ? WHERE ID = ?';
	let now = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
	let args = [data['tableID'], now, data['id']];

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

dao.updateRake  = function (id: any, rake: any, cb: any) {
	let query = "UPDATE USERS SET RAKE = ?, UPDATEDATE = ? WHERE ID = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [rake, now, id];

	_client.query(query, args, function (err: any, res: any) {
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

dao.selectStaticsByID = (id: any, cb: any)=> {

	let sql = "SELECT * FROM STATICS WHERE userID = ?";
	let args = [id];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res[0]);
	});
};
