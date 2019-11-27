//aws account: 576515628@qq.com
//pwd: Dante24hyy
// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const {
  getRequestType,
  getIntentName,
  getSlotValue,
  getDialogState,
} = require('ask-sdk-core');


const states = {
    START: `_START`,
    QUIZ: `_QUIZ`,
  };
  


//load the file that can query the workers status based on the name
const insertworkers = require("insertworkers");
const getworkers = require("queryworkers");
const proptfirstQuestion = require("querysubtask_byorderandtaskid");
const insertanswers = require("insertanswers");
const update_progress = require("updateworker");
const uuids = require('uuid');
// Load the AWS SDK for Node.js
//const AWS = require('aws-sdk');
// Set the region 
//AWS.config.update({region: 'REGION'});

// Create the DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        const speakOutput = 'Welcome come to crowdsoucing platform on desktop , sign in your name to do the following step!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
//sigin in intent
//ask for user name and store the name as a session attribute
//and output the name 
//question1:  if I want to add the user into database, can I just direct do like this？ to call dynanodb in the handler? but I think ddb.putitem is a function
// there are no nested function in nodejs right? 
//question2: As I have a id attribute in dynanodb, is that means I have to find what the number if id are existe now and plus one? but how to do that?
// I think is too tricky to read from db and plus one and write to db? Is there easier way to acheive that? Or just give up worker id, is that affect the system?
const SignInIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SignInIntent';
    },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
            //resolve the user name 
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            var workersname= getSlotValue(handlerInput.requestEnvelope, 'workername');
            
            sessionAttributes.current_order = 1;
            sessionAttributes.states = states.START;


            getworkers.getWorkerByName(workersname.toLowerCase() ,the_worker =>{
                //check if the worker is valid in database
               if(the_worker){
                
                sessionAttributes.signin_Name = workersname.toLowerCase();
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                speakOutput = "Hi! " +"<break time='1s'/>" +sessionAttributes.signin_Name + " "+sessionAttributes.current_order+"<break time='1s'/>"+" you are already in database";
                reprompt = "you can do what you want";
                const response = handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .getResponse();
                resolve(response);
                return;



               }else{
                
                the_inser_same =  workersname.toLowerCase();
                sessionAttributes.signin_Name = the_inser_same;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                insertworkers.insertByName(the_inser_same,intheworker =>{
                    console.log(intheworker);
                    speakOutput = "Hi! " +"<break time='1s'/>" +sessionAttributes.signin_Name + " "+sessionAttributes.current_order;
                    reprompt = "what your name again?";
                    const response = handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(reprompt)
                        .withSimpleCard(the_inser_same,speakOutput)
                        .getResponse();
                    resolve(response);
                    return;
                
                })
                   
               }
          
            })
    
        })
     
    }
};


 /* const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
       var workersname= getSlotValue(handlerInput.requestEnvelope, 'workername');
       sessionAttributes.signin_Name = workersname;
       handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
       const speakOutput =  'Hi' +sessionAttributes.signin_Name;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('what do you want? Check task? Do task?')
            .getResponse();*/


//check avalble task for the signin user
//use the name that user have sign in and return the avalble task from dynanodb
// the require task are store as number list
//TODO: How can I out put all the item in num list
//error: 

const CheckAvalibleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckAvalible';
    },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
            //resolve the user name 
            const sessionAttribute = handlerInput.attributesManager.getSessionAttributes();
            
            const name  = sessionAttribute.signin_Name;
            let lowername =name.toLowerCase();
            let speakOutput;
            //const speakOutput =  "Here is the task that avalable to you :";
            getworkers.getWorkerByName(lowername,the_worker =>{
                sessionAttribute.current_workerid = the_worker.workerid;
                
                if (the_worker){
                    
                    sessionAttribute.current_task_progess = the_worker.task_progress;
                    var templist  = [];
                    console.log(the_worker.task_progress)
                    
                    for(item in sessionAttribute.current_task_progess)
                    {
                        if(sessionAttribute.current_task_progess[item].task_status == "incomplete")
                        {
                            templist.push(sessionAttribute.current_task_progess[item].task_id);

                        }
                        //what is the 
                    }
                    console.log(templist);
                    taskstring  = templist.join();
                    speakOutput = "Here is the task that avalable to you : "+ taskstring;
                }else{
                    speakOutput = "I can't find your name with " + lowername;
                }
                handlerInput.attributesManager.setSessionAttributes(sessionAttribute);
                reprompt = "what are you going to do next?";
                const response = handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .withSimpleCard(lowername,speakOutput)
                    .getResponse();
                resolve(response);
                return;
            })
        })
    }
};

