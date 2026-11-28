import { useAuth } from "@clerk/react";
import { useEffect, useRef } from "react";

function Auth() {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const hasSynced = useRef(false);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            hasSynced.current = false;
            return;
        }

        if (hasSynced.current) return;
        hasSynced.current = true;

        const syncUser = async () => {
            try {
                const token = await getToken();

                if (!token) {
                    throw new Error("No authentication token");
                }

                const response = await fetch(
                    `${import.meta.env.VITE_LINK || "http://localhost:9000"}/sync-user`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "User sync failed");
                }
            } catch (error) {
                hasSynced.current = false;
                console.error("Account sync failed:", error);
            }
        };

        syncUser();
    }, [isLoaded, isSignedIn, getToken]);

    return null;
}

export default Auth;