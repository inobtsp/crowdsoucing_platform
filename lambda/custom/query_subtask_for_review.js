"use strict"
const AWS = require("aws-sdk");
//const dynamodb = new AWS.DynamoDB();

//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });
   

module.exports = {
    getQuestionBy_orderAndTask_reviewer : function(subtask_ids,theorder,callback){
        //paras set set the query, query by worker name
        dynamodb.query({
            TableName: "subTask",
            FilterExpression:"#taskOrder = :signin_workername",
            KeyConditionExpression:"#taskID = :ids and #subtaskID = :taskids ",
            ExpressionAttributeNames: {
                "#subtaskID": "subtaskId",
                "#taskID" : "task_id",
                "#taskOrder" : "task_order"
            },
            ExpressionAttributeValues: {
                ":taskids" : subtask_ids,
                ":ids": "5",
                ":signin_workername": theorder
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