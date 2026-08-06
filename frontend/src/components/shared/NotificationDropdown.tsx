import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";

export const NotificationDropdown = () => {
  const { unreadCount, notifications, clearUnreadCount, clearAllNotifications } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen) {
      clearUnreadCount(); // Clear unread badge when opening the panel
    }
    setIsOpen((prev) => !prev);
  };

  // Close the popover when clicking anywhere outside of it
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
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
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-on-primary bg-primary-container border-2 border-surface-container-lowest rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-highest bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface">Notifications</h3>
              {notifications.length > 0 && (
                <span className="bg-primary-container text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {notifications.length}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-secondary hover:text-error transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Clear all
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-container-highest/50 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-secondary flex flex-col items-center">
                <span className="material-symbols-outlined text-secondary/40 text-4xl mb-2">
                  notifications_off
                </span>
                <p className="text-xs font-semibold text-on-surface">No notifications yet</p>
                <p className="text-[11px] text-secondary mt-0.5">
                  New task alerts and activity logs will appear here.
                </p>
              </div>
            ) : (
              notifications.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3.5 hover:bg-surface-container-low/60 transition-colors flex items-start gap-3 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary-container text-[16px]">
                      info
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface leading-relaxed font-medium">
                      {msg}
                    </p>
                    <span className="text-[10px] text-secondary/70 mt-1 block font-normal">
                      Recent
                    </span>
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