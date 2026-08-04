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
const dns = require('dns').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY & MIDDLEWARE
// ============================================

app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// ============================================
// FREE OSINT ENGINE (No payment required)
// ============================================

// 1. Basic DNS Records Fetching
async function getDNSRecords(domain) {
    const results = [];
    try {
        const resolve4 = await dns.resolve4(domain).catch(() => []);
        const resolve6 = await dns.resolve6(domain).catch(() => []);
        const resolveMx = await dns.resolveMx(domain).catch(() => []);
        const resolveNs = await dns.resolveNs(domain).catch(() => []);

        if(resolve4.length > 0) results.push({ label: '🌐 A Records (IPv4)', value: resolve4.join(', ') });
        if(resolve6.length > 0) results.push({ label: '🌐 AAAA Records (IPv6)', value: resolve6.join(', ') });
        if(resolveMx.length > 0) results.push({ label: '📧 MX Records (Mail Servers)', value: resolveMx.map(m => m.exchange).join(', ') });
        if(resolveNs.length > 0) results.push({ label: '📌 NS Records (Nameservers)', value: resolveNs.join(', ') });
    } catch (e) {
        results.push({ label: 'DNS Info', value: 'Unable to fetch records' });
    }
    return results;
}

// 2. SecurityTrails (Subdomain Discovery - Free Tier)
async function getSubdomains(domain) {
    try {
        // SecurityTrails ke free API endpoint ka use karte hain
        // Note: Ye specific API user-agent require karti hai
        const response = await axios.get(`https://api.securitytrails.com/v1/domain/${domain}/subdomains?apikey=`, { 
            headers: { 'APIKEY': 'free_trial_placeholder' }, // Free trial mein limit hoti hai, isliye try-catch me hai
            timeout: 5000 
        });
        if (response.data.subdomains && response.data.subdomains.length > 0) {
            return {
                label: '📂 Discovered Subdomains',
                value: response.data.subdomains.slice(0, 15).map(s => `${s}.${domain}`).join(', '),
                details: `Found ${response.data.subdomains.length} records`
            };
        }
    } catch (e) {
        // Agar API key nahi hai toh hum static check daal denge
        return { label: '🔍 Subdomain Discovery', value: 'Upgrade to SecurityTrails Pro for live brute-force', details: 'Use tools like Sublist3r on your local PC for now.' };
    }
}

// 3. URLScan.io (Threat Intelligence & History)
async function checkURLScan(domain) {
    try {
        const response = await axios.get(`https://urlscan.io/api/v1/search/?q=domain:${domain}`, { timeout: 5000 });
        if (response.data.results && response.data.results.length > 0) {
            const firstScan = response.data.results[0];
            return {
                label: '🛡️ URLScan Intelligence',
                value: `Malicious: ${firstScan.stats.malicious ? 'YES' : 'NO'}`,
                details: `Last seen: ${new Date(firstScan.scan_date).toLocaleDateString()} | Score: ${firstScan.score}`
            };
        }
    } catch (e) {}
    return null;
}

// ============================================
// MAIN INVESTIGATE FUNCTION
// ============================================

app.post('/api/investigate', async (req, res) => {
    try {
        let { target } = req.body;
        if (!target) return res.status(400).json({ error: 'Please enter a target Domain or IP.' });

        let results = {};
        target = target.trim().replace(/^https?:\/\//, '');

        // --- DOMAIN INVESTIGATION ---
        if (validator.isFQDN(target) || target.includes('.')) {
            let domainResults = [];

            // 1. Basic DNS
            const dnsData = await getDNSRecords(target);
            domainResults = domainResults.concat(dnsData);

            // 2. Subdomain Discovery
            const subDomainData = await getSubdomains(target);
            if(subDomainData) domainResults.push(subDomainData);

            // 3. URLScan (Threat check)
            const urlScanData = await checkURLScan(target);
            if(urlScanData) domainResults.push(urlScanData);

            // 4. SSL Labs
            try {
                const sslRes = await axios.get(`https://api.ssllabs.com/api/v3/analyze?host=${target}`, { timeout: 10000 });
                if(sslRes.data.endpoints) {
                    domainResults.push({
                        label: '🔒 SSL Security Grade',
                        value: sslRes.data.endpoints[0].grade || 'N/A',
                        details: `Server: ${sslRes.data.endpoints[0].serverName || 'Unknown'}`
                    });
                }
            } catch (e) {}

            results.domain = domainResults;
        } 
        
        // --- IP INVESTIGATION ---
        else if (validator.isIP(target)) {
            let ipResults = [];
            ipResults.push({ label: '🌐 Target IP', value: target });

            // 1. IPInfo.io (Location & ISP)
            try {
                const ipRes = await axios.get(`https://ipinfo.io/${target}/json`, { timeout: 5000 });
                const data = ipRes.data;
                ipResults.push({ label: '📍 Location', value: `${data.city || 'N/A'}, ${data.region || 'N/A'}`, details: `Country: ${data.country || 'N/A'}` });
                ipResults.push({ label: '🏢 ISP', value: data.org || 'N/A' });
            } catch (e) {}

            // 2. AbuseIPDB (Reputation Check)
            try {
                const abuseRes = await axios.get(`https://api.abuseipdb.com/api/v2/check?ipAddress=${target}`, { 
                    headers: { 'Key': '6a707f4fbe27e29a6b16f7db74ca55cbaef3d7db97bf90865e60876b4cf6d71e538c17a709c8402f' }, // Default free key from your server
                    timeout: 5000
                });
                if(abuseRes.data.data) {
                    ipResults.push({
                        label: '🛡️ AbuseIPDB Reputation',
                        value: `${abuseRes.data.data.abuseConfidenceScore}% Confidence Score`,
                        details: `Total Reports: ${abuseRes.data.data.totalReports || 0}`
                    });
                }
            } catch (e) {}

            // 3. Reverse DNS
            try {
                const revDns = await dns.reverse(target).catch(() => []);
                if(revDns.length > 0) ipResults.push({ label: '🔁 Reverse DNS', value: revDns.join(', ') });
            } catch(e) {}

            results.ip = ipResults;
        }

        else {
            return res.status(400).json({ error: 'Invalid target. Please enter a valid Domain or IP.' });
        }

        res.json({ results });

    } catch (error) {
        console.error('Scan Error:', error);
        res.status(500).json({ error: 'An error occurred during the scan. Please try again.' });
    }
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
    console.log(`OSINT Pro running on port ${PORT}`);
});
server.timeout = 120000;