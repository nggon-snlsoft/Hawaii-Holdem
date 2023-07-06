import { userInfo } from "os";
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

dao.SELECT_TICKETS_BY_ID = function ( s: any, e: number, cb: any ) {

	let sql = 'SELECT * FROM tickets WHERE id >= ? AND id <= ?';
	let args = [s, e];

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

dao.SELECT_USER_BY_USER_ID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM users WHERE ID = ?';
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

dao.INSERT_SALES_USER_BY_TICKET = function ( ticket: any, cb: any ) {
	let user_id = ticket.user_id;
	let distributor_id = ticket.distributor_id;
	let partner_id = ticket.partner_id;
	let day = ticket.day;
	let timestamp = ticket.timestamp;	
	let charge = ticket.charge;
	let transfer = ticket.transfer;
	let returnValue = ticket.return;
	let updateDate = ticket.updateDate;
	let createDate = ticket.createDate;

	let sql = "INSERT INTO sales_user ( user_id, store_id, distributor_id, partner_id, year, month, day, timestamp, charge, transfer, `return`, useTicket, updateDate, createDate ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	let args = [ user_id, -1, distributor_id, partner_id, 2023, 6, day, timestamp, charge, transfer, returnValue, 1, updateDate, createDate ];

	_client.query(sql, args, function (err: any, res: any) {
		console.log(err);
		console.log(res);
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res);
			} else {
				cb(null, null);
			}
		}
	});
};

dao.SELECT_ADMINS = function ( cb: any ) {

	let sql = 'SELECT * FROM admins WHERE id > 0';
	let args = null;

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

dao.SELECT_CALCULATES_ByADMIN_ID = function ( admin_id: number, cb: any ) {

	let sql = 'SELECT * FROM calculates WHERE admin_id = ?';
	let args = [admin_id];

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

dao.INSERT_CALCULATES_ByDATA = function ( calculator: any, cb: any ) {
	let admin_id = calculator.admin_id;
	let login_id = calculator.login_id;
	let type = calculator.type;
	let name = calculator.name;
	let disable = calculator.disable;

	let sql = 'INSERT INTO calculates ( admin_id, login_id, type, name, deal_money, pre_settled, settle_amount, disable ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )';
	let args = [admin_id, login_id, type, name, 0, 0, 0, disable ];

	_client.query(sql, args, function (err: any, res: any) {
		if (err !== null) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows);
			} else {
				cb(null, 0 );
			}
		}
	});
};

dao.SELECT_CRONS_INFO = function ( cb: any ) {

	console.log('SELECT_CRONS_INFO');

	let sql = 'SELECT * FROM calculate_cron WHERE id > 0';
	let args = null;

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

dao.SELECT_SALES_INFOS = function ( lastest: any, cb: any ) {
	let sql = 'SELECT * FROM sales_user WHERE id > ?';
	let args = [lastest];

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

dao.SELECT_DISTRIBUTORS_ByDISTRIBUTOR_ID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM distributors WHERE id = ?';
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

dao.SELECT_PARTNERS_ByPARTNERS_ID = function ( id: any, cb: any ) {

	let sql = 'SELECT * FROM partners WHERE ID = ?';
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

dao.UPDATE_STORE_CALCULATE = function ( data: any, cb: any ) {
	let rate = data.rate;
	let rakes = data.rakes;

	let sql = "UPDATE calculates SET commision = ?, deal_money = deal_money + ?, updateDate = current_timestamp() WHERE type = 0 ";
	let args = [ rate, rakes ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb( null, res.affectedRows );
			} else {
				cb(null, 0 );
			}
		}
	});    
};

dao.UPDATE_DISTRIBUTOR_CALCULATE_ByADMIN_ID = function ( data: any, cb: any ) {
	let admin_id = data.admin_id;
	let rate = data.rate;
	let rakes = data.rakes;

	let sql = "UPDATE calculates SET commision = ?, deal_money = deal_money + ?, updateDate = current_timestamp() WHERE admin_id = ? AND type = ? ";
	let args = [ rate, rakes, admin_id, 1 ];

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
};

dao.UPDATE_PARTNER_CALCULATE_ByADMIN_ID = function ( data: any, cb: any ) {
	let admin_id = data.admin_id;
	let rate = data.rate;
	let rakes = data.rakes;

	let sql = "UPDATE calculates SET commision = ?, deal_money = deal_money + ?, updateDate = current_timestamp() WHERE admin_id = ? and type = ?";
	let args = [ rate, rakes, admin_id, 2 ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows );
			} else {
				cb(null, 0 );
			}
		}
	});    
};

