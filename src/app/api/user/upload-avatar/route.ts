import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateUserProfile } from '@/lib/auth-db';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    console.log('[Upload API] Request received');
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Upload API] Missing SUPABASE_SERVICE_ROLE_KEY');
            return NextResponse.json({ error: 'Server configuration error: Missing Service Role Key' }, { status: 500 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        console.log(`[Upload API] Uploading for user: ${userId}, File: ${file?.name}, Size: ${file?.size}`);

        if (!file || !userId) {
            return NextResponse.json({ error: 'File and User ID are required' }, { status: 400 });
        }

        // 1. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log(`[Upload API] Target path: ${filePath}`);

        // Try to upload
        let { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type
            });

        if (uploadError) {
            console.error('[Upload API] Upload failed:', uploadError);

            // Try creating bucket
            console.log('[Upload API] Attempting to create bucket...');
            const { error: bucketError } = await supabase
                .storage
                .createBucket('avatars', {
                    public: true
                });

            if (bucketError) {
                console.error('[Upload API] Bucket creation failed:', bucketError);
                // Continue to try upload anyway, maybe it was a transient error or bucket exists
            }

            // Retry upload
            const { error: retryError } = await supabase
                .storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                });

            if (retryError) {
                console.error('[Upload API] Retry upload failed:', retryError);
                return NextResponse.json({ error: `Upload failed: ${retryError.message}` }, { status: 500 });
            }
        }

        console.log('[Upload API] Upload successful');

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        console.log(`[Upload API] Public URL: ${publicUrl}`);

        // 3. Update User Profile
        const { error: updateError } = await updateUserProfile(userId, { avatar_url: publicUrl });

        if (updateError) {
            console.error('[Upload API] Profile update failed:', updateError);
            return NextResponse.json({ error: 'Failed to update profile database' }, { status: 500 });
        }

        console.log('[Upload API] Profile updated successfully');
        return NextResponse.json({ success: true, avatarUrl: publicUrl });
    } catch (error: any) {
        console.error('[Upload API] Server Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
