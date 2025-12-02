import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { createDream, getDreams } from '@/lib/auth-db';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Helper to get user ID from request
async function getUserId(req: Request) {
    let userId: string | null = null;

    // 1. Try Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token) as any;
        if (decoded?.userId) userId = decoded.userId;
    }

    // 2. Try Cookie if Header failed
    if (!userId) {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken) as any;
            if (decoded?.userId) userId = decoded.userId;
        }
    }
    return userId;
}

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);
        const { data, error } = await getDreams(20, userId || undefined);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
        }

        return NextResponse.json({ dreams: data });
    } catch (error) {
        console.error('Fetch dreams error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, image_url, scenes, style, tags, is_public, interpretation, video_url } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // 1. Download image from external URL
        let finalImageUrl = image_url;
        try {
            if (image_url) {
                console.log(`[Dream API] Downloading image from: ${image_url}`);
                const imageRes = await fetch(image_url);
                if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);

                const imageBuffer = await imageRes.arrayBuffer();
                const fileName = `${userId}-${Date.now()}.png`;
                const filePath = `${fileName}`;

                // 2. Upload to Supabase Storage
                console.log(`[Dream API] Uploading to Supabase: ${filePath}`);
                const { error: uploadError } = await supabase
                    .storage
                    .from('dream-images')
                    .upload(filePath, imageBuffer, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Supabase upload error:', uploadError);
                    throw uploadError;
                }

                // 3. Get Public URL
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('dream-images')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
                console.log(`[Dream API] Image uploaded to: ${finalImageUrl}`);
            }
        } catch (error) {
            console.error('Image upload process failed:', error);
            // Continue with original URL if upload fails
        }

        const { data, error } = await createDream(userId, {
            title,
            content,
            image_url: finalImageUrl,
            scenes, // Add scenes to storage
            style,
            tags,
            is_public,
            interpretation,
            video_url
        });

        if (error) {
            console.error('Database insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Dream creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
