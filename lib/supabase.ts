import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// Browser client backed by cookies (chunked) instead of sessionStorage, so the
// session survives tab closes, app-switches, and browser restarts.
// persistSession + autoRefreshToken are on by default.
//
// Note: these cookies are written client-side and are readable by JavaScript,
// so against XSS they're equivalent to localStorage. True httpOnly hardening
// would require the server-side @supabase/ssr + middleware setup.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
