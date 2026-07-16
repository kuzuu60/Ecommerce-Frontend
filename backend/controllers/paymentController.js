const crypto = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const getEsewaConfig = () => ({
    productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY,
});

const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return null;
    }

    return numericAmount.toFixed(2);
};

const createSignature = (signatureString, secretKey) => crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('base64');

exports.generateEsewaSignature = (req, res) => {
    const { amount, productId } = req.body;
    const totalAmount = formatAmount(amount);
    const { productCode, secretKey } = getEsewaConfig();

    if (!totalAmount || productId === undefined || productId === null || productId === '') {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (!secretKey) {
        console.error('ESEWA_SECRET_KEY is not configured');
        return res.status(500).json({ message: 'eSewa is not configured' });
    }

    const safeProductId = String(productId).replace(/[^a-zA-Z0-9-]/g, '-');
    const transactionUuid = `${safeProductId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    const signature = createSignature(signatureString, secretKey);

    res.json({
        amount: totalAmount,
        tax_amount: '0',
        product_service_charge: '0',
        product_delivery_charge: '0',
        total_amount: totalAmount,
        signature,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        signed_field_names: signedFieldNames,
    });
};

exports.verifyEsewaResponse = (req, res) => {
    const { data } = req.body;
    const { productCode, secretKey } = getEsewaConfig();

    if (!data || !secretKey) {
        return res.status(400).json({ message: 'Invalid eSewa response' });
    }

    try {
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const signedFieldNames = decoded.signed_field_names;
        const responseSignature = decoded.signature;

        if (!signedFieldNames || !responseSignature || decoded.product_code !== productCode) {
            return res.status(400).json({ message: 'Invalid eSewa response' });
        }

        const signatureString = signedFieldNames
            .split(',')
            .map((fieldName) => `${fieldName}=${decoded[fieldName]}`)
            .join(',');
        const expectedSignature = createSignature(signatureString, secretKey);
        const receivedBuffer = Buffer.from(responseSignature, 'base64');
        const expectedBuffer = Buffer.from(expectedSignature, 'base64');

        if (
            receivedBuffer.length !== expectedBuffer.length
            || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
        ) {
            return res.status(400).json({ message: 'Invalid eSewa signature' });
        }

        if (decoded.status !== 'COMPLETE') {
            return res.status(400).json({ message: `eSewa payment status: ${decoded.status || 'UNKNOWN'}` });
        }

        return res.json({
            status: decoded.status,
            transaction_uuid: decoded.transaction_uuid,
            total_amount: decoded.total_amount,
            product_code: decoded.product_code,
        });
    } catch (error) {
        console.error('Unable to verify eSewa response:', error);
        return res.status(400).json({ message: 'Invalid eSewa response' });
    }
};
