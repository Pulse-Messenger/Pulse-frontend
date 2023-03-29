import { defineStore } from "pinia";
import { ref } from "vue";

export type notificationTypes = "info" | "error" | "warn" | "message";

export interface Notification {
  type: notificationTypes;
  message: string;
  timestamp: number;
  kill: boolean;
  extra?: {
    user: string;
    userPfp: string;
    channel: string;
  };
}

export const useNotificationStore = defineStore("notification", () => {
  setInterval(() => {
    alerts.value.forEach((alert, index) => {
      if (Date.now() - alert.timestamp >= 5000 || alert.kill) {
        alerts.value.splice(index, 1);
      }
    });
  }, 10);

  const alerts = ref<Notification[]>([]);

  const pushAlert = (notification: {
    message: string;
    type: notificationTypes;
    extra?: {
      user: string;
      userPfp: string;
      channel: string;
    };
  }) => {
    alerts.value.push({
      type: notification.type,
      message: notification.message,
      timestamp: Date.now(),
      kill: false,
      extra: notification.extra,
    });
  };

  return { pushAlert, alerts };
});
