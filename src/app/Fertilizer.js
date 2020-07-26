var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");

global.invalidUrlList=[];

//肥料来源类
class Fertilizer
{
        static async getFertilizerList(){
            var html=await httpUtils.get('http://buy.fert.cn/jinnong/centerlist/1-f1c0b1e41ad14ba9b6c8a3dd1801217d-------.htm');
            var $ = cheerio.load(html);
            var fertilizerList=[];
            var huafeiList=$("li",".menu-bar.tab-bar-ul.comm-ul").children("[target=\"_self\"]");
            for(var index=1;index<huafeiList.length;index++){
                fertilizerList[index-1]={};
                fertilizerList[index-1].name=huafeiList[index].children[0].data;
                fertilizerList[index-1].urls="http://buy.fert.cn/"+huafeiList[index].attribs.href;
                var html2= await httpUtils.get(fertilizerList[index-1].urls);
                var $1 = cheerio.load(html2);
                fertilizerList[index-1].pageSize=$1("li",".pager")[1].children[1].data.substr(1)
            }

            for(let i=0;i<fertilizerList.length;i++){
                let url=fertilizerList[i].urls;
                fertilizerList[i].urls=[];
                for(let j=0;j<fertilizerList[i].pageSize;j++){
                    var children={}
                    children.url=url.replace(/centerlist\/./g,"centerlist/"+(j+1));
                    let html=await httpUtils.get(children.url);
                    $ = cheerio.load(html);
                    var entryUrlList=[];
                    $("li",".fert-products-list").children(".fert-products-titles").each(function (index,element){
                        entryUrlList[index]=element.attribs["href"];
                    });
                    children.entryUrlList=entryUrlList;
                    fertilizerList[i].urls.push(children);
                }
            }
            return fertilizerList;
        }

       static async  getEntry(url,cate){
            //M.log(url)
            var html=await httpUtils.get(url);
            var $ = cheerio.load(html);
            var fertilizer={};

            try {
                //名称
                fertilizer.name=$(".fert-products-title")[0].children[0].data;
                //公司
                fertilizer.company=$(".company-name")[0].children[0].data;
                //数据来源
                fertilizer.from_url=url;
                //品牌
                fertilizer.brand=$(".fert-products-items-margin .products-items-2")[0].children[0].data;
                //产地
                fertilizer.producing_area=$(".fert-products-items-margin .products-items-4")[0].children[0].data;
                //形态
                fertilizer.shape=$(".fert-products-items .products-items-2")[1].children[0].data;
                //规格
                fertilizer.specifications=$(".fert-products-items .products-items-4")[1].children[0].data;
                //标准
                fertilizer.standard=$(" .fert-products-items-margin .products-items-5")[0].children[0].data;
                //特性
                fertilizer.characteristic=$(" .fert-products-items-margin .products-items-5")[1].children[0].data;
                //参数
                fertilizer.parameter=$(" .fert-products-items-margin .products-items-5")[2].children[0].data;
                fertilizer.cate=cate;
                //图片
                fertilizer.imgs=$("p",".img-content-atic").children("img").attr('src')
            }catch (e) {

                if(Object.keys(fertilizer).length==0){
                    console.log(url+"解析失败");
                    global.invalidUrlList.push(url);
                }
            }
           // M.log(JSON.stringify(fertilizer))
            return fertilizer;
        }

        static async doStep(step){
            //url存储
            if(step==1){
                var fertilizerList=await Fertilizer.getFertilizerList();
                M.writeObjToFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\fertilizer\\fertilizerList.json",fertilizerList)
            }
            //获取实体列表
            if(step==2){
                fertilizerList=M.getObjByFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\fertilizer\\fertilizerList.json");
                var entryList=[];
                for(let i=0;i<fertilizerList.length;i++){
                    for(let j=0;j<fertilizerList[i].urls.length;j++){
                        let urls=fertilizerList[i].urls[j].entryUrlList;
                        for (let k=0;k<urls.length;k++){
                            var entry=await Fertilizer.getEntry(urls[k],fertilizerList[i].name);
                            if(Object.keys(entry).length){
                                entryList.push(entry)
                            }
                        }
                    }
                }
                //写入无效url列表到文件
                var file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\fertilizer\\fertilizerUrlList1.json`;
                M.writeObjToFile(file,global.invalidUrlList);
                M.writeObjToFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\fertilizer\\entryList.json",entryList)
            }
            //生成sql语句
            if(step==3){
                M.log_console_enable=false;
                Db.do_sql_enable=false;
                fertilizerList=M.getObjByFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\fertilizer\\entryList.json");
                for (let i=0;i<fertilizerList.length;i++){
                    Db.addObj("aos_know_fertilizer",fertilizerList[i])
                }
            }
            console.log("执行完成")
        }
}



async function main(){

    k=await Fertilizer.getEntry("http://buy.fert.cn/jinnong/fertdetailhtml/20160308152710893425.shtml","氮肥")
    console.log(k)
}

main();




