import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { useAuthStore } from "../store/authStore";
import { updateFcmToken } from "../api/user";

export const useFcm = () => {
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const handleFcmToken = async () => {
            if (!isAuthenticated) return;

            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    // VAPID key is optional if using default setup, but good to have if needed. 
                    // For now, simple getToken() might work if service worker is set up correctly (firebase-messaging-sw.js).
                    // However, user didn't provide VAPID key, so we'll try without or with a placeholder if needed later.
                    // Getting token
                    const currentToken = await getToken(messaging);

                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        const storedToken = localStorage.getItem("fcmToken");

                        if (currentToken !== storedToken) {
                            // Token changed or new, update backend
                            await updateFcmToken(currentToken);
                            localStorage.setItem("fcmToken", currentToken);
                            console.log("FCM Token updated");
                        }
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.log("Notification permission not granted.");
                }
            } catch (error) {
                console.error("An error occurred while retrieving token. ", error);
            }
        };

        handleFcmToken();
    }, [isAuthenticated]);
};
