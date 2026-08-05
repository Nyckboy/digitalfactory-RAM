import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore"; // Adjust path if needed

// Define the shape of our context
interface NotificationContextType {
  unreadCount: number;
  notifications: string[];
  clearUnreadCount: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Grab BOTH user and token from the store
  const { user, token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    console.log("Current Auth User Object:", user);
    // If there is no authenticated user or token, do not connect.
    if (!user || !user.id || !token) return;

    // 1. Instantiate the STOMP client
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Pass the JWT from your store here
      },

      debug: (str) => {
        console.log('STOMP DEBUG: ', str);
      },

      reconnectDelay: 5000, // Attempt to reconnect every 5 seconds if dropped
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // 2. Handle successful connection
      onConnect: () => {
        console.log("Connected to STOMP broker with JWT");

        // 3. Subscribe to the user's private notification queue
        stompClient.subscribe(`/queue/notifications/${user.id}`, (message) => {
          if (message.body) {
            const notificationText = message.body;

            // Update local state
            setNotifications((prev) => [notificationText, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // 4. Trigger the global UI toast
            toast.info(notificationText, {
              duration: 5000,
              position: "top-right",
            });
          }
        });
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },

      onWebSocketError: (event) => {
        console.error("WebSocket connection error:", event);
      },
    });

    // Activate the client
    stompClient.activate();

    // 5. Cleanup: Disconnect cleanly when the user logs out or the component unmounts
    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
        console.log("Disconnected from STOMP broker");
      }
    };
  }, [user, token]); // Re-run if the user or token changes

  const clearUnreadCount = () => setUnreadCount(0);
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        clearUnreadCount,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy consumption
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
