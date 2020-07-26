var httpUtils=require("../modules/httpUtils");
var Db=require("../modules/Db.js");
var cheerio = require('cheerio');
var M=require("ming_node");

global.invalidUrlList=[];

class Chemical
{

    static async getChemicalUrlList(){
        var urlList=[];
        for(let i=1;i<=100;i++){
            urlList.push(`http://cheman.chemnet.com/pesticides2/search.cgi?p=${i}&&f=search&c=composition&terms=%C2%C8%C7%E8%BE%D5%F5%A5`);
        }
        var urlList1=[];
        for (let i=0;i<urlList.length;i++) {
            let url=urlList[i];
            M.log(url)
            let html=await httpUtils.get(url);
            let $ = cheerio.load(html);
            let aList=$("tbody>tr>td>a");
            for (let i=0;i<aList.length;i++){
                let url="http://cheman.chemnet.com/pesticides2/"+aList[i].attribs["href"];
                urlList1.push(url);
            }
        }
       return urlList1;
    }

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

    static async doStep(step){
        if(step==1){
            let a=await Chemical.getChemicalUrlList()
            M.writeObjToFile("D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\chemical\\chemicalUrlList0.json",a)
        }
        //循环生成sql语句
        if(step==2){
            var file_num=0
            M.log_console_enable=false;
            var file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\chemical\\chemicalUrlList${file_num}.json`
            var chemicalUrlList=M.getObjByFile(file);
            console.log("read File:"+file);
            for (let i=0;i<chemicalUrlList.length;i++) {
                var entry = await Chemical.getEntry(chemicalUrlList[i])
                if(Object.keys(entry).length){
                    Db.addObj("aos_know_chemical", entry)
                }
            }
            file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\chemical\\chemicalUrlList${file_num+1}.json`;
            M.writeObjToFile(file,global.invalidUrlList);
            console.log("write File:"+file)
        }
        if(step==3){
            async function generator_sql(file_num){
                M.log_console_enable=false;
                var file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\chemical\\chemicalUrlList${file_num}.json`
                var chemicalUrlList=M.getObjByFile(file);
                console.log("read File:"+file);
                for (let i=0;i<chemicalUrlList.length;i++) {
                    var entry = await Chemical.getEntry(chemicalUrlList[i])
                    if(Object.keys(entry).length){
                        Db.addObj("aos_know_chemical", entry)
                    }
                }
                file=`D:\\G\\OpenSource\\ming_node_web_crawler\\mock\\chemical\\chemicalUrlList${file_num+1}.json`;
                M.writeObjToFile(file,global.invalidUrlList);
                console.log("write File:"+file)
            }
            generator_sql(1)
        }
    }
}




async function main(){
        var entry = await Chemical.getEntry("http://cheman.chemnet.com/pesticides2/search.cgi?id=32852")
        console.log(entry)
}


//generator_sql(4);

main();