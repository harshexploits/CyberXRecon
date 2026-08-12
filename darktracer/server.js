const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.shodan.io", "https://ipinfo.io", 
                        "https://api.abuseipdb.com", "http://apilayer.net", 
                        "https://haveibeenpwned.com", "https://dns.google",
                        "https://api.ssllabs.com", "https://api.hackertarget.com"]
        }
    }
}));

app.use(cors({
    origin: '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts.'
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// SERVE STATIC FILES
// ============================================

app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
    }
}));

// ============================================
// API KEYS (Server-side only)
// ============================================

const API_KEYS = {
    shodan: process.env.SHODAN_KEY || 'FM8NMW8rolgeoWhwQLNOhhRPAqxqsdRL',
    ipinfo: process.env.IPINFO_KEY || 'de629995c8194f',
    abuseipdb: process.env.ABUSEIPDB_KEY || '6a707f4fbe27e29a6b16f7db74ca55cbaef3d7db97bf90865e60876b4cf6d71e538c17a709c8402f',
    numverify: process.env.NUMVERIFY_KEY || 'be659a642698f784c9331a454e1645ac',
    googleCSE: process.env.GOOGLE_CSE || '44916e5760f514259'
};

// ============================================
// DATABASE (In-memory)
// ============================================

class Database {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.createDefaultUser();
    }

    createDefaultUser() {
        const defaultUser = {
            id: '1',
            username: 'demo',
            email: 'demo@example.com',
            passwordHash: crypto.createHash('sha256').update('demo123' + 'osint_salt_2024').digest('hex'),
            tier: 'trial',
            trialEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
            investigationsUsed: 0,
            investigationsLimit: 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.users.set('demo', defaultUser);
    }

    getUser(username) {
        return this.users.get(username);
    }

    updateUser(username, updates) {
        const user = this.users.get(username);
        if (!user) return null;
        const updated = { ...user, ...updates, updatedAt: Date.now() };
        this.users.set(username, updated);
        return updated;
    }

    createSession(userId, token) {
        const session = {
            id: uuidv4(),
            userId,
            token,
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        };
        this.sessions.set(token, session);
        return session;
    }

    getSession(token) {
        const session = this.sessions.get(token);
        if (!session) return null;
        if (Date.now() > session.expiresAt) {
            this.sessions.delete(token);
            return null;
        }
        return session;
    }

    deleteSession(token) {
        this.sessions.delete(token);
    }
}

const db = new Database();

// ============================================
// AUTHENTICATION
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'osint_salt_2024').digest('hex');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username, tier: user.tier }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
}

// ============================================
// INPUT VALIDATION
// ============================================

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return xss(input, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
    });
}

function validateEmail(email) {
    return validator.isEmail(email) && email.length <= 254;
}

function validateIP(ip) {
    return validator.isIP(ip);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    return cleaned.length >= 7 && cleaned.length <= 20;
}

function validateDomain(domain) {
    const cleaned = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return validator.isFQDN(cleaned);
}

function validateUsername(username) {
    return validator.isAlphanumeric(username) && username.length >= 3 && username.length <= 30;
}

function validatePassword(password) {
    return password.length >= 8;
}

// ============================================
// OSINT FUNCTIONS
// ============================================

