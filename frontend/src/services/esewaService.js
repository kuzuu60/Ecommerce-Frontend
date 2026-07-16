const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ESEWA_FORM_URL = import.meta.env.VITE_ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

export const initiateEsewaPayment = async (amount, productId) => {
    const response = await fetch(`${API_BASE_URL}/api/payment/esewa-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, productId }),
    });

    const paymentData = await response.json();
    if (!response.ok) {
        throw new Error(paymentData.message || "Unable to start eSewa payment");
    }

    const origin = window.location.origin;
    const params = {
        ...paymentData,
        success_url: `${origin}/success`,
        failure_url: `${origin}/failure`,
    };

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", ESEWA_FORM_URL);

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

export const verifyEsewaPayment = async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/payment/esewa-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Unable to verify eSewa payment");
    }

    return result;
};
