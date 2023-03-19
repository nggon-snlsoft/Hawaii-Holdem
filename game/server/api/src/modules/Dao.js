let _client = null;
const dao = module.exports;
const timeZone = "America/New_York";

dao.init = function (sqlClient) {
	_client = sqlClient;
	return dao;
};