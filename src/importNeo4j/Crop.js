var Db=require("../modules/Db.js");
var M=require("ming_node");
var Neo4j=require("../modules/Neo4j");

var demp=`  
        Merge (c0:Crop{name:"香蕉"})  
        
        Merge (d0:Disease{name:"香蕉冠腐病"}) 
        Merge (d1:Disease{name:"香蕉巴拿马枯萎病"}) 
        Merge (d2:Disease{name:"香蕉褐缘灰斑病"}) 
        Merge (d3:Disease{name:"香蕉煤纹病"})    
        
        Merge (p0:Pest{name:"斜纹夜蛾"}) 
        Merge (p1:Pest{name:"香蕉弄蝶"}) 
        Merge (p2:Pest{name:"香蕉交脉蚜"})           
        
        Merge(c0) -[:生]->(d0) 
        Merge(c0) -[:生]->(d1) 
        Merge(c0) -[:生]->(d2) 
        Merge(c0) -[:生]->(d3)    
        Merge(c0) <-[:吃]-(p0) 
        Merge(c0) <-[:吃]-(p1) 
        Merge(c0) <-[:吃]-(p2) 
`;


async function main(){

    var allCypherList=[];

    var cropList = await Db.doSql("select * from aos_know_crop");

    for (let i=0;i<cropList.length;i++){

        var cypherList=[];

        cypherList.push(`Merge (c0:Crop{id:${cropList[i].id},name:"${cropList[i].name}",fromUrl:"${cropList[i].from_url}"})`);

        let diseaseList=cropList[i].relationship_disease_name_list.split(",");
        for(let j=0;j<diseaseList.length;j++){
            cypherList.push(`Merge (d${j}:Disease{name:"${diseaseList[j]}"})`)
        }
        let  pestList=cropList[i].relationship_pest_name_list.split(",");
        for(let k=0;k<pestList.length;k++){
            cypherList.push(`Merge (p${k}:Pest{name:"${pestList[k]}"})`)
        }

        for(let j=0;j<diseaseList.length;j++){
            cypherList.push(`Merge(c0) -[:生]->(d${j})`)
        }

        for(let k=0;k<pestList.length;k++){
            cypherList.push(`Merge(c0) <-[:吃]-(p${k})`)
        }

        let cypher=cypherList.reduce((u,v)=> u+"\n"+v);
        console.log(cypher);
        M.appendFile("output/Crop.sql",cypher+"@\n")


         Neo4j.doCypher(cypher);



    }

}

main();