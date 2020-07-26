var Neo4j=require("../modules/Neo4j");

async function main(){


    var k= await Neo4j.doCypher(`
  
    `);
    console.log("ok");
    console.log(JSON.stringify(k))
}



console.log(
    "aa,bbff,\"c,s\"".split(/(?<!\"[^,]+),(?![^,]+\")/))

//main();



