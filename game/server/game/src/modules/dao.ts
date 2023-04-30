import { eCommunityCardStep } from "../rooms/HoldemRoom";

let _client: any = null;
const dao = module.exports;

const moment = require('moment-timezone');
const timeZone = 'Asia/Tokyo';

dao.init = function ( sql: any ) {
    console.log('DAO INITIALIZED');
    _client = sql;

    let query = 'UPDATE USERS SET ACTIVESESSIONID = ?, PENDINGSESSIONID = ?, PENDINGSESSIONTIMESTAMP = 0, TABLEID = -1'
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

dao.selectTables = function( store: any, cb: any ) {

	let sql = 'SELECT * FROM TABLES WHERE DISABLE = 0 AND ALIVE = 1 AND STORE = ?';
	let args = [ store ];

	_client.query( sql, args, (err: any, res: any) => {
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

dao.ResetTableID = function ( tableId: number, cb: any ){
	let sql = 'UPDATE USERS SET TABLEID = ?, UPDATEDATE = ? WHERE TABLEID = ?';
	let now = moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
	let args = [ -1, now, tableId ];

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

dao.clearPendingSessionID = function( id: any ){
	let sql = "UPDATE USERS SET PENDINGSESSIONID = ?, PENDINGSESSIONTIMESTAMP = ? WHERE ID = ?";
	let args = ['', '', id];
	
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

dao.UpdateHandsCount = ( id: any, cb: any )=> {
	let query = "UPDATE STATICS SET HANDS = HANDS + 1 WHERE USERID = ?";
	let args = [id];

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

dao.UpdateFoldCount = ( id: any, state: any, cb: any ) => {
	// export enum eCommunityCardStep {
	// 	PREPARE,
	// 	PRE_FLOP,
	// 	FLOP,
	// 	TURN,
	// 	RIVER,
	// 	RESULT
	// }
	let query: string = '';
	switch ( state ) {
		case eCommunityCardStep.PRE_FLOP:
		query = "UPDATE STATICS SET FOLD_PREFLOP = FOLD_PREFLOP + 1 WHERE USERID = ?";
		break;
		case eCommunityCardStep.FLOP:
		query = "UPDATE STATICS SET FOLD_FLOP = FOLD_FLOP + 1 WHERE USERID = ?";
		break;
		case eCommunityCardStep.TURN:
		query = "UPDATE STATICS SET FOLD_TURN = FOLD_TURN + 1 WHERE USERID = ?";
		break;
		case eCommunityCardStep.RIVER:
		query = "UPDATE STATICS SET FOLD_RIVER = FOLD_RIVER + 1 WHERE USERID = ?";			
		break;		
	}

	let args = [id];
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

dao.UpdateStatics = ( id: any, statics: any, cb: any ) => {
	let query = 'UPDATE STATICS SET HANDS = ?, RAKES = ?, ROLLINGS = ?, MAXPOTS = ?, ' + 
	'WIN = ?, WIN_ALLIN = ?, WIN_PREFLOP = ?, WIN_FLOP = ?, WIN_TURN = ?, WIN_RIVER = ?, WIN_DEALER = ?, WIN_SMALLBLIND = ?, WIN_BIGBLIND = ?, ' + 
	'FOLD = ?, FOLD_PREFLOP =?, FOLD_FLOP = ?, FOLD_TURN =?, FOLD_RIVER = ?, ' +  
	'DRAW = ?, BEST_RANK = ?,  BEST_HANDS = ?, UPDATEDATE = ? ' + 'WHERE USERID = ?';
	
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

dao.SelectSalesUserInfo = (data: any, cb: any ) => {
	console.log('dao.SelectSalesUserInfo');
	console.log( data );

	let id = data.id;
	let date = data.date;

	let query = 'SELECT * FROM SALES_USER WHERE YEAR = ? AND MONTH = ? AND DAY = ? AND USERID = ?';
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

dao.UpdateSalesUserInfo = (data: any, cb: any ) => {
	console.log('dao.UpdateSalesUserInfo');
	console.log( data );

	let query = "UPDATE SALES_USER SET WINS = WINS + ?, RAKES = RAKES + ? WHERE ID = ?";
	let args = [ data.win, data.rake, data.index ];

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

dao.CreateSalesUserInfo = function ( data: any, cb: any ) {
	console.log('dao.CreateSalesUserInfo');
	console.log( data );

	let id = data.id;
	let store = data.store;
	let win = data.win;
	let rake = data.rake;
	let date = data.date;

	let sql = 'INSERT INTO SALES_USER ( userId, store, year, month, day, timestamp, wins, rakes ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ id, store, date.year, date.month, date.day, date.timestamp, win, rake ];

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

dao.SelectSalesTableInfo = (data: any, cb: any ) => {
	console.log('dao.SelectSalesTableInfo');
	console.log( data );

	let tableId = data.table;
	let date = data.date;

	let query = 'SELECT * FROM SALES_TABLE WHERE YEAR = ? AND MONTH = ? AND DAY = ? AND TABLEID = ?';
	let args = [ date.year, date.month, date.day, tableId ];

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

dao.UpdateSalesTableInfo = (data: any, cb: any ) => {
	console.log('dao.UpdateSalesTableInfo');
	console.log( data );

	let query = "UPDATE SALES_TABLE SET RAKES = RAKES + ? WHERE ID = ?";
	let args = [ data.rake, data.index ];

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

dao.CreateSalesTableInfo = function ( data: any, cb: any ) {
	console.log('dao.CreateSalesTableInfo');
	console.log( data );

	let id = data.table;
	let store = data.store;
	let win = data.win;
	let rake = data.rake;
	let date = data.date;

	let sql = 'INSERT INTO SALES_TABLE ( tableId, store, year, month, day, timestamp, rakes ) values ( ?, ?, ?, ?, ?, ?, ? )';
	let args = [ id, store, date.year, date.month, date.day, date.timestamp, rake ];

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
