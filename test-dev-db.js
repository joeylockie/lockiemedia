// test-dev-db.js
// A standalone script to test the database connection for the dev-tracker-service.

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('--- Starting Database Connection Test ---');

try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbFile = path.resolve(__dirname, 'lockiedb.sqlite');
    
    console.log(`Attempting to connect to database at: ${dbFile}`);

    const db = new Database(dbFile, { verbose: console.log });

    console.log('Database connection successful. Testing a simple query...');

    // Test a simple query to ensure the dev_epics table exists
    const testQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name='dev_epics';";
    const result = db.prepare(testQuery).get();

    if (result) {
        console.log('Query successful. The "dev_epics" table was found.');
        console.log('--- Test Passed ---');
    } else {
        console.error('Query failed. The "dev_epics" table was NOT found.');
        console.error('--- Test Failed ---');
    }

    db.close();
    console.log('Database connection closed.');

} catch (error) {
    console.error('--- A CRITICAL ERROR OCCURRED ---');
    console.error(error);
    console.error('--- Test Failed ---');
    process.exit(1);
}