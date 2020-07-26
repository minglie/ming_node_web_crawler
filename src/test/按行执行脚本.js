var Neo4j=require("../modules/Neo4j");

cypher=`


CREATE (n:Person { name: 'Andres', title: 'Developer' }) return n;
CREATE (n:Person { name: 'Vic', title: 'Developer' }) return n;
match(n:Person{name:"Vic"}),(m:Person{name:"Andres"}) create (n)-[r:Friend]->(m) return r;
match(n:Person{name:"Vic"}),(m:Person{name:"Andres"}) create (n)<-[r:Friend]-(m) return r;
   


`;


async function main(){
    let  cypherList=cypher.trim().split("\n");
    for (var i=0;i<cypherList.length;i++){
        k= await Neo4j.doCypher(cypherList[i]);
        console.log("do-->"+cypherList[i])
        console.log("result:");
        console.log(JSON.stringify(k))
    }
}

main();


