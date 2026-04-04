// User-friendly error and success messages
// Centralized for easy maintenance and i18n support

export const AUTH_MESSAGES = {
    // Login errors
    LOGIN_INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
    LOGIN_USER_NOT_FOUND: "Tài khoản không tồn tại. Vui lòng đăng ký.",
    LOGIN_ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.",
    LOGIN_GENERIC_ERROR: "Đăng nhập thất bại. Vui lòng thử lại sau.",

    // Login success
    LOGIN_SUCCESS: "Đăng nhập thành công!",

    // Register errors
    REGISTER_EMAIL_EXISTS: "Email đã được sử dụng. Vui lòng dùng email khác.",
    REGISTER_INVALID_EMAIL: "Email không hợp lệ.",
    REGISTER_PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 6 ký tự.",
    REGISTER_PASSWORDS_MISMATCH: "Mật khẩu xác nhận không khớp.",
    REGISTER_GENERIC_ERROR: "Đăng ký thất bại. Vui lòng thử lại sau.",

    // Register success
    REGISTER_SUCCESS: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.",

    // OTP errors
    OTP_INVALID: "Mã xác nhận không đúng. Vui lòng kiểm tra lại.",
    OTP_EXPIRED: "Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.",
    OTP_RATE_LIMIT: "Vui lòng đợi 1 phút trước khi yêu cầu mã mới.",
    OTP_GENERIC_ERROR: "Xác nhận thất bại. Vui lòng thử lại.",

    // OTP success
    OTP_VERIFIED: "Xác nhận thành công!",
    OTP_RESENT: "Mã xác nhận đã được gửi lại.",

    // Network errors
    NETWORK_ERROR: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
    SERVER_ERROR: "Máy chủ đang bảo trì. Vui lòng thử lại sau.",
    TIMEOUT_ERROR: "Yêu cầu quá thời gian. Vui lòng thử lại.",

    // Session errors
    SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    UNAUTHORIZED: "Bạn cần đăng nhập để thực hiện thao tác này.",

    // Field validation
    REQUIRED_FIELD: "Vui lòng điền đầy đủ thông tin.",
    INVALID_EMAIL_FORMAT: "Email không đúng định dạng.",
} as const;

export const LISTING_MESSAGES = {
    // Create/Update
    CREATE_SUCCESS: "Đăng tin thành công!",
    UPDATE_SUCCESS: "Cập nhật tin thành công!",
    DELETE_SUCCESS: "Xóa tin thành công!",

    // Errors
    CREATE_ERROR: "Đăng tin thất bại. Vui lòng thử lại.",
    UPDATE_ERROR: "Cập nhật thất bại. Vui lòng thử lại.",
    DELETE_ERROR: "Xóa tin thất bại. Vui lòng thử lại.",
    FETCH_ERROR: "Không thể tải danh sách tin. Vui lòng thử lại.",
    NOT_FOUND: "Không tìm thấy tin này.",

    // Validation
    TITLE_REQUIRED: "Vui lòng nhập tiêu đề.",
    ADDRESS_REQUIRED: "Vui lòng nhập địa chỉ.",
    PRICE_INVALID: "Giá thuê không hợp lệ.",
    AREA_INVALID: "Diện tích không hợp lệ.",

    // Actions
    CONFIRM_DELETE: "Bạn có chắc muốn xóa tin này?",
} as const;

export const SAVED_MESSAGES = {
    SAVE_SUCCESS: "Đã lưu tin!",
    UNSAVE_SUCCESS: "Đã bỏ lưu tin.",
    SAVE_ERROR: "Không thể lưu tin. Vui lòng đăng nhập.",
    FETCH_ERROR: "Không thể tải danh sách tin đã lưu.",
} as const;

export const REVIEW_MESSAGES = {
    SUBMIT_SUCCESS: "Đánh giá đã được gửi!",
    SUBMIT_ERROR: "Gửi đánh giá thất bại. Vui lòng thử lại.",
    UPDATE_SUCCESS: "Đánh giá đã được cập nhật!",
    UPDATE_ERROR: "Cập nhật đánh giá thất bại.",
    DELETE_SUCCESS: "Đã xóa đánh giá.",
    DELETE_ERROR: "Xóa đánh giá thất bại.",
    ALREADY_REVIEWED: "Bạn đã đánh giá tin này rồi.",
    OWN_LISTING: "Không thể đánh giá tin của chính mình.",
    FETCH_ERROR: "Không thể tải đánh giá.",
} as const;

// Helper function to get user-friendly error message
export function getErrorMessage(error: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại."): string {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Auth errors
        if (message.includes("invalid credentials")) return AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS;
        if (message.includes("unauthorized")) return AUTH_MESSAGES.UNAUTHORIZED;
        if (message.includes("session")) return AUTH_MESSAGES.SESSION_EXPIRED;

        // Network errors
        if (message.includes("network") || message.includes("connection")) {
            return AUTH_MESSAGES.NETWORK_ERROR;
        }
        if (message.includes("timeout")) return AUTH_MESSAGES.TIMEOUT_ERROR;

        // OTP errors
        if (message.includes("invalid or expired otp")) return AUTH_MESSAGES.OTP_EXPIRED;
        if (message.includes("invalid otp")) return AUTH_MESSAGES.OTP_INVALID;
        if (message.includes("rate limit")) return AUTH_MESSAGES.OTP_RATE_LIMIT;

        // Register errors
        if (message.includes("email already exists")) return AUTH_MESSAGES.REGISTER_EMAIL_EXISTS;

        // Review errors
        if (message.includes("already reviewed")) return REVIEW_MESSAGES.ALREADY_REVIEWED;
        if (message.includes("cannot review your own")) return REVIEW_MESSAGES.OWN_LISTING;

        // Validation errors
        if (message.includes("must be a number") || message.includes("expected number")) {
            return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường số liệu.";
        }
        if (message.includes("is required") || message.includes("should not be empty")) {
            return "Vui lòng điền đầy đủ thông tin bắt buộc.";
        }
        if (message.includes("validation failed")) {
            return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
        }

        // Server errors
        if (message.includes("internal server error") || message.includes("500")) {
            return AUTH_MESSAGES.SERVER_ERROR;
        }

        return error.message;
    }

    return fallback;
}

// Helper to check if error is a network error
export function isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return message.includes("network") ||
               message.includes("connection") ||
               message.includes("timeout") ||
               message.includes("failed to fetch");
    }
    return false;
}
