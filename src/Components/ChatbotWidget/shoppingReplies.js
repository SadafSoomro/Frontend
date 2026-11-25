import { deliverySummary } from '../../lib/delivery.js';

const shortcuts = ['Track my order', 'Delivery charges', 'Returns', 'Find skincare', 'Find makeup'];

const answers = [
    { match: /payment|cod|cash on delivery|card|bank transfer|pay kaise/i, text: 'Checkout offers cash on delivery, bank transfer and card where available. Select an available method at checkout.', link: '/checkout', label: 'Checkout' },
    { match: /track|order status|mera order|parcel|where.*order/i, text: 'Open My Orders to check your order status and tracking details. Sign in with the account you used at checkout.', link: '/my-orders', label: 'My Orders' },
    { match: /deliver|shipping|charges|kitn[aeiy]|kab aye/i, text: deliverySummary, link: '/cart', label: 'View bag' },
    { match: /return|refund|exchange|wap[ia]s/i, text: 'Makskin advertises 7-day returns. For eligibility and next steps, message support with your order number.', support: true },
    { match: /coupon|promo code|discount code|voucher/i, text: 'Enter your promo code in the shopping bag. The bag shows whether the code applies and updates the total.', link: '/cart', label: 'View bag' },
    { match: /cancel|change.*order|address.*order/i, text: 'Open My Orders to see the actions available for your order. Message support if you need help changing the delivery address.', link: '/my-orders', label: 'My Orders', support: true },
    { match: /^(hi|hello|hey|salam|assalam.?o.?alaikum)[!. ]*$/i, text: 'Hi! I can help find products, explain delivery charges, and point you to your orders or store support.' },
    { match: /human|agent|support|contact|admin/i, text: 'You can message the Makskin team from the Support tab.', support: true },
];

const collections = [
    { match: /skin.?care|skin care|serum|cleanser|moisturi[sz]er|sunscreen/i, category: /skin.?care|serum|cleanser|face wash|sun.?screen|moisturi[sz]er|mask/i },
    { match: /make.?up|lipstick|mascara|foundation/i, category: /make.?up|lipstick|mascara|foundation|concealer|lip liner|primer/i },
    { match: /hair|shampoo|conditioner/i, category: /hair|shampoo|conditioner/i },
];

export { shortcuts };

export async function getShoppingReply(question, loadProducts) {
    const direct = answers.find(({ match }) => match.test(question));
    if (direct) return direct;

    const collection = collections.find(({ match }) => match.test(question));
    const budget = question.match(/(?:under|below|up to|budget(?: of)?|tak)\s*(?:rs\.?\s*|pkr\s*)?([\d,]+)/i);
    const limit = budget ? Number(budget[1].replaceAll(',', '')) : Infinity;
    const words = question.toLowerCase().match(/[a-z\d-]+/g) || [];
    const search = words.filter(word => !/^(i|a|an|the|is|do|you|have|find|show|me|for|want|need|please|product|products|price|under|below|up|to|budget|of|rs|pkr|tak|koi|chahiye|dikhao|suggest|recommend|hai)$/.test(word) && !/^\d+$/.test(word));
    if (!collection && !budget && !search.length) return { text: 'Ask me about a product, your order, delivery, or checkout.', support: true };

    try {
        const products = await loadProducts();
        const matches = products.flatMap(product => {
            const name = [product.name, product.brand, product.category_id?.name].filter(Boolean).join(' ');
            const price = product.on_sale ? product.price : (product.discount_price || product.price);
            const score = search.filter(word => name.toLowerCase().includes(word)).length;
            if (!Number.isFinite(price) || price > limit || (!score && !collection?.category.test(name) && !(budget && !search.length))) return [];
            return [{ id: product._id, name: product.name, price, score }];
        }).sort((a, b) => b.score - a.score).slice(0, 3);
        if (matches.length) return { text: 'Here are matching products from the Makskin catalog.', products: matches };
        return { text: 'I could not find a matching product. Try a product name or a category like sunscreen or lipstick.', support: true };
    } catch {
        return { text: 'The catalog is temporarily unavailable. You can browse the store or message support.', link: '/', label: 'Browse store', support: true };
    }
}
