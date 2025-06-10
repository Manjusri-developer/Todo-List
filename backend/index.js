const express= require("express");
const app= express();
const cors= require("cors");

app.use(cors());
app.use(express.json());

let todos=[];

app.get("/todos",(req,res)=>{
  res.send(todos);
});

app.post("/create",(req,res)=>{
  try{
    const {newtodos}=req.body;
    todos.push(newtodos);
    res.send({newtodos});
    console.log("newwlist",newtodos);
  }
  catch(error){
    console.log(error);
  }
});

app.put("/update/:Itemid",(req,res)=>{

  try{
    console.log("Enteredddd");
    const {Itemid} = req.params;
    const {updatedText} = req.body;
    if(updatedText !==""){
    res.status(200).json({message:"Todo is updated",updatedTodo:updatedText});
    }
   
  }
  catch(error){
    const err = new Error("Todo not found");
  res.status(404).json({ message: err.message });
  }
});


app.delete("/delete/:Itemid",(req,res)=>{
const {Itemid} = req.params;
    if(Itemid !==""){
      res.status(200).json({deleteId:Itemid});
    }
    else{
      console.log(error);
      res.status(500).json({message:"ID is not received item is not removed",error});
    }
});


app.listen(8000);