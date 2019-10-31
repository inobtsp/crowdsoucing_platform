"use strict"
const AWS = require("aws-sdk");
//const dynamodb = new AWS.DynamoDB();

//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });
   

module.exports = {
    getQuestionBy_orderAndTask : function(theid,theorder,callback){
        //paras set set the query, query by worker name
        dynamodb.query({
            TableName: "subTask",
            IndexName:"task_id-task_order-index",
            ExpressionAttributeNames: {
                "#taskID" : "task_id",
                "#taskOrder" : "task_order"
            },
            ExpressionAttributeValues: {
                ":ids": theid,
                ":signin_workername": theorder
            },
            KeyConditionExpression:"#taskID = :ids and #taskOrder = :signin_workername"
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