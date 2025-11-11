import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Mock data for now - in real app, this would be an API call
      const mockPosts = [
        {
          id: 1,
          author: 'Alex Chen',
          avatar: 'AC',
          content: 'Just completed the React course! The projects were challenging but really helped me understand state management. Anyone else working on the final project?',
          timestamp: '2 hours ago',
          likes: 12,
          comments: [
            { id: 1, author: 'Sarah Kim', content: 'Congrats! I\'m working on it too. The authentication part was tricky.', timestamp: '1 hour ago' },
            { id: 2, author: 'Mike Johnson', content: 'Great job! The course really helped me land my first dev job.', timestamp: '30 minutes ago' }
          ]
        },
        {
          id: 2,
          author: 'Emma Davis',
          avatar: 'ED',
          content: 'Looking for study partners for the Data Structures course. Anyone interested in forming a group?',
          timestamp: '4 hours ago',
          likes: 8,
          comments: [
            { id: 3, author: 'John Smith', content: 'I\'m interested! What time works for you?', timestamp: '3 hours ago' }
          ]
        },
        {
          id: 3,
          author: 'David Wilson',
          avatar: 'DW',
          content: 'Just won my first coding battle! The real-time aspect makes it so exciting. Thanks InturnX for this amazing platform!',
          timestamp: '6 hours ago',
          likes: 25,
          comments: [
            { id: 4, author: 'Lisa Brown', content: 'Congratulations! 🎉', timestamp: '5 hours ago' },
            { id: 5, author: 'Tom Garcia', content: 'Awesome! What battle was it?', timestamp: '4 hours ago' }
          ]
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      // Mock new post - in real app, this would be an API call
      const post = {
        id: Date.now(),
        author: user?.name || 'Anonymous',
        avatar: (user?.name || 'A').charAt(0).toUpperCase(),
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: []
      };

      setPosts(prev => [post, ...prev]);
      setNewPost('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId) => {
    if (!commentText.trim()) return;

    const comment = {
      id: Date.now(),
      author: user?.name || 'Anonymous',
      content: commentText,
      timestamp: 'Just now'
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setCommentText('');
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#14A44D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-gray-400 mt-2">Connect, share, and learn with fellow developers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
              <span className="text-sm text-gray-400">Active Members: </span>
              <span className="text-[#14A44D] font-semibold">1,247</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Post Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <form onSubmit={handleNewPost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, ask questions, or celebrate your achievements..."
              className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D] resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="bg-[#14A44D] text-white px-6 py-2 rounded-xl hover:bg-[#14A44D]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              {/* Post Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-[#5F2EEA] rounded-full flex items-center justify-center text-lg font-semibold">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{post.author}</h3>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{post.content}</p>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center space-x-6 mb-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-[#14A44D] transition-colors"
                >
                  <span>👍</span>
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-[#14A44D] transition-colors"
                >
                  <span>💬</span>
                  <span>{post.comments.length}</span>
                </button>
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="border-t border-white/10 pt-4">
                  <div className="space-y-4 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-[#14A44D] rounded-full flex items-center justify-center text-sm font-semibold">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-400 text-xs">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#5F2EEA] rounded-full flex items-center justify-center text-sm font-semibold">
                      {(user?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14A44D] text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText.trim()}
                        className="bg-[#14A44D] text-white px-4 py-2 rounded-lg hover:bg-[#14A44D]/80 transition-colors disabled:opacity-50 text-sm"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
