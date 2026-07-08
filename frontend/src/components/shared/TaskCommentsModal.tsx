import { useState, useEffect, useRef } from 'react';
import type { TaskDTO, CommentDTO } from '../../types/api';
import { useAuthStore } from '../../store/useAuthStore';

interface TaskCommentsModalProps {
  isOpen: boolean;
  task: TaskDTO | null;
  onClose: () => void;
  // We pass these as props so the component doesn't care if it's a supervisor or intern
  fetchComments: (taskId: string) => Promise<CommentDTO[]>;
  postComment: (taskId: string, content: string) => Promise<CommentDTO>;
}

export const TaskCommentsModal = ({ isOpen, task, onClose, fetchComments, postComment }: TaskCommentsModalProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Ref to automatically scroll to the newest message
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
    // Scroll to bottom whenever comments change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!isOpen || !task) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      const addedComment = await postComment(task.id, newComment.trim());
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col h-150 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Task Chat</h2>
            <p className="text-xs text-gray-500 line-clamp-1">{task.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">✕</button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center text-gray-400 text-sm mt-10">Loading conversation...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10">No comments yet. Start the conversation!</div>
          ) : (
            comments.map((comment) => {
              // Determine if the logged-in user is the author
              const isMe = user?.role === comment.authorRole;

              return (
                <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-400 mb-1 px-1">
                    {comment.authorName} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                  }`}>
                    {comment.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className="p-2 px-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};