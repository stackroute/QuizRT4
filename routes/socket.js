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
//   Name of Developers  Raghav Goel, Kshitij Jain, Lakshay Bansal, Ayush Jain, Saurabh Gupta, Akshay Meher
//                      + Anil Sawant

// var GameManager = require('./gameManager/GameManager.js'),
var GameManagerClass = require('./gameManager/gameManager.js'),
    GameManager = new GameManagerClass(),
    TournamentManager = require('./tournamentManager/tournamentManager.js'),
<<<<<<< HEAD
    clickStreamStat = require('./clickStreamStatistics'),
    PreserveGameData = require('./preserveGameData');
    var preserveData = new PreserveGameData();
module.exports = function(server,sessionMiddleware) {
=======
    NotificationManager = require('./notificationManager/notificationManager.js'),
    uuid= require('node-uuid');

module.exports = function(server,sessionMiddleware,redisClient) {
FriendsManager = require('./friendsManager.js')(redisClient);

>>>>>>> ec594d0d36d1093b1a48ae772d6d70cccce5e5cb
  var io = require('socket.io')(server);
  io.use(function(socket,next){
    sessionMiddleware(socket.request, socket.request.res, next);
  });
  io.on('disconnect',function(client){
    console.log( 'Server crashed. All the clients were disconnected from the server.');
  })

  var normalGameSocket = io
      .of('/normalGame')
      .on('connection', function(client) {
        if ( client.request.session && client.request.session.user ) {
          console.log( client.request.session.user + ' connected to QuizRT server. Socket Id: ' + client.id);
        }

        client.on('disconnect', function() {
          if ( client.request.session && client.request.session.user ) {
            GameManager.popPlayer( client.request.session.user ); // pop the user from all the games
            delUserTTLInfo(client.request.session.user);
            console.log( client.request.session.user + ' disconnected from QuizRT server. Socket Id: ' + client.id);
          }
        });
        client.on('logout', function( userData, done) {
          console.log( client.request.session.user + ' logged out.');
          done( GameManager.popPlayer( client.request.session.user ) );
          delUserTTLInfo(client.request.session.user);
          client.request.session.user = null;
      		client.request.logout();
        });
        client.on('getUrl',function(loggedInUser){
          var url;
          if(loggedInUser.userId==client.request.session.user){
             url = uuid.v1();
              console.log("uuuuuuu  rrrrrrrrrrrrrrrrrrr  llllllllllllllll"+url);
          }
          client.emit('catchUrl',url);
        });
        var gamesOnDemand=function(){
          this.gamesOnDemandAttr=[];

        };
        gamesOnDemand.prototype.addFriends=function(attr){
          this.gamesOnDemandAttr.push(attr);
        };
        gamesOnDemand.prototype.showFriends = function () {
          return this.gamesOnDemandAttr;
        };
        //var allFriends=[];

        //gamesOnDemandObj=new gamesOnDemand();
        //gamesOnDemandObj = null;
        client.on('sendInvitedFriends',function(data) {
          console.log(data, data.url);
          gamesOnDemandObj=new gamesOnDemand();
          expiredLink=false;
          if(data){
            gamesOnDemandObj.addFriends(data);
            console.log("inside socket-----------------friendzzzzzz"+data.invitedFriendsList.length);
            console.log(gamesOnDemandObj.gamesOnDemandAttr[0].invitedFriendsList, "Obj");
            console.log(Object.keys(gamesOnDemandObj), "Obj");
            console.log(data.url);
          }
          var temp=gamesOnDemandObj.showFriends();
          console.log("temp  inner"+temp.length);
         // end client-on-join
        });

        //on clicking on play with friends
        client.on('joinGamesOnDemand',function( playerData ) {
           console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId );

           // check if the user is authenticated and his session exists, if so add him to the game
           console.log("inside gamesOnDemand ---------------");
           if(playerData.firstUser){
             addPlayersToGame(playerData);
           }
           else{
           console.log(gamesOnDemandObj.gamesOnDemandAttr[0].invitedFriendsList);
           var friendsInGame=gamesOnDemandObj.showFriends();
           console.log(friendsInGame.length, friendsInGame, playerData, "everything");
           for(var friendList in friendsInGame){
               console.log(friendsInGame[friendList]);
             for(var friend in friendsInGame[friendList].invitedFriendsList){
               console.log(friend,"Inside Friend");
               if(friendsInGame[friendList].invitedFriendsList[friend] ==playerData.userId){
                  console.log("insidefinal");
                 addPlayersToGame(playerData);
               }
             }
           }
         }
           //addPlayersToGame(playerData);
         });


        client.on('join',function( playerData ) {
          console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId );
          // check if the user is authenticated and his session exists, if so add him to the game

          addPlayersToGame(playerData);
        }); // end client-on-join



        var addPlayersToGame=function(playerData){
          console.log("this is the current player-------------"+playerData);
          if ( client.request.session && (playerData.userId == client.request.session.user) ) {//req.session.user
            var gamePlayer = {
              userId: playerData.userId,
              playerName: playerData.playerName,
              playerPic: playerData.playerPic,
              score:0,
              client: client
            };
            var difficultyLevelTopic=[1,2,3,4,5];//for topics game fetch questions from all difficulty levels
            var addedSuccessfully = GameManager.managePlayer( playerData.topicId, playerData.levelId, playerData.playersPerMatch,playerData.url,gamePlayer,difficultyLevelTopic);
            if ( addedSuccessfully === false ) {
              console.log('User is already playing the game ' + playerData.topicId + '. Cannot add him again.');
              client.emit('alreadyPlayingTheGame', { topicId: playerData.topicId });
            }
          } else {
            console.log('User session does not exist for: ' + playerData.userId + '. Or the user client was knocked out.');
            client.emit( 'userNotAuthenticated' ); //this may not be of much use
          }
        };

        client.on('expiredLink',function (data) {

          console.log("I AM EXPIRED");
          if(data.expired){
            expiredLink=true;
          }
        });
        client.on('checkForExpireURL',function (data) {
          console.log("EXPIERED LINK----------"+expiredLink);
          if(expiredLink){
            console.log("Emitting EXPIERED LINK true----------"+expiredLink);
            client.emit('checkedURL',{'checkedURL':false});
          }
          else{
            console.log("Emitting EXPIERED LINK----------"+expiredLink);
            client.emit('checkedURL',{'checkedURL':true});
          }
        });

        client.on('confirmAnswer',function(data){
<<<<<<< HEAD
            // call save on collected  data
        //   var questionCount = GameManager.games.get( data.gameId ).questionCount;
        //   data.questionCount = questionCount;

          clickStreamStat.userAnalyticsSave(data,'quiz');
          preserveData.addVal(data);

          if(data.ans =='correct'){
            //increment correct of allplayers
            //decrement unsawered of all players
=======
          console.log("Dataaaa####!!!!!@@@@",data);
          console.log(new Date());
          console.log("Invookeddddddddd");
          console.log("Invoking Confirm Answer",data.selectedId);
          console.log(data.correctIndex);
          if (data.selectedId == data.correctIndex){
            // console.log();
            //increment correct of allplayers
            //decrement unsawered of all players
            GameManager.getGamePlayers(data.gameId).forEach( function( player, index) {

              if(player.userId==data.userId){
                console.log("insude if getGame..................................."+data.userId);
                player.score+=data.scopeTime+10;
                console.log("score is..................."+player.score);
                player.client.emit('highLightOption',{correct:true,myScore:player.score,correctInd:data.correctIndex});
              }

            });
>>>>>>> ec594d0d36d1093b1a48ae772d6d70cccce5e5cb
            GameManager.getGamePlayers(data.gameId).forEach(function(player){
              player.client.emit('isCorrect');
            });
          }
          else if (data.ans =='wrong'){
            //increment wrong of allplayers
            //decrement unsawered of all players
            GameManager.getGamePlayers(data.gameId).forEach(function( player, index) {
              if(player.userId==data.userId){
                player.score-=5;
                player.client.emit('highLightOption',{correct:false,myScore:player.score});
              }

            });
            GameManager.getGamePlayers(data.gameId).forEach(function(player){
              player.client.emit('isWrong');
            });
          }
        });

        client.on('updateStatus',function( gameData ){
          console.log("-----------------------"+new Date());
          console.log("Update Status Got Invvoked");
          GameManager.getGamePlayers(gameData.gameId).forEach( function( player, index) {
            if(player.userId==gameData.userId){
              console.log("updated game player.score......"+player.score);
              gameData.playerScore=player.score;
              console.log("updated game player score......"+gameData.playerScore);
            }
          });
          if ( client.request.session && gameData.userId == client.request.session.user ) {
            GameManager.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );

            var intermediateGameBoard = GameManager.getLeaderBoard( gameData.gameId ),
                myRank = 0,
                gameTopper = intermediateGameBoard[0];
            intermediateGameBoard.some( function(player, index ) {
              if ( player.userId == gameData.userId ) {
                myRank = index + 1;
                return true;
              }
            });
            GameManager.getGamePlayers(gameData.gameId).forEach( function( player, index) {
              player.client.emit('takeScore', {myRank: myRank, userId: client.request.session.user, topperScore:gameTopper.score, topperImage:gameTopper.playerPic });
            });
          } else {
            console.log('User session does not exist for the user: ' + gameData.userId );
          }
        });
        client.on( 'gameFinished', function( game ) {
<<<<<<< HEAD
            game.preserveObj=preserveData;
            game.gameClient = io.of('/normalGame');
            GameManager.finishGame( game );
            preserveData.show();
        //   initialize the obj again
        // var preserveData = new PreserveGameData();
        //   getUserAnalyticsForGame(client.request.session.user, game.gameId);
        // getUserAnalyticsForGame(client.request.session.user, game.topicId,'null');
        // getUserAnalyticsForGame(client.request.session.userId, game.gameId);
=======
          GameManager.finishGame( game );
>>>>>>> ec594d0d36d1093b1a48ae772d6d70cccce5e5cb
        });

        client.on('leaveGame', function( gameId ){
          GameManager.leaveGame( gameId, client.request.session.user );
          console.log("Leave called -------$$$$$$$$$$$");
        });

        client.on('getOnlineFriends', function(myuserId) {
          console.log("Get Online Friends for ", myuserId.userId);
          getOnlineFriends(client, myuserId.userId);
        });

      });// end normalGameSocket



      var tournamentSocket = io
          .of('/tournament')
          .on('connection', function(client) {
            if ( client.request.session && client.request.session.user ) {
              console.log( client.request.session.user + ' connected to QuizRT server. Tournament Socket Id: ' + client.id);
            }

            client.on('disconnect', function() {
              if ( client.request.session && client.request.session.user ) {
                TournamentManager.popPlayer( client.request.session.user );
              }
            });

            client.on('logout', function( userData, done) {
              console.log( client.request.session.user + ' logged out.');
              if ( client.request.session && client.request.session.user ) {
                TournamentManager.popPlayer( client.request.session.user );
                client.request.session.user = null;
              }
          		client.request.logout();
            });

            client.on('joinTournament',function( playerData ) {
              levelMultiplier = playerData.levelMultiplier;
              console.log( playerData.userId + ' joined. Wants to play ' + playerData.topicId + ' of tournament ' + playerData.levelId  );

              if ( client.request.session && (playerData.userId == client.request.session.user) ) {//req.session.user
                var gamePlayer = {
                  userId: playerData.userId,
                  playerName: playerData.playerName,
                  playerPic: playerData.playerPic,
                  score:0,
                  client: client
                };

                var addedSuccessfully = TournamentManager.managePlayer( playerData, gamePlayer ); // add the player against the topicId.
                if ( addedSuccessfully === false ) {
                  console.log('User is already playing the game ' + playerData.topicId + ' of ' + playerData.tournamentId + '. Cannot add him again.');
                  client.emit('alreadyPlayingTheGame', { levelId: playerData.levelId, tournamentId: playerData.tournamentId, topicId: playerData.topicId });
                }
              } else {
                console.log('User session does not exist for: ' + playerData.userId + '. Or the user client was knocked out.');
                client.emit( 'userNotAuthenticated' ); //this may not be of much use
              }
            }); // end client-on-joinTournament


            client.on('confirmAnswer',function( data ){
<<<<<<< HEAD
                // var gm = TournamentManager.getGameManager( data.tournamentId )
                // var questionCount = gm.games.get( data.gameId ).questionCount;
                // data.questionCount = questionCount;
                clickStreamStat.userAnalyticsSave(data,'tournament');
                preserveData.addVal(data);
              if(data.ans == 'correct') {
=======
              //console.log("Printingg Data Blahhhhh",data);
              console.log("Invoking Confirm Answer",data.selectedId);
              console.log(data.correctIndex, typeof(data.selectedId), typeof(data.correctIndex));
              if(data.selectedId == data.correctIndex) {
>>>>>>> ec594d0d36d1093b1a48ae772d6d70cccce5e5cb
                var gameManager = TournamentManager.getGameManager( data.tournamentId ),
                    gamePlayers = gameManager ? gameManager.getGamePlayers( data.gameId ) : null ;
                  gamePlayers.forEach( function( player, index) {
                    console.log("------------------------   ------------------------------------   ------------------------------------"+player.userId+" "+player.score);
                      if(player.userId===data.userId){
                        console.log("inside if getGameTournament...................................");
                        player.score+=data.responseTime+10;
                        console.log("tournament score is..................."+player.score);
                        player.client.emit('highLightOption',{correct:true,myScore:player.score,correctInd:data.correctIndex});
                      }

                    });
                if ( gamePlayers && gamePlayers.length ) {
                  gamePlayers.forEach( function(player, index) {
                    player.client.emit('isCorrect');
                  });
                } else {
                  console.log('ERROR: Cannot find the gameManager for ' + data.tournamentId );
                }
              } else {
                var gameManager = TournamentManager.getGameManager( data.tournamentId ),
                     gamePlayers = gameManager ? gameManager.getGamePlayers( data.gameId ) : null ;
                    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"+gamePlayers);
                    gamePlayers.forEach(function( player, index) {
                      console.log('player info'+player.userId);
                      if(player.userId===data.userId){
                        player.score-=5;
                        player.client.emit('highLightOption',{correct:false,myScore:player.score,correctInd:data.correctIndex});
                      }

                    });
                if ( gamePlayers && gamePlayers.length ) {
                  gamePlayers.forEach( function(player) {
                    player.client.emit('isWrong');
                  });
                } else {
                  console.log('ERROR: Cannot find the gameManager for ' + data.tournamentId );
                }
              }
            });

            client.on('updateStatus',function( gameData ){
              var gameManager = TournamentManager.getGameManager( gameData.tournamentId ),
                  gamePlayers = gameManager ? gameManager.getGamePlayers( gameData.gameId ) : null ;
                  gamePlayers.forEach(function( player, index) {
                    if(player.userId==gameData.userId){
                      if (levelMultiplier && player.score>0) {
                        gameData.playerScore=player.score * levelMultiplier;
                      }else {
                        gameData.playerScore = player.score;
                      }
                    }
                  });

              if ( gameManager ) {
                gameManager.updateScore( gameData.gameId, gameData.userId, gameData.playerScore );
                var intermediateGameBoard = gameManager.getLeaderBoard( gameData.gameId ),
                    myRank = 0,
                    gameTopper = intermediateGameBoard[0];
                intermediateGameBoard.some( function(player, index ) {
                  if ( player.userId == gameData.userId ) {
                    myRank = index + 1;
                    // gameData.playerScore = player.score ;
                    return true;
                  }
                });
                if ( gamePlayers && gamePlayers.length ) {
                  gamePlayers.forEach( function( player, index) {

                  if (levelMultiplier && gameTopper.score>0) {
                    tempTopperScore = gameTopper.score/levelMultiplier;
                  }else {
                     tempTopperScore =  gameTopper.score;
                    }
                    player.client.emit('takeScore', {myRank: myRank, userId: client.request.session.user, topperName:gameTopper.playerName, topperScore:tempTopperScore, topperImage:gameTopper.playerPic });
                  });
                }
              } else {
                console.log('ERROR:UPDATE - Cannot find the gameManager for ' + gameData.tournamentId );
              }
            });

            client.on( 'gameFinished', function( finishGameData ) {
              TournamentManager.finishGame( finishGameData );
              console.log("Showing preserved data --->>>>>");
              preserveData.show();
            //   initialize the obj again
            // var preserveData = new PreserveGameData();
            });


            client.on('leaveGame', function( gameData, done ){
              var gameManager = TournamentManager.getGameManager( gameData.tournamentId );
              if( gameManager ) {
                gameManager.leaveGame( gameData.gameId, client.request.session.user );
                done( {error:null} );
              } else {
                console.log('ERROR: Failed to find the gameManager for ' + gameData.tournamentId );
                done( {error: 'Could not leave the game.'} );
              }
            });
          });// end tournament socket

       var notificationSocket = io
          .of('/notification')
          .on('connection', function(client) {
            client.on('respond:to:frndreq',function(data){
              console.log('recieved a notification');
            });
 
            client.on('getMyNotifications', function(userId) {
              console.log("Get Notification for User", userId);
              NotificationManager.getNotifications(userId, client);
            });
 
            client.on('sendInvitedFriends', function(data) {
              NotificationManager.inviteFriendsToPlay(data, client);
            });

            client.on('sendFriendRequest', function(data) {
              NotificationManager.handleFriendRequest(data, client);
            });
             
            client.on('response', function(data) {
              NotificationManager.handleResponse(data, client);
            });
        });

      /*Storing User Activity in Redis */
      var activeSessionTimeout = 300 /* 5 mins */

      /*Delete user infor from Redis */
      var delUserTTLInfo = function(user) {
         var redisKey = "User:"+user;

         redisClient.del(redisKey, function(err, result) {
             if (err)
              console.log(err, result);
         });
      };

      /*Refresh User Info */
      refreshUserTTL = function(user, next) {
        var redisKey = "User:"+user;
        redisClient.setex(redisKey, activeSessionTimeout, "Active", function(err, result) {
           next();
        });
     };
}
