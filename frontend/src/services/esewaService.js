import { API_BASE_URL, ESEWA_MODE } from '@/config/api';

export const initiateEsewaPayment = async (amount, productId, forceMock = false) => {
    const transaction_uuid = productId + "-" + Date.now();

    if (forceMock || ESEWA_MODE === 'mock') {
        const query = new URLSearchParams({
            txnRefId: transaction_uuid,
            productId: String(productId),
            amount: String(amount),
        });
        const response = await fetch(`${API_BASE_URL}/api/esewa/mobile/transaction?${query}`, {
            headers: {
                merchantid: 'demo-merchant',
                merchantsecret: 'demo-secret',
            },
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || data?.[0]?.code !== '00') {
            throw new Error(data?.[0]?.message?.successMessage || 'Demo payment failed');
        }
        return { mode: 'mock', transaction_uuid };
    }

    const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const signatureResponse = await fetch(`${API_BASE_URL}/api/payment/esewa-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, productId }),
    });
    const signatureData = await signatureResponse.json().catch(() => null);
    if (!signatureResponse.ok) {
        throw new Error(signatureData?.message || 'Unable to initialize eSewa payment');
    }

    const origin = window.location.origin;
    const params = {
        amount: String(amount),
        tax_amount: "0",
        total_amount: String(amount),
        transaction_uuid: signatureData.transaction_uuid,
        product_code: signatureData.product_code,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${origin}/success`,
        failure_url: `${origin}/failure`,
        signed_field_names: signatureData.signed_field_names,
        signature: signatureData.signature,
    };

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (const key in params) {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);
        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
};
