"use strict"
const AWS = require("aws-sdk");
const uuid = require('uuid');
//const dynamodb = new AWS.DynamoDB();


//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });



let taskiid = uuid.v1();
console.log(taskiid);
module.exports = {
    insertByName : function(workername,callback){
        //paras set set the query, query by worker name
        dynamodb.put({
            TableName: "theworker",
            Item:{
                "task_progress": 
                  [
                    {
                        "task_id":  "1",
                        "task_status": "incomplete"
                    },
                    {
                      
                        "task_id": "2", 
                        "task_status": "incomplete"

                    },
                    {
                    
                        "task_id": "3",
                        "task_status": "incomplete"
                        
                    },
                    {
                     
                        "task_id": "4",
                        "task_status": "incomplete"

                    },
                    {
                    
                        "task_id":"5",
                        "task_status":"incoplete"

                    },
                    {
                      "task_id": "6",
                      "task_status":"incomplete"
                        
                 
                    },
                    {
                    
                        "task_id": "7",
                        "task_status": "incomplete"
                    
                    }
                  ],
                "workerid": taskiid,
                "workername": workername
              }
            
        },
        (err,data)=>{
            if(err||data ==undefined){
                console.log("getitem threw an error: ", JSON.stringify(err,null,2));
                callback(undefined);
            }
            else{
                console.log("getItem succeeded: ",JSON.stringify(err,null,2));
                if(data.Count >0){
                    callback(data.Items[0]);

                }else{
                    callback(undefined);
                }
            }
        }
     );
}
    

    
};
