import { storeUserRefreshToken, getUserRefreshToken, deleteUserRefreshToken } from './auth-db';

// Migrated to DB-backed store (Supabase)
// Functions are now async

export const storeRefreshToken = async (userId: string, token: string) => {
    await storeUserRefreshToken(userId, token);
};

export const validateRefreshToken = async (userId: string, token: string) => {
    const { token: storedToken } = await getUserRefreshToken(userId);
    return storedToken === token;
};

export const revokeRefreshToken = async (userId: string) => {
    await deleteUserRefreshToken(userId);
};
