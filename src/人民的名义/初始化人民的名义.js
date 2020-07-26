var M=require("ming_node")
var Neo4j=require("../modules/Neo4j");

async function main(){
   let a= M.readFile("人民的名义init.sql")

    Neo4j.ip="192.168.159.128";

   let  cypherList=a.split("\r\n");
    for (let i=0;i<cypherList.length;i++){
        if(cypherList[i]){
            var k= await Neo4j.doCypher(cypherList[i])
            console.log(JSON.stringify(k))
        }
    }
}

main();
