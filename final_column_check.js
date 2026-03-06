require('dotenv').config();
const { supabaseAdmin } = require('./server/src/config/db');

async function check() {
    const { data } = await supabaseAdmin.from('issue_activity_log').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("COLUMNS FOUND:", Object.keys(data[0]));
    } else {
        console.log("NO ROWS FOUND IN issue_activity_log");
    }
}
check();
