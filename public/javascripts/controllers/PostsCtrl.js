app.controller('PostsCtrl', [
    '$scope',
    'posts',
    'post',
    'auth',
    function ($scope, posts, post, auth) {

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.post = post;

        $scope.addComment = addComment;
        $scope.incrementUpvotes = incrementUpvotes;

        function addComment() {
            if (!$scope.body || $scope.body == '') {
                return;
            }
            posts.addComment($scope.post, {
                body: $scope.body,
                author: 'user',
                post: $scope.post._id
            }).then(function (data) {
                $scope.post.comments.push(data.data);
            });
            $scope.body = '';
        }

        function incrementUpvotes(comment) {
            posts.upvoteComment(post, comment);
        }

    }]);