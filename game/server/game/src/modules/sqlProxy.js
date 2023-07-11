const mysql = require( 'mysql' );

const sql_config = {
	"localhost" : {
		"host"     : "127.0.0.1",
		"port"     : "3306",
		"database" : "holdem",
		"user"     : "root",
		"password" : "root"
	},

	"development" : {
		"host"     : "52.70.28.169",
		"port"     : "3306",
		"database" : "holdem",
		"user"     : "holdem",
		"password" : "bnfgames09!2"
	},

	"production" : {
		"host"     : "database-1.cleanm1dnitm.ap-northeast-1.rds.amazonaws.com",
		"port"     : "3306",
		"database" : "holdem",
		"user"     : "admin",
		"password" : "admin0912"
	}
};

const parseArgs = function( args ) {
	let argsMap = {};
	let mainPos = 1;

	while( args[ mainPos ].indexOf( '--' ) > 0 ) {
		mainPos++;
	}
	argsMap.main = args[ mainPos ];

	for( let i = ( mainPos + 1 ); i < args.length; i++ ) {
		let arg   = args[ i ];
		let sep   = arg.indexOf( '=' );
		let key   = arg.slice( 0, sep );
		let value = arg.slice( sep + 1 );
		if( !isNaN( Number( value ) ) && ( value.indexOf( '.' ) < 0 ) ) {
			value = Number( value );
		}
		argsMap[ key ] = value;
	}

	return argsMap;
};

let _database_pool           = null;
const createDatabasePool = function() {
	const args = parseArgs( process.argv );
	return mysql.createPool( {
		connectionLimit    : 100, //important
		host               : sql_config[ 'localhost' ].host,
		user               : sql_config[ 'localhost' ].user,
		password           : sql_config[ 'localhost' ].password,
		database           : sql_config[ 'localhost' ].database,
		waitForConnections : true,
		dateStrings : true
	} );
};

let _internal_proxy = {};

_internal_proxy.init = function() {
	_database_pool = createDatabasePool();
	this.addPoolEventListener();
}

_internal_proxy.addPoolEventListener = function() {
	// _database_pool.on( 'acquire', function( connection ) {
	// 	console.log( 'Connection %d acquired', connection.threadId );
	// } );
	//
	// _database_pool.on( 'connection', function( connection ) {
	// 	console.log( 'Connection %d connection', connection.threadId );
	// 	// connection.query('SET SESSION auto_increment_increment=1')
	// } );

	_database_pool.on( 'enqueue', function() {
		console.warn( '[ DATABASE ] Waiting for available connection slot' );
	} );

	// _database_pool.on( 'release', function( connection ) {
	// 	console.log( 'Connection %d released', connection.threadId );
	// } );
}

_internal_proxy.query = function( sql, args, cb ) {
	// console.log( '[ SQL_PROXY ] query : ', sql );
	// console.log( '[ SQL_PROXY ] args : ', args );
	_database_pool.getConnection( function( err, connection ) {
		if( err ) {
			console.error( '[ DATABASE ] get connection error : ', err );
			cb( err, null );
			// throw err;
		}

		connection.query( sql, args, function( error, results ) {
			connection.release();
			// console.log( 'query result : ', results );
			cb( error, results );
			// if( error ) {
			// 	throw error;
			// }

			// console.log(results.insertId);
			// console.log('affected rows : ' + results.affectedRows);
			// console.log('changed ' + results.changedRows + ' rows');
			// console.log('connected as id ' + connection.threadId);
		} );

	} );
};

_internal_proxy.queries = function( sqls, cb ) {
	let i     = 0;
	let count = 0;
	do {
		let sliceUnit = sqls.length / 100;
		let partSqls  = sqls.slice( i * sliceUnit, ( i + 1 ) * sliceUnit );
		if( partSqls.length === 0 ) {
			break;
		}

		( function( sqlsInClosure ) {
			_database_pool.getConnection( function( err, connection ) {
				if( err ) {
					cb( err );
					throw err;
				}

				connection.beginTransaction( function( err ) {
					if( err ) {
						cb( err );
						connection.release();
						throw err;
					}

					sqlsInClosure.forEach( function( sql ) {
						connection.query( sql, function( err ) {
							if( err ) {
								cb( err );
								connection.release();
								return connection.rollback( function() {
									throw err;
								} );
							}
						} );
					} );

					connection.commit( function( err ) {
						if( err ) {
							return connection.rollback( function() {
								cb( err );
								connection.release();
								throw err;
							} );
						}
						connection.release();

						count += sqlsInClosure.length;
						if( count >= sqls.length ) {
							cb( null );
						}
					} );
				} );
			} );
		} )( partSqls );

		++i;
	}
	while( true );
};

_internal_proxy.shutdown = function() {
	_database_pool.end( function( err ) {
		if( err ) {
			console.error( 'sql client pool end error : ', err );
			throw err;
		}
	} );
};

const sqlclient = module.exports;
sqlclient.init  = function() {
	console.log( "sqlclient.init" );
	_internal_proxy.init();
	sqlclient.insert  = _internal_proxy.query;
	sqlclient.update  = _internal_proxy.query;
	sqlclient.delete  = _internal_proxy.query;
	sqlclient.query   = _internal_proxy.query;
	sqlclient.queries = _internal_proxy.queries;
	return sqlclient;
}

sqlclient.shutdown = function() {
	_internal_proxy.shutdown();
};