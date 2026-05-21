const currencyFormatter = new Intl.NumberFormat("vi-VN");

export function formatListingPrice(price: number, suffix = "đ") {
    return `${currencyFormatter.format(price)}${suffix}`;
}
