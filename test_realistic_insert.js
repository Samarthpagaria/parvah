require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function checkPublicUser() {
    try {
        console.log("Fetching a valid public user to test with...");
        const { data: user, error } = await supabaseAdmin
            .from('public_users')
            .select('id')
            .limit(1)
            .single();

        if (error) {
            console.error("Error fetching public user:", error.message);
            return;
        }

        console.log("Using public user ID:", user.id);

        const { data: issue, error: issueErr } = await supabaseAdmin
            .from('issues')
            .select('id, org_id')
            .eq('reported_by', user.id)
            .limit(1)
            .single();

        if (issueErr) {
            console.warn("No issues found for this user, trying to use any issue...");
            const { data: anyIssue } = await supabaseAdmin.from('issues').select('id, org_id').limit(1).single();
            if (anyIssue) {
                testInsert(anyIssue.id, user.id);
            } else {
                console.error("No issues in DB to test with.");
            }
        } else {
            testInsert(issue.id, user.id);
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

async function testInsert(issueId, userId) {
    console.log(`Testing insert for issue ${issueId} and user ${userId}...`);
    const { data, error } = await supabaseAdmin
        .from('issue_attachments')
        .insert({
            issue_id: issueId,
            uploader_id: userId,
            file_url: 'https://example.com/test.jpg',
            file_name: 'test.jpg',
            file_type: 'image/jpeg',
            file_size_kb: 100
        })
        .select();

    if (error) {
        console.error("INSERT FAILED:", error.message);
    } else {
        console.log("INSERT SUCCESSFUL!", data);
    }
}

checkPublicUser();
