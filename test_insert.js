require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function testInsert() {
    try {
        console.log("Attempting a test insert into issue_attachments to discover schema...");
        const { data, error } = await supabaseAdmin
            .from('issue_attachments')
            .insert({
                issue_id: '00000000-0000-0000-0000-000000000000', // invalid but should trigger column check if table exists
                file_url: 'test',
                file_name: 'test',
                file_type: 'test',
                file_size_kb: 0,
                uploader_id: '00000000-0000-0000-0000-000000000000'
            })
            .select();

        if (error) {
            console.log("Insert result (Error):", error.message);
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                console.log("COLUMN MISMATCH FOUND!");
            }
        } else {
            console.log("Insert result (Success):", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

testInsert();
