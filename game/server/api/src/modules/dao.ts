import { userInfo } from "os";
import { ENUM_RESULT_CODE } from "../main";
import { error } from "console";

// const moment = require('moment-timezone');
const moment = require('moment')

const timeZone = 'Asia/Tokyo';

let _client: any = null;
const dao = module.exports;

dao.init = function ( sql: any ) {
    _client = sql;
    return dao;
};

dao.SELECT_USER_BY_USER_ID = function ( id: any, cb: any ) {

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

dao.SELECT_USERS_BY_LOGIN_ID = function ( login_id: any, cb: any ) {

	let sql = 'SELECT * FROM USERS WHERE LOGIN_ID = ?';
	let args = [login_id];

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

dao.UPDATE_USERS_TOKEN_LOGIN_ID = function ( token: any, login_id: any, cb: any ) {
	let sql = "UPDATE USERS SET TOKEN = ? WHERE LOGIN_ID = ? ";
	let args = [ token, login_id ];

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
};

dao.UPDATE_USERS_LOGIN = function ( data: any, cb: any ) {

	let login_ip = data.login_ip;
	let id = data.user_id;
	let rake_back_rate = data.rake_back_rate;
	let platform = data.platform;
	let os = data.os;

	let sql = "UPDATE USERS SET LOGIN_IP = ?, PLATFORM = ?, OS = ?, RAKE_BACK_RATE = ?, LOGINCOUNT = LOGINCOUNT + 1, LOGINDATE = current_timestamp() WHERE ID = ? ";
	let args = [ login_ip, platform, os, rake_back_rate, id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, true);

			} else {
				cb(null, 0);
			}
		}
	});    
};

dao.SELECT_JOINS_BY_LOGIN_ID = function ( login_id: any, cb: any ) {

	let sql = 'SELECT * FROM JOINS WHERE LOGIN_ID = ?';
	let args = [login_id];

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

dao.SELECT_JOINS_BY_NICKNAME = function ( nickname: any, cb: any ) {

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

dao.SELECT_USERS_BY_NICKNAME = function ( nickname: any, cb: any ) {

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

dao.SELECT_SETTING_BY_USER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM SETTING WHERE USER_ID = ?';
	let args = [user_id];

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

dao.UPDATE_SETTING = function ( user_id: any, setting: any, cb: any ) {

	let sound = setting.sound;
	let mode = 0;
	let card = setting.card;
	let board = setting.table;
	let background = setting.background;


	let sql = "UPDATE SETTING SET SOUND = ?, MODE = ?,  CARD_TYPE = ?, BOARD_TYPE = ?, BG_TYPE = ? WHERE USER_ID = ? ";
	let args = [ sound, mode, card, board, background, user_id ];

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

dao.SELECT_STATICS_BY_USER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM STATICS WHERE USER_ID = ?';
	let args = [user_id];

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

		cb?.(null, {
            code: ENUM_RESULT_CODE.SUCCESS,
         });
	});
}

dao.insertJOIN_MEMBER = function ( user: any, cb: any ) {

	let sql = 'INSERT INTO JOINS (login_id, store_id, distributor_id, partner_id, nickname, password, transferpassword, phone, bank, holder, account, recommender, rake_back_rate, join_ip, platform, os, alive ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	let args = [ user.login_id, user.store_id, user.distributor_id, user.partner_id, user.nickname, user.password, user.transfer_password, user.phone, 
		user.bank, user.holder, user.account, user.recommender, user.rake_back_rate, user.join_ip, user.platform, user.os, 1 ];

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

dao.INSERT_SETTING = function ( user_id: any, cb: any ) {

	let sql = "INSERT INTO setting ( user_id ) values ( ? )";
	let args = [ user_id ];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if (!!res && res.affectedRows > 0) {
			cb(null, res.affectedRows);
		} else {
			cb(null, 0);
		}
	});
}

