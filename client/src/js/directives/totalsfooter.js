angular.module('bhima.directives')
.directive('totalsFooter', TotalsFooterDirective);

function TotalsFooterDirective() { 
  return  { 
    restrict : 'A',
    transclude : true,
    scope : { 
      
      // Direct model binding to the grid that should be tracked
      grid : '=grid',
      
      // One way binding for a setting that should not change
      leadingColumns : '@'
    },
    template : '<ng-transclude />',
    link : function (scope, element, attrs) { 
     
      // Varaiable to track grid columns in order to calculate widths 
      var columns;
      var coreReference;

      // Object to be exposed to parent scope - allowing custom widths to be set 
      // dependendent on the columns of the grid object provided
      var trackGridColumns = { width : null };

      // Reference grid passed in parameter - this will be used to calculate 
      // %'s for column widths
      var grid = scope.grid;
  
      // This variable keeps track of the current callabck to be fired on 
      // API registration - this can be refined if someone can think of a better
      // way of exposing the columns object without adding controller code 
      var interceptOnRegisterApi = grid.onRegisterApi;
    
      // The number of columns that the directive should calculate the width of, 
      // this will determine the column that the totals should line up with
      // (defaults to 1 column)
      var leadingColumns = scope.leadingColumns || 1;

      grid.onRegisterApi = function intercept(gridApi) { 
        var columnReference;

        coreReference = gridApi.core;
        columnReference = gridApi.grid.columns;

        // Make column reference available to internal scope 
        columns = columnReference;
         
        // Hook into grid rendering event - this will allow us to only update 
        // column widths when the grid has redrawn a row. This is much more 
        // effecient than watching an object with angulars $scope.$watch
        gridApi.core.on.rowsRendered(null, updateColumnWidths);
      
        // Expose external scope to track column width number 
        // note : this could be passed in through a parameter track-columns that 
        // would then be assigned width - this assumes a configured UI grid
        grid.appScopeProvider.trackColumns = trackGridColumns;

        // Pass the grid API onto the controller if it is defined
        if (angular.isDefined(interceptOnRegisterApi)) { 
          interceptOnRegisterApi(gridApi);
        }
      }
    
      function updateColumnWidths() { 
        trackGridColumns.width = columns.reduce(sumColumnWidths, 0);
      }

      function sumColumnWidths(currentWidth, column, index) { 
        if (index < leadingColumns) { 
          currentWidth += column.drawnWidth;
        }
        return currentWidth;
      }
    }
  };
}
