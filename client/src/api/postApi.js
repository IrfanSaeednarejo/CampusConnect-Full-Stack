import api from "./axios";

const BASE = "/posts";

export const getFeed         = (type = "campus", page = 1, limit = 15)   => api.get(`${BASE}/feed`, { params: { type, page, limit } });
export const createPost      = (formData)                                  => api.post(BASE, formData);
export const getPostById     = (postId)                                    => api.get(`${BASE}/${postId}`);
export const updatePost      = (postId, data)                              => api.patch(`${BASE}/${postId}`, data);
export const deletePost      = (postId)                                    => api.delete(`${BASE}/${postId}`);
export const reactToPost     = (postId, reactionType)                      => api.post(`${BASE}/${postId}/react`, { reactionType });
export const repostPost      = (postId, comment = "")                      => api.post(`${BASE}/${postId}/repost`, { comment });
export const voteOnPoll      = (postId, optionIndexes)                     => api.post(`${BASE}/${postId}/poll/vote`, { optionIndexes });
export const getComments     = (postId, page = 1, limit = 20)              => api.get(`${BASE}/${postId}/comments`, { params: { page, limit } });
export const getCommentReplies=(postId, commentId, page = 1)               => api.get(`${BASE}/${postId}/comments/${commentId}/replies`, { params: { page } });
export const addComment      = (postId, body, parentId = null, mentions)   => api.post(`${BASE}/${postId}/comments`, { body, parentId, mentions });
export const deleteComment   = (postId, commentId)                         => api.delete(`${BASE}/${postId}/comments/${commentId}`);
export const getUserPosts    = (userId, page = 1)                          => api.get(`${BASE}/user/${userId}`, { params: { page } });
export const getPostsByHashtag=(tag, page = 1)                             => api.get(`${BASE}/hashtag/${tag}`, { params: { page } });
export const searchPosts     = (q, campusId, page = 1)                     => api.get(`${BASE}/search`, { params: { q, campusId, page } });
export const getTrendingHashtags = (limit = 10)                            => api.get(`${BASE}/hashtags/trending`, { params: { limit } });
