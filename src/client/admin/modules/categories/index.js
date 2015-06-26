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
  "$scope", "$http", "$rootScope", "messenger", "progress",
  function($scope, $http, $rootScope, messenger, progress) {
    $rootScope.title = "Categories";

    $scope.create = function() {
      $scope.modalTitle = "Create";
      $scope.iconDialog = true;
    };

    $scope.close = function() {
      $scope.iconDialog = false;
      $scope.entity = null;
    };

    $scope.edit = function(category) {
      $scope.entity = angular.copy(category);
      $scope.modalTitle = "Update";
      $scope.iconDialog = true;
    };

    $scope.del = function(category) {
      return messenger.confirm(function() {
        progress.start();
        $http["delete"]("" + MEANING.ApiAddress + "/categories/" + category._id, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Delete category successfully!");
          $scope.getCategoryList(1);
          progress.complete();
        }).error(function(err) {
          progress.complete();
        });
      });
    };

    $scope.save = function() {
      progress.start();

      // Update
      if ($scope.entity._id) {
        $scope.entity.EditUser = $rootScope._loginUser.UserName;
        $scope.entity.EditDate = new Date();
        $http.put("" + MEANING.ApiAddress + "/categories/" + $scope.entity._id, $scope.entity, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Update category successfully!");
          $scope.close();
          $scope.getCategoryList($scope.currentPage);
        }).error(function(err) {
          progress.complete();
        });
      }

      // Create
      else {
        $scope.entity.CreateUser = $rootScope._loginUser.UserName;
        $http.post("" + MEANING.ApiAddress + "/categories", $scope.entity, {
          headers: {
            "meaning-token": $.cookie("meaning-token")
          }
        }).success(function(data) {
          messenger.success("Create category successfully!");
          $scope.close();
          $scope.getCategoryList(1);
        }).error(function(err) {
          progress.complete();
        });
      }
    };

    $scope.getCategoryList = function(page) {
      progress.start();
      $scope.currentPage = page;
      $http.get("" + MEANING.ApiAddress + "/categories?pageIndex=" + (page - 1), {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        $scope.categories = data.list;
        $scope.totalCount = data.totalCount;
        progress.complete();
      });
    };

    $scope.getCategoryList(1);
  }
]);
