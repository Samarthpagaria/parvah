require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function check() {
    console.log("LAST LOG FULL:");
    const { data } = await supabaseAdmin.from('issue_activity_log').select('*').order('created_at', { ascending: false }).limit(1);
    console.log(JSON.stringify(data[0], null, 2));
}

check();
