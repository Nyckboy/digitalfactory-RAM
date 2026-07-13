import { useState, useEffect, useRef } from "react";
import type { TaskDTO, CommentDTO } from "../../types/api";
import { useAuthStore } from "../../store/useAuthStore";

interface TaskCommentsModalProps {
  isOpen: boolean;
  task: TaskDTO | null;
  onClose: () => void;
  fetchComments: (taskId: string) => Promise<CommentDTO[]>;
  postComment: (taskId: string, content: string) => Promise<CommentDTO>;
}

export const TaskCommentsModal = ({
  isOpen,
  task,
  onClose,
  fetchComments,
  postComment,
}: TaskCommentsModalProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && task) {
      setIsLoading(true);
      fetchComments(task.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, task, fetchComments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!isOpen || !task) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      const addedComment = await postComment(task.id, newComment.trim());
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity font-sans">
      {/* Clickable backdrop to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-container-highest bg-surface-container-lowest z-10">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Task Discussion
            </h2>
            <p className="text-xs font-semibold text-secondary mt-1 line-clamp-1">
              {task.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary-container p-2 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background custom-scrollbar">
          {isLoading ? (
            <div className="text-center text-secondary text-sm mt-10">
              Loading conversation...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-secondary opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2">
                forum
              </span>
              <p className="text-sm">No comments yet.</p>
              <p className="text-xs mt-1">
                Be the first to start the conversation!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              // Assuming your backend uses authorRole or ID to determine the sender
              const isMe = user?.role === comment.authorRole;

              return (
                <div
                  key={comment.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-semibold text-secondary mb-1.5 px-1 uppercase tracking-wider">
                    {comment.authorName} •{" "}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div
                    className={`px-4 py-2.5 max-w-[85%] text-sm shadow-sm ${
                      isMe
                        ? "bg-primary-container text-on-primary rounded-2xl rounded-tr-sm"
                        : "bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-lowest border-t border-surface-container-highest z-10">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-[#F1F3F5] border border-outline-variant rounded-full focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm text-on-surface transition-colors placeholder:text-secondary"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className={`p-3 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                !newComment.trim() || isSending
                  ? "bg-surface-container-highest text-secondary cursor-not-allowed"
                  : "bg-primary-container text-on-primary hover:bg-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] translate-x-1px">
                send
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