dao.INSERT_STATICS = ( user_id: any, cb: any )=> {

	let sql = "INSERT INTO STATICS(user_id) VALUES (?)";
	let args = [user_id];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			console.log('err');			
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if (!!res && res.affectedRows > 0) {
			cb(null, res.affectedRows);
		} else {
			cb(null, 0);
		}
	});
}

dao.UPDATE_AVATAR = function ( id: any, avatar: any, cb: any ) {

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

dao.UPDATE_POINT_TRANSFER = function ( data: any, cb: any ) {
	let id = data.user_id;
	let balance = data.balance;
	let point = data.point;

	let sql = "UPDATE USERS SET BALANCE = ?, POINT = ? WHERE ID = ? ";
	let args = [ balance, point, id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, 0);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows);
			} else {
				cb(null, 0);
			}
		}
	});    
}

dao.UPDATE_TICKETS_ALIVE = function ( ticket_id: any, cb: any ) {

	let sql = "UPDATE TICKETS SET ALIVE = 0 WHERE ID = ? ";
	let args = [ ticket_id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, 0);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows);
			} else {
				cb(null, 0);
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

dao.SELECT_STORE_BySTORE_ID = function ( store_id: any, cb: any ) {

	let sql = 'SELECT * FROM STORES WHERE ID = ?';
	let args = [store_id];

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

dao.SELECT_STORES = function ( cb: any ) {

	let sql = 'SELECT * FROM STORES';
	_client.query(sql, null, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.SELECT_PARTNERS_ByCODE = function ( code: any, cb: any ) {

	let sql = 'SELECT * FROM PARTNERS WHERE CODE = ?';
	let args = [code];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if ( res == null ) {
			cb( null, null );
		} else {
			if ( res.length > 0 ) {
				cb(null, res[0]);
			} else {
				cb( null, null );
			}
		}
	});
};

dao.SELECT_PARTNERS_ByPARTNER_ID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM PARTNERS WHERE ID = ?';
	let args = [id];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if ( res == null ) {
			cb( null, null );
		} else {
			if ( res.length > 0 ) {
				cb(null, res[0]);
			} else {
				cb( null, null );
			}
		}
	});
};

dao.SELECT_STORE_CODE_ByCODE = function ( code: any, cb: any ) {

	let sql = 'SELECT * FROM PARTNERS WHERE CODE = ?';
	let args = [code];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		if ( res == null ) {
			cb( null, -1 );
		} else {
			if ( res.length > 0 ) {
				cb(null, res[0]);
			} else {
				cb( null, -1 );
			}
		}
	});
};

dao.SELECT_CHARGE_REQUESTS_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM CHARGES WHERE USER_ID = ? AND ALIVE = 1 AND PENDING = 1';
	let args = [user_id];

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

dao.SELECT_TRANSFER_REQUEST_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM TRANSFERS WHERE USER_ID = ? AND ALIVE = 1 AND PENDING = 1';
	let args = [user_id];

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

dao.SELECT_POPUPS_BySTORE_ID = function ( cb: any ) {

	let sql = 'SELECT * FROM POPUPS WHERE DISABLE = 0';

	_client.query(sql, null, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		cb?.(null, res);
	});
};

dao.SELECT_TICKETS_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM TICKETS WHERE USER_ID = ? AND ALIVE = 1';
	let args = [ user_id ];

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

dao.SELECT_UNREAD_ANSWER_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT COUNT(*) AS UNREAD_COUNT FROM QUESTIONS WHERE (USER_ID = ? AND ALIVE = 1 AND PENDING = 0 AND UNREAD = 1 )';
	let args = [ user_id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			if (!!cb) {
				cb(err, null);
			}
			return;
		}

		let count = res[0].UNREAD_COUNT;
		cb?.(null, count );
	});
};

