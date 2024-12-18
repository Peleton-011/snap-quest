import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";

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
) {
	try {
		await client.connect();
		const db = client.db("promptsDB");
		const promptSetsCollection = db.collection("promptSets");

		const { id } = await req.json(); // Access the "id" from context.params

		if (!id) {
			return NextResponse.json(
				{ error: "Missing 'id' parameter" },
				{ status: 400 }
			);
		}

		const objectId = new ObjectId(id);

		const result = await promptSetsCollection
			.aggregate([
				{ $match: { _id: objectId } },
				{
					$lookup: {
						from: "prompts",
						localField: "prompts",
						foreignField: "_id",
						as: "prompts",
					},
				},
			])
			.toArray();

		if (result.length === 0) {
			return NextResponse.json(
				{ error: "No PromptSet found with the given id" },
				{ status: 404 }
			);
		}

		return NextResponse.json(result[0]);
	} catch (error) {
		console.error("Error fetching promptSet:", error);
		return NextResponse.json(
			{ error: "Failed to fetch promptSet" },
			{ status: 500 }
		);
	} finally {
		await client.close();
	}
}
