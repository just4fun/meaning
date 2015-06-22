angular.module("admin-posts-detail", []).config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/posts/new", {
      templateUrl: "/admin/modules/posts/detail/index.html",
      controller: "AdminPostsNewCtrl",
      resolve: {
        categories: [
          "$q", "$http", function($q, $http) {
            var deferred = $q.defer();
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
            var deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/categories").success(function(data) {
              return deferred.resolve(data);
            });
            return deferred.promise;
          }
        ],
        post: [
          "$q", "$http", "$route", "$rootScope", "$location",
          function($q, $http, $route, $rootScope, $location) {
            var deferred = $q.defer();
            $http.get("" + MEANING.ApiAddress + "/posts/" + $route.current.params.url, {
              headers: {
                "from-admin-console": true
              }
            }).success(function(data) {
              // check user role
              var currentUser = $rootScope._loginUser;
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
  "$scope", "$http", "$rootScope", "$window", "messenger", "categories", "$location", "progress",
  function($scope, $http, $rootScope, $window, messenger, categories, $location, progress) {
    // Create
    $rootScope.title = "Add New Post";
    $scope.categories = categories.list;
    $scope.submitText = "Publish";

    // init post entity
    $scope.post = {
      AllowComments: true
    };

    $scope.publish = function() {
      return save("Published");
    };

    $scope.saveDraft = function() {
      return save("Draft");
    };

    var save = function(status) {
      // to prevent Two-Way Binding
      var tempPost = angular.copy($scope.post);

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
      $http.post("" + MEANING.ApiAddress + "/posts", tempPost, {
        headers: {
          "meaning-token": $.cookie("meaning-token")
        }
      }).success(function(data) {
        progress.complete();

        if (status === "Published") {
          return $window.location.href = "/#!/posts/" + data.Url;
        } else {
          messenger.success("Save draft successfully!");
          /**
           * change url to edit mode, otherwise it will create again when press
           * save draft button twice.
           */
          $location.path("/posts/" + tempPost.Url);
        }
      }).error(function(err) {
        progress.complete();
      });
    };
  }
]).controller("AdminPostsDetailCtrl", [
  "$scope", "$http", "$rootScope", "$window", "$routeParams", "post", "messenger", "categories", "$location", "progress",
  function($scope, $http, $rootScope, $window, $routeParams, post, messenger, categories, $location, progress) {
    // Update
    var save, t, tags, _i, _len, _ref;
    $rootScope.title = "Edit Post";

    // to avoid "/posts/count" route being fired
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
      save("Published");
    };

    $scope.saveDraft = function() {
      save("Draft");
    };

    $scope.moveToTrash = function() {
      messenger.confirm(function() {
        if (post.Status === "Published") {
          save("Trash");
        } else {
          save("Published");
        }
      });
    };

    save = function(status) {
      // to prevent Two-Way Binding
      var tempPost = angular.copy($scope.post);

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
      $http.put("" + MEANING.ApiAddress + "/posts/" + $routeParams.url, tempPost, {
        headers: {
          "meaning-token": $.cookie("meaning-token"),

          // without below param, the getByUrl() in node.js will return 404
          "from-admin-console": true
        }
      }).success(function(data) {
        progress.complete();

        if (status === "Published") {
          $window.location.href = "/#!/posts/" + data.Url;
        } else if (status === "Trash") {
          $window.location.href = "#!/posts/list/trash";
        } else {
          messenger.success("Save draft successfully!");
        }
      }).error(function(err) {
        progress.complete();
      });
    };
  }
]);
