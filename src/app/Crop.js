var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");

global.invalidUrlList=[];

class Crop
{
    static async doStep(step){
        //获取基本作物列表
        if(step==1){
            var baseUrl="http://bcch.ahnw.gov.cn";
            var url=baseUrl+"/Right.aspx"
            var html=await httpUtils.get1(url);
            var $ = cheerio.load(html);
            var $1=$(":contains('更多')").parents("a");
            var urlList1=[];
            for(let i=0;i<$1.length;i++){
                if($1[i].attribs.href.endsWith("crop"))
                    urlList1.push(baseUrl+"/"+$1[i].attribs.href);
            }
            var cropList1=[];
            for(let i=0;i<urlList1.length;i++) {
                html=await httpUtils.get1(urlList1[i]);
                $ = cheerio.load(html);
                var cate=$("strong")[0].children[0].data.trim();
                var tagAList=$("td>a");

                for(let i=0;i<tagAList.length;i++){
                    var crop={};
                    crop.from_url=baseUrl+"/"+tagAList[i].attribs.href;
                    crop.name=tagAList[i].children[0].data.trim();
                    crop.cate=cate;
                    cropList1.push(crop)
                }
            }
            var file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList1.json`;
            M.writeObjToFile(file,cropList1);
            console.log("write File:"+file)
        }
        //获取详细作物列表
        if(step==2){
            var baseUrl="http://bcch.ahnw.gov.cn";
            var cropList1=M.getObjByFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList1.json")
            var cropList2=[];
            for(let i=0;i<cropList1.length;i++){
                var crop=cropList1[i];
                crop.relationship_disease_name_list=[];
                crop.relationship_pest_name_list=[];
                var html=await httpUtils.get1(crop.from_url);

                var $ = cheerio.load(html);
                var tagA_diseaseList=$("a",$("table").first());
                var tagA_pestList= $("a",$("table").last())

                for(let j=0;j<tagA_diseaseList.length;j++){
                    var disease={};
                    //数据来源
                    disease.from_url=baseUrl+"/"+tagA_diseaseList[j].attribs.href;
                    //病害名称
                    disease.name=tagA_diseaseList[j].children[tagA_diseaseList[j].children.length-1].data.trim()
                    html=await httpUtils.get1(disease.from_url);
                    // M.writeFile("c:A.html",html);
                    $ = cheerio.load(html);
                    //病害英文名称
                    disease.english_name=$("#lblNameEng").text()
                    //病害异名
                    disease.alias_name=$("#lblSynonyms").text()
                    //病害简介
                    disease.brief_introduction=$("#lblIntroduction").text()
                    var $1= $("img","a[href]");
                    disease.imgs=[];
                    for (let i=0;i<$1.length;i++){
                        disease.imgs.push(baseUrl+"/"+$1[i].attribs.src)
                    }
                    //病害图片
                    disease.imgs=JSON.stringify( disease.imgs)
                    //为害症状
                    disease.symptoms=$("#lblDamageSym").text();
                    //病原物
                    disease.pathogen=$("#lblPathogen").text();
                    //发生因素
                    disease.occurrence_factor=$("#lblOFactor").text();
                    //防止方法
                    disease.prevention_method=$("#lblCMethod").text();
                    crop.relationship_disease_name_list.push(disease)
                }

                for(let k=0;k<tagA_pestList.length;k++){
                    var pest={};
                    //数据来源
                    pest.from_url=baseUrl+"/"+tagA_pestList[k].attribs.href;
                    //害虫名称
                    pest.name=tagA_pestList[k].children[tagA_pestList[k].children.length-1].data.trim()
                    html=await httpUtils.get1(pest.from_url);
                    $ = cheerio.load(html);
                    //害虫英文名称
                    pest.english_name=$("#lblNameEng").text()
                    //害虫异名
                    pest.alias_name=$("#lblSynonyms").text()
                    //害虫简介
                    pest.brief_introduction=$("#lblIntroduction").text()
                    var $1= $("img","a[href]");
                    pest.imgs=[];
                    for (let i=0;i<$1.length;i++){
                        pest.imgs.push(baseUrl+"/"+$1[i].attribs.src)
                    }
                    //害虫图片
                    pest.imgs=JSON.stringify(pest.imgs)
                    //为害症状
                    pest.symptoms=$("#lblDamageSym").text();
                    //发生因素
                    pest.occurrence_factor=$("#lblOFactor").text();
                    //形态特征
                    pest.morphological_character=$("#lblMorphology").text();
                    //生活习性
                    pest.life_habit=$("#lblHabits").text();
                    //防止方法
                    pest.prevention_method=$("#lblCMethod").text();
                    crop.relationship_pest_name_list.push(pest);
                    console.log(crop.name)
                }
                cropList2.push(crop);
            }
            var file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList2.json`;
            M.writeObjToFile(file,cropList2);
            console.log("write File:"+file)
        }

        //获取作物,害虫,病害列表
        if(step==3) {
            var cropList2=M.getObjByFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList2.json");
            var pestList=[];
            var diseaseList=[];
            var cropList3=[];
            for(let i=0;i<cropList2.length;i++) {
                var crop = cropList2[i];
                for(let j=0;j<crop.relationship_disease_name_list.length;j++){
                    if(! diseaseList.find(u=>u.name==crop.relationship_disease_name_list[j].name)){
                        diseaseList.push(crop.relationship_disease_name_list[j]);
                    }
                }
                for(let k=0;k<crop.relationship_pest_name_list.length;k++){
                    if(! pestList.find(u=>u.name==crop.relationship_pest_name_list[k].name)){
                        pestList.push(crop.relationship_pest_name_list[k]);
                    }
                }
                crop.relationship_disease_name_list=crop.relationship_disease_name_list.map(u=>u.name);
                crop.relationship_pest_name_list=crop.relationship_pest_name_list.map(u=>u.name);
                cropList3.push(crop);
                console.log(crop.name)
            }

               // var  file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList3.json`;
               // M.writeObjToFile(file,cropList3);
               // console.log("write File:"+file)
               //
               // file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\disease\\diseaseList1.json`;
               // M.writeObjToFile(file,diseaseList);
               // console.log("write File:"+file)

            file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\pest\\pestList1.json`;
            M.writeObjToFile(file,pestList);
            console.log("write File:"+file)
        }
        //生成作物sql
        if(step==4){
            //生成作物sql
            M.log_console_enable=false;
            Db.do_sql_enable=false;
            var file="D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\crop\\cropList3.json";
            console.log("read File:"+file);
            var cropList3=M.getObjByFile(file);
            for (let i=0;i<cropList3.length;i++) {
                Db.addObj("aoss_know_crop", cropList3[i]);
                console.log(cropList3[i].name);
            }
        }
    }


}


async function main(){

}

main();