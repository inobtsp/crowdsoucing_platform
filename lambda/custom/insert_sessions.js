"use strict"
const AWS = require("aws-sdk");
const uuid = require('uuid');
//const dynamodb = new AWS.DynamoDB();


//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });



//let sessionid = uuid.v1();

var today = new Date();


module.exports = {
    insertInSessions : function(sessionid,worker_name,workerid,record_status,record_taskid,repeat_time){
        console.log("error here 4");
        //paras set set the query, query by worker name
        dynamodb.put({
            TableName: "session",
            Item:{
                "session_id": sessionid,
                "worker_name": worker_name,
                "workerid": workerid,    
                "record_time": Date(),
                "record_status": record_status,
                "record_taskid": record_taskid,
                "repeat_time":repeat_time
   
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
