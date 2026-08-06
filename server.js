const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

app.post('/api/investigate', async (req, res) => {
    try {
        let { target } = req.body;
        if (!target) return res.status(400).json({ error: 'Target is required' });
        target = target.trim().replace(/^https?:\/\//, '');

        let results = {};

        // 1. SUBLIST3R (Subdomains)
        try {
            const { stdout } = await execPromise(`sublist3r -d ${target}`, { timeout: 15000 });
            const lines = stdout.split('\n');
            results.subdomains = lines.filter(l => l.trim().startsWith('[-]') && !l.includes('Total')).join('\n') || 'No subdomains found.';
        } catch (e) { results.subdomains = 'Sublist3r timed out.'; }

        // 2. NMAP (Ports)
        try {
            const { stdout } = await execPromise(`nmap -sS -T4 -F ${target}`, { timeout: 10000 });
            results.ports = stdout.split('\n').filter(l => l.includes('open')).join('\n') || 'No open ports found.';
        } catch (e) { results.ports = 'Nmap timed out.'; }

        // 3. THEHARVESTER (Emails)
        try {
            const { stdout } = await execPromise(`./theHarvester/bin/theHarvester -d ${target} -b google -l 50`, { timeout: 15000 });
            const emails = stdout.split('\n').filter(l => l.includes('@') && l.includes('.'));
            results.emails = emails.length ? emails.join(', ') : 'No emails found via Google.';
        } catch (e) { results.emails = 'TheHarvester timed out.'; }

        // 4. PHONEINFOGA (Phone)
        if (/^\+?[1-9]\d{1,14}$/.test(target)) {
            try {
                const { stdout } = await execPromise(`cd phoneinfoga && python3 phoneinfoga.py -n ${target}`, { timeout: 10000 });
                results.phone = stdout.split('\n').filter(l => l.includes('Country') || l.includes('Carrier') || l.includes('Line')).join('\n') || 'Phone info not available.';
            } catch (e) { results.phone = 'Phoneinfoga timed out.'; }
        }

        // 5. H8MAIL (Email Breach)
        if (target.includes('@')) {
            try {
                const { stdout } = await execPromise(`h8mail -t ${target}`, { timeout: 10000 });
                results.emailBreach = stdout.includes('Found') ? 'Breaches found!' : 'No breaches detected.';
            } catch (e) { results.emailBreach = 'H8mail timed out.'; }
        }

        // 6. SHERLOCK (Social Media)
        if (/^[a-zA-Z0-9_.]{3,}$/.test(target) && !target.includes('@') && !target.includes('.')) {
            try {
                const { stdout } = await execPromise(`sherlock ${target}`, { timeout: 15000 });
                results.social = stdout.split('\n').filter(l => l.includes('✅')).join('\n') || 'No social profiles found.';
            } catch (e) { results.social = 'Sherlock timed out.'; }
        }

        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Internal Engine Error' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Brahmastra running on port ${PORT}`));