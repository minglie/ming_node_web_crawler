var Neo4j=require("../modules/Neo4j");

async function main(){
    var k= await Neo4j.doCypher(`
       match(n) detach delete n
    `);
    console.log("ok");
    console.log(JSON.stringify(k))
}


main();



