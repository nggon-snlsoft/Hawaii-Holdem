"use strict";
module.exports.parse = function (token) {
    let dec = Buffer.from(token, 'hex').toString('utf8');
    //console.error( '[token] decrypt token. %j, %j', token, dec );
    let ts = dec.split("|");
    if (ts.length !== 4) {
        // illegal token
        return null;
    }
    return { title: ts[0], version: ts[1], adminID: Number(ts[2]), serial: Number(ts[3]) };
};
