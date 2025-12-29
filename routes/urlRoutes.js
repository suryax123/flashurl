const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const axios = require('axios');
const Url = require('../models/url');

// Helper function to verify reCAPTCHA
async function verifyCaptcha(token) {
    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );
        return response.data.success;
    } catch (error) {
        console.error('CAPTCHA verification error:', error);
        return false;
    }
}

// Create short URL - NO CAPTCHA HERE
router.post('/shorten', async function(req, res) {
    try {
        const originalUrl = req.body.originalUrl;

        // Validate URL
        try {
            new URL(originalUrl);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        // Generate short ID with collision handling
        let shortId;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
            shortId = nanoid(6);
            const existing = await Url.findOne({ shortId: shortId });
            if (!existing) break;
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            return res.status(500).json({ error: 'Failed to generate unique ID' });
        }

        // Save to database
        const url = new Url({
            originalUrl: originalUrl,
            shortId: shortId
        });
        await url.save();

        // Return short URL
        const shortUrl = process.env.BASE_URL + '/' + shortId;
        res.json({ shortUrl: shortUrl, shortId: shortId });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GATE 1 - First page (8 seconds)
router.get('/:shortId', async function(req, res) {
    try {
        const shortId = req.params.shortId;
        
        // Skip if it's step2 or step3 route
        if (shortId === 'step2' || shortId === 'step3') {
            return res.status(404).render('404');
        }
        
        const url = await Url.findOne({ shortId: shortId });

        if (!url) {
            return res.status(404).render('404');
        }

        // Increment clicks
        url.clicks = url.clicks + 1;
        await url.save();

        res.render('gate1', { shortId: shortId });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('404');
    }
});

// GATE 2 - Second page (8 seconds)
router.get('/step2/:shortId', async function(req, res) {
    try {
        const shortId = req.params.shortId;
        const url = await Url.findOne({ shortId: shortId });

        if (!url) {
            return res.status(404).render('404');
        }

        res.render('gate2', { shortId: shortId });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('404');
    }
});

// GATE 3 - Final page (5 seconds + CAPTCHA)
router.get('/step3/:shortId', async function(req, res) {
    try {
        const shortId = req.params.shortId;
        const url = await Url.findOne({ shortId: shortId });

        if (!url) {
            return res.status(404).render('404');
        }

        res.render('gate3', {
            shortId: shortId,
            originalUrl: url.originalUrl,
            siteKey: process.env.RECAPTCHA_SITE_KEY
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('404');
    }
});

// Verify CAPTCHA and redirect - Server-side verification
router.post('/verify/:shortId', async function(req, res) {
    try {
        const shortId = req.params.shortId;
        const captchaToken = req.body.captchaToken;

        // Verify CAPTCHA on server
        const isValid = await verifyCaptcha(captchaToken);
        
        if (!isValid) {
            return res.status(400).json({ error: 'CAPTCHA verification failed' });
        }

        const url = await Url.findOne({ shortId: shortId });

        if (!url) {
            return res.status(404).json({ error: 'Link not found' });
        }

        res.json({ success: true, redirectUrl: url.originalUrl });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;