//say "start question one to enter"
const StartquestionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'startquestionIntent';
    },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
            //nachu task id 存进session
         

            console.log("On start request");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            var current_taskid= getSlotValue(handlerInput.requestEnvelope, 'number');
            sessionAttributes.current_taskid = current_taskid;
            sessionAttributes.states = states.QUIZ;
            
            var order = sessionAttributes.current_order;
            var speakOutput =" ";
           //从database里拿问题

           proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_first_questions=>{
                console.log("This is the order before ask question: " + order);
                console.log("Now in the start the first question intent!! ")
                console.log(the_first_questions); 
                
                if (current_taskid === "1"){
                    speakOutput = "Here is the question"+ order+": "+"<break time='1s'/>"+ "Please answer " + the_first_questions.subtaskname +"or say repeat to repeat the question !"
                    +"<break time='2s'/>"+ the_first_questions.description;
                    console.log( "第一个if");
                }
                else if (current_taskid === "2")
                {
                    speakOutput = "Here is the question"+ order+ "on task " +current_taskid + ": "+"<break time='1s'/>"+ "Please answer " + the_first_questions.subtaskname +"or say repeat to repeat the question !"
                    +"<break time='2s'/>"+ the_first_questions.description;
                    console.log( "第二个if");
                }
                else{
                    speakOutput="here comes to third type!";
                }

                reprompt = "your answer is invalid " +the_first_questions.description;
                //order变成2
                //sessionAttributes.current_order +=1;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                console.log("This is the order after ask question:" +sessionAttributes.current_order);
                const response = handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .getResponse();
                resolve(response);
                return;
            
            })
        })
     
    }
};

const YesOrNoanswerIntentHandler = {
    
    canHandle(handlerInput) {
        var attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
        var  A= attributes.states === states.QUIZ;
        var B= attributes.current_taskid === "1" ;
        var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
       console.log(A + " "+B+" "+C);

          return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "1";
          //&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'YesOrNoanswerIntent'
 
        },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
        //1. 拿slot value
        //2. 对比slot value的答案和正确的答案
         //3. 拿order=2 task=1的问题抛出来
            console.log("In the yesOrNo inttent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            var current_answer= getSlotValue(handlerInput.requestEnvelope, 'YesOrNo');
            var order = sessionAttributes.current_order;
                    
          
            
                //找到order 1 的全部信息
                //find column of the order i
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    var current_correction = compareSlots(current_answer,the_query_sub_task.correct_answer);
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction);
                    console.log("Store answer in the answer table end");
                    console.log("here the query sub task is valiod 11111111111111111111");
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;

                        
                       
                        //找到order 2 的全部信息并问下一个问题
                        //find the column of i+1 question and ask for the i+2
                        proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                            if(the_second_query_sub_task){console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                            speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please answer " + the_second_query_sub_task.subtaskname +"or say repeat to repeat the question !"
                            +"<break time='2s'/>"+ the_second_query_sub_task.description;
                            reprompt = the_second_query_sub_task.description;   
                            const response = handlerInput.responseBuilder
                                .speak(speakOutput)
                                .reprompt(reprompt)
                                .getResponse();
                            resolve(response);
                            return;

                            }
                            else{
                                   //if there are no quiz for task1 , the intent will tell user it's over and ask user to ask for new task.
                                    //it will set order back to one and change the current state since quiz is over
                            
                                    console.log("here the query sub task is invalid 22222222222222222222222");
                                    speakOutput = "you are finish this task, which task are you going to do next!";
                                    reprompt  = "tell me which task you are want to do";
                                    //mark task one as complete 
                                    sessionAttributes.current_order = 1;
                                    sessionAttributes.states = states.START;
                                    var list = sessionAttributes.current_task_progess;
                                    let change_status = list .find((p) => {
                                        return p.task_id === current_taskid;
                                    });
                                    change_status.task_status = "complete";
                                    sessionAttributes.current_task_progess = list;
                                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                                    //mark task one as complete in database
                                    update_progress.update_the_progress(sessionAttributes.current_workerid,sessionAttributes.signin_Name,list,update_status=>{

                                        console.log("here change the status of task progress");
                                        const response = handlerInput.responseBuilder
                                                    .speak(speakOutput)
                                                    .reprompt(reprompt)
                                                    .getResponse();
                                                resolve(response);
                                                return;

                                    }
                                )
                               

                                     }
                            
                                })                            
                        })
                
        
    
            
        })
            
        
        
    }
};





