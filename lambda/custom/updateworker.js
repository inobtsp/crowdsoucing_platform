"use strict"
const AWS = require("aws-sdk");

//const dynamodb = new AWS.DynamoDB();


//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });


module.exports = {
    update_the_progress : function(current_answer_id,the_current_task_progress){
        console.log("error here 3");
        //paras set set the query, query by worker name
        dynamodb.update({
            TableName: "theworker",
            key:{
                "workerid":current_answer_id
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
                
            }
            else{
                console.log("Added item:", JSON.stringify(data, null, 2));
               
            }
        }
     );
}
    

    
};
