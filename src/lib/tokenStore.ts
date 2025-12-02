// In-memory store for Refresh Tokens (RTR)
// Map<UserId, RefreshToken>
// NOTE: This is ephemeral and will be lost on server restart. Use Redis for production.

const refreshTokens = new Map<string, string>();

export const storeRefreshToken = (userId: string, token: string) => {
    refreshTokens.set(userId, token);
};

export const validateRefreshToken = (userId: string, token: string) => {
    const storedToken = refreshTokens.get(userId);
    return storedToken === token;
};

export const revokeRefreshToken = (userId: string) => {
    refreshTokens.delete(userId);
};
