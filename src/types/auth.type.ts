import type { User } from "./user.type";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type VerifyEmailPayload = {
    email: string;
    otp: string;
};

export type AuthResponse = {
    user: User;
    accessToken: string;
    refreshToken: string;
    code?: string;
    message?: string;
};

export type VerifyEmailResponse = {
    user: User;
    accessToken: string;
    refreshToken: string;
    message: string;
    code?: string;
};

export type RegisterResponse = {
    user: Pick<User, "id" | "email" | "name">;
    message: string;
    code?: string;
};
