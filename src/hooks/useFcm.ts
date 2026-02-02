import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";
import { useAuthStore } from "../store/authStore";
import { updateFcmToken } from "../api/user";

export const useFcm = () => {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const handleFcmToken = async () => {
            if (!isAuthenticated) {
                // 로그아웃 시 토큰 정리
                localStorage.removeItem("fcmToken");
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.log("Notification permission not granted.");
                    return;
                }

                const currentToken = await getToken(messaging);

                if (currentToken) {
                    console.log("FCM Token:", currentToken);

                    const storedToken = localStorage.getItem("fcmToken");

                    if (currentToken !== storedToken) {
                        await updateFcmToken(currentToken);
                        localStorage.setItem("fcmToken", currentToken);
                        console.log("FCM Token updated on server");
                    }
                } else {
                    console.log('No registration token available.');
                }
            } catch (error) {
                console.error("Error retrieving FCM token:", error);
            }
        };

        handleFcmToken();

        // 포그라운드 메시지 수신 리스너
        const unsubscribeMessage = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);

            // 알림 표시 (브라우저가 포커스된 상태에서)
            if (payload.notification) {
                new Notification(payload.notification.title || '알림', {
                    body: payload.notification.body,
                    icon: payload.notification.icon || '/logo.png',
                });
            }
        });

        return () => {
            unsubscribeMessage();
        };
    }, [isAuthenticated]);
};
