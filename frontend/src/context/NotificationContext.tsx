import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";
import {
  notificationService,
  type NotificationDTO,
} from "../lib/notificationApi";

interface NotificationContextType {
  unreadCount: number;
  notifications: NotificationDTO[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuthStore();

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);

  // Dynamically calculate unread count based on the state array
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 1. Fetch historical unread notifications on load
  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const history = await notificationService.getUnread();
      setNotifications(history);
    } catch (error) {
      console.error("Failed to fetch notification history:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user && token) {
      fetchUnreadNotifications();
    }
  }, [user, token, fetchUnreadNotifications]);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!user || !user.id || !token) return;

    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('Connected to STOMP broker');
        
        stompClient.subscribe(`/queue/notifications/${user.id}`, (message) => {
          if (message.body) {
            let newNotif: NotificationDTO;
            
            try {
              // 1. Try to parse it as a JSON object (for the new backend logic)
              newNotif = JSON.parse(message.body);
              
              // Fallback just in case the backend sends a JSON string that lacks an ID
              if (!newNotif.id) {
                newNotif.id = `temp-${Date.now()}`;
                newNotif.read = false;
              }
            } catch (err) {
              // 2. If JSON.parse fails, it's a plain string. Wrap it manually!
              newNotif = {
                id: `temp-${Date.now()}`, // Generate a temporary ID for React keys
                message: message.body,
                read: false,
              };
            }
            
            // 3. Update the UI
            setNotifications((prev) => [newNotif, ...prev]);
            
            toast.info(newNotif.message, {
              duration: 5000,
              position: 'top-right',
            });
          }
        });
      },
      onStompError: (frame) =>
        console.error("Broker error:", frame.headers["message"]),
      onWebSocketError: (event) => console.error("WebSocket error:", event),
    });

    stompClient.activate();

    return () => {
      if (stompClient.active) stompClient.deactivate();
    };
  }, [user, token]);

  // 3. Mark single notification as read
  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Optional: Revert state on failure
    }
  };

  // 4. Mark all as read
  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ unreadCount, notifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
