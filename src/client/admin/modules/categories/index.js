angular.module("admin-categories", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/categories", {
      templateUrl: "/admin/modules/categories/index.html",
      controller: "AdminCategoriesCtrl",
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
]).controller("AdminCategoriesCtrl", [
  "$scope", "$http", "$rootScope", "messenger", "progress", function($scope, $http, $rootScope, messenger, progress) {
    $rootScope.title = "Categories";
    $scope.create = function() {
      $scope.modalTitle = "Create";
      return $scope.iconDialog = true;
    };
    $scope.close = function() {
      $scope.iconDialog = false;
      return $scope.entity = null;
    };
    $scope.edit = function(category) {
      $scope.entity = angular.copy(category);
      $scope.modalTitle = "Update";
      return $scope.iconDialog = true;
    };
    $scope.del = function(category) {
      return messenger.confirm(function() {
        progress.start();
        return $http["delete"]("" + MEANING.ApiAddress + "/categories/" + category._id, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete category successfully!");
          $scope.getCategoryList(1);
          return progress.complete();
        }).error(function(err) {
          return progress.complete();
        });
      });
    };
    $scope.save = function() {
      progress.start();
      if ($scope.entity._id) {
        $scope.entity.EditUser = $rootScope._loginUser.UserName;
        $scope.entity.EditDate = new Date();
        return $http.put("" + MEANING.ApiAddress + "/categories/" + $scope.entity._id, $scope.entity, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Update category successfully!");
          $scope.close();
          return $scope.getCategoryList($scope.currentPage);
        }).error(function(err) {
          return progress.complete();
        });
      } else {
        $scope.entity.CreateUser = $rootScope._loginUser.UserName;
        return $http.post("" + MEANING.ApiAddress + "/categories", $scope.entity, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Create category successfully!");
          $scope.close();
          return $scope.getCategoryList(1);
        }).error(function(err) {
          return progress.complete();
        });
      }
    };
    $scope.getCategoryList = function(page) {
      progress.start();
      $scope.currentPage = page;
      return $http.get("" + MEANING.ApiAddress + "/categories?pageIndex=" + (page - 1), {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        $scope.categories = data.list;
        $scope.totalCount = data.totalCount;
        return progress.complete();
      });
    };
    return $scope.getCategoryList(1);
  }
]);
