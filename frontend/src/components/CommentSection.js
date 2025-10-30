import { useState, useEffect } from "react";

function CommentSection({ voteId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [message, setMessage] = useState("");

  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/vote/${voteId}`);
        const data = await res.json();
        if (res.ok) {
          setComments(data);
        } else {
          console.error("Failed to fetch comments:", data.message);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (voteId) {
      fetchComments();
    }
  }, [voteId]);

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!auth?.token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    if (!newComment.trim()) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/comments/vote/${voteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setNewComment("");
        setMessage("댓글이 작성되었습니다.");
      } else {
        setMessage(data.message || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      setMessage("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (res.ok) {
        setComments(comments.filter(comment => comment._id !== commentId));
        setMessage("댓글이 삭제되었습니다.");
      } else {
        const data = await res.json();
        setMessage(data.message || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      setMessage("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // Start editing comment
  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // Submit edited comment
  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments(comments.map(comment => 
          comment._id === commentId ? data : comment
        ));
        setEditingCommentId(null);
        setEditContent("");
        setMessage("댓글이 수정되었습니다.");
      } else {
        setMessage(data.message || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      setMessage("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        댓글을 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "30px" }}>
      <h3 style={{ marginBottom: "20px", color: "#333" }}>
        💬 댓글 ({comments.length})
      </h3>

      {/* Comment Form */}
      {auth ? (
        <form onSubmit={handleSubmitComment} style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요... (최대 500자)"
              maxLength={500}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {newComment.length}/500
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: submitting || !newComment.trim() ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: submitting || !newComment.trim() ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                {submitting ? "작성 중..." : "댓글 작성"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px", 
          marginBottom: "30px",
          textAlign: "center",
          color: "#666"
        }}>
          댓글을 작성하려면 로그인해주세요.
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          style={{
            padding: "10px 15px",
            borderRadius: "6px",
            marginBottom: "20px",
            backgroundColor: message.includes("실패") || message.includes("오류") ? "#f8d7da" : "#d4edda",
            color: message.includes("실패") || message.includes("오류") ? "#721c24" : "#155724",
            fontSize: "14px"
          }}
        >
          {message}
        </div>
      )}

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#999",
            fontSize: "16px"
          }}>
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요! 🎉
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                padding: "15px",
                border: "1px solid #eee",
                borderRadius: "8px",
                marginBottom: "15px",
                backgroundColor: "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <strong style={{ color: "#333", fontSize: "14px" }}>
                    {comment.author?.username || "Unknown User"}
                  </strong>
                  <span style={{ color: "#999", fontSize: "12px", marginLeft: "10px" }}>
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && (
                      <span> (수정됨)</span>
                    )}
                  </span>
                </div>
                
                {auth && comment.author?._id === auth._id && (
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => startEditComment(comment)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment._id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={500}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      marginBottom: "10px",
                      fontFamily: "inherit"
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ 
                  margin: "0", 
                  lineHeight: "1.5", 
                  color: "#555",
                  whiteSpace: "pre-wrap"
                }}>
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;