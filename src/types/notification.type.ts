export type NotificationType =
    | "LISTING_APPROVED"
    | "LISTING_REJECTED"
    | "LISTING_EXPIRED"
    | "NEW_MESSAGE"
    | "NEW_REVIEW"
    | "NEW_REPORT"
    | "SUBSCRIPTION_EXPIRING"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED";

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    refId: string | null;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    data: Notification[];
    meta: {
        page: number;
        limit: number;
        total: number;
        unreadCount: number;
    };
}
