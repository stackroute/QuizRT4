var mongoose = require('mongoose'),
    badgesRulesSchema=mongoose.Schema({
      level:[
        {
          levelName:String,
          subLevel:[
            {
              subLevelName:String,
              badgesInfo:[
                {
                  "badgeId":String,
                  "badgeName":String,
                  "badgeUrl":String,
                  "rule":{
                    "currentGameCorrectAnsCount":Number,
                    "totalGameCorrectAnsCount":Number,
                    "totalWinCount":Number,
                    "avgResponseSpeedCorrectQues":Number,
                    "winStreak":Number,
                    "dayStreak":Number,
                    "currentScore":Number,
                    "totalScore":Number,
                    "topicId":Number,
                    "topicName":Number
                  }
                }
              ]
            }
          ]
        }
      ]
    });
module.exports=badgesRulesSchema;
