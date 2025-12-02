import { supabase, supabaseAdmin } from './supabase';


// Assuming a 'users' table exists in Supabase with:
// id (uuid, primary key), email (text, unique), password_hash (text), created_at (timestamp), credits (int)

export const createUser = async (email: string, passwordHash: string | null, provider: string = 'email', avatarUrl: string | null = null, nationality: string | null = null, gender: string | null = null, nickname: string | null = null) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            email,
            password_hash: passwordHash,
            provider,
            avatar_url: avatarUrl,
            credits: 3, // Default credits
            nationality,
            gender,
            nickname: nickname || "Dreamer" // Use provided nickname or default
        }])
        .select()
        .single();

    return { data, error };
};

export const findUserByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    return { data, error };
};

export const getUserCredits = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

    return { credits: data?.credits, error };
};

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, credits, nationality, gender, email, is_premium, nickname, avatar_url, provider')
        .eq('id', userId)
        .single();

    return { profile: data, error };
};

export const updateUserCredits = async (userId: string, amount: number) => {
    // First get current credits
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

    if (fetchError) return { error: fetchError };

    const newCredits = (user?.credits || 0) + amount;

    const { data, error } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

export const updateUserPremium = async (userId: string, isPremium: boolean) => {
    const { data, error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

export const updateUserProfile = async (userId: string, updates: { nickname?: string; avatar_url?: string }) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

export const updateUserPassword = async (userId: string, passwordHash: string) => {
    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
};

// Dream related functions

export const createDream = async (userId: string, dreamData: any) => {
    const { data, error } = await supabaseAdmin
        .from('dreams')
        .insert([{
            user_id: userId,
            is_public: dreamData.is_public ?? true, // Default to true if not specified
            interpretation: dreamData.interpretation,
            video_url: dreamData.video_url,
            ...dreamData
        }])
        .select()
        .single();

    return { data, error };
};

export const getDreams = async (limit: number = 20, userId?: string) => {
    const { data: dreams, error } = await supabase
        .from('dreams')
        .select(`
            *,
            users:user_id (
                email,
                avatar_url,
                nickname
            )
        `)
        .eq('is_public', true) // Only fetch public dreams
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return { data: null, error };

    // If userId provided, check which dreams the user liked
    let likedDreamIds = new Set();
    if (userId && dreams && dreams.length > 0) {
        // Skip checking likes for now if tables might be missing
        /*
        const dreamIds = dreams.map(d => d.id);
        const { data: userLikes } = await supabase
            .from('likes')
            .select('dream_id')
            .eq('user_id', userId)
            .in('dream_id', dreamIds);
        
        if (userLikes) {
            userLikes.forEach(l => likedDreamIds.add(l.dream_id));
        }
        */
    }

    // Transform data to include flat counts and liked status
    const enrichedDreams = dreams.map(dream => ({
        ...dream,
        likes: 0, // Default to 0 for now
        comments: 0, // Default to 0 for now
        user_has_liked: false // Default to false
    }));

    return { data: enrichedDreams, error: null };
};

export const getUserDreams = async (userId: string) => {
    const { data, error } = await supabaseAdmin
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return { data, error };
};

export const getDreamById = async (dreamId: string) => {
    const { data, error } = await supabase
        .from('dreams')
        .select(`
            *,
            users:user_id (
                email,
                avatar_url,
                nickname
            )
        `)
        .eq('id', dreamId)
        .single();

    return { data, error };
};

export const getDreamByIdAdmin = async (dreamId: string) => {
    const { data, error } = await supabaseAdmin
        .from('dreams')
        .select(`
            *,
            users:user_id (
                email,
                avatar_url,
                nickname
            )
        `)
        .eq('id', dreamId)
        .single();

    return { data, error };
};

export const deleteDream = async (dreamId: string, userId: string) => {
    const { data, error } = await supabaseAdmin
        .from('dreams')
        .delete()
        .eq('id', dreamId)
        .eq('user_id', userId);

    return { data, error };
};

export const updateDream = async (dreamId: string, userId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
        .from('dreams')
        .update(updates)
        .eq('id', dreamId)
        .eq('user_id', userId)
        .select()
        .single();

    return { data, error };
};
// Community Features (Likes & Comments)

export const toggleLike = async (userId: string, dreamId: string) => {
    // Check if like exists
    const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('dream_id', dreamId)
        .single();

    if (existingLike) {
        // Unlike
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('dream_id', dreamId);
        return { liked: false, error };
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert([{ user_id: userId, dream_id: dreamId }]);
        return { liked: true, error };
    }
};

export const getLikeStatus = async (userId: string, dreamId: string) => {
    const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('dream_id', dreamId)
        .single();

    return { liked: !!data, error };
};

export const getDreamComments = async (dreamId: string) => {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            created_at,
            users:user_id (
                id,
                nickname,
                avatar_url
            )
        `)
        .eq('dream_id', dreamId)
        .order('created_at', { ascending: true });

    return { data, error };
};

export const addComment = async (userId: string, dreamId: string, content: string) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            user_id: userId,
            dream_id: dreamId,
            content
        }])
        .select(`
            id,
            content,
            created_at,
            users:user_id (
                id,
                nickname,
                avatar_url
            )
        `)
        .single();

    return { data, error };
};

export const deleteComment = async (commentId: string, userId: string) => {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // Ensure user owns the comment

    return { error };
};
