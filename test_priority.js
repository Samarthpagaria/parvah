require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function testIssueInsert() {
    try {
        console.log("Testing issue insert without priority to check for default...");
        const { data, error } = await supabaseAdmin
            .from('issues')
            .insert({
                org_id: '51f54cbb-28e8-485a-b229-fae04bbf5a00', // an existing org id from logs
                reported_by: 'f3a50853-ada1-41f3-97b7-55c256361f1f', // an existing user id
                title: 'Test Issue ' + Date.now(),
                description: 'Testing if priority has a default value in DB.',
                status: 'open'
            })
            .select();

        if (error) {
            console.log("Insert result (Error):", error.message);
            if (error.message.includes("null value in column \"priority\"")) {
                console.log("DATABASE ERROR: COLUMN 'priority' HAS NO DEFAULT!");
            }
        } else {
            console.log("Insert result (Success):", data);
            console.log("Value assigned to priority:", data[0].priority);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

testIssueInsert();
