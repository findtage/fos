import { Client } from 'colyseus';

// Interface for user session data
interface UserSession {
    userId: string;
    username: string;
    loginTime: Date;
    lastActivity: Date;
    clients: Set<Client>; // Track multiple clients for the same user
    ipAddress?: string;
    userAgent?: string;
}

class SessionManager {
    // Map to store active user sessions: userId -> UserSession
    private activeUsers: Map<string, UserSession> = new Map();
    
    // Map to store client to user mapping: clientId -> userId 
    private clientToUser: Map<string, string> = new Map();

    /**
     * Logs in a user and kicks out any existing session
     */
    loginUser(userId: string, username: string, clientInfo?: { ip?: string, userAgent?: string }): void {
        // Check if user is already logged in
        const existingSession = this.activeUsers.get(userId);
        if (existingSession) {
            console.log(`⚠️ User ${username} (${userId}) already logged in. Kicking out all existing clients.`);
            
            // Disconnect ALL existing clients for this user
            for (const client of existingSession.clients) {
                try {
                    client.send('session_invalidated', { 
                        reason: 'NEW_LOGIN',
                        message: 'Your account has been logged in from another location.'
                    });
                    client.close(1000, 'Account logged in elsewhere');
                    console.log(`🔌 Disconnected client ${client.id} for ${username}`);
                } catch (error) {
                    console.error(`❌ Error disconnecting client ${client.id}:`, error);
                }
                
                // Clean up client mapping
                this.clientToUser.delete(client.id);
            }
        }

        // Create new session with empty clients set
        const userSession: UserSession = {
            userId,
            username,
            loginTime: new Date(),
            lastActivity: new Date(),
            clients: new Set<Client>(),
            ipAddress: clientInfo?.ip,
            userAgent: clientInfo?.userAgent
        };

        this.activeUsers.set(userId, userSession);
        console.log(`✅ User ${username} (${userId}) logged in successfully`);
    }

    /**
     * Associates a Colyseus client with a user session
     */
    associateClient(userId: string, client: Client, roomName: string): boolean {
        const session = this.activeUsers.get(userId);
        if (!session) {
            console.log(`❌ Cannot associate client: User ${userId} not found in active sessions`);
            return false;
        }

        console.log(`🔗 Associating client ${client.id} with user ${session.username} in room ${roomName}`);

        // Add client to the session's clients set
        session.clients.add(client);
        session.lastActivity = new Date();

        // Map client to user for easy lookup
        this.clientToUser.set(client.id, userId);

        console.log(`✅ Client ${client.id} associated with user ${session.username}`);
        return true;
    }

    /**
     * Removes client association when user leaves
     */
    removeClient(userId: string): void {
        const session = this.activeUsers.get(userId);
        if (!session) return;

        // Find the client to remove by looking up the clientToUser map
        let clientToRemove: Client | null = null;
        for (const [clientId, mappedUserId] of this.clientToUser.entries()) {
            if (mappedUserId === userId) {
                for (const client of session.clients) {
                    if (client.id === clientId) {
                        clientToRemove = client;
                        break;
                    }
                }
                break;
            }
        }

        if (clientToRemove) {
            session.clients.delete(clientToRemove);
            this.clientToUser.delete(clientToRemove.id);
            console.log(`🔗 Client ${clientToRemove.id} removed for user ${session.username}`);
        }

        session.lastActivity = new Date();
    }

    /**
     * Gets user ID by client ID
     */
    getUserByClientId(clientId: string): string | undefined {
        return this.clientToUser.get(clientId);
    }

    /**
     * Gets user session by user ID
     */
    getUserSession(userId: string): UserSession | undefined {
        return this.activeUsers.get(userId);
    }

    /**
     * Gets user ID by username
     */
    getUserIdByUsername(username: string): string | undefined {
        for (const [userId, session] of this.activeUsers.entries()) {
            if (session.username === username) {
                return userId;
            }
        }
        return undefined;
    }

    /**
     * Associates a Colyseus client with a user session by username
     */
    associateClientByUsername(username: string, client: Client, roomName: string): boolean {
        const userId = this.getUserIdByUsername(username);
        if (!userId) {
            console.log(`❌ Cannot associate client: User ${username} not found in active sessions`);
            return false;
        }
        return this.associateClient(userId, client, roomName);
    }

    /**
     * Checks if user is currently logged in
     */
    isUserLoggedIn(userId: string): boolean {
        return this.activeUsers.has(userId);
    }

    /**
     * Logs out a user
     */
    logoutUser(userId: string): boolean {
        const session = this.activeUsers.get(userId);
        if (!session) {
            return false;
        }

        console.log(`🚪 Logging out user ${session.username} (${userId})`);

        // Disconnect all clients
        for (const client of session.clients) {
            try {
                client.send('session_invalidated', { 
                    reason: 'LOGOUT',
                    message: 'You have been logged out.'
                });
                client.close(1000, 'User logged out');
                this.clientToUser.delete(client.id);
            } catch (error) {
                console.error(`❌ Error disconnecting client during logout:`, error);
            }
        }

        // Remove from active users
        this.activeUsers.delete(userId);
        console.log(`✅ User ${session.username} logged out successfully`);
        return true;
    }

    /**
     * Gets all active users (for debugging/admin purposes)
     */
    getAllActiveUsers(): UserSession[] {
        return Array.from(this.activeUsers.values());
    }

    /**
     * Gets count of active users
     */
    getActiveUserCount(): number {
        return this.activeUsers.size;
    }

    /**
     * Cleans up expired sessions (older than 2 hours with no activity)
     */
    cleanupExpiredSessions(): void {
        const expirationTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        const now = new Date();

        for (const [userId, session] of this.activeUsers.entries()) {
            const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
            
            if (timeSinceActivity > expirationTime) {
                console.log(`🧹 Cleaning up expired session for user ${session.username}: ${userId}`);
                this.logoutUser(userId);
            }
        }
    }

    /**
     * Start periodic cleanup of expired sessions
     */
    startCleanupInterval(): void {
        // Run cleanup every 30 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 30 * 60 * 1000);

        console.log('🧹 Session cleanup interval started (runs every 30 minutes)');
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();
export default sessionManager;