class OSINTService {
    async investigateEmail(email) {
        const results = [];
        if (!validateEmail(email)) {
            return [{ label: '❌ Invalid Email', value: 'Please enter a valid email address' }];
        }

        const domain = email.split('@')[1];
        results.push({ label: '📧 Email Address', value: email, details: `Domain: ${domain}` });

        try {
            const response = await axios.get(
                `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
                { headers: { 'User-Agent': 'OSINT-Tool' }, timeout: 5000 }
            );
            if (response.status === 200 && response.data.length > 0) {
                const breaches = response.data.slice(0, 5).map(b => 
                    `${b.Name} (${b.BreachDate})`
                ).join(', ');
                results.push({
                    label: '⚠️ Data Breaches Found',
                    value: `${response.data.length} breaches detected`,
                    details: breaches
                });
            } else {
                results.push({
                    label: '✅ Security Check',
                    value: 'No breaches found',
                    details: 'Email not found in known data breaches'
                });
            }
        } catch (error) {
            results.push({
                label: 'ℹ️ Breach Check',
                value: 'Rate limit may be exceeded',
                details: 'Try again in a few minutes'
            });
        }

        return results;
    }

    async investigateIP(ip) {
        const results = [];
        if (!validateIP(ip)) {
            return [{ label: '❌ Invalid IP', value: 'Please enter a valid IPv4 address' }];
        }

        results.push({ label: '🌐 IP Address', value: ip, details: 'IPv4 address' });

        try {
            const response = await axios.get(
                `https://ipinfo.io/${ip}/json?token=${API_KEYS.ipinfo}`,
                { timeout: 5000 }
            );
            const data = response.data;
            results.push({
                label: '📍 Location',
                value: `${data.city || 'N/A'}, ${data.region || 'N/A'}, ${data.country || 'N/A'}`,
                details: `Coordinates: ${data.loc || 'N/A'}`
            });
            results.push({
                label: '🏢 ISP & Organization',
                value: data.org || 'N/A',
                details: `ASN: ${data.asn || 'N/A'}`
            });
            if (data.hostname) {
                results.push({
                    label: '🏷️ Hostname',
                    value: data.hostname,
                    details: 'Reverse DNS lookup'
                });
            }
        } catch (error) {}

        try {
            const response = await axios.get(
                `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
                {
                    headers: { 'Key': API_KEYS.abuseipdb, 'Accept': 'application/json' },
                    timeout: 5000
                }
            );
            const abuse = response.data.data;
            const abuseScore = abuse.abuseConfidenceScore || 0;
            const status = abuseScore > 50 ? '⚠️ High Risk' : abuseScore > 20 ? '⚠️ Medium Risk' : '✅ Low Risk';
            results.push({
                label: '🛡️ AbuseIPDB Score',
                value: `${abuseScore}% - ${status}`,
                details: `Reports: ${abuse.totalReports || 0}`
            });
        } catch (error) {}

        try {
            const response = await axios.get(
                `https://api.shodan.io/shodan/host/${ip}?key=${API_KEYS.shodan}`,
                { timeout: 5000 }
            );
            if (response.data.ports && response.data.ports.length > 0) {
                const openPorts = response.data.ports.slice(0, 10).map(p => p.toString()).join(', ');
                results.push({
                    label: '🔓 Open Ports',
                    value: `${response.data.ports.length} ports found`,
                    details: openPorts
                });
            }
            if (response.data.vulns) {
                const vulnList = Object.keys(response.data.vulns).slice(0, 5).join(', ');
                results.push({
                    label: '⚠️ Vulnerabilities (CVE)',
                    value: `${Object.keys(response.data.vulns).length} CVEs found`,
                    details: vulnList
                });
            }
        } catch (error) {}

        return results;
    }

    async investigatePhone(phone) {
        const results = [];
        const cleanPhone = phone.replace(/[^0-9+]/g, '');
        if (!validatePhone(phone)) {
            return [{ label: '❌ Invalid Phone', value: 'Please enter a valid phone number' }];
        }

        results.push({ label: '📱 Phone Number', value: cleanPhone, details: 'Sanitized input' });

        try {
            const response = await axios.get(
                `http://apilayer.net/api/validate?access_key=${API_KEYS.numverify}&number=${encodeURIComponent(cleanPhone)}`,
                { timeout: 5000 }
            );
            const data = response.data;
            if (data.valid) {
                results.push({
                    label: '✅ Validation Status',
                    value: 'Valid phone number'
                });
                results.push({
                    label: '🌍 Country',
                    value: data.country_name || 'N/A',
                    details: `Code: ${data.country_code || 'N/A'}`
                });
                if (data.carrier) {
                    results.push({
                        label: '📡 Carrier',
                        value: data.carrier,
                        details: `Line type: ${data.line_type || 'Unknown'}`
                    });
                }
            } else {
                results.push({
                    label: '❌ Validation Status',
                    value: 'Invalid phone number'
                });
            }
        } catch (error) {
            results.push({
                label: '❌ Numverify Error',
                value: 'Could not validate phone number'
            });
        }

        return results;
    }

