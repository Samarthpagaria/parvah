require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkConstraints() {
    try {
        console.log("Checking constraints on issue_attachments...");
        // This is a bit hard with supabase-js but we can try to get it via SQL if we have an rpc or something.
        // Or we can just try to insert with 1kb and see if it works.
        const { data, error } = await supabaseAdmin
            .from('issue_attachments')
            .insert({
                issue_id: '79efc440-adad-4322-82f5-2ad320211263',
                file_url: 'https://test.com/test.jpg',
                file_name: 'test.jpg',
                file_type: 'image/jpeg',
                file_size_kb: 10,
                uploader_id: 'f3a50853-ada1-41f3-97b7-55c256361f1f'
            })
            .select();

        if (error) {
            console.log("Insert result (Error):", error.message);
        } else {
            console.log("Insert result (Success):", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkConstraints();
