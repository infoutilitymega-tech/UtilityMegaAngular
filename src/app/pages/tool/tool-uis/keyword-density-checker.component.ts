import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface KwResult { word: string; count: number; density: number; prominence: string; status: string; }

@Component({
  selector: 'app-keyword-density-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="kdc-wrap">
      <div class="input-section">
        <div class="inp-row">
          <div class="field flex1">
            <label>Content to Analyze</label>
            <textarea class="content-area" [(ngModel)]="content" (input)="analyze()" rows="7" placeholder="Paste your article, blog post, or page content here...&#10;&#10;The analyzer will identify keyword frequency, density, and prominence."></textarea>
          </div>
          <div class="field target-col">
            <label>Target Keyword (optional)</label>
            <input type="text" [(ngModel)]="targetKw" (input)="analyze()" class="inp" placeholder="e.g. SIP calculator" />
            <div class="target-result" *ngIf="targetKw && targetCount() >= 0">
              <div class="tr-count">{{ targetCount() }}×</div>
              <div class="tr-density" [class]="densityClass(targetDensity())">{{ targetDensity().toFixed(2) }}%</div>
              <div class="tr-label">{{ densityLabel(targetDensity()) }}</div>
            </div>

            <div class="content-stats" *ngIf="wordCount() > 0">
              <div class="cs-item"><span class="cs-l">Total Words</span><span class="cs-v">{{ wordCount() }}</span></div>
              <div class="cs-item"><span class="cs-l">Unique Words</span><span class="cs-v">{{ uniqueWords() }}</span></div>
              <div class="cs-item"><span class="cs-l">Sentences</span><span class="cs-v">{{ sentenceCount() }}</span></div>
              <div class="cs-item"><span class="cs-l">Readability</span><span class="cs-v">{{ readability() }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs" *ngIf="results().length">
        <button class="ftab" [class.active]="minLen===1" (click)="minLen=1;analyze()">All Words</button>
        <button class="ftab" [class.active]="minLen===4" (click)="minLen=4;analyze()">4+ chars</button>
        <button class="ftab" [class.active]="minLen===6" (click)="minLen=6;analyze()">6+ chars</button>
        <button class="ftab" [class.active]="phraseMode" (click)="phraseMode=!phraseMode;analyze()">
          {{ phraseMode ? '✅' : '☐' }} 2-word phrases
        </button>
      </div>

      <!-- Results Chart -->
      <div class="results-section" *ngIf="results().length">
        <div class="rs-header">
          <span class="rs-title">📊 Keyword Density Analysis (Top {{ results().length }})</span>
        </div>

        <div class="kw-chart">
          <div class="kw-row header-row">
            <span class="kw-word">Keyword</span>
            <span class="kw-bar-h">Density Bar</span>
            <span class="kw-count-h">Count</span>
            <span class="kw-pct-h">Density</span>
            <span class="kw-status-h">Status</span>
          </div>
          <div class="kw-row" *ngFor="let r of results(); let i=index" [class.target-kw]="isTarget(r.word)">
            <span class="kw-word" [class.bold]="i < 3">{{ r.word }}</span>
            <div class="kw-bar-wrap">
              <div class="kw-bar" [style.width.%]="(r.count/results()[0].count)*100" [style.background]="barColor(r.density)"></div>
            </div>
            <span class="kw-count-v">{{ r.count }}×</span>
            <span class="kw-pct-v" [class]="densityClass(r.density)">{{ r.density.toFixed(2) }}%</span>
            <span class="kw-status" [class]="'s-' + r.status">{{ r.status }}</span>
          </div>
        </div>

        <!-- Density scale legend -->
        <div class="density-legend">
          <div class="dl-item s-ideal"><span class="dl-dot"></span>Ideal (1–2%)</div>
          <div class="dl-item s-low"><span class="dl-dot"></span>Low (<1%)</div>
          <div class="dl-item s-high"><span class="dl-dot"></span>High (2–4%)</div>
          <div class="dl-item s-stuffing"><span class="dl-dot"></span>Stuffing (>4%)</div>
        </div>

        <!-- SEO Score card -->
        <div class="seo-score-card" *ngIf="targetKw">
          <div class="ssc-title">🎯 Target Keyword: "{{ targetKw }}"</div>
          <div class="ssc-grid">
            <div class="ssc-item"><div class="ssc-val" [class]="densityClass(targetDensity())">{{ targetDensity().toFixed(2) }}%</div><div class="ssc-lbl">Density</div></div>
            <div class="ssc-item"><div class="ssc-val">{{ targetCount() }}×</div><div class="ssc-lbl">Occurrences</div></div>
            <div class="ssc-item"><div class="ssc-val">{{ inFirstParagraph() ? '✅' : '⚠️' }}</div><div class="ssc-lbl">In 1st Para</div></div>
            <div class="ssc-item"><div class="ssc-val">{{ densityLabel(targetDensity()) }}</div><div class="ssc-lbl">Assessment</div></div>
          </div>
          <div class="ssc-advice">{{ densityAdvice() }}</div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!content">
        <div class="es-icon">🔍</div>
        <div class="es-text">Paste content above to analyze keyword density</div>
      </div>
    </div>
  `,
  styles: [`
    .kdc-wrap{padding:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .inp-row{display:grid;grid-template-columns:1fr 240px;gap:1rem}
    .field{display:flex;flex-direction:column;gap:.35rem}
    .flex1{flex:1}
    .target-col{display:flex;flex-direction:column;gap:.6rem}
    .field label{font-size:.78rem;font-weight:600;color:var(--text-muted)}
    .content-area,.inp{width:100%;padding:.75rem;border:1.5px solid var(--border);border-radius:10px;font-size:.85rem;background:var(--input-bg);color:var(--text);outline:none;font-family:var(--font);resize:vertical;box-sizing:border-box}
    .content-area:focus,.inp:focus{border-color:var(--primary)}
    .target-result{display:flex;align-items:center;gap:.65rem;padding:.65rem .85rem;background:var(--primary-light);border-radius:10px;border:1px solid var(--primary)44}
    .tr-count{font-size:1.3rem;font-weight:900;color:var(--primary)}
    .tr-density{font-size:1rem;font-weight:800}
    .tr-label{font-size:.72rem;color:var(--text-muted)}
    .content-stats{display:flex;flex-direction:column;gap:.3rem;padding:.65rem .85rem;background:var(--bg-alt);border-radius:10px;border:1px solid var(--border)}
    .cs-item{display:flex;justify-content:space-between;font-size:.78rem}
    .cs-l{color:var(--text-muted)}
    .cs-v{font-weight:700;color:var(--text)}
    .filter-tabs{display:flex;gap:.4rem;flex-wrap:wrap}
    .ftab{padding:.35rem .8rem;border-radius:99px;border:1.5px solid var(--border);background:var(--card-bg);color:var(--text-muted);font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
    .ftab.active{background:var(--primary);border-color:var(--primary);color:#fff}
    .results-section{display:flex;flex-direction:column;gap:.75rem}
    .rs-header{display:flex;align-items:center;justify-content:space-between}
    .rs-title{font-size:.85rem;font-weight:700}
    .kw-chart{border:1px solid var(--border);border-radius:12px;overflow:hidden}
    .kw-row{display:grid;grid-template-columns:130px 1fr 55px 65px 70px;align-items:center;gap:.65rem;padding:.5rem .85rem;border-bottom:1px solid var(--border)}
    .kw-row:last-child{border-bottom:none}
    .kw-row.header-row{background:var(--bg-alt);font-size:.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase}
    .kw-row:hover:not(.header-row){background:var(--bg-alt)}
    .kw-row.target-kw{background:var(--primary-light)!important}
    .kw-word{font-size:.82rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .kw-word.bold{font-weight:700}
    .kw-bar-wrap{height:8px;background:var(--border);border-radius:99px;overflow:hidden}
    .kw-bar{height:100%;border-radius:99px;transition:width .3s}
    .kw-count-v,.kw-pct-v{font-size:.78rem;font-weight:700;text-align:right}
    .kw-status{font-size:.68rem;font-weight:700;text-align:center;padding:.15rem .3rem;border-radius:99px}
    .s-ideal{color:var(--green)}.s-ideal .dl-dot{background:var(--green)}
    .s-low{color:var(--text-muted)}.s-low .dl-dot{background:var(--text-muted)}
    .s-high{color:var(--accent)}.s-high .dl-dot{background:var(--accent)}
    .s-stuffing{color:var(--red)}.s-stuffing .dl-dot{background:var(--red)}
    .density-legend{display:flex;gap:1rem;font-size:.72rem;flex-wrap:wrap}
    .dl-item{display:flex;align-items:center;gap:.3rem}
    .dl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    .density-green{color:var(--green)} .density-muted{color:var(--text-muted)} .density-amber{color:var(--accent)} .density-red{color:var(--red)}
    .seo-score-card{padding:1rem 1.25rem;background:var(--bg-alt);border-radius:12px;border:1px solid var(--border)}
    .ssc-title{font-size:.83rem;font-weight:700;margin-bottom:.75rem}
    .ssc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-bottom:.75rem}
    .ssc-item{text-align:center}
    .ssc-val{font-size:1.1rem;font-weight:800;color:var(--text)}
    .ssc-lbl{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;margin-top:.2rem}
    .ssc-advice{font-size:.78rem;color:var(--text-muted);padding:.5rem .7rem;background:var(--card-bg);border-radius:8px;border-left:3px solid var(--primary)}
    .empty-state{text-align:center;padding:2.5rem;color:var(--text-muted)}
    .es-icon{font-size:2.5rem;margin-bottom:.5rem}
    .es-text{font-size:.88rem}
    @media(max-width:640px){.inp-row{grid-template-columns:1fr}.kw-row{grid-template-columns:100px 1fr 45px 55px 60px}.ssc-grid{grid-template-columns:repeat(2,1fr)}}
  `]
})
export class KeywordDensityCheckerComponent {
  content = ''; targetKw = ''; minLen = 4; phraseMode = false;
  results = signal<KwResult[]>([]);

  STOP_WORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','that','this','it','its','as','by','from','up','out','if','about','so','not','can','my','we','you','he','she','they','i','your','our','their','his','her','its','which','who','what','how','when','where','why']);

  analyze() {
    if (!this.content.trim()) { this.results.set([]); return; }
    const words = this.content.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length >= this.minLen && !this.STOP_WORDS.has(w));
    const total = this.content.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).length;

    const freq: Record<string, number> = {};
    if (this.phraseMode) {
      const allWords = this.content.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
      for (let i = 0; i < allWords.length - 1; i++) {
        const phrase = allWords[i] + ' ' + allWords[i + 1];
        if (allWords[i].length >= 3 && allWords[i + 1].length >= 3 && !this.STOP_WORDS.has(allWords[i]) && !this.STOP_WORDS.has(allWords[i + 1])) {
          freq[phrase] = (freq[phrase] || 0) + 1;
        }
      }
    } else {
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    }

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    this.results.set(sorted.map(([word, count]) => {
      const density = (count / total) * 100;
      return { word, count, density, prominence: '', status: density > 4 ? 'Stuffing' : density >= 2 ? 'High' : density >= 1 ? 'Ideal' : 'Low' };
    }));
  }

  wordCount() { return this.content.trim() ? this.content.trim().split(/\s+/).filter(Boolean).length : 0; }
  uniqueWords() { return new Set(this.content.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''))).size; }
  sentenceCount() { return this.content.split(/[.!?]+/).filter(s => s.trim()).length; }
  readability() {
    const wc = this.wordCount(), sc = this.sentenceCount();
    if (!sc) return 'N/A';
    const avgSent = wc / sc;
    if (avgSent < 15) return 'Easy'; if (avgSent < 25) return 'Medium'; return 'Difficult';
  }

  targetCount(): number {
    if (!this.targetKw.trim()) return 0;
    const re = new RegExp(this.targetKw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (this.content.match(re) || []).length;
  }
  targetDensity() { return this.wordCount() ? (this.targetCount() / this.wordCount()) * 100 : 0; }

  isTarget(word: string) { return this.targetKw && word.toLowerCase().includes(this.targetKw.toLowerCase()); }

  barColor(d: number) { if (d > 4) return 'var(--red)'; if (d >= 2) return 'var(--accent)'; if (d >= 1) return 'var(--green)'; return 'var(--text-muted)'; }
  densityClass(d: number) { if (d > 4) return 'density-red'; if (d >= 2) return 'density-amber'; if (d >= 1) return 'density-green'; return 'density-muted'; }
  densityLabel(d: number) { if (d > 4) return '⚠️ Stuffing'; if (d >= 2) return '📈 High'; if (d >= 1) return '✅ Ideal'; if (d > 0) return '📉 Low'; return '❌ Not Found'; }
  densityAdvice() {
    const d = this.targetDensity();
    if (d === 0) return `"${this.targetKw}" not found. Add it naturally in your content.`;
    if (d > 4) return `Density ${d.toFixed(1)}% is too high — Google may penalize for keyword stuffing. Reduce occurrences.`;
    if (d >= 2) return `Density ${d.toFixed(1)}% is high. Consider reducing slightly for more natural reading.`;
    if (d >= 1) return `Density ${d.toFixed(1)}% is in the ideal 1–2% range. Great for SEO!`;
    return `Density ${d.toFixed(1)}% is low. Consider adding the keyword more naturally in your content.`;
  }
  inFirstParagraph() {
    if (!this.targetKw) return false;
    const firstPara = this.content.split('\n\n')[0] || this.content.slice(0, 200);
    return firstPara.toLowerCase().includes(this.targetKw.toLowerCase());
  }
}
