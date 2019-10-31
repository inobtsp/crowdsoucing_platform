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
    insertInAnswer : function(current_answer_id,current_workerid,current_worker_names,current_subtask_id,current_task_id,current_correction){
        console.log("error here 3");
        //paras set set the query, query by worker name
        dynamodb.put({
            TableName: "Answer",
            Item:{
                "Answerid": current_answer_id,
                "ass_workerid": current_workerid,
                "ass_workername": current_worker_names,
                "com_question_id": current_subtask_id,
                "com_task_id": current_task_id,
                "Correction":current_correction,
                "complete_time": today,
                "timespent": "50"
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
