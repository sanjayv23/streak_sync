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

    
})

app.get("/home",async (req,res)=>{
    console.log("START");
    let a,b;
    let complete_percent=[];
    let streak_calen=[];
    try{
        const data=await db.query("select * from task where date=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
        const data2=await db.query("select * from complete_task where date=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
        
        a=data.rowCount;
        b=data2.rowCount;
        percent=a+b==0?0:(b/(a+b))*100;
        percent = Math.round(percent);
        const check_percent_exists=await db.query("select * from streak_calen where day=($1) and month=($2) and year=($3);",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
        
        if(check_percent_exists.rowCount==0){
            await db.query("insert into streak_calen (month,day,year,complete_percent) values ($1,$2,$3,$4)",[d.getMonth()+1,d.getDate(),d.getFullYear(),percent]);
        }
        else{
            await db.query("UPDATE streak_calen SET complete_percent =$1 WHERE month =$2 AND day =$3 AND year = $4;",[percent,d.getMonth()+1,d.getDate(),d.getFullYear(),]);
        
        }
        const percent_data=await db.query("select complete_percent from streak_calen where month=($1) and year=($2)  order by day asc; ",[d.getMonth()+1,d.getFullYear()]);
        complete_percent=percent_data.rows;
        complete=data2.rows;
        task=data.rows;
    }
    catch(err){
            console.error("error is executing"+err.stack);
    }
    for(let i=0;i<complete_percent.length;i++){
        streak_calen[i]=complete_percent[i].complete_percent;
    }
    console.log("streak calen "+streak_calen);
     
    res.render("home.ejs",{task:task,date:date,complete:complete,percent:percent});
})

//add task
app.post("/task",(req,res)=>{
    console.log("task: "+req.body.t_name);
    const task_id=uuidv4();
    db.query('INSERT INTO task (task,task_id,date,month,year) VALUES ($1,$2,$3,$4,$5)',
        [req.body.t_name,task_id,d.getDate(),d.getMonth()+1,d.getFullYear()]);
    res.redirect("/");  
})

// delete task
app.post("/delete-task",async (req,res)=>{
    //console.log("del id: "+req.body.task_id);
    try{
        const data=await db.query("delete from task where task_id=($1)",[req.body.task_id]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
});

// mark the task to complete
app.post("/complete-task",async (req,res)=>{
    //console.log(req.body);
    try{
        db.query("delete from task where task_id=($1)",[req.body.task_id]);
        db.query('INSERT INTO complete_task (task,task_id,date,month,year) VALUES ($1,$2,$3,$4,$5)',
        [req.body.task,req.body.task_id,d.getDate(),d.getMonth()+1,d.getFullYear()]);    
    }
    catch(err){
        console.error(err);
    }    
    res.redirect("/");
})

// reset completed task list
app.post("/delete-complete",(req,res)=>{
    try{
        db.query("delete from complete_task where date=($1) and month=($2) and year=($3)",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
})

// reset task list
app.post("/delete-today",(req,res)=>{
    try{
        db.query("delete from task where date=($1) and month=($2) and year=($3)",[d.getDate(),d.getMonth()+1,d.getFullYear()]);
    }
    catch(err){
        console.error(err);
    }
    res.redirect("/");
})

// to
app.get("/streak",(req,res)=>{
    res.render("streak.ejs",{});
})

app.listen(3000,()=>{
    console.log(`server is running on port ${port}`);
})