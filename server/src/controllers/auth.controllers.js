const supabase = require("../config/db");

//admin login
// POST /api/auth/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Step 1 — Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Step 2 — Check if this user exists in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", data.user.id)
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      return res
        .status(403)
        .json({ error: "Access denied. Not an admin account." });
    }

    // Step 3 — Return JWT + admin profile
    res.json({
      token: data.session.access_token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        avatar_url: adminUser.avatar_url,
        is_super_admin: adminUser.is_super_admin,
      },
    });
  } catch (err) {
    console.error("loginAdmin error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public User Login
// POST /api/auth/public/login
const loginPublicUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Step 1 — Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Step 2 — Check if user exists in public_users table
    const { data: publicUser, error: userError } = await supabase
      .from("public_users")
      .select("*")
      .eq("id", data.user.id)
      .eq("is_active", true)
      .single();

    if (userError || !publicUser) {
      return res
        .status(403)
        .json({ error: "Access denied. Not a public user account." });
    }

    // Step 3 — Return JWT + user profile
    res.json({
      token: data.session.access_token,
      user: {
        id: publicUser.id,
        email: publicUser.email,
        full_name: publicUser.full_name,
        avatar_url: publicUser.avatar_url,
        phone: publicUser.phone,
      },
    });
  } catch (err) {
    console.error("loginPublicUser error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Public User Register 
// POST /api/auth/public/register
const registerPublicUser = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password and full name are required' })
    }

    // Step 1 — Create auth account in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Step 2 — Create profile in public_users table
    const { data: newUser, error: insertError } = await supabase
      .from('public_users')
      .insert({
        id: data.user.id,     // same UUID as auth.users
        email,
        full_name,
        phone: phone || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert public_user error:', insertError.message)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name
      }
    })

  } catch (err) {
    console.error('registerPublicUser error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Logout
// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // Invalidate the session in Supabase
    await supabase.auth.signOut()

    res.json({ message: 'Logged out successfully' })

  } catch (err) {
    console.error('logout error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get Current User
// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // req.user is already set by auth middleware
    const userId = req.user.id

    // Check admin_users first
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (adminUser) {
      return res.json({
        type: 'admin',
        user: adminUser
      })
    }

    // Check public_users
    const { data: publicUser } = await supabase
      .from('public_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (publicUser) {
      return res.json({
        type: 'public',
        user: publicUser
      })
    }

    res.status(404).json({ error: 'User profile not found' })

  } catch (err) {
    console.error('getMe error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── Update Profile ─────────────────────────────────────────
// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { full_name, avatar_url, phone, address } = req.body

    // Try updating admin_users first
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single()

    if (adminUser) {
      const { data, error } = await supabase
        .from('admin_users')
        .update({ full_name, avatar_url })
        .eq('id', userId)
        .select()
        .single()

      if (error) return res.status(400).json({ error: error.message })
      return res.json({ user: data })
    }

    // Otherwise update public_users
    const { data, error } = await supabase
      .from('public_users')
      .update({ full_name, avatar_url, phone, address })
      .eq('id', userId)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json({ user: data })

  } catch (err) {
    console.error('updateProfile error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  loginAdmin,
  loginPublicUser,
  registerPublicUser,
  logout,
  getMe,
  updateProfile
}