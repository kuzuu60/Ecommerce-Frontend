const cryptoJs = require('crypto-js');
const { randomUUID } = require('crypto');

exports.generateEsewaSignature = (req, res) => {
    const { amount, productId } = req.body;

    if (!amount || !productId) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    const secret_key = "8gBm/:&EnhH.1/q";
    const product_code = "EPAYTEST";
    const transaction_uuid = randomUUID();

    const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = cryptoJs.HmacSHA256(signatureString, secret_key);
    const signature = cryptoJs.enc.Base64.stringify(hash);

    res.json({
        signature,
        transaction_uuid,
        product_code,
        signed_field_names: "total_amount,transaction_uuid,product_code"
    });
};
