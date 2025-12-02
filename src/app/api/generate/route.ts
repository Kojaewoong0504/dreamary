import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { getUserCredits, updateUserCredits } from '@/lib/auth-db';
import { cookies } from 'next/headers';

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
    try {
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

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { prompt, style, model, userContext } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Check Credits
        const { credits, error: creditError } = await getUserCredits(userId);

        if (creditError) {
            return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
        }

        if (credits <= 0) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
        }

        // --- Gemini Integration ---
        let interpretation = "꿈의 해석을 불러오지 못했습니다.";
        let scenes: any[] = [];

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const { gender, nationality } = userContext || { gender: 'unknown', nationality: 'unknown' };

            const systemPrompt = `
            You are a professional Dream Interpreter and AI Storyteller.
            
            User Context:
            - Gender: ${gender}
            - Nationality: ${nationality}
            - Dream Style: ${style}

            User's Dream: "${prompt}"

            Task:
            1. Analyze the dream and break it down into a 4-cut story (Intro, Development, Climax, Conclusion).
            2. For each scene, provide a Korean description (storytelling) and a detailed English image prompt.
            3. Provide an overall psychological interpretation.

            Output Format (JSON):
            {
                "scenes": [
                    {
                        "scene_number": 1,
                        "description": "Korean story text for scene 1...",
                        "image_prompt": "Detailed English image prompt for scene 1..."
                    },
                    {
                        "scene_number": 2,
                        "description": "Korean story text for scene 2...",
                        "image_prompt": "Detailed English image prompt for scene 2..."
                    },
                    {
                        "scene_number": 3,
                        "description": "Korean story text for scene 3...",
                        "image_prompt": "Detailed English image prompt for scene 3..."
                    },
                    {
                        "scene_number": 4,
                        "description": "Korean story text for scene 4...",
                        "image_prompt": "Detailed English image prompt for scene 4..."
                    }
                ],
                "interpretation": "Overall Korean interpretation..."
            }
            `;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON from Gemini response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const json = JSON.parse(jsonMatch[0]);
                interpretation = json.interpretation;
                scenes = json.scenes;
            } else {
                throw new Error("Failed to parse Gemini response");
            }

            // Generate images for each scene in parallel
            const scenePromises = scenes.map(async (scene) => {
                const encodedPrompt = encodeURIComponent(`${scene.image_prompt}, ${style} style, high quality, 8k`);
                const seed = Math.floor(Math.random() * 1000000);
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
                return {
                    ...scene,
                    imageUrl
                };
            });

            scenes = await Promise.all(scenePromises);

        } catch (geminiError) {
            console.error("Gemini generation error:", geminiError);
            return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
        }

        // Deduct Credit
        const { error: deductError } = await updateUserCredits(userId, -1);
        if (deductError) {
            return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            scenes: scenes,
            interpretation: interpretation,
            remainingCredits: credits - 1
        });

    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate image' },
            { status: 500 }
        );
    }
}
