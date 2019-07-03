// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var ioniczApp = angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.

    // if (window.cordova && window.Keyboard) {
    //   window.Keyboard.hideKeyboardAccessoryBar(true);
    // }

    if (window.cordova && window.cordova.plugins.Keyboard) {
      //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
});


angular.module('starter')

.constant('ROUTE_ACCESS', {
	'PUBLIC' : 'public',
	'CHECK_TEST' : 'check_test'
})

.config(function($stateProvider, $urlRouterProvider, ROUTE_ACCESS) {
	
	$stateProvider
	
	// .state('login', {
	// 	url: '/login',
	// 	cache: false,
  //   	data : {access : ROUTE_ACCESS.PUBLIC},
  //   	templateUrl: 'views/login/login.html',
  //   	controller: 'LoginCtrl'
  //   })
    
  // .state('reg', {
  // url: '/reg',
  // cache: false,
  //   data : {access : ROUTE_ACCESS.PUBLIC},
  //   templateUrl: 'views/login/reg.html',
  //   controller: 'RegCtrl'
  // })
	
	.state('/home', {
		url: '/home',
		cache: false,
		data : {access : ROUTE_ACCESS.PUBLIC},
    templateUrl: 'view/home.html',
		controller: 'HomeCtrl'
  })

  .state('/submit', {
		cache: false,
    url: '/submit/:sub_data',
    templateUrl: 'view/submit.html',
    controller:'SubCtrl'
  })

  $urlRouterProvider.otherwise('/home');
});

angular.module('starter.controllers', [])

.controller('HomeCtrl', function($rootScope, $log, $scope, $state, $location, $ionicPopup, $ionicHistory, My) {

	$log.debug("HomeCtrl...");

  $rootScope.myValue = true;
  $scope.queue_count = My.info.length;

	$ionicHistory.nextViewOptions({
		disableAnimate: true
  });
  
  $scope.getDataFromScan = function(arg) {

    $scope.msg = arg;
    var arg2 = "";
    var splitArray = arg.split(";");
    for(var i=0;i<splitArray.length;i++){
      arg2 = arg2 + splitArray[i] + ";\n";
    }
    
    My.appendInfo(arg2);

    $scope.queue_count = My.info.length;

    var alertPopup = $ionicPopup.alert({
      title: 'Content',
      template: arg2
    });
    alertPopup.then(function(res) {
      console.log('Scanned result!');
    });
    $log.debug("DENUG: " + My.info);
    // $state.go("/submit");
  }

  $scope.sendData = function(){
    var temp_txt = ""
    for(var i=0; i<My.info.length; i++){
      temp_txt = temp_txt + "QR_" + (i+1).toString() + "\n" + My.info[i] + "\n\n";
    }
    My.tinfo = temp_txt;
    $state.go("/submit");
  }

  $scope.clearQueue = function(){
    $scope.$apply(function(){
      My.info = [];
      $scope.queue_count = 0;
    });
  }
	
})

.controller('SubCtrl', function($rootScope, $scope, $http, $stateParams, $timeout, $ionicPopup, $ionicHistory, My, $log, $ionicModal, $interval) {

	$ionicHistory.nextViewOptions({
		disableAnimate: true
	});

  $scope.subtext = My.tinfo;
  $scope.addtext = "";
  $scope.csrdata = "Cindy";

  $scope.SubmitF = function(){
    $log.debug($scope.subtext);
    $log.debug($scope.addtext);
    $log.debug($scope.csrdata);

    var qrjson = {};
    for(var i=0; i<My.info.length; i++){
      qrjson["QR_"+(i+1).toString()] = My.info[i];
    }

    var params = {};
    params["qrcode"] = qrjson;
    params["csrdata"] = $scope.csrdata;
    params["addtext"] = $scope.addtext;

    $log.debug("PARAMS:");
    $log.debug(params);
    $log.debug("PARAMS:");

    var method = 'POST';
    var base_url = 'https://httpbin.org/post';
    var req = {method: method, url: base_url, headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}};

    // var token = My.info.token;

    // if(token) {
    //   params['x-session-token'] = token;
    // }
    
    if(method.toLocaleUpperCase() == 'POST') {
      req['data'] = params;
    }
    else {
      req['params'] = params;
    }

    $http(req).success(function(data) {
      $log.debug(data);
      $ionicPopup.alert({
        title: 'POST Success!',
        template: JSON.stringify(data),
        buttons: [
        {
          text: '<b>OK</b>',
          onTap: function() {
            console.log('shown');
            // $localStorage.popupShown = true;
          }
        }]
      });
    }).error(function(data, status, header, config) {
      if(status == 403) {
        $log.debug("403 Error!");
        $ionicPopup.alert({
          title: 'POST Error(403)!',
          template: 'It might taste good',
          buttons: [
          {
            text: '<b>OK</b>',
            onTap: function() {
              console.log('shown');
              // $localStorage.popupShown = true;
            }
          }]
        });
      }
    });

  }
})

angular.module('starter.services', [])

.service('My', function($rootScope, $location, $interval, $log) {
	var self = this;
  this.info = [];
  this.tinfo = "";

  this.getInfo = function() {
		return this.info;
  };

  this.clearInfo = function() {
    self.info = [];
    self.tinfo = "";
  };

  this.appendInfo = function(txt){
    self.info.push(txt);
  }
})