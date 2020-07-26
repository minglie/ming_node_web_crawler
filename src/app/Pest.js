var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");



async function main(){
   //生成病害sql
    M.log_console_enable=false;
    var file="D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\pest\\pestList1.json";
    console.log("read File:"+file);
    var pestList1=M.getObjByFile(file);
    for (let i=0;i<pestList1.length;i++) {
        M.log(Db.getAddObjectSql1("aos_know_pest", pestList1[i])+";");
        console.log(pestList1[i].name);
    }
}



main();