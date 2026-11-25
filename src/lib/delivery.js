export const deliveryFee = 200;
export const freeDeliveryThreshold = 2000;

export const getDeliveryFee = subtotal => subtotal > 0 && subtotal <= freeDeliveryThreshold ? deliveryFee : 0;

export const deliverySummary = `Rs. ${deliveryFee.toLocaleString()} delivery across Pakistan. Free on orders over Rs. ${freeDeliveryThreshold.toLocaleString()}.`;
