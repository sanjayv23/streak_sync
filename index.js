import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config(); 

const app=express();
const port=3000;
const task_id=uuidv4();
const d=new Date();

let task=[];
let complete=[];
let percent=0;
let date=d.getDate()+" "+(d.getMonth()+1)+" "+d.getFullYear();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

const db=new pg.Client({
    user: process.env.DB_USER,     // UPPERCASE
    host: process.env.DB_HOST,     // UPPERCASE
    database: process.env.DB_DATABASE, // UPPERCASE
    password: process.env.DB_PASSWORD, // UPPERCASE
    port: process.env.DB_PORT      // UPPERCASE
})
db.connect();

app.get("/",(req,res)=>{
    
    res.redirect("/home")
})

app.get("/home",async (req,res)=>{
    console.log("START");
    let a,b;
    try{
        
        const data=await db.query("select * from task where date=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
        const data2=await db.query("select * from complete_task where date=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
        a=data.rowCount;
        b=data2.rowCount;
        complete=data2.rows;
        task=data.rows;
        
    }
    catch(err){
            console.error("error is executing"+err.stack);
    }    
    // console.log("complete: "+complete.length);
    // console.log("set task leng: "+set_task);
    percent=(b/(a+b))*100; 
    
    // console.log("percent: "+set);
    res.render("home.ejs",{task:task,date:date,complete:complete,percent:percent});
})

app.post("/task",(req,res)=>{
    console.log("task: "+req.body.t_name);
    const task_id=uuidv4();
    
    db.query('INSERT INTO task (task,task_id,date,month,year) VALUES ($1,$2,$3,$4,$5)',
        [req.body.t_name,task_id,d.getDate(),d.getMonth()+1,d.getFullYear()]);
    
    res.redirect("/");  
})

app.post("/delete-task",async (req,res)=>{
    console.log("del id: "+req.body.task_id);
    try{
       
        const data=await db.query("delete from task where task_id=($1)",[req.body.task_id]);
        
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
});

app.post("/complete-task",async (req,res)=>{
    console.log(req.body);
    
    try{
        
        db.query("delete from task where task_id=($1)",[req.body.task_id]);
        
        const data=await db.query("select * from task where date=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]); 
        

        db.query('INSERT INTO complete_task (task,task_id,date,month,year) VALUES ($1,$2,$3,$4,$5)',
        [req.body.task,req.body.task_id,d.getDate(),d.getMonth()+1,d.getFullYear()]);
        
    }
    catch(err){
        console.error(err);
    }
    

    
    res.redirect("/");
})


app.post("/delete-complete",(req,res)=>{
    try{
        db.query("delete from complete_task where date=($1) and month=($2) and year=($3)",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
})

app.post("/delete-today",(req,res)=>{
    try{
        db.query("delete from task where date=($1) and month=($2) and year=($3)",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
})

app.listen(3000,()=>{
    console.log(`server is running on port ${port}`);
})