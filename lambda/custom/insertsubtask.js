"use strict"
const AWS = require("aws-sdk");

//const dynamodb = new AWS.DynamoDB();


//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });




var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

module.exports = {

   
    insertInsubtask : function(truly_correction,correct_answer,task_des ,prev_answer,subtask_id,task_order){
        console.log("error here 3");
        //paras set set the query, query by worker name
        dynamodb.put({
            TableName: "subTask",
            Item:{
                "correct_answer":truly_correction ,
                "description": task_des,
                "practice": false,
                "pre_answer": prev_answer,
                "subtaskId": subtask_id,
                "subtaskname": "review the answer provide by the other worker for the emotional labeling for the following audio clip. do you agree with their answer? please answer with right , wrong or unknown.",
                "task_id": "5",
                "task_order": task_order,
                "cor_ans_for_pre":correct_answer
              }
           
        },
        (err,data)=>{
            if(err||data ==undefined){
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                
            }
            else{
                console.log("Added item:", JSON.stringify(data, null, 2));
               
            }
        }
     );
}
    

    
};
