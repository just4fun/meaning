angular.module('admin-categories', [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/categories",
    templateUrl: "/admin/modules/categories/index.html"
    controller: 'AdminCategoriesCtrl')
])

.controller('AdminCategoriesCtrl',
["$scope", "$http", "$rootScope", "messenger", "progress",
  ($scope, $http, $rootScope, messenger, progress) ->
    getCategoryList = ->
      progress.start();
      $http.get("#{MEANING.ApiAddress}/categories")
      .success (data) ->
        $scope.categories = data
        progress.complete();

    $scope.create = ->
      $scope.modalTitle = "Create"
      $scope.iconDialog = true

    $scope.close = ->
      $scope.iconDialog = false
      $scope.entity = null

    $scope.edit = (category) ->
      $scope.entity = angular.copy category
      $scope.modalTitle = "Update"
      $scope.iconDialog = true

    $scope.del = (category) ->
      messenger.confirm ->
        progress.start();
        $http.delete("#{MEANING.ApiAddress}/category/#{category._id}",
          headers:
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          $scope.categories.splice($scope.categories.indexOf(category), 1)
          messenger.success "Delete category successfully!"
          progress.complete();
        .error (err) ->
          progress.complete();

    $scope.save = ->
      progress.start()
      #Update
      if $scope.entity._id
        $scope.entity.EditUser = $rootScope._loginUser.Username
        $scope.entity.EditDate = new Date()
        $http.put("#{MEANING.ApiAddress}/category/#{$scope.entity._id}",
          $scope.entity,
          headers:
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          messenger.success "Update category successfully!"
          $scope.close()
          getCategoryList()
        .error (err) ->
          progress.complete();
      #Create
      else
        $scope.entity.CreateUser = $rootScope._loginUser.Username
        $http.post("#{MEANING.ApiAddress}/category",
          $scope.entity,
          headers:
            'meaning-token': $.cookie('meaning-token')
        )
        .success (data) ->
          messenger.success "Create category successfully!"
          $scope.close()
          getCategoryList()
        .error (err) ->
          progress.complete();

    getCategoryList()
])