import "dotenv/config";
import fs from "fs";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
function parseMongoDate(value) {
    if (value?.$date?.$numberLong) {
        return new Date(Number(value.$date.$numberLong));
    }
    if (value?.$date) {
        return new Date(value.$date);
    }
    return new Date(value);
}
async function importTeams() {
    try {
        //        console.log("Reading...");
        const rawData = fs.readFileSync(
            "./teams.json",
            "utf-8"
        );
        const teams = JSON.parse(rawData);
        if (!Array.isArray(teams)) {
            throw new Error("Expected a JSON array of team records.");
        }
        console.log(`Found ${teams.length} records.`);
        const formattedTeams = teams.map((team) => {
            const createdAt = parseMongoDate(team.createdAt);
            const updatedAt = parseMongoDate(team.updatedAt);
            if (
                !Number.isInteger(team.teamNumber) ||
                Number.isNaN(createdAt.getTime()) ||
                Number.isNaN(updatedAt.getTime())
            ) {
                throw new Error(
                    `Invalid record for team ${team.teamNumber}`
                );
            }
            return {
                teamNumber: team.teamNumber,
                createdAt,
                updatedAt,
            };
        });
        const badTeams = formattedTeams.filter((team) =>
            typeof team.teamNumber !== "number" ||
            !Number.isSafeInteger(team.teamNumber) ||
            team.teamNumber < -2147483648 ||
            team.teamNumber > 2147483647
        );

        console.log("Invalid records:", badTeams);
        console.log("Total invalid records:", badTeams.length);

        console.log("Importing into SQL");
        let imported = 0;
        for (let i = 0; i < formattedTeams.length; i += 500) {
            const batch = formattedTeams.slice(i, i + 500);
            const result = await prisma.teamNumber.createMany({
                data: batch,
            });
            imported += result.count;
            console.log(
                `Imported ${imported}/${formattedTeams.length}`
            );
        }
        let total = await prisma.teamNumber.count();
        console.log("\nImport completed!");
        console.log(`New records imported: ${imported}`);
        console.log(`Total PostgreSQL records: ${total}`);
    } catch (error) {
        console.error("Import failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}
importTeams();
