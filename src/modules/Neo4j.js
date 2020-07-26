var request = require("request");
var M=require("ming_node")

var applicationConfig=M.getObjByFile("../../applicationConfig.json");

var Neo4j={};

Neo4j.ip="127.0.0.1";
Neo4j.uri=`http://${Neo4j.ip}:7474/db/data/transaction/commit`;

function doCypher(query, params) {
    return new Promise(function(reslove,reject){
        request.post({
                uri:   Neo4j.uri,
                json: {statements: [{statement: query, parameters: params}]}
            },
            function (err, res, body) {

                if(err){
                    M.appendFile(applicationConfig.err_log_path,err+"\n");
                }
                if(body.errors.length>0){
                    M.appendFile(applicationConfig.err_log_path,JSON.stringify(body.errors)+"\n");
                    console.error(body.errors);
                }
                reslove(body.results);

            })
    });
}

Neo4j.doCypher=doCypher;

module.exports=Neo4j;

if(0)
+async function(){
    k= await Neo4j.doCypher(`CREATE (zw:KNOW { name: \'qqqqqqqqqqqqq\'})`)
    console.log(JSON.stringify(k))
}();
