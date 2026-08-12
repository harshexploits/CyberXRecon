export const moduleDetails = {
  ports: {
    icon: '🛰️',
    title: 'Port Scan',
    summary: 'Nmap-style TCP scan against common service ports.',
    items: [
      '22/tcp ssh open — OpenSSH 8.9',
      '80/tcp http open — nginx 1.24.0',
      '443/tcp https open — nginx 1.24.0 (TLS 1.3)',
      '3306/tcp filtered — firewall blocking',
      '8080/tcp closed',
    ],
  },
  subdomains: {
    icon: '🌐',
    title: 'Subdomains',
    summary: 'Enumeration across DNS and certificate transparency sources.',
    items: [
      'mail.target.com — resolves',
      'api.target.com — resolves',
      'dev.target.com — resolves',
      'staging.target.com — resolves',
      'cdn.target.com — resolves',
      'old.target.com — no response',
    ],
  },
  phone: {
    icon: '📱',
    title: 'Phone OSINT',
    summary: 'Carrier and line-type lookup for discovered numbers.',
    items: [
      'Carrier: Reliance Jio',
      'Region: Maharashtra, IN',
      'Line type: Mobile',
      'Valid number: Yes',
    ],
  },
  social: {
    icon: '🕵️',
    title: 'Social Media',
    summary: 'Username presence check across common platforms.',
    items: [
      'GitHub — 12 repos found',
      'Twitter/X — profile found',
      'Reddit — not found',
      'LinkedIn — not checked',
      'Instagram — profile found',
    ],
  },
  emails: {
    icon: '✉️',
    title: 'Emails',
    summary: 'Harvested addresses with their discovery source.',
    items: [
      'admin@target.com — source: WHOIS',
      'support@target.com — source: contact page',
      'info@target.com — source: DNS TXT record',
    ],
  },
  breach: {
    icon: '🔓',
    title: 'Breach Check',
    summary: 'Cross-reference against known breach compilations.',
    items: [
      'Collection #1 (2019) — 773M records',
      'Exploit.in (2020) — 593M records',
    ],
  },
};

export const moduleOrder = ['ports', 'subdomains', 'phone', 'social', 'emails', 'breach'];
