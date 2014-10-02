angular.module("admin-categories", [])

.config(["$routeProvider",
($routeProvider) ->
  $routeProvider
  .when("/categories",
    templateUrl: "/admin/modules/categories/index.html"
    controller: "AdminCategoriesCtrl"
    resolve:
      check: ["$q", "$http", "$rootScope", "$location",
        ($q, $http, $rootScope, $location) ->
          if $rootScope._loginUser.Role isnt "Admin"
            $location.path "/"
      ]
  )
])

.controller("AdminCategoriesCtrl"
["$scope", "$http", "$rootScope", "messenger", "progress",
  ($scope, $http, $rootScope, messenger, progress) ->
    $rootScope.title = "Categories"

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
        progress.start()
        $http.delete("#{MEANING.ApiAddress}/categories/#{category._id}",
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Delete category successfully!"
          $scope.getCategoryList(1)
          progress.complete()
        .error (err) ->
          progress.complete()

    $scope.save = ->
      progress.start()
      #Update
      if $scope.entity._id
        $scope.entity.EditUser = $rootScope._loginUser.UserName
        $scope.entity.EditDate = new Date()
        $http.put("#{MEANING.ApiAddress}/categories/#{$scope.entity._id}",
          $scope.entity,
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Update category successfully!"
          $scope.close()
          $scope.getCategoryList($scope.currentPage)
        .error (err) ->
          progress.complete()
      #Create
      else
        $scope.entity.CreateUser = $rootScope._loginUser.UserName
        $http.post("#{MEANING.ApiAddress}/categories",
          $scope.entity,
          headers:
            "meaning-token": $.cookie("meaning-token")
        )
        .success (data) ->
          messenger.success "Create category successfully!"
          $scope.close()
          $scope.getCategoryList(1)
        .error (err) ->
          progress.complete()

    $scope.getCategoryList = (page) ->
      progress.start()
      $scope.currentPage = page
      $http.get("#{MEANING.ApiAddress}/categories?pageIndex=#{page - 1}",
        headers:
          "meaning-token": $.cookie("meaning-token")
      )
      .success (data) ->
        $scope.categories = data.list
        $scope.totalCount = data.totalCount
        progress.complete()

    $scope.getCategoryList(1)
])