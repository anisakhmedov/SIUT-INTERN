const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uri = "mongodb+srv://akhmedovanis:nipanid2@cluster0.1bp9j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function backup() {
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const dbName = client.options.dbName;
        const db = client.db(dbName);

        const collections = await db.listCollections().toArray();

        const backupDir = path.join(__dirname, "backup");

        if (!fs.existsSync(backupDir))
            fs.mkdirSync(backupDir);

        for (const collection of collections) {
            const data = await db.collection(collection.name).find({}).toArray();

            fs.writeFileSync(
                path.join(backupDir, `${collection.name}.json`),
                JSON.stringify(data, null, 2)
            );

            console.log(`✔ ${collection.name} (${data.length} документов)`);
        }

        console.log("\nГотово!");
    } finally {
        await client.close();
    }
}

backup().catch(console.error);