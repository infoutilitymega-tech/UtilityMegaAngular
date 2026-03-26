import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Word Counter ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-word-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="editor-layout">
        <div class="editor-col">
          <div class="editor-toolbar">
            <div class="tb-title">📝 Text Editor</div>
            <div class="tb-actions">
              <button class="tb-btn" (click)="paste()">📋 Paste</button>
              <button class="tb-btn" (click)="clear()">🗑 Clear</button>
              <button class="tb-btn" (click)="copy()">📋 Copy</button>
              <label class="tb-btn file-btn">📄 Upload .txt <input type="file" accept=".txt,.md,.csv" (change)="onFileUpload($event)" style="display:none" /></label>
            </div>
          </div>
          <textarea
            [(ngModel)]="text"
            (ngModelChange)="analyze()"
            class="main-editor"
            placeholder="Start typing or paste your text here...

Word Counter analyzes your text in real-time:
• Words, characters, sentences, paragraphs
• Reading time and speaking time
• Keyword density and top words
• Readability scores
• Character frequency"
            rows="16"
          ></textarea>
        </div>

        <div class="stats-col">
          <!-- Primary stats -->
          <div class="primary-stats">
            <div class="pstat" *ngFor="let s of primaryStats()">
              <div class="ps-val">{{s.val}}</div>
              <div class="ps-label">{{s.label}}</div>
            </div>
          </div>

          <!-- Reading/speaking time -->
          <div class="time-card">
            <div class="tc-row">
              <span class="tc-icon">👁</span>
              <span class="tc-label">Reading time</span>
              <span class="tc-val">{{readingTime()}}</span>
            </div>
            <div class="tc-row">
              <span class="tc-icon">🎙</span>
              <span class="tc-label">Speaking time</span>
              <span class="tc-val">{{speakingTime()}}</span>
            </div>
            <div class="tc-row">
              <span class="tc-icon">📚</span>
              <span class="tc-label">Reading level</span>
              <span class="tc-val">{{readingLevel()}}</span>
            </div>
          </div>

          <!-- Readability -->
          <div class="readability-card">
            <div class="rc-title">Readability Scores</div>
            <div class="rsc-row" *ngFor="let r of readabilityScores()">
              <span class="rsc-name">{{r.name}}</span>
              <div class="rsc-bar"><div class="rscb-fill" [style.width.%]="r.pct" [style.background]="r.color"></div></div>
              <span class="rsc-val">{{r.val}}</span>
            </div>
          </div>

          <!-- Goals -->
          <div class="goals-card" *ngIf="text.length">
            <div class="gc-title">Writing Goals</div>
            <div class="goal-row" *ngFor="let g of goals()">
              <div class="gr-header">
                <span class="gr-name">{{g.name}}</span>
                <span class="gr-progress" [class.done]="g.done">{{g.current}}/{{g.target}}</span>
              </div>
              <div class="gr-bar"><div class="grb-fill" [style.width.%]="g.pct" [style.background]="g.done?'#22c55e':'#6366f1'"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed analysis -->
      <div class="analysis-grid" *ngIf="text.trim()">
        <!-- Top words -->
        <div class="analysis-card">
          <div class="ac-title">🏆 Top Words</div>
          <div class="word-list">
            <div class="wl-item" *ngFor="let w of topWords()">
              <span class="wl-word">{{w.word}}</span>
              <div class="wl-bar"><div class="wlb-fill" [style.width.%]="w.pct"></div></div>
              <span class="wl-count">{{w.count}}</span>
            </div>
          </div>
        </div>

        <!-- Char frequency -->
        <div class="analysis-card">
          <div class="ac-title">🔡 Character Frequency</div>
          <div class="char-grid">
            <div class="cg-item" *ngFor="let c of topChars()">
              <span class="cg-char">{{c.char}}</span>
              <span class="cg-count">{{c.count}}</span>
            </div>
          </div>
        </div>

        <!-- Sentence analysis -->
        <div class="analysis-card">
          <div class="ac-title">📊 Sentence Analysis</div>
          <div class="sentence-stats">
            <div class="ss-item" *ngFor="let s of sentenceStats()">
              <span class="ssi-label">{{s.label}}</span>
              <span class="ssi-val">{{s.val}}</span>
            </div>
          </div>
          <!-- Longest sentence -->
          <div class="longest-sentence" *ngIf="longestSentence()">
            <div class="ls-label">Longest sentence:</div>
            <div class="ls-text">{{longestSentence()}}</div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!text.trim()">
        <div class="es-icon">📝</div>
        <div class="es-text">Paste or type your text above to see detailed statistics</div>
        <div class="es-examples">
          <button *ngFor="let e of examples" class="example-btn" (click)="text=e.text;analyze()">{{e.label}}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .editor-layout{display:grid;grid-template-columns:1fr 300px;gap:1rem;margin-bottom:1rem}
    @media(max-width:800px){.editor-layout{grid-template-columns:1fr}}
    .editor-col{display:flex;flex-direction:column;gap:.4rem}
    .editor-toolbar{display:flex;justify-content:space-between;align-items:center;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .85rem}
    .tb-title{font-size:.75rem;font-weight:700;color:#374151}
    .tb-actions{display:flex;gap:.3rem;flex-wrap:wrap}
    .tb-btn{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.25rem .6rem;cursor:pointer;font-size:.72rem;font-weight:600;color:#374151;transition:all .1s}
    .tb-btn:hover{border-color:#6366f1;color:#6366f1}
    .file-btn{cursor:pointer}
    .main-editor{width:100%;min-height:320px;padding:.85rem 1rem;border:1px solid #d1d5db;border-radius:10px;font-size:.88rem;line-height:1.65;resize:vertical;outline:none;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;transition:border-color .2s}
    .main-editor:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
    .stats-col{display:flex;flex-direction:column;gap:.65rem}
    .primary-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:.4rem}
    .pstat{background:white;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem .7rem;text-align:center}
    .ps-val{font-size:1.4rem;font-weight:900;color:#111827;line-height:1}
    .ps-label{font-size:.6rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-top:.2rem}
    .time-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .tc-row{display:flex;align-items:center;gap.4rem;gap:.4rem;padding:.2rem 0;font-size:.78rem}
    .tc-icon{flex-shrink:0;font-size:.85rem}
    .tc-label{flex:1;color:#6b7280}
    .tc-val{font-weight:800;color:#111827}
    .readability-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .rc-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.45rem;margin-bottom:.45rem}
    .rsc-row{display:flex;align-items:center;gap.4rem;gap:.4rem;margin-bottom:.3rem}
    .rsc-name{font-size:.68rem;color:#6b7280;min-width:80px;flex-shrink:0}
    .rsc-bar{flex:1;height:6px;background:#e5e7eb;border-radius:99px;overflow:hidden}
    .rscb-fill{height:100%;border-radius:99px;transition:width .4s}
    .rsc-val{font-size:.7rem;font-weight:700;min-width:24px;text-align:right}
    .goals-card{background:#f5f3ff;border:1px solid #e9d5ff;border-radius:10px;padding:.65rem .85rem}
    .gc-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#7c3aed;margin-bottom:.45rem}
    .goal-row{margin-bottom.4rem;margin-bottom:.4rem}
    .gr-header{display:flex;justify-content:space-between;font-size:.72rem;margin-bottom:.2rem}
    .gr-name{font-weight:600;color:#374151}
    .gr-progress{color:#6b7280}
    .gr-progress.done{color:#059669;font-weight:700}
    .gr-bar{height:5px;background:#ddd6fe;border-radius:99px;overflow:hidden}
    .grb-fill{height:100%;border-radius:99px;transition:width .4s}
    .analysis-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.85rem}
    @media(max-width:900px){.analysis-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:600px){.analysis-grid{grid-template-columns:1fr}}
    .analysis-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ac-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .word-list{display:flex;flex-direction:column;gap.25rem;gap:.25rem}
    .wl-item{display:flex;align-items:center;gap.4rem;gap:.4rem}
    .wl-word{font-size:.78rem;font-weight:600;min-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .wl-bar{flex:1;height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden}
    .wlb-fill{height:100%;background:#6366f1;border-radius:99px}
    .wl-count{font-size:.68rem;color:#9ca3af;min-width:20px;text-align:right}
    .char-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:.3rem}
    .cg-item{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.25rem .3rem;text-align:center}
    .cg-char{display:block;font-size:.82rem;font-weight:700;font-family:monospace}
    .cg-count{display:block;font-size:.58rem;color:#9ca3af}
    .sentence-stats{display:flex;flex-direction:column;gap.25rem;gap:.25rem;margin-bottom:.5rem}
    .ss-item{display:flex;justify-content:space-between;font-size:.78rem;padding:.18rem 0;border-bottom:1px solid #f3f4f6}
    .ss-item:last-child{border-bottom:none}
    .ssi-label{color:#6b7280}.ssi-val{font-weight:700;color:#111827}
    .longest-sentence{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.4rem .6rem}
    .ls-label{font-size:.6rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.2rem}
    .ls-text{font-size:.72rem;color:#374151;line-height:1.4;max-height:60px;overflow:hidden}
    .empty-state{text-align:center;padding:2rem 1rem}
    .es-icon{font-size:2.5rem;margin-bottom:.5rem}
    .es-text{font-size:.9rem;color:#6b7280;margin-bottom.85rem;margin-bottom:.85rem}
    .es-examples{display:flex;gap.4rem;justify-content:center;flex-wrap:wrap;gap:.4rem}
    .example-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:.3rem .75rem;cursor:pointer;font-size:.78rem;font-weight:600}
    .example-btn:hover{border-color:#6366f1;color:#6366f1}
  `]
})
export class WordCounterComponent {
  text = '';

  examples = [
    {label:'Short essay',text:'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once. It has been used for typewriter and keyboard testing for many years. Typography experts call such sentences pangrams because they include all 26 letters.'},
    {label:'Blog post',text:'Artificial intelligence is transforming the way we work, communicate, and solve problems. From natural language processing to computer vision, AI applications are becoming increasingly sophisticated. Machine learning algorithms can now recognize patterns in data that were previously invisible to human analysts. This technological revolution is creating new opportunities while also raising important questions about employment, privacy, and ethics.'},
    {label:'Haiku',text:'An old silent pond\nA frog jumps into the pond\nSplash! Silence again'},
  ];

  analyze() {}

  words(): number { return this.text.trim() ? this.text.trim().split(/\s+/).filter(w => w.length > 0).length : 0; }
  chars(): number { return this.text.length; }
  charsNoSpaces(): number { return this.text.replace(/\s/g,'').length; }
  sentences(): number { return this.text.trim() ? (this.text.match(/[.!?]+/g)||[]).length : 0; }
  paragraphs(): number { return this.text.trim() ? this.text.split(/\n\s*\n/).filter(p=>p.trim()).length : 0; }
  lines(): number { return this.text ? this.text.split('\n').length : 0; }

  primaryStats() {
    return [
      {val:this.words().toLocaleString(),label:'Words'},
      {val:this.chars().toLocaleString(),label:'Characters'},
      {val:this.sentences().toLocaleString(),label:'Sentences'},
      {val:this.paragraphs().toLocaleString(),label:'Paragraphs'},
      {val:this.charsNoSpaces().toLocaleString(),label:'No Spaces'},
      {val:this.lines().toLocaleString(),label:'Lines'},
    ];
  }

  readingTime(): string {
    const mins = this.words() / 238;
    if (mins < 1) return `${Math.round(mins * 60)}s`;
    return `${Math.round(mins)} min`;
  }
  speakingTime(): string {
    const mins = this.words() / 130;
    if (mins < 1) return `${Math.round(mins * 60)}s`;
    return `${Math.round(mins)} min`;
  }

  fleschScore(): number {
    const w = this.words(); const s = this.sentences() || 1;
    const syllables = this.countSyllables();
    if (!w) return 0;
    return Math.max(0, Math.min(100, 206.835 - 1.015*(w/s) - 84.6*(syllables/w)));
  }

  countSyllables(): number {
    return this.text.toLowerCase().split(/\s+/).reduce((sum, word) => {
      word = word.replace(/[^a-z]/g,'');
      if (!word) return sum;
      let count = (word.match(/[aeiouy]+/g)||[]).length;
      if (word.endsWith('e') && count > 1) count--;
      return sum + Math.max(1, count);
    }, 0);
  }

  readingLevel(): string {
    const f = this.fleschScore();
    if (f >= 90) return 'Very Easy (Grade 5)';
    if (f >= 80) return 'Easy (Grade 6)';
    if (f >= 70) return 'Fairly Easy (Grade 7)';
    if (f >= 60) return 'Standard (Grade 8–9)';
    if (f >= 50) return 'Fairly Difficult';
    if (f >= 30) return 'Difficult (College)';
    return 'Very Confusing';
  }

  readabilityScores() {
    const f = this.fleschScore();
    const w = this.words(); const s = this.sentences() || 1;
    const asl = w / s;
    const asw = this.countSyllables() / (w || 1);
    const fk = Math.max(1, 0.39 * asl + 11.8 * asw - 15.59);
    return [
      {name:'Flesch Reading',val:Math.round(f),pct:f,color:f>=60?'#22c55e':f>=30?'#f59e0b':'#ef4444'},
      {name:'FK Grade',val:fk.toFixed(1),pct:Math.min(100,(fk/20)*100),color:fk<=8?'#22c55e':fk<=12?'#f59e0b':'#ef4444'},
      {name:'Avg Sent. Len',val:asl.toFixed(1),pct:Math.min(100,(asl/40)*100),color:asl<=20?'#22c55e':asl<=30?'#f59e0b':'#ef4444'},
    ];
  }

  goals() {
    const w = this.words();
    return [
      {name:'Tweet',target:280,current:Math.min(w,280),pct:Math.min(100,(w/280)*100),done:w>=280},
      {name:'Blog post (min)',target:300,current:Math.min(w,300),pct:Math.min(100,(w/300)*100),done:w>=300},
      {name:'Article',target:1000,current:Math.min(w,1000),pct:Math.min(100,(w/1000)*100),done:w>=1000},
      {name:'Long-form',target:2500,current:Math.min(w,2500),pct:Math.min(100,(w/2500)*100),done:w>=2500},
    ];
  }

  topWords() {
    const words = this.text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','day','get','has','him','his','how','its','now','old','see','two','way','who','did','its','let','put','say','too','use','with','this','that','have','from','they','will','when','what','your','make','like','time','more','just','know','take','into','year','most','some','been','come','than','then','well','also','back','after','could','there','which','their','about','would','these','those','over']);
    const freq: Record<string,number> = {};
    words.filter(w => !stopWords.has(w)).forEach(w => freq[w] = (freq[w]||0)+1);
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([word,count]) => ({word,count,pct:(count/max)*100}));
  }

  topChars() {
    const freq: Record<string,number> = {};
    for (const c of this.text.toLowerCase()) {
      if (/[a-z]/.test(c)) freq[c] = (freq[c]||0)+1;
    }
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([char,count])=>({char,count}));
  }

  sentenceStats() {
    const sents = this.text.split(/[.!?]+/).filter(s=>s.trim());
    if (!sents.length) return [];
    const lens = sents.map(s=>s.trim().split(/\s+/).length);
    return [
      {label:'Avg sentence length',val:(this.words()/(this.sentences()||1)).toFixed(1)+' words'},
      {label:'Shortest sentence',val:Math.min(...lens)+' words'},
      {label:'Longest sentence',val:Math.max(...lens)+' words'},
      {label:'Long sentences (>30w)',val:lens.filter(l=>l>30).length},
      {label:'Short sentences (<10w)',val:lens.filter(l=>l<10).length},
    ];
  }

  longestSentence(): string {
    const sents = this.text.split(/[.!?]+/).filter(s=>s.trim().split(/\s+/).length > 3);
    if (!sents.length) return '';
    return sents.sort((a,b)=>b.split(/\s+/).length - a.split(/\s+/).length)[0].trim().slice(0,200);
  }

  async paste() { try { const t = await navigator.clipboard.readText(); this.text = t; } catch {} }
  copy() { navigator.clipboard.writeText(this.text); }
  clear() { this.text = ''; }

  onFileUpload(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { this.text = r.result as string; };
    r.readAsText(f);
  }
}

// ─── Text Case Converter ──────────────────────────────────────────────────────
@Component({
  selector: 'app-text-case-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="layout">
        <div class="input-col">
          <label class="inp-label">Input Text</label>
          <textarea [(ngModel)]="inputText" (ngModelChange)="convert()" class="main-ta" rows="12" placeholder="Type or paste your text here to convert its case..."></textarea>
          <div class="inp-footer">
            <span>{{inputText.length}} chars · {{wordCount()}} words</span>
            <button class="paste-btn" (click)="pasteText()">📋 Paste</button>
          </div>
        </div>

        <div class="cases-col">
          <div class="cases-grid">
            <div class="case-card" *ngFor="let c of cases" [class.active]="activeCase()===c.key" (click)="setCase(c.key)">
              <div class="cc-header">
                <span class="cc-icon">{{c.icon}}</span>
                <span class="cc-name">{{c.name}}</span>
              </div>
              <div class="cc-sample">{{getSample(c.key)}}</div>
              <div class="cc-desc">{{c.desc}}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="output-section" *ngIf="outputText()">
        <div class="os-header">
          <div class="os-title">
            <span class="os-case-icon">{{activeCaseData()?.icon}}</span>
            {{activeCaseData()?.name}}
          </div>
          <div class="os-actions">
            <button class="action-btn" (click)="copyOutput()">📋 Copy</button>
            <button class="action-btn" (click)="inputText=outputText();convert()">↺ Use as Input</button>
            <button class="action-btn warn" (click)="inputText='';convert()">🗑 Clear</button>
          </div>
        </div>
        <div class="output-display">{{outputText()}}</div>
        <div class="os-footer">{{outputText().length}} chars · {{outputWordCount()}} words</div>
      </div>

      <!-- All cases at once -->
      <div class="all-cases" *ngIf="inputText.trim()">
        <div class="allc-title">All Conversions at a Glance</div>
        <div class="allc-grid">
          <div class="allc-item" *ngFor="let c of cases">
            <div class="allci-label">{{c.icon}} {{c.name}}</div>
            <div class="allci-text">{{convertCase(inputText, c.key)}}</div>
            <button class="allci-copy" (click)="copyText(convertCase(inputText,c.key))">📋</button>
          </div>
        </div>
      </div>

      <!-- Use cases reference -->
      <div class="ref-section">
        <div class="ref-title">When to Use Each Case</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of usageRef">
            <span class="ri-icon">{{r.icon}}</span>
            <div>
              <div class="ri-case">{{r.caseName}}</div>
              <div class="ri-uses">{{r.uses}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:750px){.layout{grid-template-columns:1fr}}
    .inp-label{display:block;font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.3rem}
    .main-ta{width:100%;padding:.75rem .9rem;border:1px solid #d1d5db;border-radius:10px;font-size:.9rem;line-height:1.6;resize:vertical;outline:none;box-sizing:border-box;transition:border-color .2s}
    .main-ta:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
    .inp-footer{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:#9ca3af;margin-top:.3rem}
    .paste-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.7rem;font-weight:700}
    .cases-grid{display:flex;flex-direction:column;gap:.4rem}
    .case-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.55rem .8rem;cursor:pointer;transition:all .15s}
    .case-card:hover{border-color:#6366f1;background:#f5f3ff}
    .case-card.active{border-color:#6366f1;background:#f5f3ff;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
    .cc-header{display:flex;align-items:center;gap.35rem;gap:.35rem;margin-bottom.2rem;margin-bottom:.2rem}
    .cc-icon{font-size:.9rem;flex-shrink:0}
    .cc-name{font-size:.8rem;font-weight:700;color:#111827}
    .cc-sample{font-family:monospace;font-size:.72rem;color:#6366f1;background:white;border-radius:4px;padding:.1rem .35rem;display:inline-block;margin-bottom.15rem;margin-bottom:.15rem}
    .cc-desc{font-size:.68rem;color:#9ca3af}
    .output-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .os-header{display:flex;justify-content:space-between;align-items:center;margin-bottom.6rem;margin-bottom:.6rem;flex-wrap:wrap;gap:.3rem}
    .os-title{display:flex;align-items:center;gap.35rem;gap:.35rem;font-size:.85rem;font-weight:700;color:#111827}
    .os-case-icon{font-size:1rem}
    .os-actions{display:flex;gap.3rem;gap:.3rem;flex-wrap:wrap}
    .action-btn{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-size:.72rem;font-weight:600}
    .action-btn:hover{border-color:#6366f1;color:#6366f1}
    .action-btn.warn:hover{border-color:#dc2626;color:#dc2626}
    .output-display{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem .9rem;font-size:.9rem;line-height:1.6;min-height:80px;white-space:pre-wrap;word-break:break-word;max-height:220px;overflow-y:auto}
    .os-footer{font-size:.68rem;color:#9ca3af;text-align:right;margin-top:.3rem}
    .all-cases{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .allc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.65rem;margin-bottom:.65rem}
    .allc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.4rem}
    .allc-item{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.45rem .65rem;display:flex;align-items:center;gap.3rem;gap:.3rem}
    .allci-label{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#9ca3af;min-width:90px;flex-shrink:0}
    .allci-text{flex:1;font-size:.78rem;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151}
    .allci-copy{background:none;border:none;cursor:pointer;font-size:.7rem;opacity:.6;flex-shrink:0}
    .allci-copy:hover{opacity:1}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.45rem}
    .ref-item{display:flex;gap.4rem;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .7rem;font-size:.78rem}
    .ri-icon{font-size:.9rem;flex-shrink:0}
    .ri-case{font-weight:700;color:#111827;margin-bottom.1rem;margin-bottom:.1rem}
    .ri-uses{font-size:.7rem;color:#6b7280}
  `]
})
export class TextCaseConverterComponent {
  inputText = ''; activeCase = signal('sentence');

  cases = [
    {key:'sentence',icon:'📝',name:'Sentence case',desc:'First letter of each sentence capitalised'},
    {key:'lower',icon:'🔡',name:'lowercase',desc:'All letters in lowercase'},
    {key:'upper',icon:'🔠',name:'UPPERCASE',desc:'All letters in uppercase'},
    {key:'title',icon:'📖',name:'Title Case',desc:'First Letter Of Every Word Capitalised'},
    {key:'camel',icon:'🐪',name:'camelCase',desc:'First word lower, rest capitalised — for variables'},
    {key:'pascal',icon:'🏔',name:'PascalCase',desc:'Every word capitalised — for classes/components'},
    {key:'snake',icon:'🐍',name:'snake_case',desc:'Words separated by underscores — for Python/SQL'},
    {key:'kebab',icon:'🍡',name:'kebab-case',desc:'Words separated by hyphens — for CSS/URLs'},
    {key:'constant',icon:'⚡',name:'CONSTANT_CASE',desc:'Uppercase with underscores — for constants'},
    {key:'dot',icon:'·',name:'dot.case',desc:'Words separated by dots — for filenames'},
    {key:'alternate',icon:'🎭',name:'aLtErNaTe CaSe',desc:'Alternating upper and lowercase letters'},
    {key:'inverse',icon:'🔃',name:'iNVERSE cASE',desc:'Swap case of every character'},
  ];

  usageRef = [
    {icon:'💻',caseName:'camelCase',uses:'JavaScript/TypeScript variables and functions'},
    {icon:'🏗',caseName:'PascalCase',uses:'Class names, React components, Angular components'},
    {icon:'🐍',caseName:'snake_case',uses:'Python variables, SQL columns, Ruby'},
    {icon:'🌐',caseName:'kebab-case',uses:'CSS class names, HTML attributes, URL slugs'},
    {icon:'⚡',caseName:'CONSTANT_CASE',uses:'Environment variables, Redux action types, constants'},
    {icon:'📖',caseName:'Title Case',uses:'Headings, titles, book names, proper nouns'},
    {icon:'📝',caseName:'Sentence case',uses:'Body text, descriptions, regular writing'},
    {icon:'·',caseName:'dot.case',uses:'Package names (npm), file naming conventions'},
  ];

  getSample(key: string): string {
    const sample = 'hello world example';
    return this.convertCase(sample, key).slice(0, 22);
  }

  convertCase(text: string, caseKey: string): string {
    if (!text.trim()) return text;
    switch (caseKey) {
      case 'sentence': return text.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()).replace(/(?<=[.!?]\s*)([A-Z])/g, c => c).toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
      case 'lower': return text.toLowerCase();
      case 'upper': return text.toUpperCase();
      case 'title': return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      case 'camel': { const words = text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/); return words[0] + words.slice(1).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(''); }
      case 'pascal': return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join('');
      case 'snake': return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).join('_');
      case 'kebab': return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).join('-');
      case 'constant': return text.toUpperCase().replace(/[^A-Z0-9\s]/g,' ').trim().split(/\s+/).join('_');
      case 'dot': return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).join('.');
      case 'alternate': return text.split('').map((c,i)=>i%2===0?c.toUpperCase():c.toLowerCase()).join('');
      case 'inverse': return text.split('').map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join('');
      default: return text;
    }
  }

  outputText = signal('');

  setCase(key: string) { this.activeCase.set(key); this.convert(); }
  convert() { this.outputText.set(this.convertCase(this.inputText, this.activeCase())); }
  activeCaseData() { return this.cases.find(c => c.key === this.activeCase()); }

  wordCount() { return this.inputText.trim() ? this.inputText.trim().split(/\s+/).length : 0; }
  outputWordCount() { return this.outputText().trim() ? this.outputText().trim().split(/\s+/).length : 0; }

  copyOutput() { navigator.clipboard.writeText(this.outputText()); }
  copyText(t: string) { navigator.clipboard.writeText(t); }
  async pasteText() { try { this.inputText = await navigator.clipboard.readText(); this.convert(); } catch {} }
}
