require('dotenv').config();
import DatabaseController from "./database-controller";
import { queries } from "./queries";

(async () => {
    const databaseController = new DatabaseController();
    await databaseController.awaitConnection();

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        const result = await databaseController.query(query.query);
        console.log(query.name);
        console.log(query.description);
        // console.log(query.query);
        console.log(JSON.stringify(result.rows, null, 2));
        console.log('\n\n\n');
    }
    try {
        await databaseController?.close();
    } catch (e) {
        console.error('Unexpected error closing db connection', e);
    }
})();