import { prisma } from "../prisma.js";
import { getAuth } from "@clerk/express";
export const getCompletions = async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        if (!isAuthenticated || !userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const completions = await prisma.problemCompletion.findMany({
            where: { userId: user.id },
            include: {
                problem: {
                    select: { slug: true },
                },
            },
        });
        res.json({
            completedProblems: completions.map(
                (completion) => completion.problem.slug
            ),
        })
    } catch (error) {
        console.error("Get completions error:", error);
        res.status(500).json({ message: "Failed to get completions" });
    }
};
export const completeProblem = async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        if (!isAuthenticated || !userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { slug, title } = req.body;
        if (!slug || !title) {
            return res.status(400).json({
                message: "Problem slug and title are required",
            });
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
        await prisma.problemCompletion.upsert({
            where: {
                userId_problemId: {
                    userId: user.id,
                    problemId: problem.id,
                },
            },
            update: {},
            create: {
                userId: user.id,
                problemId: problem.id,
            },
        });
        res.status(200).json({ message: "Problem completed!" });
    } catch (error) {
        console.error("Complete problem error:", error);
        res.status(500).json({ message: "Failed to complete problem" });
    }
};