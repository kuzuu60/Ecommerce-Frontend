import CryptoJS from "crypto-js";

export const initiateEsewaPayment = (amount, productId) => {
    const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const product_code = "EPAYTEST";
    const secret_key = "8gBm/:&EnhH.1/q";
    const transaction_uuid = productId + "_" + Date.now();
    const tax_amount = "0";
    const product_service_charge = "0";
    const product_delivery_charge = "0";

    // Signature calculation: "total_amount,transaction_uuid,product_code"
    const total_amount = amount.toString(); // Ensure string
    const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hash = CryptoJS.HmacSHA256(signatureString, secret_key);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const params = {
        amount: total_amount,
        tax_amount: tax_amount,
        total_amount: total_amount,
        transaction_uuid: transaction_uuid,
        product_code: product_code,
        product_service_charge: product_service_charge,
        product_delivery_charge: product_delivery_charge,
        success_url: "http://localhost:5173/success",
        failure_url: "http://localhost:5173/failure",
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
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
