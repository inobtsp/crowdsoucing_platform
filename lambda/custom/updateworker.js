"use strict"
const AWS = require("aws-sdk");

//const dynamodb = new AWS.DynamoDB();


//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });


module.exports = {
    update_the_progress : function(current_worker_id,current_worker_name,the_current_task_progress,callback){
        //paras set set the query, query by worker name
        console.log("Here's comes to the update function, the current workerid is "+ current_worker_id);
        dynamodb.update({
            TableName: "theworker",
            Key:{
                "workerid":current_worker_id,
                "workername":current_worker_name
            },
            UpdateExpression: "set task_progress = :new_list",
            ExpressionAttributeValues:{
                ":new_list":the_current_task_progress
            },
            ReturnValues:"UPDATED_NEW"
        },
        (err,data)=>{
            if(err||data ==undefined){
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                callback(undefined);
                
            }
            else{
                console.log("Added item:", JSON.stringify(data, null, 2));
                callback(undefined);
               
            }
        }
     );
}
    

    
};
