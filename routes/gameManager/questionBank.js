//Copyright {2016} {NIIT Limited, Wipro Limited}
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
//   Name of Developers  Anil Sawant

var Reservoir = require('reservoir'),
    Question = require("../../models/question.js"),
    questionPaper = require('../../models/questionPaper.js'),
    Q = require('q');
module.exports = {
  getQuizQuestions: function( topicId, difficultyLevel, noOfQs, done ) {
    if ( isNaN(noOfQs) ) {
      done( 'noOfQs is not a number', null );
    } else {
      Question.find( {$and:[{topicId:topicId},{difficultyLevel:{$in:difficultyLevel}}]} ) // retrieve questions from Question collection for topicId
      .exec( function(err, questions) {
        if ( err ) {
          done( 'Questions cannot be read from mongo.', null );
        } else {
          var myReservoir = Reservoir( noOfQs ),
              fewQuestions = [];

          questions.forEach(function(e) {
            myReservoir.pushSome(e);
          });

          for (var i = 0; i < noOfQs; i++) {
            fewQuestions.push(myReservoir[i]);
          }
          fewQuestions[0] ? done( null, fewQuestions) : done( 'No Questions in QuestionBank for ' + topicId + '.', null ); // if no questions send null else send the questions
        }
      });
    }
  }
}




//   getQuestionIds:function(questionPaperName) {
//     var def = Q.defer();
//     questionPaper.find({'Name':questionPaperName})
//                    .select('Question')
//                    .exec(function(err,selectedQuestions){
//                      if(err){
//                        return response.send(err);
//                      }
//                      else{
//                        def.resolve(selectedQuestions);
//                        return def.promise;
//                      }
//                    });
//                  },
//
//   getQuestionsPrebuild:function( topicId,selectedQuestions, noOfQs, done ){
//     if ( isNaN(noOfQs) ) {
//       done( 'noOfQs is not a number', null );
//     } else {
//       Question.find( {questionId:{$in:selectedQuestions}} ) // retrieve questions from Question collection for topicId
//       .exec( function(err, questions) {
//         if ( err ) {
//           done( 'Questions cannot be read from mongo.', null );
//         } else {
//           var myReservoir = Reservoir( noOfQs ),
//               fewQuestions = [];
//
//           questions.forEach(function(e) {
//             myReservoir.pushSome(e);
//           });
//
//           for (var i = 0; i < noOfQs; i++) {
//             fewQuestions.push(myReservoir[i]);
//           }
//           fewQuestions[0] ? done( null, fewQuestions) : done( 'No Questions in QuestionBank for ' + topicId + '.', null ); // if no questions send null else send the questions
//         }
//       });
//     }
//   }
// }