dao.INSERT_CHARGE_REQUEST = function ( data: any, cb: any ) {
	let amount = data.amount;
	let user = data.user;
	let holder = data.holder;

	let sql = 'INSERT INTO CHARGES ( user_id, login_id, nickname, holder, amount, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user.id, user.login_id, user.nickname, holder, amount, 1, 1 ];

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

dao.INSERT_QNA = function ( user: any, data: any, cb: any ) {
	let user_id = user.id;
	let store_id = user.store_id;
	let nickname = user.nickname;
	let title = data.title;
	let question = data.question;

	let sql = 'INSERT INTO QUESTIONS ( user_id, store_id, nickname, type, title, question, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user_id, store_id, nickname, 0, title, question, 1, 1 ];

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

dao.UPDATE_QNA_READ = function ( id: any, cb: any ) {

	let sql = "UPDATE QUESTIONS SET UNREAD = 0 WHERE ID = ? ";
	let args = [ id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb( null, res.affectedRows );				
			} else {
				cb( null, 0 );
			}
		}
	});    
}

dao.UPDATE_QNA_DELETE = function ( id: any, cb: any ) {

	let sql = "UPDATE QUESTIONS SET ALIVE = 0 WHERE ID = ? ";
	let args = [ id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb( null, res.affectedRows );				
			} else {
				cb( null, 0 );
			}
		}
	});    
}

dao.INSERT_TRANSFER_REQUEST = function ( data: any, cb: any ) {
	let value = data.value;
	let user = data.user;

	let oldBalance = user.balance;

	let newBalance = oldBalance - value;

	let sql = 'INSERT INTO TRANSFERS ( user_id, login_id, nickname, amount, oldBalance, newBalance, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [ user.id, user.login_id, user.nickname, value, oldBalance, newBalance, 1, 1 ];

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

dao.UPDATE_USER_BALANCE = function ( data: any, cb: any ) {
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

dao.INSERT_POINT_TRANSFER_LOG = ( data: any, cb: any )=> {
	let user_id = data.user_id;
	let oldPoint = data.oldPoint;
	let newPoint = data.newPoint;
	let point = data.point;
	let oldBalance = data.oldBalance;
	let newBalance = data.newBalance;

	let sql = 'INSERT INTO POINT_TRANSFERS ( user_id, oldPoint, newPoint, point, oldBalance, newBalance ) VALUES ( ?, ?, ?, ?, ?, ? )';
	let args = [ user_id, oldPoint, newPoint, point, oldBalance, newBalance];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			cb(err, null);
			return;
		} else {
			if (!!res && res.affectedRows > 0) {

				sql = 'SELECT * FROM POINT_TRANSFERS WHERE USER_ID = ? ORDER BY createDate DESC';
				args = [ user_id ];

				_client.query( sql, args, function ( err: any, logs: any ) {
					if ( !!err ) {
						cb( err, null );
					} else {
						cb(null, logs );
					}
				});
			} else {
				cb( null, null );
			}
		}
	});
}

dao.SELECT_POINT_TRANSFER_LOG = ( id: any, cb: any )=> {
	let sql = 'SELECT * FROM POINT_TRANSFERS WHERE USER_ID = ? ORDER BY createDate DESC';
	let args = [ id ];	

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			cb(err, null);
			return;
		} else {
			if ( res != null ) {
				cb(null, res );
			} else {
				cb(null, null );
			}
		}
	});
}

dao.SELECT_POINT_RECEIVE_LOG = ( user_id: any, cb: any )=> {
	let sql = 'SELECT * FROM POINT_RECEIVES WHERE USER_ID = ? ORDER BY createDate DESC';
	let args = [ user_id ];	

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			cb(err, null);
			return;
		} else {
			if ( res != null ) {
				cb(null, res );
			} else {
				cb(null, null );
			}
		}
	});
}

dao.SELECT_QUESTIONS_ByUSER_ID = ( user_id: any, cb: any )=> {
	let sql = 'SELECT * FROM QUESTIONS WHERE USER_ID = ? AND ALIVE = 1 ORDER BY questionDate DESC';
	let args = [ user_id ];	

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			cb(err, null);
			return;
		} else {
			if ( res != null ) {
				cb(null, res );
			} else {
				cb(null, null );
			}
		}
	});
}

export default dao;