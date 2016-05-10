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
//   limitations under t`he License.
//

angular.module('quizRT')
  .directive('fileUpload', ['$parse', function($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('change', function() {
          scope.$apply(function() {
            scope.imageFile = element[0].files[0];
          });
        });
      }
    }
  }]);


angular.module('quizRT')
  .controller('tournamentCreationController', ['$scope', '$http', '$rootScope', '$location',
    function($scope, $http, $rootScope, $location) {
      $rootScope.stylesheetName = "tournamentCreation";
      $scope.levelsArray = ["Level 1"];
      $scope.levelTopicArray = [];
      $scope.questionPaperArray = [];
            $http.get('/topicsHandler/topics')
        .then(
          function(successResponse) {

            $scope.topics = successResponse.data;
            $scope.initialTopic = $scope.topics[0].topicName;

          },
          function(errorResponse) {
            console.log('Error in fetching topics.');
            console.log(errorResponse.status);
            console.log(errorResponse.statusText);

          }
        );
      //stub for diff level.
      $scope.difficultyLevels = [1, 2, 3, 4, 5];
    //  $scope.questionPaper='';
      $scope.slider = [{
          minValue: 0,
          maxValue: 10,
          options: {
            floor: 0,
            ceil: 10,
            step: 1
          }
        }];
      //console.log($scope.slider.minValue);
      //stub for  level mux.
      $scope.levelMultiplier = [1, 2, 3, 4, 5];
      $scope.addLevels = function(levelIndex) {
        console.log('here add level');
        //$scope.levelsArray.push("Level " + ($scope.levelsArray.length + 1));

      //  $scope.levelTopicArray[]
      var tempObj = {
          minValue: 0,
          maxValue: 10,
          options: {
            floor: 0,
            ceil: 10,
            step: 1
          }
        };
      $scope.slider.push(tempObj);
      };

      $scope.deleteLevels = function(levelIndex) {

      };
      //
      $scope.selectionChange = function(value, index,key) {
        //key=T1;
        if(key=="isRandom"){
          var tempObj = {
              minValue: 0,
              maxValue: 10,
              options: {
                floor: 0,
                ceil: 10,
                step: 1
              }
            };
          $scope.slider.push(tempObj);
        }

        console.log("value is "+typeof(value));
        console.log(index);
        $scope.levelTopicArray[index] = $scope.levelTopicArray[index] || {};
        console.log($scope.levelTopicArray[index]);
        $scope.levelTopicArray[index][key] = value;
        if(key=='topicId'){
        $http.get('/questionPaperRetriever/getQPaper/' + value)
             .then(function(successResponse){
                   console.log(successResponse.data);//to pe replaced By appropriate array assignment operation
                   $scope.questionPaper=successResponse.data;
               });
             }
      };
      //ng-model="initialTopic.tournamentType"
      $scope.createTournament = function(tournament) {

        var isValidTournament = validateTournament(tournament);
        if (isValidTournament) {
          tournament.levelTopicArray = $scope.levelTopicArray;
          var formData = new FormData();

          formData.append('data', JSON.stringify(tournament));
          formData.append('file', $scope.imageFile);

          $http.post('tournamentHandler/createTournament', formData, {
              headers: {
                'Content-Type': undefined
              }
            })
            .then(
              function(successResponse) {
                var tournamentId = successResponse.data.tournamentId;
                $location.path("/tournament/" + tournamentId);

              }, // end successCallback
              function(errorResponse) {
                console.log('Error occurred while creating Tournament');
                console.log(errorResponse.error);
                alert(errorResponse.error);
              } //end errorCallback
            );

        }



      }

      $scope.reset = function(form) {
        if (form) {
          form.$setPristine();
          form.$setUntouched();
        }
        $scope.user = {};
      };

      validateTournament = function(tournament) {

        var isValidTournament = false;


        if (!tournament || !tournament.title) {
          alert("Please provide title for the tournament.");

        } else if (!$scope.imageFile) {
          alert("Please choose image file for the tournament.");

        } else if ($scope.levelTopicArray.length == 0) {
          alert("Please select topic for each level");

        } else if (!tournament.playersPerMatch || (tournament.playersPerMatch < 2)) {
          alert("Please provide players required for each match. Minimum of 2 players are required.");

        } else {
          isValidTournament = true;
        }

        return isValidTournament;



      }


    }
  ]);