    async investigateDomain(domain) {
        const results = [];
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!validateDomain(domain)) {
            return [{ label: '❌ Invalid Domain', value: 'Please enter a valid domain' }];
        }

        results.push({ label: '🏠 Domain', value: cleanDomain, details: 'Primary domain' });

        try {
            const response = await axios.get(
                `https://dns.google/resolve?name=${cleanDomain}&type=A`,
                { timeout: 5000 }
            );
            if (response.data.Answer) {
                const ips = response.data.Answer
                    .filter(a => a.type === 1)
                    .map(a => a.data)
                    .slice(0, 5);
                if (ips.length > 0) {
                    results.push({
                        label: '🌐 IP Addresses',
                        value: ips.join(', '),
                        details: `${ips.length} A records found`
                    });
                }
            }
        } catch (error) {}

        try {
            const response = await axios.get(
                `https://api.ssllabs.com/api/v3/analyze?host=${cleanDomain}`,
                { timeout: 10000 }
            );
            if (response.data.endpoints && response.data.endpoints.length > 0) {
                const endpoint = response.data.endpoints[0];
                results.push({
                    label: '🔒 SSL/TLS Grade',
                    value: endpoint.grade || 'N/A',
                    details: `Server: ${endpoint.serverName || 'N/A'}`
                });
            }
        } catch (error) {}

        return results;
    }

    async investigateThreats(target) {
        const results = [];
        const isIP = validateIP(target);

        if (isIP) {
            try {
                const response = await axios.get(
                    `https://api.abuseipdb.com/api/v2/check?ipAddress=${target}&maxAgeInDays=90`,
                    {
                        headers: { 'Key': API_KEYS.abuseipdb, 'Accept': 'application/json' },
                        timeout: 5000
                    }
                );
                const abuse = response.data.data;
                results.push({
                    label: '🛡️ Abuse Confidence',
                    value: `${abuse.abuseConfidenceScore || 0}%`,
                    details: `Threat level: ${abuse.abuseConfidenceScore > 50 ? '🔴 HIGH' : abuse.abuseConfidenceScore > 20 ? '🟡 MEDIUM' : '🟢 LOW'}`
                });
                if (abuse.totalReports && abuse.totalReports > 0) {
                    results.push({
                        label: '📊 Threat Reports',
                        value: `${abuse.totalReports} reports`
                    });
                }
            } catch (error) {}
        }

        if (results.length === 0) {
            results.push({
                label: 'ℹ️ Threat Analysis',
                value: 'No threat data available',
                details: 'Try IP address for threat analysis'
            });
        }

        return results;
    }

    async investigateGoogle(target) {
        const results = [];
        results.push({
            label: '🔍 Google Search',
            value: `Search for "${target}"`,
            details: `Using Google Custom Search Engine`,
            link: `https://www.google.com/search?q=${encodeURIComponent(target)}`
        });

        const dorks = [
            { label: 'LinkedIn', query: `site:linkedin.com "${target}"` },
            { label: 'Twitter', query: `site:twitter.com "${target}"` },
            { label: 'PDF Files', query: `"${target}" filetype:pdf` },
            { label: 'DOC Files', query: `"${target}" filetype:doc` }
        ];

        dorks.forEach(dork => {
            results.push({
                label: `🎯 ${dork.label}`,
                value: dork.query,
                details: `Search with Google`,
                link: `https://www.google.com/search?q=${encodeURIComponent(dork.query)}`
            });
        });

        return results;
    }
}

const osintService = new OSINTService();

