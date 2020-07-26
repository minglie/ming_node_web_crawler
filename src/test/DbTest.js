
var Db=require("../modules/Db.js");
var M=require("ming_node");



async function main1(){
    //Db.getByObj("aos_know_fertilizer",fertilizerList[i])
    a=await Db.doSql(`SELECT t1.id,t1.name, t2.name cate FROM aos_crop t1
                        LEFT JOIN  aos_crop_cate t2
                           on t1.crop_cate_id=t2.id`);
    a=JSON.stringify(a);
    console.log(a)
    M.writeFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\entryList.json",a)
}

async function main(){
    list=M.getObjByFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\entryList.json");
    for (let i=0;i<list.length;i++){
       Db.addObj("aoss_know_crop",list[i])
    }

}





main();



