app.factory('posts', [
    '$http',
    'auth',
    'toaster',
    function ($http, auth, toaster) {

        var o = {
            posts:          [],
            getAll:         getAll,
            getPostsByAuthor: getPostsByAuthor,
            getPost:        getPost,
            addComment:     addComment,
            upvoteComment:  upvoteComment,
            create:         create,
            deletePost:     deletePost,
            upvote:         upvote
        };

        function getAll() {
            return $http.get('/posts').then(function(data) {
                angular.copy(data.data, o.posts);
            })
        }

        function getPostsByAuthor(author) {
            return $http.get('users/' + author + '/posts').then(function(data) {
                angular.copy(data.data, o.posts);
            })
        }

        function getPost(id) {
            return $http.get('/posts/' + id).then(function(data) {
                return data.data;
            })
        }

        function addComment(post, comment) {
            return $http.post('/posts/' + post._id + '/comments', comment).then(function() {
                o.getPostsByAuthor(post.author.username);
                toaster.pop('info', '', 'Comment added');
            });
        }

        function upvoteComment(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').then(function() {
                comment.upvotes++;
            })
        }

        function create(post) {
            /*return $http.post('/posts', post).then(function() {
                toaster.pop('info', '', 'Post added');
                o.getPostsByAuthor(auth.me.username);
            })*/

            var fd = new FormData();

            fd.append('title', post.title);
            fd.append('image', post.image);


            return $http.post('/posts', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                .then(function() {
                    toaster.pop('info', '', 'Post added');
                    o.getPostsByAuthor(auth.me.username);
                },
                function(err) {
                    toaster.pop('error', '', err.data.msg);
                }
            )

        }

        function deletePost(post) {
            return $http.delete('/posts/' + post._id).then(function(res) {
                o.posts.forEach(function(elem, idx){
                    if (elem == post) {
                        o.posts.splice(idx, 1);
                    }
                });
                toaster.pop('info', '', res.data.msg);
            })
        }

        function upvote(post) {
            return $http.put('/posts/' + post._id + '/upvote').then(function() {
                post.upvotes.push(auth.currentUser()._id);
                toaster.pop('info', '', 'Post Upvoted');
            })
        }

        return o;

}]);