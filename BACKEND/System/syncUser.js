
import { clerkClient, getAuth } from "@clerk/express";
import { prisma } from "../prisma.js";
export const syncUser = async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        if (!isAuthenticated || !userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses.find(
            (address) => address.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;
        if (!email) {
            return res.status(400).json({
                error: "No primary email address found"
            });
        }
        const user = await prisma.user.upsert({
            where: {
                clerkId: userId
            },
            update: {
                email,
                username: clerkUser.username ?? null
            },
            create: {
                clerkId: userId,
                email,
                username: clerkUser.username ?? null
            }
        });
        return res.status(200).json({
            message: "User synced successfully!",
            user: {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error("User sync error:", error);

        return res.status(500).json({
            error: "Failed to sync user"
        });
    }
};
