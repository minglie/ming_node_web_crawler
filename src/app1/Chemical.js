var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");

global.invalidUrlList=[];

class Chemical
{
    static async  getEntry(url){
        var html=await httpUtils.get1(url);
        var $ =cheerio.load(html);
        var chemical={};
        //解析无效url,要解析第2遍
        try {
            var $1=$("tr>td","[width='100%'][border='0']").filter("[bgcolor='#FFFFFF']");
            chemical.company=$1[1].children[0].data;
            chemical.name=$1[3].children[0].data;
            chemical.effective_constituent=$1[5].children.filter(u=>u.type=="text" && u.data.trim()!="").reduce((u,v)=>u.data+","+v.data);
            chemical.from_url=url;
            chemical.content=$1[7].children[0].data;
            chemical.registration_status=$1[9].children[0].data;
            chemical.registration_number=$1[11].children[0].data;
            chemical.registration_validity_period=$1[13].children[0].data;
            chemical.toxicity_classification=$1[15].children[0].data;
            let str=$("td>b",":contains('农药用途')").parents("tbody").first().text();
            str=str.replace(/\n(\s)*( )*(\s)*/g,"@").substr(12).split("@");
            str.pop();
            chemical.purpose=str;
        }catch (e) {
            // console.log(e);
            if(Object.keys(chemical).length==0){
                console.log(url+"解析失败");
                global.invalidUrlList.push(url);
            }
        }
        return chemical;
    }

    //提取农药要杀的虫
    static async  getChemicalPests(){
        var purposeList = await Db.doSql("select id, purpose ,from_url from aos_know_chemical")
        for (let i=0;i<purposeList.length;i++){
            if(purposeList[i].purpose){
                var list1=purposeList[i].purpose.split(",")
                if(!(list1.length%4)){
                    purposeList[i].relationship_pest_name_list=[];
                    // console.log(purposeList[i].purpose.split(",").length)
                    // console.log(purposeList[i].from_url)
                    // console.log(purposeList[i].purpose.split(","))
                    if(list1[5])purposeList[i].relationship_pest_name_list.push(list1[5]);
                    if(list1[9])purposeList[i].relationship_pest_name_list.push(list1[9]);
                    purposeList[i].relationship_pest_name_list=JSON.stringify(purposeList[i].relationship_pest_name_list)
                }
            }
        }
        for(let i=0;i<purposeList.length;i++){
            if(purposeList[i].relationship_pest_name_list){
                var  sql= Db.getUpdateObjectSql("aos_know_chemical",{relationship_pest_name_list:purposeList[i].relationship_pest_name_list},{id:purposeList[i].id})
                M.log(sql+";")
            }
        }
    }

    //修改有效成分错误的行
    static async  updateChemical_effective_constituent(){
        Db.display_sql_enable=false
        var chemicalList = await Db.doSql("SELECT id,effective_constituent,from_url from aos_know_chemical WHERE effective_constituent=\"[object Object]\"")

        for (let i=0;i<chemicalList.length;i++){
            var chemical = await Chemical.getEntry(chemicalList[i].from_url);
            chemical.effective_constituent=chemical.effective_constituent.data.trim();
            var  sql= Db.getUpdateObjectSql("aos_know_chemical",{effective_constituent:chemical.effective_constituent},{id:chemicalList[i].id})
            M.log(sql+";")

        }

        /**
         SELECT id,effective_constituent,from_url,TRIM(REPLACE(effective_constituent,'undefined,', '' )) from aos_know_chemical WHERE effective_constituent like "undefined,%"
         update aos_know_chemical set effective_constituent=TRIM(REPLACE(effective_constituent,'undefined,', '' )) where effective_constituent like "undefined,%"
         */


        /**
         *
         SELECT relationship_pest_name_list,REPLACE(relationship_pest_name_list,'、',',') from aos_know_chemical
         UPDATE aos_know_chemical  set relationship_pest_name_list=REPLACE(relationship_pest_name_list,'、',',')

         */
    }



}




async function main(){

    Db.display_sql_enable=false
    var chemicalList = await Db.doSql(
        `
            SELECT id, relationship_pest_name_list from aos_know_chemical  WHERE  relationship_pest_name_list not like '%[%'
        `

        )

    for (let i=0;i<chemicalList.length;i++){
        var chemical = chemicalList[i];
        var s1=chemical.relationship_pest_name_list
        if(s1){
            s1=s1.split("、");
            var id=chemical.id;
            var relationship_pest_name_list=JSON.stringify(s1);
            var  sql= Db.getUpdateObjectSql("aos_know_chemical",{relationship_pest_name_list},{id})
            M.log(sql+";")
        }

        // chemical.effective_constituent=chemical.effective_constituent.data.trim();
        // var  sql= Db.getUpdateObjectSql("aos_know_chemical",{effective_constituent:chemical.effective_constituent},{id:chemicalList[i].id})


    }

}



main();