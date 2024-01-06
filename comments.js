// Create a web server

// Import modules
const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const User = require('../models/user');
const Post = require('../models/post');

// Middleware
const {isLoggedIn} = require('../middleware');

// Route: /posts/:id/comments
// Create a new comment
router.post('/posts/:id/comments', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user._id);
        const comment = new Comment(req.body.comment);
        comment.author.id = user._id;
        comment.author.username = user.username;
        await comment.save();
        post.comments.push(comment);
        await post.save();
        req.flash('success', 'Comment created successfully!');
        res.redirect(`/posts/${post._id}`);
    } catch (e) {
        req.flash('error', 'Cannot create comment!');
        res.redirect('back');
    }
});

// Route: /posts/:id/comments/:commentId
// Update a comment
router.put('/posts/:id/comments/:commentId', isLoggedIn, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.commentId, req.body.comment);
        req.flash('success', 'Comment updated successfully!');
        res.redirect(`/posts/${req.params.id}`);
    } catch (e) {
        req.flash('error', 'Cannot update comment!');
        res.redirect('back');
    }
});

// Route: /posts/:id/comments/:commentId
// Delete a comment
router.delete('/posts/:id/comments/:commentId', isLoggedIn, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndRemove(req.params.commentId);
        await Post.findByIdAndUpdate(req.params.id, {$pull: {comments: req.params.commentId}});
        req.flash('success', 'Comment deleted successfully!');
        res.redirect(`/posts/${req.params.id}`);
    } catch (e) {
        req.flash('error', 'Cannot delete comment!');
        res.redirect('back');
    }
});

module.exports = router;