dao.UPDATE_CALCULATE_CRON = function ( cron_info: any, cb: any ) {
	let start_index = cron_info.start_index;
	let end_index = cron_info.end_index;
	let startDate = cron_info.startDate;
	let deal_money = cron_info.deal_money;
	let deal_stores = cron_info.deal_stores;
	let deal_distributors = cron_info.deal_distributors;
	let deal_partners = cron_info.deal_partners;

	let sql = "UPDATE calculate_cron SET start_index = ?, end_index = ?, deal_money = deal_money + ?, deal_stores = deal_stores + ?, deal_distributors = deal_distributors + ?, deal_partners = deal_partners + ?, startDate = ?, endDate = current_timestamp(), updateDate = current_timestamp() WHERE id = 1";
	let args = [ start_index, end_index, deal_money, deal_stores, deal_distributors, deal_partners, startDate ];

	_client.query(sql, args, function (err: any, res: any) {
		console.log(err);
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb(null, res.affectedRows );
			} else {
				cb(null, 0 );
			}
		}
	});    
};

dao.SELECT_USERS_BY_LOGIN_ID = function ( login_id: any, cb: any ) {

	let sql = 'SELECT * FROM users WHERE LOGIN_ID = ?';
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
	let sql = "UPDATE users SET TOKEN = ? WHERE LOGIN_ID = ? ";
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

	let sql = "UPDATE users SET LOGIN_IP = ?, PLATFORM = ?, OS = ?, RAKE_BACK_RATE = ?, LOGINCOUNT = LOGINCOUNT + 1, LOGINDATE = current_timestamp() WHERE ID = ? ";
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

	let sql = 'SELECT * FROM joins WHERE LOGIN_ID = ?';
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

	let sql = 'SELECT * FROM joins WHERE NICKNAME = ?';
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

	let sql = 'SELECT * FROM users WHERE NICKNAME = ?';
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

	let sql = 'SELECT * FROM users WHERE ID = ? AND TOKEN = ? ';
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

	let sql = 'SELECT * FROM setting WHERE USER_ID = ?';
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


	let sql = "UPDATE setting SET SOUND = ?, MODE = ?,  CARD_TYPE = ?, BOARD_TYPE = ?, BG_TYPE = ? WHERE USER_ID = ? ";
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

	let sql = 'SELECT * FROM statics WHERE USER_ID = ?';
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

	let sql = "INSERT INTO statics(user_id) VALUES (?)";
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

	let sql = "UPDATE users SET AVATAR = ? WHERE ID = ? ";
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

	let sql = "UPDATE users SET BALANCE = ?, POINT = ? WHERE ID = ? ";
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

	let sql = "UPDATE tickets SET ALIVE = 0 WHERE ID = ? ";
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
	let sql = 'SELECT * FROM tables WHERE ALIVE = ?';
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

	let sql = 'SELECT * FROM stores WHERE ID = ?';
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

	let sql = 'SELECT * FROM stores';
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

	let sql = 'SELECT * FROM partners WHERE CODE = ?';
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



dao.SELECT_STORE_CODE_ByCODE = function ( code: any, cb: any ) {

	let sql = 'SELECT * FROM partners WHERE CODE = ?';
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

	let sql = 'SELECT * FROM charges WHERE USER_ID = ? AND ALIVE = 1 AND PENDING = 1';
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

	let sql = 'SELECT * FROM transfers WHERE USER_ID = ? AND ALIVE = 1 AND PENDING = 1';
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

	let sql = 'SELECT * FROM popups WHERE DISABLE = 0';

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

dao.SELECT_NOTICES = function ( cb: any ) {

	let sql = 'SELECT * FROM notices WHERE DISABLE = 0';

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

	let sql = 'SELECT * FROM tickets WHERE USER_ID = ? AND ALIVE = 1';
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

dao.SELECT_POINT_RECEIVES_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM point_receives WHERE USER_ID = ? AND ALIVE = 1';
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

dao.SELECT_PENDING_POINT_RECEIVES_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT * FROM point_receives WHERE USER_ID = ? AND ALIVE = 1 AND PENDING = 1';
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

	let sql = 'SELECT COUNT(*) AS UNREAD_COUNT FROM questions WHERE (USER_ID = ? AND ALIVE = 1 AND PENDING = 0 AND UNREAD = 1 )';
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

dao.SELECT_UNREAD_MESSAGE_ByUSER_ID = function ( user_id: any, cb: any ) {

	let sql = 'SELECT COUNT(*) AS UNREAD_COUNT FROM messages WHERE (USER_ID = ? AND ALIVE = 1 AND UNREAD = 1 )';
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

	let sql = 'INSERT INTO charges ( user_id, login_id, nickname, holder, amount, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ? )';
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

	let sql = 'INSERT INTO questions ( user_id, store_id, nickname, type, title, question, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
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

dao.UPDATE_POINT_ByPOINT_RECEIVES = function ( data: any, cb: any ) {
	let id = data.id;
	let user_id = data.user_id;
	let point = data.point;

	let sql = "UPDATE users SET POINT = POINT + ? WHERE ID = ? ";
	let args = [ point, user_id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, 0);
		} else {
			if (!!res && res.affectedRows > 0) {
				sql = "UPDATE point_receives SET PENDING = 0 WHERE ID = ? ";
				args = [id];

				_client.query( sql, args, function ( err1: any, res1: any) {
					if ( !!err1 ) {
						cb( err, 0 );
					} else {
						if ( !!res1 && res1.affectedRows > 0 ) {
							cb( null, res.affectedRows );
						} else {
							cb( null, 0 );
						}
					}
				});

			} else {
				cb( null, 0 );
			}
		}
	});
}

dao.UPDATE_USERS_DISABLE = function ( id: any, cb: any ) {

	let sql = "UPDATE users SET DISABLE = 1 WHERE ID = ? ";
	let args = [ id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, 0);
		} else {
			if (!!res && res.affectedRows > 0) {
				cb( null, res.affectedRows );
			} else {
				cb( null, 0 );
			}
		}
	});
}

