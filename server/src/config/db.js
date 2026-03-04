const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "server/src/config/db.js: Missing Supabase environment variables",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;

// any backend file e.g. issues.controller.js
// const supabase = require('../config/db')

// const getIssues = async (req, res) => {
//   const { data, error } = await supabase
//     .from('issues')
//     .select('*')
// }
