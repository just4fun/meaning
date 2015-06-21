angular.module("admin-posts-detail", []).config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/posts/new", {
      templateUrl: "/admin/modules/posts/detail/index.html",
      controller: "AdminPostsNewCtrl",
      resolve: {
        categories: [
          "$q", "$http", function($q, $http) {
            var deferred;
            deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/categories").success(function(data) {
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ]
      }
    }).when("/posts/:url", {
      templateUrl: "/admin/modules/posts/detail/index.html",
      controller: "AdminPostsDetailCtrl",
      resolve: {
        categories: [
          "$q", "$http", function($q, $http) {
            var deferred;
            deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/categories").success(function(data) {
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ],
        post: [
          "$q", "$http", "$route", "$rootScope", "$location", function($q, $http, $route, $rootScope, $location) {
            var deferred;
            deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/" + $route.current.params.url, {
              headers: {
                "from-admin-console": true
              }
            }).success(function(data) {
              var currentUser;
              currentUser = $rootScope._loginUser;
              if (currentUser.Role !== "Admin" && currentUser.UserName !== data.Author.UserName) {
                $location.path("/");
                return;
              }
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ]
      }
    });
  }
]).controller("AdminPostsNewCtrl", [
  "$scope", "$http", "$rootScope", "$window", "messenger", "categories", "$location", "progress", function($scope, $http, $rootScope, $window, messenger, categories, $location, progress) {
    var save;
    $rootScope.title = "Add New Post";
    $scope.categories = categories.list;
    $scope.submitText = "Publish";
    $scope.post = {
      AllowComments: true
    };
    $scope.publish = function() {
      return save("Published");
    };
    $scope.saveDraft = function() {
      return save("Draft");
    };
    return save = function(status) {
      var tempPost;
      tempPost = angular.copy($scope.post);
      if (tempPost.Url.toLowerCase() === "count") {
        messenger.error("The post url can not be 'count'.");
        return;
      }
      if (!tempPost.Content) {
        messenger.error("Post content is required.");
        return;
      }
      tempPost.Status = status;
      tempPost.Category = tempPost.Category._id;
      tempPost.Author = $rootScope._loginUser._id;
      progress.start();
      return $http.post("" + MEANING.ApiAddress + "/posts", tempPost, {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        progress.complete();
        if (status === "Published") {
          return $window.location.href = "/#!/posts/" + data.Url;
        } else {
          messenger.success("Save draft successfully!");
          return $location.path("/posts/" + tempPost.Url);
        }
      }).error(function(err) {
        return progress.complete();
      });
    };
  }
]).controller("AdminPostsDetailCtrl", [
  "$scope", "$http", "$rootScope", "$window", "$routeParams", "post", "messenger", "categories", "$location", "progress", function($scope, $http, $rootScope, $window, $routeParams, post, messenger, categories, $location, progress) {
    var save, t, tags, _i, _len, _ref;
    $rootScope.title = "Edit Post";
    if ($routeParams.url.toLowerCase() === "count") {
      $location.path("/404");
      return;
    }
    if (post.Tags && post.Tags.length > 0) {
      tags = [];
      _ref = post.Tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        tags.push(t.TagName);
      }
      post.Tags = tags.join(",");
    } else {
      post.Tags = "";
    }
    $scope.categories = categories.list;
    $scope.post = post;
    $scope.submitText = "Published";
    if (post.Status === "Published") {
      $scope.submitText = "Update";
    }
    $scope.operateText = "Move to Trash";
    if (post.Status === "Trash") {
      $scope.operateText = "Restore";
    }
    $scope.publish = function() {
      return save("Published");
    };
    $scope.saveDraft = function() {
      return save("Draft");
    };
    $scope.moveToTrash = function() {
      return messenger.confirm(function() {
        if (post.Status === "Published") {
          return save("Trash");
        } else {
          return save("Published");
        }
      });
    };
    return save = function(status) {
      var tempPost;
      tempPost = angular.copy($scope.post);
      if (tempPost.Url.toLowerCase() === "count") {
        messenger.error("The post url can not be 'count'.");
        return;
      }
      if (!tempPost.Content) {
        messenger.error("Post content is required.");
        return;
      }
      tempPost.Status = status;
      tempPost.Category = tempPost.Category._id;
      tempPost.EditUser = $rootScope._loginUser.UserName;
      progress.start();
      return $http.put("" + MEANING.ApiAddress + "/posts/" + $routeParams.url, tempPost, {
        headers: {
          "meaning-token": $.cookie("meaning-token"),
          "from-admin-console": true
        }
      }).success(function(data) {
        progress.complete();
        if (status === "Published") {
          return $window.location.href = "/#!/posts/" + data.Url;
        } else if (status === "Trash") {
          return $window.location.href = "#!/posts/list/trash";
        } else {
          return messenger.success("Save draft successfully!");
        }
      }).error(function(err) {
        return progress.complete();
      });
    };
  }
]);