dao.UPDATE_QNA_READ = function ( id: any, cb: any ) {

	let sql = "UPDATE questions SET UNREAD = 0 WHERE ID = ? ";
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

dao.UPDATE_MESSAGE_READ = function ( id: any, cb: any ) {

	let sql = "UPDATE messages SET UNREAD = 0 WHERE ID = ? ";
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

	let sql = "UPDATE questions SET ALIVE = 0 WHERE ID = ? ";
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

	let sql = 'INSERT INTO transfers ( user_id, login_id, nickname, amount, oldBalance, newBalance, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
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

	let sql = "UPDATE users SET BALANCE = ? WHERE ID = ? ";
	let args = [ value , id ];

	_client.query(sql, args, function (err: any, res: any) {
		if (!!err) {
			cb(err, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				sql = 'SELECT * FROM users WHERE ID = ?';
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

	let sql = 'INSERT INTO point_transfers ( user_id, oldPoint, newPoint, point, oldBalance, newBalance ) VALUES ( ?, ?, ?, ?, ?, ? )';
	let args = [ user_id, oldPoint, newPoint, point, oldBalance, newBalance];

	_client.query(sql, args, function (err: any, res: any) {        
		if (!!err) {
			cb(err, null);
			return;
		} else {
			if (!!res && res.affectedRows > 0) {

				sql = 'SELECT * FROM point_transfers WHERE USER_ID = ? ORDER BY createDate DESC';
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
	let sql = 'SELECT * FROM point_transfers WHERE USER_ID = ? ORDER BY createDate DESC';
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
	let sql = 'SELECT * FROM point receives WHERE USER_ID = ? AND PENDING = 0 AND ALIVE = 1 ORDER BY createDate DESC';
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
	let sql = 'SELECT * FROM questions WHERE USER_ID = ? AND ALIVE = 1 ORDER BY questionDate DESC';
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

dao.SELECT_MESSAGES_ByUSER_ID = ( user_id: any, cb: any )=> {
	let sql = 'SELECT * FROM messages WHERE USER_ID = ? AND ALIVE = 1 ORDER BY createDate DESC';
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

dao.SELECT_MESSAGES_ByUSER_ID = ( user_id: any, cb: any )=> {
	let sql = 'SELECT * FROM messages WHERE USER_ID = ? AND ALIVE = 1 ORDER BY createDate DESC';
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