// ============================================
// API ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
    try {
        let { username, email, password } = req.body;
        username = sanitizeInput(username);
        email = sanitizeInput(email);
        
        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'Username must be 3-30 characters alphanumeric' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        if (db.getUser(username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const passwordHash = hashPassword(password);
        const user = {
            id: uuidv4(),
            username,
            email,
            passwordHash,
            tier: 'trial',
            trialEnd: Date.now() + (7 * 24 * 60 * 60 * 1000),
            investigationsUsed: 0,
            investigationsLimit: 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        db.users.set(username, user);
        
        const token = generateToken(user);
        db.createSession(user.id, token);

        res.status(201).json({
            token,
            user: {
                username: user.username,
                email: user.email,
                tier: user.tier,
                investigationsUsed: user.investigationsUsed,
                investigationsLimit: user.investigationsLimit,
                trialEnd: user.trialEnd
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        let { username, password } = req.body;
        username = sanitizeInput(username);
        
        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'Invalid username' });
        }

        const user = db.getUser(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        db.createSession(user.id, token);

        res.json({
            token,
            user: {
                username: user.username,
                email: user.email,
                tier: user.tier,
                investigationsUsed: user.investigationsUsed,
                investigationsLimit: user.investigationsLimit,
                trialEnd: user.trialEnd
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        db.deleteSession(token);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = db.getUser(req.user.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            username: user.username,
            email: user.email,
            tier: user.tier,
            investigationsUsed: user.investigationsUsed,
            investigationsLimit: user.investigationsLimit,
            trialEnd: user.trialEnd
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

app.post('/api/auth/upgrade', authenticate, async (req, res) => {
    try {
        const user = db.getUser(req.user.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = db.updateUser(user.username, {
            tier: 'premium',
            investigationsLimit: Infinity
        });

        res.json({
            message: 'Upgraded to premium successfully!',
            user: {
                username: updated.username,
                tier: updated.tier,
                investigationsLimit: updated.investigationsLimit
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Upgrade failed' });
    }
});

app.post('/api/investigate', authenticate, async (req, res) => {
    try {
        let { target } = req.body;
        target = sanitizeInput(target);

        if (!target || target.length < 2) {
            return res.status(400).json({ error: 'Please enter a valid target' });
        }

        const user = db.getUser(req.user.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.tier !== 'premium' && user.investigationsUsed >= user.investigationsLimit) {
            return res.status(403).json({ 
                error: 'Free trial limit reached. Please upgrade to premium.',
                tier: user.tier
            });
        }

        if (user.tier === 'trial' && user.trialEnd && Date.now() > user.trialEnd) {
            return res.status(403).json({ 
                error: 'Trial period expired. Please upgrade to premium.',
                tier: 'expired'
            });
        }

        const results = {};
        const isEmail = validateEmail(target);
        const isIP = validateIP(target);
        const isPhone = /[\d\+\-\(\)\s]{7,}/.test(target) && !isEmail;
        const isDomain = !isEmail && !isIP && !isPhone && target.includes('.');

        if (isEmail) {
            results.email = await osintService.investigateEmail(target);
        }
        if (isIP) {
            results.ip = await osintService.investigateIP(target);
            results.threat = await osintService.investigateThreats(target);
        }
        if (isPhone) {
            results.phone = await osintService.investigatePhone(target);
        }
        if (isDomain) {
            results.domain = await osintService.investigateDomain(target);
        }

        results.google = await osintService.investigateGoogle(target);

        if (Object.keys(results).length === 1) {
            results.general = [{
                label: 'ℹ️ Target Type',
                value: 'General search',
                details: 'Specify email, IP, phone, or domain for more detailed results'
            }];
        }

        if (user.tier !== 'premium') {
            db.updateUser(user.username, {
                investigationsUsed: user.investigationsUsed + 1
            });
        }

        res.json({
            results,
            remaining: user.tier === 'premium' ? 'Unlimited' : (user.investigationsLimit - user.investigationsUsed - 1),
            tier: user.tier
        });

    } catch (error) {
        console.error('Investigation error:', error);
        res.status(500).json({ error: 'Investigation failed' });
    }
});

// ============================================
// FRONTEND ROUTES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
    console.log(`🔍 DarkTracker OSINT Server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
    console.log(`🔑 Demo login: demo / demo123`);
});

// ✅ CRITICAL FIX FOR VERCEL: Prevents timeout on cold starts
server.timeout = 120000; // 120 seconds (2 minutes)