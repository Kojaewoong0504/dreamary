import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '@/lib/auth-db';
import { validatePassword } from '@/lib/validation';

export async function POST(request: Request) {
    try {
        const { email, password, nationality, gender, nickname, phoneNumber } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Validate password
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error } = await createUser(email, hashedPassword, 'email', null, nationality, gender, nickname, phoneNumber);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
