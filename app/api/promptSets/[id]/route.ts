import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";

console.log(uri);
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
	tls: true,
});

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await client.connect();
		const db = client.db("promptsDB");
		const promptSetsCollection = db.collection("promptSets");
		const promptsCollection = db.collection("prompts");

		const { id } = params;

		if (!id) {
			return NextResponse.json(
				{ error: "Missing '_id' parameter" },
				{ status: 400 }
			);
		}

		// Convert string ID to ObjectId
		const objectId = new ObjectId(id);

		// Use aggregation to match and dereference prompts
		const result = await promptSetsCollection
			.aggregate([
				{ $match: { _id: objectId } }, // Match the specific PromptSet by _id
				{
					$lookup: {
						from: "prompts", // Reference the prompts collection
						localField: "prompts", // The array of references in promptSets
						foreignField: "_id", // The field in the prompts collection to match
						as: "prompts", // Name the resulting array in the output
					},
				},
			])
			.toArray();

		if (result.length === 0) {
			return NextResponse.json(
				{ error: "No PromptSet found with the given _id" },
				{ status: 404 }
			);
		}

		// Return the single matching PromptSet
		return NextResponse.json(result[0]);
	} catch (error) {
		console.error("Error fetching promptSet:", error);
		return NextResponse.json(
			{ error: "Failed to fetch promptSet" },
			{ status: 500 }
		);
	} finally {
		await client.close(); // Ensure the client is closed after the request
	}
}
