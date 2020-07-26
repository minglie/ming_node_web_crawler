var request = require('request');
var iconv = require('iconv-lite')
var http=require('http');


httpUtils={};


httpUtils.get=function (url) {
    var promise = new Promise(function(reslove,reject){

        request(url, function (error, response, body) {
            if(error)console.error(error);
            if (!error && response.statusCode == 200) {
                reslove(body);
            }
        });
    });
    return promise;
}



httpUtils.get1=function (url) {
    var promise = new Promise(function(reslove,reject){
        http.get(url, function(res) {
            res.pipe(iconv.decodeStream('GBK')).collect(function(err, decodedBody) {
                reslove(decodedBody);
            });
        });
    });
    return promise;
}



module.exports=httpUtils;