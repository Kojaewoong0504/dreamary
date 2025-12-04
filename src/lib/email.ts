import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
    try {
        // In development/testing without a domain, we can only send to the verified email (usually the account owner).
        // Or we can use 'onboarding@resend.dev' which only sends to the account owner.
        // For production, this should be 'noreply@yourdomain.com'.

        const fromEmail = 'onboarding@resend.dev';
        // NOTE: If you have a custom domain set up in Resend, change this to your domain email.

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: '[Dreamary] 인증번호가 도착했습니다',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0f; color: #ffffff; border-radius: 10px;">
                    <h1 style="color: #a855f7; text-align: center;">Dreamary</h1>
                    <div style="background-color: #1a1a2e; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #333;">
                        <p style="font-size: 16px; color: #cccccc; margin-bottom: 20px;">
                            비밀번호 재설정을 위한 인증번호입니다.<br/>
                            아래 번호를 입력하여 인증을 완료해주세요.
                        </p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #22d3ee; margin: 30px 0; padding: 15px; background-color: #0f172a; border-radius: 5px; display: inline-block;">
                            ${code}
                        </div>
                        <p style="font-size: 14px; color: #666666; margin-top: 20px;">
                            본인이 요청하지 않았다면 이 이메일을 무시하세요.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #444;">
                        &copy; ${new Date().getFullYear()} Dreamary. All rights reserved.
                    </div>
                </div>
            `
        });

        if (error) {
            // Fallback for testing without domain (Resend Free Tier Limitation)
            // If we get a validation error about sending to unverified email, we log the code to console.
            const isValidationError = error.name === 'validation_error';
            const isForbidden = (error as any).statusCode === 403;
            const isDomainError = error.message.includes('only send testing emails') || error.message.includes('verify a domain');

            if (isValidationError && (isForbidden || isDomainError)) {
                console.log("\n==================================================================");
                console.log("⚠️ [DEV MODE] Resend Email Failed (Domain Verification Required)");
                console.log(`📧 To: ${email}`);
                console.log(`🔑 Verification Code: ${code}`);
                console.log("==================================================================\n");
                return { success: true, data: { id: 'mock-id-dev' } }; // Pretend success for testing
            }

            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email Send Failed:", error);
        return { success: false, error };
    }
};
