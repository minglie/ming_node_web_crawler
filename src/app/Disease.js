var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");



async function main(){
   //生成病害sql
    M.log_console_enable=false;
    var file="D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\disease\\diseaseList1.json";
    console.log("read File:"+file);
    var diseaseList1=M.getObjByFile(file);
    for (let i=0;i<diseaseList1.length;i++) {
        M.log(Db.getAddObjectSql1("aoss_know_disease", diseaseList1[i])+";");
        console.log(diseaseList1[i].name);
    }

}



main();