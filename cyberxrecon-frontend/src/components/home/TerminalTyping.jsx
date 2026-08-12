import { useState, useEffect } from 'react';

export default function TerminalTyping() {
  const lines = [
    'Scanning target.com...',
    'Resolving subdomains... 14 found',
    'Harvesting emails... 6 found',
    'Checking breach databases... 2 matches',
    'Report ready.',
  ];
  const [displayed, setDisplayed] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      const resetTimer = setTimeout(() => {
        setDisplayed('');
        setLineIndex(0);
        setCharIndex(0);
      }, 1800);
      return () => clearTimeout(resetTimer);
    }
    const currentLine = lines[lineIndex];
    if (charIndex < currentLine.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + currentLine[charIndex]);
        setCharIndex((c) => c + 1);
      }, 35);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + '\n');
        setLineIndex((l) => l + 1);
        setCharIndex(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex]);

  return (
    <div className="mt-10 max-w-md mx-auto bg-black/60 border border-cyan-500/30 rounded-lg p-4 text-left font-mono text-sm text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex space-x-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
      </div>
      <pre className="whitespace-pre-wrap min-h-[110px]">{displayed}<span className="animate-pulse">▋</span></pre>
    </div>
  );
}
