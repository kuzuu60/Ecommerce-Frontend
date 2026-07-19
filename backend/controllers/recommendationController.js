const path = require('path');
const { spawn } = require('child_process');
const pool = require('../models/db');

const fs = require('fs');

const getPythonCommand = () => {
    if (process.env.PYTHON_COMMAND) return process.env.PYTHON_COMMAND;
    if (process.platform !== 'win32') {
        const condaPath = '/opt/anaconda3/envs/SPC/bin/python';
        if (fs.existsSync(condaPath)) return condaPath;
        return 'python3';
    }
    return 'python';
};

const pythonCommand = getPythonCommand();

const runPythonRecommender = (payload) => new Promise((resolve, reject) => {
    const process = spawn(pythonCommand, ['-m', 'recommender.cli'], {
        cwd: path.join(__dirname, '..'),
        windowsHide: true,
    });
    let output = '';
    let errorOutput = '';
    let settled = false;

    const timeout = setTimeout(() => {
        process.kill();
        if (!settled) {
            settled = true;
            reject(new Error('Recommendation model timed out'));
        }
    }, 15000);

    process.stdout.on('data', (chunk) => { output += chunk.toString(); });
    process.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });
    process.on('error', (error) => {
        clearTimeout(timeout);
        if (!settled) {
            settled = true;
            reject(new Error(`Unable to start Python recommender: ${error.message}`));
        }
    });
    process.on('close', (code) => {
        clearTimeout(timeout);
        if (settled) return;
        settled = true;
        if (code !== 0) {
            reject(new Error(errorOutput.trim() || `Python recommender exited with code ${code}`));
            return;
        }
        try {
            resolve(JSON.parse(output));
        } catch (error) {
            reject(new Error(`Python recommender returned invalid JSON: ${error.message}`));
        }
    });

    process.stdin.end(JSON.stringify(payload));
});

exports.getRecommendations = async (req, res) => {
    try {
        const productId = Number.parseInt(req.params.id, 10);
        const requestedTopN = Number.parseInt(req.query.topN || req.query.limit, 10);
        const topN = Number.isFinite(requestedTopN) ? Math.min(Math.max(requestedTopN, 1), 20) : null;

        if (!Number.isInteger(productId)) {
            return res.status(400).json({ message: 'Product id must be a number' });
        }

        const result = await pool.query(`
            SELECT id, title, description, specs, category, brand, price, stock,
                   discount_percentage AS "discountPercentage", thumbnail
            FROM products
            ORDER BY id
        `);
        if (!result.rows.some((product) => product.id === productId)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const recommendations = await runPythonRecommender({
            productId,
            topN,
            products: result.rows,
        });
        res.json(recommendations);
    } catch (error) {
        console.error('Product recommendation error:', error);
        res.status(500).json({ message: error.message || 'Recommendation failed' });
    }
};
