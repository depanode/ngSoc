app.directive('fileModel', ['$parse', function($parse) {
   return {
       restrict: 'A',
       link: function(scope, el, attrs) {
           var model = $parse(attrs.fileModel);

           el.bind('change', function() {
               scope.$apply(function() {
                   model.assign(scope, el[0].files[0]);
               });
           })
       }
   }
}]);