const FactGatherIntentHandler = {
    
    canHandle(handlerInput) {
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
       return attributes.states === states.QUIZ && attributes.current_taskid === "2" && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' ;
       /* console.log("In the fact gather inttent");
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FactGatherIntent'// && attributes.state === states.QUIZ && attributes.current_taskid === "1" ;
    */
        },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
        //1. 拿slot value
        //2. 对比slot value的答案和正确的答案
         //3. 拿order=2 task=1的问题抛出来
         console.log("In the gact gather inttent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            var current_answer_fact= getSlotValue(handlerInput.requestEnvelope, 'the_fact');
            
            var order = sessionAttributes.current_order;
   
            if(order<=2){
                //找到order 1 的全部信息
                //find column of the order i
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{
                    
            
                    var current_correction = compareSlots(current_answer_fact,the_query_sub_task.correct_answer);
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction);
                    console.log("Store answer in the answer table end");
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;
                
                    //找到order 2 的全部信息并问下一个问题
                    //find the column of i+1 question and ask for the i+2
                    proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                        console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                        speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please answer " + the_second_query_sub_task.subtaskname +"or say repeat to repeat the question !"
                        +"<break time='2s'/>"+ the_second_query_sub_task.description;
                        reprompt = the_second_query_sub_task.description;   
                        const response = handlerInput.responseBuilder
                            .speak(speakOutput)
                            .reprompt(reprompt)
                            .getResponse();
                        resolve(response);
                        return;
                    })      
        
                })
                
            }else{
                //if there are no quiz for task1 , the intent will tell user it's over and ask user to ask for new task.
                //it will set order back to one and change the current state since quiz is over
                speakOutput = "you are finish this task, which task are you going to do next!";
                reprompt  = "tell me which task you are want to do";
                sessionAttributes.current_order = 1;
                sessionAttributes.states = states.START;
                const response = handlerInput.responseBuilder
                            .speak(speakOutput)
                            .reprompt(reprompt)
                            .getResponse();
                        resolve(response);
                        return;
            }    
            
        })
            
        
        
    }
};









function compareSlots(slots, value) {
    const correction = {
        CORRECT: `correct`,
        INCORRECT: `incorrect`,
      };

        if (slots.toString().toLowerCase() === value.toString().toLowerCase()) {
          return correction.CORRECT;
        }

    return correction.INCORRECT;
  }

/*const TranscriptionIntentHandler = {
    canHandle(handlerInput) {
        console.log("In the transcription inttent");
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TranscriptionIntent';
           
    },
    handle(handlerInput) {
      /*  return new Promise((resolve,reject)=>{
            //resolve the user name 
           
           
                speakOutput
                reprompt = "what are you going to do next?";
                handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .getResponse();
                 
        
       
        })
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

*/








const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SignInIntentHandler,
        CheckAvalibleIntentHandler,
        StartquestionIntentHandler,
        YesOrNoanswerIntentHandler,
        FactGatherIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();
