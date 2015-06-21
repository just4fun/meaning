angular.module("admin-users", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/users", {
      templateUrl: "/admin/modules/users/index.html",
      controller: "AdminUsersCtrl",
      resolve: {
        check: [
          "$q", "$http", "$rootScope", "$location", function($q, $http, $rootScope, $location) {
            if ($rootScope._loginUser.Role !== "Admin") {
              return $location.path("/");
            }
          }
        ]
      }
    });
  }
]).controller("AdminUsersCtrl", [
  "$scope", "$http", "$rootScope", "messenger", "progress", function($scope, $http, $rootScope, messenger, progress) {
    $rootScope.title = "Users";
    $scope.create = function() {
      $scope.modalTitle = "Create";
      return $scope.iconDialog = true;
    };
    $scope.close = function() {
      $scope.iconDialog = false;
      return $scope.entity = null;
    };
    $scope.edit = function(user) {
      $scope.entity = angular.copy(user);
      $scope.modalTitle = "Update";
      return $scope.iconDialog = true;
    };
    $scope.del = function(user) {
      return messenger.confirm(function() {
        progress.start();
        return $http["delete"]("" + MEANING.ApiAddress + "/users/" + user._id, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete user successfully!");
          return $scope.getUserList(1);
        }).error(function(err) {
          return progress.complete();
        });
      });
    };
    $scope.save = function() {
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
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          var user;
          if ($scope.entity._id === $rootScope._loginUser._id) {
            user = angular.fromJson($.cookie("CurrentUser"));
            user.UserName = $scope.entity.UserName;
            user.Email = $scope.entity.Email;
            $.cookie("CurrentUser", angular.toJson(user), {
              expires: 180,
              path: "/"
            });
            $rootScope._loginUser = angular.fromJson($.cookie("CurrentUser"));
          }
          messenger.success("Update user successfully!");
          $scope.close();
          return $scope.getUserList($scope.currentPage);
        }).error(function(err) {
          return progress.complete();
        });
      } else {
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
        return $http.post("" + MEANING.ApiAddress + "/users", $scope.entity, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Create user successfully!");
          $scope.close();
          return $scope.getUserList(1);
        }).error(function(err) {
          return progress.complete();
        });
      }
    };
    $scope.getUserList = function(page) {
      progress.start();
      $scope.currentPage = page;
      return $http.get("" + MEANING.ApiAddress + "/users?pageIndex=" + (page - 1), {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        $scope.users = data.list;
        $scope.totalCount = data.totalCount;
        return progress.complete();
      });
    };
    return $scope.getUserList(1);
  }
]);
