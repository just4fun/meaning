angular.module("admin-users", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/users", {
      templateUrl: "/admin/modules/users/index.html",
      controller: "AdminUsersCtrl",
      resolve: {
        check: [
          "$q", "$http", "$rootScope", "$location",
          function($q, $http, $rootScope, $location) {
            if ($rootScope._loginUser.Role !== "Admin") {
              return $location.path("/");
            }
          }
        ]
      }
    });
  }
]).controller("AdminUsersCtrl", [
  "$scope", "$http", "$rootScope", "$cookies", "messenger", "progress",
  function($scope, $http, $rootScope, $cookies, messenger, progress) {
    $rootScope.title = "Users";

    $scope.create = function() {
      $scope.modalTitle = "Create";
      $scope.iconDialog = true;
    };

    $scope.close = function() {
      $scope.iconDialog = false;
      $scope.entity = null;
    };

    $scope.edit = function(user) {
      $scope.entity = angular.copy(user);
      $scope.modalTitle = "Update";
      $scope.iconDialog = true;
    };

    $scope.del = function(user) {
      messenger.confirm(function() {
        progress.start();
        $http["delete"]("" + MEANING.ApiAddress + "/users/" + user._id, {
          headers: {
            "meaning-token": $cookies.get("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete user successfully!");
          $scope.getUserList(1);
        }).error(function(err) {
          progress.complete();
        });
      });
    };

    $scope.save = function() {
      // Update
      if ($scope.entity._id) {
        if ($scope.entity.NewPassword && !$scope.entity.RePassword) {
          messenger.error("Please confirm Password.");
          return;
        }
        if ($scope.entity.NewPassword && $scope.entity.RePassword && $scope.entity.NewPassword !== $scope.entity.RePassword) {
          messenger.error("The RePassword mismatch Password.");
          return;
        }

        $scope.entity.EditUser = $rootScope._loginUser.UserName;
        $scope.entity.EditDate = new Date();
        $scope.entity.Password = $scope.entity.NewPassword;
        delete $scope.entity.RePassword;

        progress.start();
        return $http.put("" + MEANING.ApiAddress + "/users/" + $scope.entity._id, $scope.entity, {
          headers: {
            "meaning-token": $cookies.get("meaning-token")
          }
        }).success(function(data) {
          // update cookie and global variable
          if ($scope.entity._id === $rootScope._loginUser._id) {
            var user = angular.fromJson($cookies.get("CurrentUser"));
            user.UserName = $scope.entity.UserName;
            user.Email = $scope.entity.Email;
            /**
             * if update role here, a user from admin to author will own no right immediately
             * user.Role = $scope.entity.Role
             */
            $cookies.put("CurrentUser", angular.toJson(user), {
              expires: 180,
              path: "/"
            });
            // update global variable
            $rootScope._loginUser = angular.fromJson($cookies.get("CurrentUser"));
          }

          messenger.success("Update user successfully!");
          $scope.close();
          $scope.getUserList($scope.currentPage);
        }).error(function(err) {
          progress.complete();
        });
      }

      // Create
      else {
        if (!$scope.entity.NewPassword) {
          messenger.error("Password is required.");
          return;
        }
        if (!$scope.entity.RePassword) {
          messenger.error("Please confirm Password.");
          return;
        }
        if ($scope.entity.NewPassword !== $scope.entity.RePassword) {
          messenger.error("The RePassword mismatch Password .");
          return;
        }

        $scope.entity.Password = $scope.entity.NewPassword;
        delete $scope.entity.RePassword;

        progress.start();
        $http.post("" + MEANING.ApiAddress + "/users", $scope.entity, {
          headers: {
            "meaning-token": $cookies.get("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Create user successfully!");
          $scope.close();
          $scope.getUserList(1);
        }).error(function(err) {
          progress.complete();
        });
      }
    };

    $scope.getUserList = function(page) {
      progress.start();
      $scope.currentPage = page;
      $http.get("" + MEANING.ApiAddress + "/users?pageIndex=" + (page - 1), {
        headers: {
          "meaning-token": $cookies.get("meaning-token")
        }
      }).success(function(data) {
        $scope.users = data.list;
        $scope.totalCount = data.totalCount;
        progress.complete();
      });
    };

    $scope.getUserList(1);
  }
]);
