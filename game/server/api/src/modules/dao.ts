import { userInfo } from "os";
import { ENUM_RESULT_CODE } from "../main";

let _client: any = null;
const dao = module.exports;

dao.init = function ( sql: any ) {
    _client = sql;
    return dao;
};

dao.selectAccountByID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM USERS WHERE ID = ?';
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

dao.selectAccountByUID = function ( uid: any, cb: any ) {

	let sql = 'SELECT * FROM USERS WHERE UID = ?';
	let args = [uid];

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

dao.selectJoinUserByUID = function ( uid: any, cb: any ) {

	let sql = 'SELECT * FROM JOINS WHERE UID = ?';
	let args = [uid];

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

dao.selectJoinUserByNickname = function ( nickname: any, cb: any ) {
	console.log( nickname );

	let sql = 'SELECT * FROM JOINS WHERE NICKNAME = ?';
	let args = [nickname];

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

dao.selectAccountByNickname = function ( nickname: any, cb: any ) {

	let sql = 'SELECT * FROM USERS WHERE NICKNAME = ?';
	let args = [nickname];

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

dao.selectSettingByID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM SETTING WHERE USERID = ?';
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

dao.updateSettingByID = function ( id: any, setting: any, cb: any ) {
	let index = id;
	let sound = setting.sound;
	let card = setting.card;
	let table = setting.table;
	let background = setting.background;


	let sql = "UPDATE SETTING SET SOUND = ?, CARD_TYPE1 = ?, BOARD_TYPE = ?, BG_TYPE = ? WHERE USERID = ? ";
	let args = [ sound, card, table, background, index ];

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

dao.selectStaticsByID = function ( id: any, cb: any ) {
	console.log('id: ' + id);

	let sql = 'SELECT * FROM STATICS WHERE USERID = ?';
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

dao.insertAccountForPending = function ( user: any, cb: any ) {

	let sql = 'INSERT INTO USERS (uid, nickname, password, transferpassword, phone, bank, holder, account, recommender, disable, alive, pending ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	let args = [user.uid, user.nickname, user.password, user.trans, user.phone, user.bank, user.holder, user.account, user.recommender, 0, 1, 1 ];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

        console.log( res );

		cb?.(null, {
            code: ENUM_RESULT_CODE.SUCCESS,
         });
	});
}

dao.insertJoinMember = function ( user: any, cb: any ) {

	let sql = 'INSERT INTO JOINS (uid, nickname, password, transferpassword, phone, bank, holder, account, recommender, store, alive ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	let args = [ user.uid, user.nickname, user.password, user.trans, user.phone, 
		user.bank, user.holder, user.account, user.recommender, user.store, 1 ];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

        console.log( res );

		cb?.(null, {
            code: ENUM_RESULT_CODE.SUCCESS,
         });
	});
}

dao.insertInitialSetting = function ( id: any, cb: any ) {

	let sql = "INSERT INTO setting ( userId, sound, card_type1, card_type2, board_type, bg_type, best_hands) values ( ?,?,?,?,?,?,? )";
	let args = [ id, '7', '0', '0', '0', '0', ' '];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, {
            code: ENUM_RESULT_CODE.SUCCESS,
         });
	});
}

dao.insertUserStatics = ( id: any, cb: any )=> {
	console.log('insertUserStatics: ', id);

	let sql = "INSERT INTO STATICS(userID) VALUES (?)";
	let args = [id];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			console.log('err');			
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, {
            code: ENUM_RESULT_CODE.SUCCESS,
         });
	});
}

dao.updateAvatar = function ( id: any, avatar: any, cb: any ) {
	let sql = "UPDATE USERS SET AVATAR = ? WHERE ID = ? ";
	let args = [avatar, id];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
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

dao.selectTables = function ( cb: any ) {
    let alive = 1;
	let sql = 'SELECT * FROM TABLES WHERE ALIVE = ?';
	let args = [alive];

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

dao.SelectStoreByStoreID = function ( sid: any, cb: any ) {
	console.log('dao.SelectStoreByStoreID: ' + sid.toString() );

	let sql = 'SELECT * FROM STORES WHERE ID = ?';
	let args = [sid];

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

dao.SelectChargeRequestsByID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM CHARGES WHERE USERID = ? AND ALIVE = 1';
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

dao.SelectTransferRequestsByID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM TRANSFERS WHERE USERID = ? AND ALIVE = 1';
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

dao.CreateChargeRequest = function ( data: any, cb: any ) {
	let amount = data.amount;
	let user = data.user;

	let sql = 'INSERT INTO CHARGES ( userId, uid, nickname, holder, amount, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user.id, user.uid, user.nickname, user.holder, amount, 1, 1 ];

	_client.query(sql, args, function (err: any, res: any) {

		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true );
			} else {
				cb(null, false );
			}
		}
	});	
}

dao.CreateTransferRequest = function ( data: any, cb: any ) {
	let value = data.value;
	let user = data.user;

	let oldBalance = user.balance;

	let newBalance = oldBalance - value;

	let sql = 'INSERT INTO TRANSFERS ( userId, uid, nickname, amount, oldBalance, newBalance, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user.id, user.uid, user.nickname, value, oldBalance, newBalance, 1, 1 ];

	_client.query(sql, args, function (err: any, res: any) {

		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, {
					affected: res.affectedRows,
					balance: newBalance,
				} );
			} else {
				cb(null, {
					affected: 0,
					balance: newBalance,
				} );
			}
		}
	});	
}

dao.UpdateUserBalance = function ( data: any, cb: any ) {
	let id = data.id;
	let value = data.newBalance;

	let sql = "UPDATE USERS SET BALANCE = ? WHERE ID = ? ";
	let args = [ value , id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				sql = 'SELECT * FROM USERS WHERE ID = ?';
				args = [id];

				_client.query( sql, args, function ( err: any, user: any ) {
					if ( !!err ) {
						cb( err, user );
					} else {
						cb(null, user );
					}
				});
			} else {
				cb( null, null );
			}
		}
	});    
}

export default dao;