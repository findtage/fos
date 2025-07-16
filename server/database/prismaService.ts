import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserData {
    email: string;
    username: string;
    password: string;
    gender: string;
}

interface UserDefaults {
    body: string;
    bottom: string;
    eyes: string;
    hair: string;
    head: string;
    shoes: string;
    top: string;
}

class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    // Auth related methods
    async createUser({ email, username, password, gender }: CreateUserData): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Set defaults based on gender
        const defaults: UserDefaults = gender === "male" ? {
            body: "mbody0",
            bottom: "mbottom0",
            eyes: "meyes0",
            hair: "mhair0",
            head: "mhead0",
            shoes: "mshoe0",
            top: "mtop0"
        } : {
            body: "body0",
            bottom: "bottom0",
            eyes: "eyes0",
            hair: "hair0",
            head: "head0",
            shoes: "shoe0",
            top: "top0"
        };

        return await this.prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                gender,
                ...defaults
            }
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { email }
        });
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { username }
        });
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id }
        });
    }

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async checkUsernameAvailable(username: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { username }
        });
        return !user;
    }

    async checkEmailAvailable(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });
        return !user;
    }

    async getUserCount(): Promise<number> {
        return await this.prisma.user.count();
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data
        });
    }

    // Cleanup method
    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }
}

export default new DatabaseService();
