import { NextRequest, NextResponse } from "next/server";
import { PromptSet, Prompt } from "@/app/types/types";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI || "";

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});


export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const set = searchParams.get("set") || "default";

	// Fetch promptSets from mongoDB

	try {
		await client.connect();
		const db = client.db("promptsDB");
		const promptSetsCollection = db.collection<PromptSet>("promptSets");
		const promptSets = await promptSetsCollection.find({}, { projection: { _id: 1, name: 1, description: 1} }).toArray();
		return NextResponse.json(promptSets);
	} catch (error) {
		console.error("Error fetching promptSets:", error);
	}
}
