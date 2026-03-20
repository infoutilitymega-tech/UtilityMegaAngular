import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-word-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <textarea class="wc-textarea" [(ngModel)]="text" (input)="analyze()"
        placeholder="Paste or type your text here to count words, characters, sentences, paragraphs and more..."></textarea>

      <div class="stats-grid">
        <div class="stat-box"><div class="stat-num">{{ stats().words }}</div><div class="stat-lbl">Words</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().chars }}</div><div class="stat-lbl">Characters</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().charsNoSpace }}</div><div class="stat-lbl">No Spaces</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().sentences }}</div><div class="stat-lbl">Sentences</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().paragraphs }}</div><div class="stat-lbl">Paragraphs</div></div>
        <div class="stat-box highlight"><div class="stat-num">{{ stats().readTime }}</div><div class="stat-lbl">Read Time</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().uniqueWords }}</div><div class="stat-lbl">Unique Words</div></div>
        <div class="stat-box"><div class="stat-num">{{ stats().avgWordLen }}</div><div class="stat-lbl">Avg Word Len</div></div>
      </div>

      <!-- Target counters -->
      <div class="targets">
        <div class="target-row">
          <span class="tgt-label">Twitter/X (280 chars)</span>
          <div class="tgt-bar"><div class="tgt-fill" [style.width.%]="pct(stats().chars, 280)" [class.over]="stats().chars > 280"></div></div>
          <span class="tgt-val" [class.over]="stats().chars > 280">{{ stats().chars }}/280</span>
        </div>
        <div class="target-row">
          <span class="tgt-label">Meta Description (160 chars)</span>
          <div class="tgt-bar"><div class="tgt-fill" [style.width.%]="pct(stats().chars, 160)" [class.over]="stats().chars > 160"></div></div>
          <span class="tgt-val" [class.over]="stats().chars > 160">{{ stats().chars }}/160</span>
        </div>
        <div class="target-row">
          <span class="tgt-label">Blog Post (1500 words min)</span>
          <div class="tgt-bar"><div class="tgt-fill good" [style.width.%]="pct(stats().words, 1500)"></div></div>
          <span class="tgt-val">{{ stats().words }}/1500</span>
        </div>
      </div>

      <!-- Top keywords -->
      <div class="keywords-section" *ngIf="topWords().length">
        <div class="kw-title">Top Keywords (Keyword Density)</div>
        <div class="kw-list">
          <div class="kw-item" *ngFor="let w of topWords()">
            <span class="kw-word">{{ w.word }}</span>
            <div class="kw-bar-wrap"><div class="kw-bar" [style.width.%]="(w.count / topWords()[0].count) * 100"></div></div>
            <span class="kw-count">{{ w.count }}× ({{ w.pct }}%)</span>
          </div>
        </div>
      </div>

      <div class="wc-actions">
        <button class="wc-btn" (click)="clear()">🗑 Clear</button>
        <button class="wc-btn" (click)="copy()">{{ copied() ? '✓ Copied!' : '📋 Copy Text' }}</button>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .wc-textarea { width: 100%; height: 200px; padding: .85rem; border: 1.5px solid var(--border); border-radius: 10px; font-size: .9rem; line-height: 1.7; background: var(--input-bg); color: var(--text); resize: vertical; outline: none; font-family: var(--font); box-sizing: border-box; }
    .wc-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,.08); }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .65rem; }
    .stat-box { background: var(--bg-alt); border: 1px solid var(--border); border-radius: 10px; padding: .85rem .75rem; text-align: center; }
    .stat-box.highlight { background: var(--primary-light); border-color: var(--primary); }
    .stat-num { font-size: 1.4rem; font-weight: 800; color: var(--text); line-height: 1; }
    .stat-box.highlight .stat-num { color: var(--primary); }
    .stat-lbl { font-size: .7rem; font-weight: 600; color: var(--text-muted); margin-top: .3rem; text-transform: uppercase; letter-spacing: .04em; }
    .targets { display: flex; flex-direction: column; gap: .55rem; }
    .target-row { display: flex; align-items: center; gap: .65rem; }
    .tgt-label { font-size: .78rem; color: var(--text-muted); width: 200px; flex-shrink: 0; }
    .tgt-bar { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .tgt-fill { height: 100%; background: var(--primary); border-radius: 99px; max-width: 100%; transition: width .3s; }
    .tgt-fill.good { background: #16a34a; }
    .tgt-fill.over { background: #ef4444; }
    .tgt-val { font-size: .75rem; font-weight: 600; color: var(--text-muted); width: 60px; text-align: right; flex-shrink: 0; }
    .tgt-val.over { color: #ef4444; }
    .keywords-section { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .kw-title { padding: .55rem .9rem; font-size: .78rem; font-weight: 700; background: var(--bg-alt); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); }
    .kw-list { display: flex; flex-direction: column; max-height: 180px; overflow-y: auto; }
    .kw-item { display: flex; align-items: center; gap: .65rem; padding: .45rem .9rem; border-top: 1px solid var(--border); }
    .kw-word { font-size: .82rem; font-weight: 600; width: 110px; flex-shrink: 0; }
    .kw-bar-wrap { flex: 1; height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .kw-bar { height: 100%; background: var(--primary); border-radius: 99px; transition: width .3s; }
    .kw-count { font-size: .72rem; color: var(--text-muted); width: 80px; text-align: right; flex-shrink: 0; }
    .wc-actions { display: flex; gap: .5rem; }
    .wc-btn { padding: .5rem 1rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text); font-size: .82rem; font-weight: 600; cursor: pointer; font-family: var(--font); transition: all .15s; }
    .wc-btn:hover { border-color: var(--primary); color: var(--primary); }
    @media(max-width: 500px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .tgt-label { width: auto; font-size: .7rem; } }
  `]
})
export class WordCounterComponent {
  text = '';
  copied = signal(false);
  stats = signal({ words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readTime: '0 min', uniqueWords: 0, avgWordLen: '0' });
  topWords = signal<{ word: string; count: number; pct: string }[]>([]);

  analyze() {
    const t = this.text;
    const words = t.trim() ? t.trim().split(/\s+/).filter(w => w.length > 0) : [];
    const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = t.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readSecs = Math.ceil(words.length / 225);
    const readTime = readSecs < 60 ? `< 1 min` : `${Math.ceil(readSecs / 60)} min`;
    const unique = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    const avgLen = words.length ? (words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1) : '0';

    this.stats.set({
      words: words.length, chars: t.length,
      charsNoSpace: t.replace(/\s/g, '').length,
      sentences, paragraphs, readTime, uniqueWords: unique, avgWordLen: avgLen
    });

    // Keyword density
    const freq: Record<string, number> = {};
    const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','it','its','as','by','from','up','out','if','about','so','not','can','my','we','you','he','she','they','i']);
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    this.topWords.set(sorted.map(([word, count]) => ({
      word, count, pct: words.length ? ((count / words.length) * 100).toFixed(1) : '0'
    })));
  }

  pct(val: number, max: number) { return Math.min((val / max) * 100, 100); }
  clear() { this.text = ''; this.analyze(); }
  copy() { navigator.clipboard.writeText(this.text).then(() => { this.copied.set(true); setTimeout(() => this.copied.set(false), 2000); }); }
}
