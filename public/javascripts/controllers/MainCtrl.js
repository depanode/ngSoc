app.controller('MainCtrl', [
    '$scope',
    'posts',
    'auth',
    'users',
    'messages',
    'toaster',
    function ($scope, posts, auth, users, messages, toaster) {

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.me = auth.me._id ? auth.me : auth.getMyself();
        $scope.posts = posts.posts;
        $scope.user = users.user;
        $scope.post = {};
        $scope.comment = {};
        $scope.commentFormInPost = null;

        $scope.upvote = upvote;
        $scope.showFollowBtn = showFollowBtn;
        $scope.addPost = addPost;
        $scope.addComment = addComment;
        $scope.showCommentForm = showCommentForm;
        $scope.incrementUpvotes = incrementUpvotes;
        $scope.deletePost = deletePost;
        $scope.addFriend = addFriend;
        $scope.removeFriend = removeFriend;
        $scope.inviteFriend = inviteFriend;
        $scope.whispTo = whispTo;
        $scope.logout = logout;

        $scope.$watch(function () {
            return auth.me
        }, function (newVal) {
            $scope.me = newVal;
        }, true);


        function upvote(post) {
            posts.upvote(post);
        }

        function showFollowBtn() {
            var show = {};

            if ($scope.me.friends.length) {
                $scope.me.friends.forEach(function (friend) {
                    if (friend._id == $scope.user._id) {
                        show.isFriend = true;
                    }
                });
            }

            if ($scope.user.pending_req.length) {
                $scope.user.pending_req.forEach(function (friend) {
                    if (friend._id == $scope.me._id) {
                        show.inPending = true;
                    }
                });
            }

            if ($scope.me._id === $scope.user._id) {
                show.isMe = true;
            }

            return show;
        }


        function addPost() {
            if ($scope.post.title == '' || !$scope.post.title) {
                return;
            }

            /*posts.create({
                title: $scope.post.title,
                image: $scope.post.image
            });*/

            posts.create($scope.post);

            $scope.post.title = '';
            $scope.post.image = '';
        }

        function addComment(post) {
            if (!$scope.comment.comment_body || $scope.comment.comment_body == '') {
                return;
            }
            posts.addComment(post, {
                body: $scope.comment.comment_body,
                author: auth.me.username,
                post: post._id
            });
            $scope.comment.comment_body = '';
            showCommentForm(null);
        }

        function showCommentForm(postId) {
            $scope.commentFormInPost = postId;
        }

        function incrementUpvotes(comment) {
            posts.upvoteComment(post, comment);
        }

        function deletePost(post) {
            if (post.author._id !== auth.currentUser()._id) {
                return;
            }
            posts.deletePost(post);
        }

        function addFriend() {
            users.addFriend($scope.user);
        }

        function removeFriend() {
            users.removeFriend($scope.user);
        }

        function inviteFriend() {
            users.sendInvite($scope.inviteEmail);
            $scope.inviteEmail = '';
        }

        function whispTo(user) {
            if (!$scope.privateMessage) {return;}
            messages.sendMessage(user, $scope.privateMessage, function(msg) {
                if (msg) {
                    toaster.pop('info', '', 'Message sent');
                    $scope.privateMessage = '';
                    $scope.privateMessageFormIsShowing = null;
                }
            })
        }

        function logout() {
            auth.logout();
        }

}]);