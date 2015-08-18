angular.module('tweetsToSoftware')
  .controller('mainController', function(TweetService, MenuService, FilterService,
                                         $scope, $q) {
    'use strict';

    $scope.tweets = TweetService.tweets;
    $scope.menu = MenuService.menu;
    $scope.toolbar = MenuService.toolbar;
    $scope.panelbar = MenuService.panelbar;

    $scope.filters = FilterService;

    $q.all([
      TweetService.loaded,
      MenuService.loaded
    ])
      .then(function() {
        $scope.tweets.mockCommands([
          $scope.menu,
          $scope.toolbar,
          $scope.panelbar
        ]);

        filterHandler();
        $scope.$watchGroup([
            'filters.selectedCommand',
            'filters.renderUntil'
          ], filterHandler);
      });

    function filterHandler() {
      console.log('filter handler');

      var processedTweetIds = {};

      $scope.filters.activeTweetId = null;
      $scope.tweets.filter($scope.filters.renderUntil,
        $scope.filters.selectedMenu,
        $scope.filters.selectedCommand);

      $scope.menu.resetCounters();
      $scope.panelbar.resetCounters();
      $scope.toolbar.resetCounters();
      $scope.tweets.filtered.forEach(function(t) {
        var tweet = t.retweetedStatus || t;

        // avoid processing retweets multiple times
        if (!processedTweetIds[tweet.id]) {
          processedTweetIds[tweet.id] = true;

          ['menu', 'toolbar', 'panelbar'].forEach(function(menuName) {
            tweet[menuName].forEach(function(item) {
              item.increaseCounter();
            });
          });
        }
      });
    }

    /**
     * common for all menus
     */
    $scope.activateItem = function(menu, item) {
      if (item.children.length === 0) {
        menu.close();

        $scope.filters.selectedMenu = menu;
        $scope.filters.selectedCommand = item;
      }
    };

    $scope.itemHoverHandler = function(menu, item) {
      menu.close();
      item.highlight().open();
      menu.isOpen = true;
    };

    $scope.itemLeaveHandler = function(item) {
      if (item.children.length === 0) {
        item.isHighlighted = false;
      }
    };

    $scope.rootItemHoverHandler = function(menu, rootItem) {
      if (menu.isOpen) {
        menu.close();
        rootItem.open();
        menu.isOpen = true;
      }

      rootItem.highlight();
    };

    $scope.rootItemClickHandler = function(menu, rootItem) {
      rootItem.highlight();

      if (menu.isOpen) {
        menu.close();
      } else {
        menu.close();
        rootItem.open();
        menu.isOpen = true;
      }
    };

    $scope.rootItemLeaveHandler = function(menu, rootItem) {
      if (!menu.isOpen) {
        rootItem.isHighlighted = false;
      }
    };
  });