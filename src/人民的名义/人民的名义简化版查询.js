var M=require("ming_node")
var Neo4j=require("../modules/Neo4j");

var links=[];

async function main(){
    results= await Neo4j.doCypher(`
      MATCH(n1:People)-[r]->(n2:People) return (n1.name+"-"+type(r)+"-"+n2.name) as result
    `)

    for(var i=0;i<results[0].data.length;i++){
        let list=results[0].data[i].row[0].split("-");
        var link={};
        link.source=list[0];
        link.type  =list[1];
        link.target=list[2];
        links.push(link);
    }

    console.log(links)
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    console.log(results[0].data.map((u)=>u.row[0]))

}

main();

