import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';

// ─── Retry helper ─────────────────────────────────────────────────────────────
const withRetry = async <T>(fn: () => Promise<T>, retries = 1, delayMs = 1000): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isNetwork = err instanceof TypeError && (err as TypeError).message === 'Failed to fetch';
      if (isNetwork && attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const authApi = {
  me: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return profile ? { ...user, ...profile } : { ...user, role: 'merchant', full_name: '' };
  },

  logout: () => supabase.auth.signOut(),

  updateMe: async (updates: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Generic entity helpers ───────────────────────────────────────────────────
const orderByField = (orderStr?: string) => {
  if (!orderStr) return { column: 'created_date', ascending: false };
  const asc = !orderStr.startsWith('-');
  return { column: orderStr.replace(/^-/, ''), ascending: asc };
};

// ─── SalonApplication ─────────────────────────────────────────────────────────
export const SalonApplication = {
  list: async (order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('salon_applications')
        .select('*')
        .order(column, { ascending });
      if (error) throw error;
      return data || [];
    });
  },

  filter: async (filters: Record<string, unknown> = {}, order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    return withRetry(async () => {
      let query = supabase.from('salon_applications').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'created_by' && typeof value === 'string' && value.includes('@')) {
          query = query.eq('created_by_email', value);
        } else {
          query = query.eq(key, value as string);
        }
      });
      query = query.order(column, { ascending });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    });
  },

  create: async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const { data, error } = await supabase
      .from('salon_applications')
      .insert({
        ...payload,
        created_by: user?.id,
        created_by_email: user?.email,
        created_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('salon_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('salon_applications').delete().eq('id', id);
    if (error) throw error;
    return {};
  },
};

// ─── SalonProfile ─────────────────────────────────────────────────────────────
export const SalonProfile = {
  list: async (order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    const { data, error } = await supabase
      .from('salon_profiles')
      .select('*')
      .order(column, { ascending });
    if (error) throw error;
    return data || [];
  },

  filter: async (filters: Record<string, unknown> = {}, order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    let query = supabase.from('salon_profiles').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'created_by' && typeof value === 'string' && value.includes('@')) {
        query = query.eq('created_by_email', value);
      } else {
        query = query.eq(key, value as string);
      }
    });
    query = query.order(column, { ascending });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const { data, error } = await supabase
      .from('salon_profiles')
      .insert({
        ...payload,
        created_by: user?.id,
        created_by_email: user?.email,
        created_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('salon_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('salon_profiles').delete().eq('id', id);
    if (error) throw error;
    return {};
  },
};

// ─── SalonProfileVersion ──────────────────────────────────────────────────────
export const SalonProfileVersion = {
  list: async (order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    return withRetry(async () => {
      const { data, error } = await supabase
        .from('salon_profile_versions')
        .select('*')
        .order(column, { ascending });
      if (error) throw error;
      return data || [];
    });
  },

  filter: async (filters: Record<string, unknown> = {}, order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    return withRetry(async () => {
      let query = supabase.from('salon_profile_versions').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value as string);
      });
      query = query.order(column, { ascending });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    });
  },

  create: async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const { data, error } = await supabase
      .from('salon_profile_versions')
      .insert({
        ...payload,
        created_by: user?.id,
        created_by_email: user?.email,
        created_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from('salon_profile_versions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('salon_profile_versions').delete().eq('id', id);
    if (error) throw error;
    return {};
  },
};

// ─── UserActivityLog ──────────────────────────────────────────────────────────
export const UserActivityLog = {
  list: async (order = '-created_date', limit = 500) => {
    const { column, ascending } = orderByField(order);
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order(column, { ascending })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  filter: async (filters: Record<string, unknown> = {}, order = '-created_date') => {
    const { column, ascending } = orderByField(order);
    let query = supabase.from('user_activity_logs').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });
    query = query.order(column, { ascending }).limit(500);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert({
        ...payload,
        user_id: user?.id,
        created_date: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── Functions (Edge Functions) ───────────────────────────────────────────────
export const functionsApi = {
  invoke: async (name: string, params: Record<string, unknown> = {}) => {
    const slugMap: Record<string, string> = {
      shopifyData: 'supabase-functions-shopify-data',
      listUsers: 'supabase-functions-list-users',
      inviteAdminUser: 'supabase-functions-invite-admin-user',
      checkShopifyHandle: 'supabase-functions-shopify-check-handle',
      refreshShopifyToken: 'supabase-functions-shopify-refresh-token',
    };
    const slug = slugMap[name] || name;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token || supabaseAnonKey;

    const response = await withRetry(() => fetch(`${supabaseUrl}/functions/v1/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(params),
    }));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { data };
  },
};

// ─── File upload ──────────────────────────────────────────────────────────────
export const uploadFile = async ({ file }: { file: File }) => {
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file, { upsert: false });
  if (error) {
    return { file_url: URL.createObjectURL(file) };
  }
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
  return { file_url: urlData.publicUrl };
};
