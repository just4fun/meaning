angular.module("posts-list", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/posts", {
      templateUrl: "/modules/posts/list/index.html",
      controller: "PostsListCtrl"
    }).when("/posts/author/:author", {
      templateUrl: "/modules/posts/list/index.html",
      controller: "AuthorPostsListCtrl"
    }).when("/posts/tag/:tag", {
      templateUrl: "/modules/posts/list/index.html",
      controller: "TagPostsListCtrl"
    }).when("/posts/categories/:category", {
      templateUrl: "/modules/posts/list/index.html",
      controller: "CategoryPostsListCtrl"
    });
  }
]).controller("PostsListCtrl", [
  "$scope", "$http", "$rootScope", "progress", function($scope, $http, $rootScope, progress) {
    $rootScope.title = "Posts";
    $scope.isAllList = true;
    progress.start();
    return $http.get("" + MEANING.ApiAddress + "/posts/list/Published").success(function(data) {
      $scope.posts = data;
      return progress.complete();
    });
  }
]).controller("AuthorPostsListCtrl", [
  "$scope", "$http", "$rootScope", "$routeParams", "progress", function($scope, $http, $rootScope, $routeParams, progress) {
    var author;
    author = $routeParams.author;
    $rootScope.title = "Posts of Author '" + author + "'";
    $scope.isAllList = false;
    $scope.filterText = "Author";
    $scope.filter = author;
    progress.start();
    return $http.get("" + MEANING.ApiAddress + "/posts/author/" + author).success(function(data) {
      $scope.posts = data;
      return progress.complete();
    });
  }
]).controller("TagPostsListCtrl", [
  "$scope", "$http", "$rootScope", "$routeParams", "progress", function($scope, $http, $rootScope, $routeParams, progress) {
    var tag;
    tag = $routeParams.tag;
    $rootScope.title = "Posts of Tag '" + tag + "'";
    $scope.isAllList = false;
    $scope.filterText = "Tag";
    $scope.filter = tag;
    progress.start();
    return $http.get("" + MEANING.ApiAddress + "/posts/tag/" + tag).success(function(data) {
      $scope.posts = data;
      return progress.complete();
    });
  }
]).controller("CategoryPostsListCtrl", [
  "$scope", "$http", "$rootScope", "$routeParams", "progress", function($scope, $http, $rootScope, $routeParams, progress) {
    var category;
    category = $routeParams.category;
    $rootScope.title = "Posts of Category '" + category + "'";
    $scope.isAllList = false;
    $scope.filterText = "Category";
    $scope.filter = category;
    progress.start();
    return $http.get("" + MEANING.ApiAddress + "/posts/categories/" + category).success(function(data) {
      $scope.posts = data;
      return progress.complete();
    });
  }
]);
