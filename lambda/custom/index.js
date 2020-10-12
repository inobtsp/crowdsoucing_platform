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
const insert_subtask = require("insertsubtask");
const query_task_reviewer = require("query_subtask_for_review");
const insert_session = require("insert_sessions");
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
        
        const speakOutput = 'Welcome come to crowdsoucing platform on desktop in taizhou , sign in your name to do the following step!';
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
                speakOutput = "Hi! " +"<break time='1s'/>" +sessionAttributes.signin_Name + " "+sessionAttributes.current_order+"<break time='1s'/>"+" you are already in database, welecome back !";
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

                var job_description
                var job_status 
                var task_4_status
                var task_5_status
                //1. 如果这个人是solver则显示第四题， 如果是reviewer则显示第五题
                
                let random =Math.floor(Math.random() * 2)+1;
                console.log(random);
                if (random === 1){
                    job_description = "solver"
                    job_status = "uncheck"
                    task_4_status = "incomplete"
                    task_5_status = "complete"


                }else{
                    job_description = "reviewer"
                    job_status = "dante"
                    task_4_status = "complete"
                    task_5_status = "incomplete"

                }
                

                insertworkers.insertByName(the_inser_same,job_description,job_status,task_4_status,task_5_status,intheworker =>{
                    console.log(intheworker);
                    speakOutput = "Hi! " +"<break time='1s'/>" +sessionAttributes.signin_Name +" welcome to crowdsourcing platform";
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
                 //如果是reviewer则把对应的批改人放进session里，方便读取
                 sessionAttribute.current_worker_job = the_worker.job;
                if (the_worker.job === "reviewer")
                {
                    
                    sessionAttribute.current_worker_job = the_worker.job;
                    sessionAttribute.who_is_reviewed = the_worker.status;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttribute);
                    //handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    console.log("reviewer 把 "+ the_worker + "存进了session 里。。。");


                }
                
             

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
                
                    
                    speakOutput = "Here is the task that available to you : "+ taskstring;
                    
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
            const current_subtaskid = sessionAttributes.who_is_reviewed;
            const current_workerids = sessionAttributes.current_workerid;
            const curren_workerjob = sessionAttributes.current_worker_job;
            var order = sessionAttributes.current_order;
            var currentworker = sessionAttributes.signin_Name;
            var  newsubtaskid = current_subtaskid+order;
            var sessionid = uuids.v1();
            var speakOutput =" ";
            //var dingdong = "https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3";

           // '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' 
           //从database里拿问题

           proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_first_questions=>{
            query_task_reviewer.getQuestionBy_orderAndTask_reviewer(newsubtaskid.toString(),order,the_second_query_sub_task=>{
                console.log("This is the order before ask question: " + order);
                console.log("Now in the start the first question intent!! ")
                console.log(the_first_questions); 
                practiceOutput = "The first two question are for you to pratice. The result will not recorded. The real question will start at question three. "+" ";
                if (current_taskid === "1")

                {  // dingdongurl = '<audio  src='+dingdong+'/>' ;
                //workerid,worker_name,record_status,record_taskid,repeat_time
                    

                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
                    speakOutput = "Here is the question"+ order+": "+" "+"sentiment analysis " +"<break time='1s'/>"+practiceOutput+ "<break time='1s'/>"+"Please answer " + the_first_questions.subtaskname +" or say repeat to repeat the question !"
                    +"<break time='2s'/>"+ the_first_questions.description + dingdongurl ;
                    sessionAttributes.current_question_des =  the_first_questions.description;
                    sessionAttributes.current_repeatime = 0;
                     handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    console.log( "第一个if");
                }
                else if (current_taskid === "2")
                {   
                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
                    speakOutput = "Here is the question"+ order+ "on task " +current_taskid + ": "+"<break time='1s'/>"+practiceOutput+ "<break time='1s'/>"+ "Please answer " + the_first_questions.subtaskname +" Please start with "+"<break time='1s'/>"+'the answer is '+"<break time='1s'/>"+"or say repeat to repeat the question !"
                    +"<break time='2s'/>"+ the_first_questions.description +dingdongurl;
                    sessionAttributes.current_question_des =  the_first_questions.description;
                    sessionAttributes.current_repeatime = 0;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    console.log( "第二个if");
                }
                else if (current_taskid === "3")
                {   
                    
                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
                    soundurl = '<audio  src="'+the_first_questions.description+'"/>' 
                    speakOutput =  "Here is the question"+ order+" "+ "on task " +current_taskid + ": "+"<break time='1s'/>"+practiceOutput+"<break time='1s'/>"+ "Please answer " + the_first_questions.subtaskname +" Please start with 'he say' or 'she say' or say repeat to repeat the question !"
                    +dingdongurl +soundurl;
                    
                   
                    //+ the_first_questions.description;
                    //+ order+": "+'<audio  src="'+the_first_questions.description+'"/>' ;

                    //<audio src = ' https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3' />
                    sessionAttributes.current_question_des = '<audio  src="'+the_first_questions.description+'"/>' ;
                    sessionAttributes.current_repeatime = 0;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    console.log(speakOutput)
                    console.log(the_first_questions.description);
                    console.log( "第三个if");
                }
                else if (current_taskid === "4"&& curren_workerjob=== "solver")
                {
                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    soundurl = '<audio  src="'+the_first_questions.description+'"/>' 
                    
                    //speakOutput =  "Here is the question"+ order+""+ ": "+        soundurl ;
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;

                    speakOutput = "Here is the question "+ order+ "on task " +current_taskid + ": "+"<break time='1s'/>"+practiceOutput+ "<break time='1s'/>"+ "Please answer " + the_first_questions.subtaskname +"Please start with 'he is' or 'she is'  "+
                    "<break time='1s'/>"+"or say repeat to repeat the question !"+ dingdongurl  +"<break time='1s'/>"+ soundurl ;
                    sessionAttributes.current_question_des = '<audio  src="'+the_first_questions.description+'"/>' ;
                    sessionAttributes.current_repeatime = 0;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    //+ the_first_questions.description;
                    //+ order+": "+'<audio  src="'+the_first_questions.description+'"/>' ;
                        //"<speak>Here is the question1: <audio  src=\"https://s3.amazonaws.com/dante.crowdsoucing.project/5_0.mp3\"/></speak>"
                    //<audio src = ' https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3' />
                    console.log(speakOutput)
                    console.log(the_first_questions.description);
                    console.log( "第四个if");
                }
                else if (current_taskid === "5" && curren_workerjob=== "reviewer")
                {
                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
                    console.log(newsubtaskid.toString());
                    console.log(order + "the current order");
                 
                   
                       

                    soundurl = '<audio  src="'+the_second_query_sub_task.description+'"/>' ;
                    speakOutput =  "Here is the question "+ order+ "on task " +current_taskid +": "+"<break time='1s'/>" + "Please " +the_second_query_sub_task.subtaskname+ " The people you review are from "+ "<break time='1s'/>"  +current_subtaskid+ ", the audio will play after a ding"+
                    dingdongurl + soundurl  +"His answer is "+the_second_query_sub_task.pre_answer +"<break time='1s'/>" +" How do you think of his answer?"+ "<break time='1s'/>"+ " Please answer with right or wrong or you can say repeat to repeat the question !";
                        
                    sessionAttributes.current_question_des = "the audio he listen is " +"<break time='1s'/>"+ '<audio  src="'+the_second_query_sub_task.description+'"/>' + "his answer is " + "<break time='1s'/>"+the_second_query_sub_task.pre_answer
                    + ". How do you think ? Please reply with right,wrong or unknown";
                    sessionAttributes.current_repeatime = 0;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                        //+ the_first_questions.description;
                        //+ order+": "+'<audio  src="'+the_first_questions.description+'"/>' ;
    
                        //<audio src = ' https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3' />
    
                        //"Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please " + the_second_query_sub_task.subtaskname+ "the people you review are from " +current_subtaskid+ "you are hearing the audio after two second"+
                        //+"<break time='2s'/>"+ soundurl  +"how do you think"+ "<break time='1s'/>"+ "or you can say repeat to repeat the question !"
                    console.log(speakOutput);
                    console.log(the_second_query_sub_task);
                    console.log( "第五个if");

                }
            
                else if (current_taskid === "6")
                {   
                    insert_session.insertInSessions(sessionid,currentworker,current_workerids,"start", current_taskid, 0);
                    console.log("session is start with repeat is 0");
                    dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
                    speakOutput = "Here is the question"+ order+ " on task " +current_taskid + ": "+"<break time='1s'/>"+practiceOutput+ "<break time='1s'/>" + the_first_questions.subtaskname +"<break time='2s'/>"+ " The question is : "+the_first_questions.the_question+"<break time='1s'/>"+dingdongurl+" Now here is the text: "+ the_first_questions.description+"<break time='1s'/>"+" please start with "+"<break time='1s'/>"+'my answer is '
                    +"<break time='1s'/>"+"or say repeat to repeat the question !" +"<break time='1s'/>" ;
                    sessionAttributes.current_question_des =    the_first_questions.description+ "<break time='1s'/>" + "So ,"+"<break time='1s'/>" + the_first_questions.the_question+dingdongurl;   
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    console.log( "第六个if");
                }
                else
                {
                    speakOutput="The task id you require is unavailable , please say check task to check you available task!!";
                }

                reprompt = "your answer is invalid " +the_first_questions.description;
                //order变成2
                //sessionAttributes.current_order +=1;
                
                console.log("This is the order after ask question:" +sessionAttributes.current_order);
                const response = handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .getResponse();
                resolve(response);
                return;
            
            })
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
            console.log("In the yesOrNo intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            const current_workerids = sessionAttributes.current_workerid;
            var current_answer= getSlotValue(handlerInput.requestEnvelope, 'YesOrNo');
            var order = sessionAttributes.current_order;
            var current_repeat = sessionAttributes.current_repeatime;
            var dingdong = "https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3";
           // var soundurl = '<audio  src='+dingdong+'/>' ;
            var dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;
         
                    
                //找到order 1 的全部信息
                //find column of the order i
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{


                    //如果带practice则存进去
                   
                   if(the_query_sub_task.practice == false){
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    var current_correction = compareSlots(current_answer,the_query_sub_task.correct_answer);
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction,the_query_sub_task.task_difficulty,order);
                    console.log("Store answer in the answer table end");
                    console.log("here the query sub task is valiod 11111111111111111111");

                   }
                   
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;

                        
                       
                        //找到order 2 的全部信息并问下一个问题
                        //find the column of i+1 question and ask for the i+2
                        proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                            if(the_second_query_sub_task)
                            {

                                console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                             //   speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please answer " + the_second_query_sub_task.subtaskname +"or say repeat to repeat the question !"
                           // +"<break time='2s'/>"+ the_second_query_sub_task.description;
                           speakOutput ="Here is the question "+ sessionAttributes.current_order +": "+"<break time='2s'/>"+ the_second_query_sub_task.description +dingdongurl;
                            sessionAttributes.current_question_des =  the_second_query_sub_task.description;
                            reprompt = "you should start with " + "positive, neutral or negative " +"try again!" +  the_second_query_sub_task.description;   
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

                                    //workerid,worker_name,record_status,record_taskid,repeat_time
                              
                                    let sessionid = uuids.v1();
                                    insert_session.insertInSessions(sessionid,sessionAttributes.signin_Name,current_workerids,"end", current_taskid,current_repeat );
                                    console.log("session end is store with new repeat" + current_repeat);

                                    reprompt  = "tell me which task you are want to do";
                                    //mark task one as complete 
                                    sessionAttributes.current_order = 1;
                                    sessionAttributes.states = states.START;
                                    sessionAttributes.current_repeatime = 0;
                                    
                                    var list = sessionAttributes.current_task_progess;
                                    let change_status = list .find((p) => {
                                        return p.task_id === current_taskid;
                                    });
                                    change_status.task_status = "complete";
                                    sessionAttributes.current_task_progess = list;
                                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                                    console.log("repeat is reset to " + current_repeat);
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

            var attributes = handlerInput.attributesManager.getSessionAttributes();
                    
            console.log(attributes.current_taskid);
            var  A= attributes.states === states.QUIZ;
            var B= attributes.current_taskid === "2" ;
            var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
            console.log(A + " "+B+" "+C);

            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "2";




        },


    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
        //1. 拿slot value
        //2. 对比slot value的答案和正确的答案
         //3. 拿order=2 task=1的问题抛出来
         console.log("In the fact gather intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            var current_answer_fact= getSlotValue(handlerInput.requestEnvelope, 'the_fact');   
            const current_workerids = sessionAttributes.current_workerid;
            var current_repeat = sessionAttributes.current_repeatime;
            var current_question_des;
            var order = sessionAttributes.current_order;

           
            var dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;

            proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{


                //如果带practice则存进去
               
               if(the_query_sub_task.practice == false){
                //存进answer
                console.log("Store answer in the answer table start");
                let answerid = uuids.v4();
                var current_correction = compareSlots(current_answer_fact,the_query_sub_task.correct_answer);
                insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction,the_query_sub_task.task_difficulty,order);
                console.log("Store answer in the answer table end");
                console.log("here the query sub task is valiod 11111111111111111111");

               }
               
                //move to next questions
                sessionAttributes.current_order +=1;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                var neworder = sessionAttributes.current_order;

                    
                   
                    //找到order 2 的全部信息并问下一个问题
                    //find the column of i+1 question and ask for the i+2
                    proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                        if(the_second_query_sub_task)
                        {

                            console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                            //speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please answer " + the_second_query_sub_task.subtaskname +"or say repeat to repeat the question !"
                       // +"<break time='2s'/>"+ the_second_query_sub_task.description;
                         speakOutput = "Here is the question"+ sessionAttributes.current_order +" " +"<break time='2s'/>"+ the_second_query_sub_task.description+dingdongurl;
                        sessionAttributes.current_question_des =  the_second_query_sub_task.description;
                        reprompt = "you should start with  'the answer is ' try again!" +  the_second_query_sub_task.description;   
                    
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

                                let sessionid = uuids.v1();
                                insert_session.insertInSessions(sessionid,sessionAttributes.signin_Name,current_workerids,"end", current_taskid,current_repeat );
                                console.log("session end is store with new repeat" + current_repeat);
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
                                sessionAttributes.current_repeatime = 0;
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
            



            //这里等于总题数减一，因为到2的时候还会再走一次这个intent
            /*if(order<=2){
                //找到order 1 的全部信息
                //find column of the order i


              
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{
                   
                     
                    if(order>1)
                    {
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

                    }       
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
            } */   
            
        })
            
        
        
    }
};




/*

        var attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
        var  A= attributes.states === states.QUIZ;
        var B= attributes.current_taskid === "1" ;
        var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
       console.log(A + " "+B+" "+C);

          return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "1";
          //&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'YesOrNoanswerIntent'
 
 */

const Question_three_Handler = {
    canHandle(handlerInput) {
       /* const attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
       return attributes.states === states.QUIZ && attributes.current_taskid === "3" && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' ;*/
       var attributes = handlerInput.attributesManager.getSessionAttributes();
                    
       console.log(attributes.current_taskid);
       var A= attributes.states === states.QUIZ;
       var B= attributes.current_taskid === "3" ;
       var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
       console.log(" in third intent")
       console.log(A + " "+B+" "+ C) ;
       console.log("第三个intent： " +  Alexa.getRequestType(handlerInput.requestEnvelope))
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "3";
      
    },
    handle(handlerInput) {

          return new Promise((resolve,reject)=>{
            console.log("In the question three intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            const current_workerids = sessionAttributes.current_workerid;
            var current_repeat = sessionAttributes.current_repeatime;
            //slot value change here
            var current_answer_voice= getSlotValue(handlerInput.requestEnvelope, 'transcripslot');    
            var order = sessionAttributes.current_order;
            //resolve the user name 

      
           let speakOutput ="HI, this is your first task on task "+ current_taskid + "<speak><audio src = 'https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3' /></speak>";
           
           //'<audio src="https://s3.amazonaws.com/waanimals-deployment-scripts/alexa-audio/' +       '.mp3" /> ';
           //https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3
            console.log("Inside question three handler - handle");
            
                //找到order 1 的全部信息
                //find column of the order i
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{


                    //如果不是practice则存进answer
                   
                   if(the_query_sub_task.practice == false){
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    var edit_distance = getEditDistance(current_answer_voice,the_query_sub_task.correct_answer);
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,edit_distance,the_query_sub_task.task_difficulty,order);
                    console.log("Store answer in the answer table end");
                    console.log("here the query sub task is valiod 11111111111111111111");
        
                   }
                   
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;

                        
                       
                        //找到order 2 的全部信息并问下一个问题
                        //find the column of i+1 question and ask for the i+2
                        proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                            if(the_second_query_sub_task)
                            {

                                console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                                soundurl = '<audio  src="'+the_second_query_sub_task.description+'"/>' 
                                speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "remember start with  he say or she say "+"<break time='2s'/>"+ soundurl;
                            sessionAttributes.current_question_des =  soundurl;
                            reprompt = soundurl;   
                            const response = handlerInput.responseBuilder
                                .speak(speakOutput)
                                .reprompt(reprompt)
                                .getResponse();
                            resolve(response);
                            return;

                            }
                            else{
                                   //if there are no quiz for task , the intent will tell user it's over and ask user to ask for new task.
                                    //it will set order back to one and change the current state since quiz is over
                            
                                    console.log("here the query sub task is invalid 22222222222222222222222");
                                    speakOutput = "you are finish this task, which task are you going to do next!";
                                    let sessionid = uuids.v1();
                                    insert_session.insertInSessions(sessionid,sessionAttributes.signin_Name,current_workerids,"end", current_taskid,current_repeat );
                                    console.log("session end is store with new repeat" + current_repeat);
                                    reprompt  = "tell me which task you are want to do";
                                    //mark task one as complete 
                                    sessionAttributes.current_order = 1;
                                    sessionAttributes.states = states.START;
                                    var list = sessionAttributes.current_task_progess;
                                    let change_status = list .find((p) => {
                                        return p.task_id === current_taskid;
                                    });
                                    change_status.task_status = "complete";
                                    sessionAttributes.current_repeatime = 0;
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











//和前面一样，但是每次答完这里会往sub-task的table里加入新的东西

const Question_Four_Handler = {
    canHandle(handlerInput) {
       /* const attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
       return attributes.states === states.QUIZ && attributes.current_taskid === "4" && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' ;*/
       var attributes = handlerInput.attributesManager.getSessionAttributes();
                    
       console.log(attributes.current_taskid);
       var A= attributes.states === states.QUIZ;
       var B= attributes.current_taskid === "4" ;
       var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
       console.log(" in Fourth intent")
       console.log(A + " "+B+" "+ C) ;
       console.log("第四个intent： " +  Alexa.getRequestType(handlerInput.requestEnvelope))
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "4";
      
    },
    handle(handlerInput) {

          return new Promise((resolve,reject)=>{
            console.log("In the question four intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            const curren_workername = sessionAttributes.signin_Name;
            const current_workerids = sessionAttributes.current_workerid;
            var current_repeat = sessionAttributes.current_repeatime;
            var current_answer_voice= getSlotValue(handlerInput.requestEnvelope, 'emotional');    
            //var current_question_des;
            var order = sessionAttributes.current_order;
            //resolve the user name 

      
           //let speakOutput ="HI, this is your first task" + "<speak><audio src = 'https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3' /></speak>";
           
           //'<audio src="https://s3.amazonaws.com/waanimals-deployment-scripts/alexa-audio/' +       '.mp3" /> ';
           //https://s3.amazonaws.com/dante.crowdsoucing.project/king.mp3
            console.log("Inside question four handler - handle");
            
                //找到order 1 的全部信息
                //find column of the order i
                proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{


                    //如果带practice则存进去
                   
                   if(the_query_sub_task.practice == false){
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    var current_correction = compareSlots(current_answer_voice,the_query_sub_task.correct_answer);
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction,the_query_sub_task.task_difficulty,order);
                    console.log("Store answer in the answer table end");
                    console.log("here the query sub task is valiod 11111111111111111111");
                    
                    
               
                    /***
                     * 
                    *how to implement collaborate
                    *1. 所有的user（一开始注册的时候，可以被后台更改）会被分为problem solver 和reviewer两类， 每个reviewer都指定一个特殊的solver用来review他的回答
                    2. 这个地方通过query worker里带有ps身份的（比如是dante）
                    * 2. problem solver 每次答完题就会生成新的subtask，这个新的subtask用来给reviewer来判断
                    * 3. 每次新生成的subtask的unique subtaskid 从通常的001， 变成 当前user名字+当前order的格式
                    * 4. reviewer因为指定了review人的关系（这里reviewer对应哪个solver直接后台人为分配，因为只用于实验， 因此可以给每个worker加一个身份行，一个当前status行， status行如果是solver里面则是是否被审核过了，如果是reviewer里面则填对应的审核人名字）
                    * 5. 这样因为指定了review的人是谁， 在第五题review的时候直接在subtask的表里取subtaskid = 分派的人+order， 答完直接答案放进answer里也不需要再管subtask了
                     * 
                     * 
                     * 
                     */
                    //存进subtask
                    // insertInsubtask : function(correct_answer,task_des ,prev_answer,subtask_id,task_order)
                    
                    to_be_reviewed_subtaskid = curren_workername + (Number(order)-2).toString() ;
                    questionfive_order = Number(order)-2;
                    if(current_correction === "correct"){
                        truly_correction ="right";

                    }
                    else if(current_correction === "incorrect")
                    {
                        truly_correction ="wrong";
                    }
                    insert_subtask.insertInsubtask(truly_correction,the_query_sub_task.correct_answer,the_query_sub_task.description,current_answer_voice,to_be_reviewed_subtaskid,questionfive_order);
                    console.log("success update subtask table ");
             

                   }
                   
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;

                        
                       
                        //找到order 2 的全部信息并问下一个问题
                        //find the column of i+1 question and ask for the i+2
                        proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                            if(the_second_query_sub_task)
                            {

                                console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                                soundurl = '<audio  src="'+the_second_query_sub_task.description+'"/>' ;
                                speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='2s'/>"+ "your answer should start  with 'she is' or 'he is' , then choose one of the 7 labels 'Joy', 'Sad', 'Fear', 'angry', 'Surprise', ,'Neutral' and 'Disgust'."+"<break time='2s'/>"+soundurl;
                            sessionAttributes.current_question_des =  soundurl;
                            reprompt = soundurl;   
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
                                    let sessionid = uuids.v1();
                                    insert_session.insertInSessions(sessionid,sessionAttributes.signin_Name,current_workerids,"end", current_taskid,current_repeat );
                                    console.log("session end is store with new repeat" + current_repeat);
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
                                    sessionAttributes.current_repeatime = 0;
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





//和前面一样，但是每次答完这里会往sub-task的table里加入新的东西

const Question_Five_Handler = {
    canHandle(handlerInput) {
       /* const attributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log(attributes.current_taskid);
       return attributes.states === states.QUIZ && attributes.current_taskid === "4" && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' ;*/
       var attributes = handlerInput.attributesManager.getSessionAttributes();
                    
       console.log(attributes.current_taskid);
       var A= attributes.states === states.QUIZ;
       var B= attributes.current_taskid === "5" ;
       var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
       console.log(" in fifth intent")
       console.log(A + " "+B+" "+ C) ;
       console.log("第五个intent： " +  Alexa.getRequestType(handlerInput.requestEnvelope))
       return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "5";
      
    },
    handle(handlerInput) {

          return new Promise((resolve,reject)=>{
            console.log("In the question fifth intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            const current_subtaskid = sessionAttributes.who_is_reviewed;
            const curren_workername = sessionAttributes.signin_Name;
            const current_workerids = sessionAttributes.current_workerid;
            var current_repeat = sessionAttributes.current_repeatime;
            var current_answer_voice= getSlotValue(handlerInput.requestEnvelope, 'review_result');    
            console.log(current_answer_voice + ""+ "the slot value is extract" )
            //var current_question_des;
            var order = sessionAttributes.current_order;
            //resolve the user name 

            console.log("Inside question five handler - handle");
            
                //找到order 1 的全部信息
                //find column of the order i
                query_task_reviewer.getQuestionBy_orderAndTask_reviewer(current_subtaskid+order,order,the_query_sub_task=>{


                    //如果带practice则存进去
                   
                   if(the_query_sub_task.practice == false){
                    //存进answer
                    console.log("Store answer in the answer table start");
                    let answerid = uuids.v4();
                    var current_correction = compareSlots(current_answer_voice,the_query_sub_task.correct_answer);
                    insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction,the_query_sub_task.task_difficulty,order);
                    console.log("Store answer in the answer table end");
                    console.log("here the query sub task is valiod 11111111111111111111");
                    
                    
               
                    /***
                     * 
                    *how to implement collaborate
                    *1. 所有的user（一开始注册的时候，可以被后台更改）会被分为problem solver 和reviewer两类， 每个reviewer都指定一个特殊的solver用来review他的回答 111111
                    2. 这个地方通过query worker里带有ps身份的（比如是dante）****
                    * 2. problem solver 每次答完题就会生成新的subtask，这个新的subtask用来给reviewer来判断  111111
                    * 3. 每次新生成的subtask的unique subtaskid 从通常的001， 变成 当前user名字+当前order的格式   1111111
                    * 4. reviewer因为指定了review人的关系（这里reviewer对应哪个solver直接后台人为分配，因为只用于实验， 因此可以给每个worker加一个身份行，一个当前status行， status行如果是solver里面则是是否被审核过了，如果是reviewer里面则填对应的审核人名字）  111111
                    * 5. 这样因为指定了review的人是谁， 在第五题review的时候直接在subtask的表里取subtaskid = 分派的人+order， 答完直接答案放进answer里也不需要再管subtask了 111
                     * 
                     * 
                     * 
                     */
               


                    

                   }
                   
                    //move to next questions
                    sessionAttributes.current_order +=1;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                    var neworder = sessionAttributes.current_order;

                        
                       
                        //找到order 2 的全部信息并问下一个问题
                        //find the column of i+1 question and ask for the i+2
                        query_task_reviewer.getQuestionBy_orderAndTask_reviewer(current_subtaskid+neworder,neworder,the_second_query_sub_task=>{
                            if(the_second_query_sub_task)
                            {

                                console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                                soundurl = '<audio  src="'+the_second_query_sub_task.description+'"/>' ;
                                speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+  "You are hearing the audio after one second."
                                +"<break time='1s'/>"+ soundurl  +"His answer is ： "+ the_second_query_sub_task.pre_answer +"."+ "<break time='1s'/>"+ " Please answer with right , wrong , unknown  or you can say repeat to repeat the question .";

                                
                            ;
                            
                            sessionAttributes.current_question_des = "The audio he listen is " +"<break time='1s'/>"+ soundurl + "His answer is " +"<break time='1s'/>"+ the_second_query_sub_task.pre_answer+ ". How do you think? Please reply with right,wrong or unknown.";

          

                            reprompt = "You are enter an wrong value , please try again and don't forget to reply with right,wrong or unknown.";   
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
                                    let sessionid = uuids.v1();
                                    insert_session.insertInSessions(sessionid,curren_workername,current_workerids,"end", current_taskid,current_repeat );
                                    console.log("session end is store with new repeat" + current_repeat);
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
                                    sessionAttributes.current_repeatime = 0;
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





const Question_Six_Handler = {
    
    canHandle(handlerInput) {

            var attributes = handlerInput.attributesManager.getSessionAttributes();
                    
            console.log(attributes.current_taskid);
            var  A= attributes.states === states.QUIZ;
            var B= attributes.current_taskid === "6" ;
            var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
            console.log(A + " "+B+" "+C);

            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'&& attributes.states === states.QUIZ && attributes.current_taskid === "6";




        },


    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
        //1. 拿slot value
        //2. 对比slot value的答案和正确的答案
         //3. 拿order=2 task=1的问题抛出来
         console.log("In the true fact gather intent");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const current_taskid = sessionAttributes.current_taskid;
            var current_answer_fact= getSlotValue(handlerInput.requestEnvelope, 'the_real_fact');   
            const current_workerids = sessionAttributes.current_workerid;
            var current_repeat = sessionAttributes.current_repeatime;
            var current_question_des;
            var order = sessionAttributes.current_order;

           
            var dingdongurl = '<audio  src="https://s3.amazonaws.com/dante.crowdsoucing.project/dingdong_voice.mp3"/>' ;

            proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,order,the_query_sub_task=>{


                //如果带practice则存进去
               
               if(the_query_sub_task.practice == false){
                //存进answer
                console.log("Store answer in the answer table start");
                let answerid = uuids.v4();
                var current_correction = compareSlots(current_answer_fact,the_query_sub_task.correct_answer);
                insertanswers.insertInAnswer(answerid,sessionAttributes.current_workerid,sessionAttributes.signin_Name,the_query_sub_task.subtaskId,sessionAttributes.current_taskid,current_correction,the_query_sub_task.task_difficulty,order);
                console.log("Store answer in the answer table end");
                console.log("here the query sub task is valiod 11111111111111111111");

               }
               
                //move to next questions
                sessionAttributes.current_order +=1;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
                var neworder = sessionAttributes.current_order;

                    
                   
                    //找到order 2 的全部信息并问下一个问题
                    //find the column of i+1 question and ask for the i+2
                    proptfirstQuestion.getQuestionBy_orderAndTask(current_taskid,neworder,the_second_query_sub_task=>{
                        if(the_second_query_sub_task)
                        {

                            console.log("Here's come's to asking the second function, the order is already plus one, current order is " +sessionAttributes.current_order);
                            //speakOutput = "Here is the question"+ sessionAttributes.current_order+": "+"<break time='1s'/>"+ "Please answer " + the_second_query_sub_task.subtaskname +"or say repeat to repeat the question !"
                       // +"<break time='2s'/>"+ the_second_query_sub_task.description;
                         speakOutput = "Here is the question"+ sessionAttributes.current_order +". " +"<break time='1s'/>"+"My  question is : "+"<break time='1s'/>"+the_second_query_sub_task.the_question+ "<break time='1s'/>"+" Here is the text: "+ the_second_query_sub_task.description+dingdongurl;

                        sessionAttributes.current_question_des =  the_second_query_sub_task.description+ "<break time='1s'/>" + "So ,"+"<break time='1s'/>" + the_second_query_sub_task.the_question+dingdongurl;
                        reprompt = "you should start with  'my answer is ' try again!" +  the_second_query_sub_task.description;   
                    
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

                                let sessionid = uuids.v1();
                                insert_session.insertInSessions(sessionid,sessionAttributes.signin_Name,current_workerids,"end", current_taskid,current_repeat );
                                console.log("session end is store with new repeat" + current_repeat);
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
                                sessionAttributes.current_repeatime = 0;
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














function getEditDistance(a, b) {
    if(a.length === 0) return b.length; 
    if(b.length === 0) return a.length; 
  
    var matrix = [];
  
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
  
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }
  
    return matrix[b.length][a.length];
  };









function compareSlots(slots, value) {
    const correction = {
        CORRECT: `correct`,
        INCORRECT: `incorrect`,
      };

        a = slots.toString().toLowerCase();
        b= value.toString().toLowerCase();
        console.log(a +"sssssssssssss " + b );
        if (a.indexOf(b) != -1 ){
          return correction.CORRECT;
        }

    return correction.INCORRECT;
  }




const RepeatHandler = {
    canHandle(handlerInput) {
      console.log("Inside RepeatHandler");
      var B= Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent' ;
      var C = Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
      console.log("in repeat "+ " "+B+" "+C);
  
      return Alexa.getRequestType(handlerInput.requestEnvelope) ==='IntentRequest'&&
             Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {

          return new Promise((resolve,reject)=>{
            //resolve the user name 
           
           
            console.log("Inside RepeatHandler - handle");
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            const question =sessionAttributes.current_question_des;
            const speakOutput = question;
            var current_repeat =  sessionAttributes.current_repeatime ;
            sessionAttributes.current_repeatime = current_repeat+1;
            console.log("you are repeat " + current_repeat+ " times!!!" );
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            console.log("come on let's repeat");
            const response = handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
        resolve(response);
        return;
    
        })
    }
  };



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
        RepeatHandler,
        YesOrNoanswerIntentHandler,
        FactGatherIntentHandler,
        Question_three_Handler,
        Question_Four_Handler,
        Question_Five_Handler,
        Question_Six_Handler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();
