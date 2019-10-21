
const AWS = require("aws-sdk");
//const dynamodb = new AWS.DynamoDB();

//config the region
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
   });
   
var uuid = require('uuid');
module.exports = {
    insertByName : function(name,callback){
        //paras set set the query, query by worker name
        dynamodb.putItem({
            TableName: "theworker",
            Item: {
                "task_progress": {
                  "L": [
                    {
                      "M": {
                        "task_id": {
                          "S": "001"
                        },
                        "task_status": {
                          "S": "incomplete"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_id": {
                          "S": "002"
                        },
                        "task_status": {
                          "S": "incomplete"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_id": {
                          "S": "003"
                        },
                        "task_status": {
                          "S": "incomplete"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_id": {
                          "S": "004"
                        },
                        "task_status": {
                          "S": "incomplete"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_id": {
                          "S": "005"
                        },
                        "task_status": {
                          "S": "incoplete"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_status": {
                          "S": "incomplete"
                        },
                        "taskd_id": {
                          "S": "006"
                        }
                      }
                    },
                    {
                      "M": {
                        "task_id": {
                          "S": "007"
                        },
                        "task_status": {
                          "S": "incomplete"
                        }
                      }
                    }
                  ]
                },
                "workerid": {
                  "S": uuid.v1
                },
                "workername": {
                  "S": name
                }
              },
    
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
