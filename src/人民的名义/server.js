var M=require("ming_node")
var app=M.server();
app.listener(8888);



app.get("/",
    (req,res)=>{


         res.send(M.result("ok"))
    }
)


