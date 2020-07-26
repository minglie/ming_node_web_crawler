var M=require("ming_node")
var Neo4j=require("../modules/Neo4j");

var app=M.server();
app.listener(8888);

var nodes=[];
var links=[];

async function main(){
    var results= await Neo4j.doCypher(`
       MATCH (n:People) return n
    `)

    for(var i=0;i<results[0].data.length;i++){
        nodes.push((results[0].data[i].row[0]));
    }

    results= await Neo4j.doCypher(`
       MATCH p=()-[r]->() return p
    `)

    for(var i=0;i<results[0].data.length;i++){
        var link={};
        link.source=results[0].data[i].row[0][0].name;
        link.type  =results[0].data[i].row[0][1].name;
        link.target=results[0].data[i].row[0][2].name;
        links.push(link);
    }

    console.log(links)
}

main();

app.get("/a",
    (req,res)=>{
         res.send(M.result({nodes,links}))
    }
)


