import { eCommunityCardStep } from "../rooms/HoldemRoom";

let _client: any = null;
const dao = module.exports;

const moment = require('moment-timezone');
const timeZone = 'Asia/Tokyo';

dao.init = function ( sql: any ) {
    console.log('DAO INITIALIZED');
    _client = sql;

    let query = 'UPDATE USERS SET ACTIVESESSIONID = ?, PENDINGSESSIONID = ?, PENDINGSESSIONTIMESTAMP = 0, TABLE_ID = -1'
	let arg = ['', ''];

    _client.query( query, arg, function ( err: any, res: any ) {
        if ( !!err ) {
            return;
        }

		query = 'UPDATE USERS SET BALANCE = BALANCE + CHIP, CHIP = 0 WHERE CHIP > 0'
		_client.query ( query, null, function ( err: any, res: any ) {
			if ( !!err ) {
				return;
			}
		});
    });

    return dao;
};

dao.SELECT_TABLES = function( cb: any ) {

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

dao.SELECT_TABLES_ByTABLE_ID = ( table_id: any, cb: any )=> {
	let sql = 'SELECT * FROM TABLES WHERE DISABLE = 0 AND ALIVE = 1 AND ID = ?';
    let arg = [table_id];

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

dao.SELECT_USERS_ByUSER_ID = function (id: any, cb: any) {

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

dao.SELECT_USERS_ByPENDING_ID = function (pendingID: any, cb: any ) {
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

dao.UPDATE_USERS_PENDING = function ( data: any, cb: any ) {

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

dao.UPDATE_USERS_TABLE_ID_ByUSER = function ( data: any, cb: any ){
	console.log( data );

	let sql = 'UPDATE USERS SET TABLE_ID = ?, UPDATEDATE = ? WHERE ID = ?';
	let now = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
	let args = [data['table_id'], now, data['id']];

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

dao.UPDATE_USERS_CLEAR_TABLE_ID = function ( table_id: number, value: number, cb: any ){
	let sql = 'UPDATE USERS SET TABLE_ID = ?, UPDATEDATE = ? WHERE TABLE_ID = ?';
	let now = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
	let args = [ value, now, table_id ];

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

dao.UPDATE_USER_ACTIVE_SESSION_ID = function (sid: any, cb: any) {
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

dao.UPDATE_USERS_ACTIVE_SESSION_ID = function( sid: any, session_id: any ){
	let sql = "UPDATE USERS SET ACTIVESESSIONID = ? WHERE ID = ?";
	let args = [session_id, sid];
	
	_client.query(sql, args, function (err: any, res: any) {
	 	if ( !!err ) {
	 		return;
	 	}
	 });
}

dao.UPDATE_USERS_PENDING_SESSION_ID = function( id: any, session_id: any ){
	let sql = "UPDATE USERS SET PENDINGSESSIONID = ?, PENDINGSESSIONTIMESTAMP = ? WHERE ID = ?";
	let args = [session_id, '', id];
	
	_client.query(sql, args, function (err: any, res: any) {
	 	if ( !!err ) {
	 		return;
	 	}
	 });
}

dao.CHIP_OUT = function(chip: any, id: any){
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

dao.UPDATE_USERS_CHIP = function ( id: any, chip: any, cb: any) {
	let query = "UPDATE USERS SET CHIP = ?, UPDATEDATE = ? WHERE ID = ?";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [chip, now, id];

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

dao.SELECT_BALANCE_ByUSER_ID = (id: any, cb: any)=> {
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

dao.BUY_IN = ( user_id: any, table_id: any , oldBalance: any, balance: any, oldChip: any, chip: any, amount: any, cb: any)=>{
	let query = "INSERT INTO BUYINS (USER_ID, TABLE_ID, OLDBALANCE, BALANCE, OLDCHIP, CHIP, AMOUNT, CREATEDATE) VALUES ( ?,?,?,?,?,?,?,? )";
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [user_id, table_id, oldBalance, balance, oldChip, chip, amount, now];

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

dao.UPDATE_USERS_BALANCE = (id: any, balance: any, cb: any)=> {
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

dao.UPDATE_USERS_RAKE  = function (id: any, rake: any, cb: any) {
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

dao.SELECT_STATICS_ByUSER_ID = ( user_id: any, cb: any)=> {

	let sql = "SELECT * FROM STATICS WHERE USER_ID = ?";
	let args = [ user_id ];

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

dao.UPDATE_STATICS = ( id: any, statics: any, cb: any ) => {
	let query = 'UPDATE STATICS SET HANDS = ?, RAKES = ?, ROLLINGS = ?, MAXPOTS = ?, ' + 
	'WIN = ?, WIN_ALLIN = ?, WIN_PREFLOP = ?, WIN_FLOP = ?, WIN_TURN = ?, WIN_RIVER = ?, WIN_DEALER = ?, WIN_SMALLBLIND = ?, WIN_BIGBLIND = ?, ' + 
	'FOLD = ?, FOLD_PREFLOP =?, FOLD_FLOP = ?, FOLD_TURN =?, FOLD_RIVER = ?, ' +  
	'DRAW = ?, BEST_RANK = ?,  BEST_HANDS = ?, UPDATEDATE = ? ' + 'WHERE USER_ID = ?';
	
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
	let args = [ statics.hands, statics.rakes, statics.rollings, statics.maxPots,
	statics.win, statics.win_allin, statics.win_preflop, statics.win_flop, statics.win_turn, statics.win_river, statics.win_dealer, statics.win_smallBlind, statics.win_bigBlind,
	statics.fold, statics.fold_preflop, statics.fold_flop, statics.fold_turn, statics.fold_river,
	statics.draw, statics.best_rank, statics.best_hands, now, id ];

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
}

dao.SELECT_SALES_USER = (data: any, cb: any ) => {

	let id = data.id;
	let date = data.date;

	let query = 'SELECT * FROM SALES_USER WHERE YEAR = ? AND MONTH = ? AND DAY = ? AND USER_ID = ? AND USETICKET = 0';
	let args = [ date.year, date.month, date.day, id ];

	_client.query( query, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb( err, null );
			}
			return;
		}

		cb?.(null, res[0] );
	});	
}

dao.UPDATE_SALES_USER = (data: any, cb: any ) => {
	let id = data.index;
	let bettings = data.bettings;
	let wins = data.wins;
	let rakes = data.rakes;
	let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

	let query = "UPDATE SALES_USER SET WINS = WINS + ?, RAKES = RAKES + ?, BETTINGS = ?, UPDATEDATE = ? WHERE ID = ?";
	let args = [ wins, rakes, bettings, now, id];

	_client.query(query, args, function (err: any, res: any) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows);
			} else {
				cb(null, 0);
			}
		}
	});	
}

dao.INSERT_SALES_USER = function ( data: any, cb: any ) {

	let user_id = data.user_id;
	let store_id = data.store_id;
	let distributor_id = data.distributor_id;
	let partner_id = data.partner_id;
	let bettings = data.bettings;
	let wins = data.wins;
	let rakes = data.rakes;
	let date = data.date;

	let sql = 'INSERT INTO SALES_USER ( user_Id, store_id, distributor_id, partner_id, year, month, day, timestamp, wins, rakes, bettings ) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user_id, store_id, distributor_id, partner_id, date.year, date.month, date.day, date.timestamp, wins, rakes, bettings ];

	_client.query(sql, args, function (err: any, res: any) {

		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows );
			} else {
				cb(null, 0 );
			}
		}
	});	
}

dao.SELECT_SALES_TABLE = (data: any, cb: any ) => {

	let table_id = data.table_id;
	let date = data.date;

	let query = 'SELECT * FROM SALES_TABLE WHERE YEAR = ? AND MONTH = ? AND DAY = ? AND TABLE_ID = ?';
	let args = [ date.year, date.month, date.day, table_id ];

	_client.query( query, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb( err, null );
			}
			return;
		}

		cb?.(null, res[0] );
	});	
}

dao.UPDATE_SALES_TABLE = (data: any, cb: any ) => {
	let id = data.id;
	let bettings = data.bettings;
	let rakes = data.rakes;

	let query = "UPDATE SALES_TABLE SET RAKES = RAKES + ?, BETTINGS = BETTINGS + ? WHERE ID = ?";
	let args = [ rakes, bettings, id ];

	_client.query(query, args, function (err: any, res: any) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows);
			} else {
				cb(null, 0);
			}
		}
	});	
}

dao.INSERT_SALES_TABLE = function ( data: any, cb: any ) {

	let table_id = data.table_id;
	let store_id = data.store_id;
	let bettings = data.bettings;
	let rakes = data.rakes;
	let date = data.date;

	let sql = 'INSERT INTO SALES_TABLE ( table_Id, store_id, year, month, day, timestamp, rakes, bettings ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ table_id, store_id, date.year, date.month, date.day, date.timestamp, rakes, bettings ];

	_client.query(sql, args, function (err: any, res: any) {

		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows );
			} else {
				cb(null, 0 );
			}
		}
	});	
}

dao.SELECT_USERS_BY_USER_ID_TOKEN = function ( user_id: any, token: any, cb: any ) {

	let sql = 'SELECT * FROM USERS WHERE ID = ? AND TOKEN = ? ';
	let args = [user_id, token];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if ( res != null ) {
			if ( res.length > 0 ) {
				cb(null, true);
			} else {
				cb(null, false);
			}

		} else {
			cb(null, false);
		}
	});
};
