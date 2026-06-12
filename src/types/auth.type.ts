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

export type GoogleLoginPayload = {
    sub?: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    nickname?: string;
    picture?: string;
    email_verified?: boolean;
    authProvider?: "google";
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
