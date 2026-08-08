import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";

export const NotificationDropdown = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Hover handler to trigger the read state
  const handleHover = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`relative p-2 rounded-full transition-colors duration-200 ${
          isOpen
            ? "bg-surface-container-low text-primary-container"
            : "text-secondary hover:bg-surface-container-low"
        }`}
        title="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-on-primary bg-primary-container border-2 border-surface-container-lowest rounded-full transition-all">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-highest bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-primary-container text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-secondary hover:text-primary-container transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">
                  done_all
                </span>
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-container-highest/50 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-secondary flex flex-col items-center">
                <span className="material-symbols-outlined text-secondary/40 text-4xl mb-2">
                  notifications_off
                </span>
                <p className="text-xs font-semibold text-on-surface">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onMouseEnter={() => handleHover(notif.id, notif.read)}
                  className={`p-3.5 transition-all duration-300 flex items-start gap-3 text-left ${
                    !notif.read
                      ? "bg-primary-container/10 hover:bg-primary-container/20"
                      : "bg-transparent hover:bg-surface-container-low/60 opacity-70"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      !notif.read
                        ? "bg-primary-fixed text-primary-container"
                        : "bg-surface-container-highest text-secondary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {notif.read ? "mark_email_read" : "info"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${!notif.read ? "text-on-surface font-bold" : "text-secondary font-medium"}`}
                    >
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
