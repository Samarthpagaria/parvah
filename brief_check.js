require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function check() {
    console.log("LAST 5 LOGS:");
    const { data } = await supabaseAdmin.from('issue_activity_log').select('action, created_at').order('created_at', { ascending: false }).limit(5);
    console.log(JSON.stringify(data, null, 2));
}

check();
