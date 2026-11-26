
import { prisma } from "../prisma.js";
import { getAuth } from "@clerk/express";
export const getSavedCode = async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        if (!isAuthenticated || !userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { slug, language } = req.query;
        if (!slug || !language) {
            return res.status(400).json({ message: "Missing slug or language" });
        }
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const problem = await prisma.problem.findUnique({
            where: { slug },
        });
        if (!problem) {
            return res.json({ code: null });
        }
        const saved = await prisma.savedCode.findUnique({
            where: {
                userId_problemId_language: {
                    userId: user.id,
                    problemId: problem.id,
                    language,
                },
            },
        });
        res.json({ code: saved?.code ?? null });
    } catch (error) {
        console.error("Get saved code error:", error);
        res.status(500).json({ message: "Failed to load code" });
    }
};
export const saveCode = async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        if (!isAuthenticated || !userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { slug, title, language, code } = req.body;
        if (!slug || !title || !language || typeof code !== "string") {
            return res.status(400).json({ message: "Invalid code information" });
        }
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const problem = await prisma.problem.upsert({
            where: { slug },
            update: { title },
            create: { slug, title },
        });
        await prisma.savedCode.upsert({
            where: {
                userId_problemId_language: {
                    userId: user.id,
                    problemId: problem.id,
                    language,
                },
            },
            update: { code },
            create: {
                userId: user.id,
                problemId: problem.id,
                language,
                code,
            },
        });
        res.json({ message: "Code saved!" });
    } catch (error) {
        console.error("Save code error:", error);
        res.status(500).json({ message: "Failed to save code" });
    }
};
