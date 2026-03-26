import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Lorem Ipsum Generator ────────────────────────────────────────────────────
@Component({
  selector: 'app-lorem-ipsum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="controls-bar">
        <div class="cb-group">
          <label class="cb-label">Type</label>
          <div class="type-tabs">
            <button *ngFor="let t of types" [class.active]="genType===t.key" (click)="genType=t.key;generate()">{{t.label}}</button>
          </div>
        </div>
        <div class="cb-group">
          <label class="cb-label">Count</label>
          <input type="number" [(ngModel)]="count" (ngModelChange)="generate()" class="count-inp" min="1" [max]="genType==='words'?500:genType==='sentences'?50:20" />
        </div>
        <div class="cb-group">
          <label class="cb-label">Options</label>
          <div class="option-checks">
            <label class="chk" *ngIf="genType!=='words'"><input type="checkbox" [(ngModel)]="startWithLorem" (change)="generate()" /> Start with "Lorem ipsum"</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="includeHtml" (change)="generate()" /> HTML tags</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="includeLineBreaks" (change)="generate()" /> Line breaks</label>
          </div>
        </div>
        <div class="cb-group">
          <label class="cb-label">Format</label>
          <select [(ngModel)]="format" (ngModelChange)="generate()" class="sel">
            <option value="lorem">Classic Lorem</option>
            <option value="cicero">Original Cicero</option>
            <option value="lorem_ext">Extended Lorem</option>
            <option value="hipster">Hipster Ipsum</option>
            <option value="corporate">Corporate Ipsum</option>
          </select>
        </div>
      </div>

      <div class="output-area">
        <div class="oa-header">
          <div class="oa-stats">
            <span>~{{wordCountOut()}} words</span>
            <span>~{{charCountOut()}} chars</span>
          </div>
          <div class="oa-actions">
            <button class="action-btn" (click)="generate()">🔄 Regenerate</button>
            <button class="action-btn primary" (click)="copy()">📋 Copy</button>
            <button class="action-btn" (click)="download()">⬇ Download .txt</button>
          </div>
        </div>
        <div class="output-text" [innerHTML]="outputHtml()"></div>
      </div>

      <!-- Quick presets -->
      <div class="presets-section">
        <div class="ps-title">Quick Presets</div>
        <div class="preset-grid">
          <button *ngFor="let p of presets" class="preset-btn" (click)="applyPreset(p)">
            <span class="pb-icon">{{p.icon}}</span>
            <span class="pb-label">{{p.label}}</span>
            <span class="pb-desc">{{p.desc}}</span>
          </button>
        </div>
      </div>

      <!-- About section -->
      <div class="about-section">
        <div class="as-title">About Lorem Ipsum</div>
        <div class="as-text">Lorem ipsum originates from sections 1.10.32 and 1.10.33 of <em>de Finibus Bonorum et Malorum</em> ("On the Ends of Good and Evil") by Cicero, written in 45 BC. It was popularized in the 1960s with Letraset sheets and later desktop publishing software like Aldus PageMaker. The standard "Lorem ipsum" passage has been the standard dummy text in typesetting since the 1500s.</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .controls-bar{display:flex;gap:1rem;flex-wrap:wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem;align-items:flex-end}
    .cb-group{display:flex;flex-direction:column;gap:.3rem}
    .cb-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .type-tabs{display:flex;background:#e5e7eb;border-radius:6px;overflow:hidden}
    .type-tabs button{padding:.3rem .65rem;border:none;background:none;cursor:pointer;font-size:.78rem;font-weight:600;color:#6b7280}
    .type-tabs button.active{background:white;color:#6366f1;box-shadow:0 1px 3px rgba(0,0,0,.1)}
    .count-inp{width:70px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.88rem;outline:none}
    .option-checks{display:flex;flex-direction:column;gap:.2rem}
    .chk{display:flex;align-items:center;gap.3rem;gap:.3rem;cursor:pointer;font-size:.78rem}
    .sel{padding:.35rem .55rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;background:white;outline:none}
    .output-area{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .oa-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.4rem;margin-bottom.65rem;margin-bottom:.65rem}
    .oa-stats{display:flex;gap.5rem;gap:.5rem;font-size:.72rem;color:#9ca3af}
    .oa-actions{display:flex;gap.3rem;gap:.3rem;flex-wrap:wrap}
    .action-btn{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.3rem .75rem;cursor:pointer;font-size:.75rem;font-weight:600}
    .action-btn.primary{background:#6366f1;border-color:#6366f1;color:white}
    .output-text{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.85rem 1rem;line-height:1.7;font-size:.88rem;color:#374151;max-height:400px;overflow-y:auto}
    :host ::ng-deep .output-text p{margin:0 0 .75rem}
    :host ::ng-deep .output-text p:last-child{margin-bottom:0}
    :host ::ng-deep .output-text h1,:host ::ng-deep .output-text h2{font-weight:700;margin:.5rem 0 .3rem}
    :host ::ng-deep .output-text ul{padding-left:1.25rem;margin:.3rem 0}
    .presets-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .preset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.4rem}
    .preset-btn{background:white;border:1px solid #e5e7eb;border-radius:9px;padding:.55rem .75rem;cursor:pointer;text-align:left;transition:all .15s}
    .preset-btn:hover{border-color:#6366f1}
    .pb-icon{display:block;font-size:1.1rem;margin-bottom.15rem;margin-bottom:.15rem}
    .pb-label{display:block;font-size:.8rem;font-weight:700;color:#111827;margin-bottom.1rem;margin-bottom:.1rem}
    .pb-desc{display:block;font-size:.68rem;color:#9ca3af}
    .about-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .as-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.4rem;margin-bottom:.4rem}
    .as-text{font-size:.8rem;color:#6b7280;line-height:1.5}
  `]
})
export class LoremIpsumGeneratorComponent {
  genType = 'paragraphs'; count = 3; startWithLorem = true; includeHtml = false; includeLineBreaks = true; format = 'lorem';
  private _output = '';

  types = [{key:'words',label:'Words'},{key:'sentences',label:'Sentences'},{key:'paragraphs',label:'Paragraphs'}];

  presets = [
    {icon:'📌',label:'Single paragraph',desc:'One medium paragraph',type:'paragraphs',count:1},
    {icon:'📄',label:'Short article',desc:'3 paragraphs',type:'paragraphs',count:3},
    {icon:'📰',label:'Long article',desc:'7 paragraphs',type:'paragraphs',count:7},
    {icon:'💬',label:'Short quote',desc:'10 words',type:'words',count:10},
    {icon:'📋',label:'List items',desc:'5 sentences',type:'sentences',count:5},
    {icon:'🖼',label:'Image caption',desc:'1 sentence',type:'sentences',count:1},
  ];

  wordBanks: Record<FormatType,string[]> = {
    lorem: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' '),
    cicero: 'at vero eos accusamus iusto odio dignissimos ducimus blanditiis praesentium voluptatum deleniti atque corrupti quos dolores quas molestias excepturi sint obcaecati cupiditate non provident similique sunt culpa qui officia deserunt mollitia animi id est laborum dolorum fuga harum quidem rerum facilis est expedita distinctio nam libero tempore cum soluta nobis eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus'.split(' '),
    lorem_ext: 'lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus netus malesuada fames turpis egestas vestibulum tortor quam feugiat vitae ultricies eget tempor nibh in hac habitasse platea dictumst quisque rhoncus maecenas ullamcorper dui blandit scelerisque nisl porttitor ligula pede primis faucibus orci luctus ultrices posuere cubilia curae'.split(' '),
    hipster: 'artisan craft beer roof party pinterest typewriter tofu synth twee biodiesel hella letterpress williamsburg mixtape semiotics sustainable organic quinoa ethical mumblecore occupy hashtag forage salvia messenger bag cliche kogi 8-bit dreamcatcher ennui marfa portland flexitarian cold-pressed chia trust fund chambray normcore pork belly wayfarers'.split(' '),
    corporate: 'synergy leverage paradigm disruptive innovate scalable agile blockchain ecosystem stakeholder bandwidth deliverable roadmap iterate pivot robust seamless proactive dynamic holistic strategic value-added mission-critical best-practice thought-leader core-competency deep-dive circle-back low-hanging-fruit action-item going-forward key-performance-indicator'.split(' '),
  };

  constructor() { this.generate(); }

  generate() {
    const bank = this.wordBanks[this.format as FormatType] || this.wordBanks['lorem'];
    const getRandWord = () => bank[Math.floor(Math.random() * bank.length)];

    const makeSentence = (numWords = 8 + Math.floor(Math.random() * 12)): string => {
      const words: string[] = [];
      for (let i = 0; i < numWords; i++) words.push(getRandWord());
      const sent = words.join(' ');
      return sent.charAt(0).toUpperCase() + sent.slice(1) + '.';
    };

    const makeParagraph = (): string => {
      const sentCount = 3 + Math.floor(Math.random() * 4);
      const sentences: string[] = [];
      for (let i = 0; i < sentCount; i++) sentences.push(makeSentence());
      return sentences.join(' ');
    };

    let output = '';
    if (this.genType === 'words') {
      const words: string[] = [];
      for (let i = 0; i < this.count; i++) words.push(getRandWord());
      output = words.join(' ');
    } else if (this.genType === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < this.count; i++) sentences.push(makeSentence());
      output = sentences.join(' ');
    } else {
      const paras: string[] = [];
      for (let i = 0; i < this.count; i++) paras.push(makeParagraph());
      output = paras.join('\n\n');
    }

    if (this.startWithLorem && this.genType !== 'words') {
      output = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + output.replace(/^[^.]+\.?\s*/, '');
    }

    this._output = output;
  }

  outputHtml(): string {
    if (!this._output) return '';
    let text = this._output;
    if (this.includeHtml && this.genType === 'paragraphs') {
      return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
    }
    if (this.includeLineBreaks && this.genType === 'paragraphs') {
      return text.split('\n\n').map(p => `<p>${p}</p>`).join('');
    }
    return `<p>${text}</p>`;
  }

  wordCountOut(): number { return this._output.split(/\s+/).filter(w=>w).length; }
  charCountOut(): number { return this._output.length; }

  applyPreset(p: any) { this.genType = p.type; this.count = p.count; this.generate(); }
  copy() { navigator.clipboard.writeText(this._output); }
  download() { const b=new Blob([this._output],{type:'text/plain'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='lorem-ipsum.txt';a.click(); }
}

// ─── Duplicate Line Remover ───────────────────────────────────────────────────
@Component({
  selector: 'app-duplicate-remover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="io-grid">
        <div class="io-col">
          <div class="io-header">
            <label class="io-label">Input Text</label>
            <div class="io-actions">
              <button class="tb-btn" (click)="paste()">📋 Paste</button>
              <button class="tb-btn" (click)="inputText=''">🗑 Clear</button>
            </div>
          </div>
          <textarea [(ngModel)]="inputText" class="io-ta" rows="14" placeholder="Paste lines here — duplicates will be detected and removed...&#10;&#10;apple&#10;banana&#10;apple&#10;cherry&#10;banana&#10;date"></textarea>
          <div class="io-footer">{{inputLines()}} lines · {{uniqueCount()}} unique · {{dupCount()}} duplicates</div>
        </div>
        <div class="io-col">
          <div class="io-header">
            <label class="io-label">Output</label>
            <div class="io-actions">
              <button class="tb-btn primary" (click)="copy(output())">📋 Copy</button>
              <button class="tb-btn" (click)="download()">⬇ Download</button>
            </div>
          </div>
          <div class="io-output" [innerHTML]="highlightedOutput()"></div>
          <div class="io-footer">{{outputLines()}} lines · {{removedCount()}} removed ({{removedPct()}}%)</div>
        </div>
      </div>

      <div class="options-bar">
        <div class="ob-group">
          <span class="ob-label">Case</span>
          <label class="chk"><input type="checkbox" [(ngModel)]="caseSensitive" (change)="process()" /> Case-sensitive</label>
        </div>
        <div class="ob-group">
          <span class="ob-label">Whitespace</span>
          <label class="chk"><input type="checkbox" [(ngModel)]="trimLines" (change)="process()" /> Trim whitespace</label>
          <label class="chk"><input type="checkbox" [(ngModel)]="removeEmptyLines" (change)="process()" /> Remove empty lines</label>
        </div>
        <div class="ob-group">
          <span class="ob-label">Sort</span>
          <div class="sort-tabs">
            <button *ngFor="let s of sortOptions" [class.active]="sortMode===s.key" (click)="sortMode=s.key;process()">{{s.label}}</button>
          </div>
        </div>
        <div class="ob-group">
          <span class="ob-label">Keep</span>
          <div class="keep-tabs">
            <button [class.active]="keepMode==='first'" (click)="keepMode='first';process()">First</button>
            <button [class.active]="keepMode==='last'" (click)="keepMode='last';process()">Last</button>
          </div>
        </div>
      </div>

      <!-- Duplicate list -->
      <div class="dups-section" *ngIf="duplicates().length">
        <div class="ds-title">Found {{duplicates().length}} duplicate group{{duplicates().length===1?'':'s'}}</div>
        <div class="dup-list">
          <div class="dup-item" *ngFor="let d of duplicates().slice(0,20)">
            <span class="di-text">{{d.text}}</span>
            <span class="di-count">×{{d.count}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .io-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
    @media(max-width:700px){.io-grid{grid-template-columns:1fr}}
    .io-col{display:flex;flex-direction:column;gap:.3rem}
    .io-header{display:flex;justify-content:space-between;align-items:center}
    .io-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .io-actions{display:flex;gap.25rem;gap:.25rem}
    .tb-btn{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.22rem .55rem;cursor:pointer;font-size:.7rem;font-weight:600}
    .tb-btn:hover{border-color:#6366f1;color:#6366f1}
    .tb-btn.primary{background:#6366f1;border-color:#6366f1;color:white}
    .io-ta{width:100%;min-height:280px;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.6}
    .io-output{min-height:280px;max-height:340px;overflow-y:auto;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.65rem .85rem;font-size:.82rem;font-family:monospace;line-height:1.6;white-space:pre-wrap}
    :host ::ng-deep .dup-line{text-decoration:line-through;opacity:.4;color:#dc2626}
    :host ::ng-deep .keep-line{color:#059669;font-weight:600}
    .io-footer{font-size:.68rem;color:#9ca3af;text-align:right}
    .options-bar{display:flex;gap:1rem;flex-wrap:wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem 1rem;margin-bottom:.85rem;align-items:flex-end}
    .ob-group{display:flex;flex-direction:column;gap.2rem;gap:.2rem}
    .ob-label{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .chk{display:flex;align-items:center;gap.25rem;gap:.25rem;cursor:pointer;font-size:.78rem}
    .sort-tabs,.keep-tabs{display:flex;background:#e5e7eb;border-radius:5px;overflow:hidden}
    .sort-tabs button,.keep-tabs button{padding:.25rem .55rem;border:none;background:none;cursor:pointer;font-size:.72rem;font-weight:600;color:#6b7280}
    .sort-tabs button.active,.keep-tabs button.active{background:white;color:#6366f1;box-shadow:0 1px 2px rgba(0,0,0,.08)}
    .dups-section{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.75rem 1rem}
    .ds-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#dc2626;margin-bottom.5rem;margin-bottom:.5rem}
    .dup-list{display:flex;flex-direction:column;gap.2rem;gap:.2rem;max-height:160px;overflow-y:auto}
    .dup-item{display:flex;align-items:center;gap.5rem;gap:.5rem;background:white;border:1px solid #fecaca;border-radius:5px;padding:.25rem .5rem}
    .di-text{flex:1;font-size:.78rem;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .di-count{font-size:.72rem;font-weight:700;color:#dc2626;flex-shrink:0;background:#fef2f2;border-radius:99px;padding:.05rem .35rem}
  `]
})
export class DuplicateLineRemoverComponent {
  inputText = 'apple\nbanana\nApple\ncherry\nbanana\ndate\napple\nCherry\ndate\negg';
  caseSensitive = false; trimLines = true; removeEmptyLines = false; keepMode = 'first';
  sortMode = 'none';
  sortOptions = [{key:'none',label:'None'},{key:'asc',label:'A→Z'},{key:'desc',label:'Z→A'},{key:'len',label:'Length'}];

  inputLines() { return this.inputText.split('\n').length; }

  process() {}

  getLines(): string[] {
    let lines = this.inputText.split('\n');
    if (this.trimLines) lines = lines.map(l => l.trim());
    if (this.removeEmptyLines) lines = lines.filter(l => l.length > 0);
    return lines;
  }

  output(): string {
    const lines = this.getLines();
    const seen = new Map<string,number>();
    lines.forEach((line, i) => {
      const key = this.caseSensitive ? line : line.toLowerCase();
      if (this.keepMode === 'first') { if (!seen.has(key)) seen.set(key, i); }
      else seen.set(key, i);
    });
    const keepIndices = new Set(seen.values());
    let result = lines.filter((_, i) => keepIndices.has(i));
    if (this.sortMode === 'asc') result.sort((a,b) => a.localeCompare(b));
    else if (this.sortMode === 'desc') result.sort((a,b) => b.localeCompare(a));
    else if (this.sortMode === 'len') result.sort((a,b) => a.length - b.length);
    return result.join('\n');
  }

  highlightedOutput(): string {
    return this.output().split('\n').map(l => `<span class="keep-line">${this.escHtml(l)}</span>`).join('\n');
  }

  duplicates(): {text:string,count:number}[] {
    const lines = this.getLines();
    const freq = new Map<string,number>();
    lines.forEach(l => { const k = this.caseSensitive?l:l.toLowerCase(); freq.set(k,(freq.get(k)||0)+1); });
    return Array.from(freq.entries()).filter(([_,c])=>c>1).sort((a,b)=>b[1]-a[1]).map(([text,count])=>({text,count}));
  }

  uniqueCount(): number { const s = new Set(this.getLines().map(l=>this.caseSensitive?l:l.toLowerCase())); return s.size; }
  dupCount(): number { return this.getLines().length - this.uniqueCount(); }
  outputLines(): number { return this.output().split('\n').filter(l=>l).length; }
  removedCount(): number { return this.inputLines() - this.outputLines(); }
  removedPct(): number { return this.inputLines() ? Math.round((this.removedCount()/this.inputLines())*100) : 0; }

  escHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  copy(t: string) { navigator.clipboard.writeText(t); }
  async paste() { try { this.inputText = await navigator.clipboard.readText(); } catch {} }
  download() { const b=new Blob([this.output()],{type:'text/plain'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='unique-lines.txt';a.click(); }
}

// ─── Find and Replace ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-find-replace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="find-bar">
        <div class="fb-row">
          <div class="fb-field">
            <label class="fb-label">Find</label>
            <div class="search-input-wrap">
              <input [(ngModel)]="findText" (ngModelChange)="doFind()" class="search-inp" [placeholder]="useRegex?'RegExp pattern e.g. \\\\b\\\\w+ing\\\\b':'Search text...'" />
              <div class="si-flags">
                <button [class.active]="caseSensitive" (click)="caseSensitive=!caseSensitive;doFind()" class="flag-btn" title="Match case">Aa</button>
                <button [class.active]="wholeWord" (click)="wholeWord=!wholeWord;doFind()" class="flag-btn" title="Whole word">W</button>
                <button [class.active]="useRegex" (click)="useRegex=!useRegex;doFind()" class="flag-btn" title="Regular expression">.*</button>
              </div>
            </div>
            <div class="match-count" *ngIf="findText">{{matches().length}} match{{matches().length===1?'':'es'}}</div>
          </div>
          <div class="fb-field">
            <label class="fb-label">Replace with</label>
            <input [(ngModel)]="replaceText" class="search-inp" placeholder="Replacement text (leave empty to delete)..." />
          </div>
          <div class="fb-actions">
            <button class="action-btn" (click)="replaceCurrent()" [disabled]="!matches().length">Replace</button>
            <button class="action-btn primary" (click)="replaceAll()" [disabled]="!matches().length">Replace All</button>
            <button class="action-btn" (click)="undoReplace()" [disabled]="!history().length">↺ Undo</button>
          </div>
        </div>
      </div>

      <div class="editor-layout">
        <div class="editor-col">
          <label class="io-label">Text</label>
          <div class="editor-wrap">
            <div class="highlighted-text" [innerHTML]="highlightedText()" ></div>
            <textarea [(ngModel)]="mainText" (ngModelChange)="doFind()" class="editor-ta overlay" spellcheck="false"></textarea>
          </div>
          <div class="ta-footer">
            <span>{{mainText.length}} chars</span>
            <span>{{wordCount()}} words</span>
            <button class="tb-btn" (click)="paste()">📋 Paste</button>
            <button class="tb-btn" (click)="mainText='';doFind()">🗑 Clear</button>
          </div>
        </div>

        <!-- Match navigator -->
        <div class="matches-col" *ngIf="matches().length">
          <label class="io-label">Matches ({{matches().length}})</label>
          <div class="match-nav">
            <button class="nav-btn" (click)="prevMatch()">↑</button>
            <span class="nav-cur">{{currentMatch()+1}} / {{matches().length}}</span>
            <button class="nav-btn" (click)="nextMatch()">↓</button>
          </div>
          <div class="matches-list">
            <div *ngFor="let m of matches().slice(0,30); let i=index" class="match-item" [class.current]="currentMatch()===i" (click)="currentMatch.set(i)">
              <span class="mi-idx">{{i+1}}</span>
              <span class="mi-context" [innerHTML]="getContext(m)"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Replace history -->
      <div class="history-section" *ngIf="history().length">
        <div class="hs-title">Replace History</div>
        <div class="hist-list">
          <div *ngFor="let h of history()" class="hist-item">
            <span class="hi-find mono">"{{h.find}}"</span>
            <span class="hi-arrow">→</span>
            <span class="hi-replace mono">{{ formatReplace(h) }}</span>
            <span class="hi-count">×{{h?.count}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .find-bar{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .fb-row{display:flex;gap.75rem;align-items:flex-end;flex-wrap:wrap;gap:.75rem}
    .fb-field{display:flex;flex-direction:column;gap.2rem;gap:.2rem;flex:1;min-width:180px}
    .fb-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .search-input-wrap{display:flex;background:white;border:1px solid #d1d5db;border-radius:7px;overflow:hidden;transition:border-color .2s}
    .search-input-wrap:focus-within{border-color:#6366f1}
    .search-inp{flex:1;padding:.4rem .65rem;border:none;font-size:.88rem;outline:none;min-width:0}
    .si-flags{display:flex;gap:1px;background:#f3f4f6;padding:2px}
    .flag-btn{padding:.2rem .4rem;border:none;border-radius:4px;background:transparent;cursor:pointer;font-size:.72rem;font-weight:700;color:#9ca3af;transition:all .1s}
    .flag-btn.active{background:#6366f1;color:white}
    .match-count{font-size:.68rem;color:#6b7280}
    .fb-actions{display:flex;gap.3rem;gap:.3rem;flex-shrink:0;flex-wrap:wrap}
    .action-btn{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.35rem .75rem;cursor:pointer;font-size:.78rem;font-weight:700}
    .action-btn:disabled{opacity:.5;cursor:not-allowed}
    .action-btn.primary{background:#6366f1;border-color:#6366f1;color:white}
    .editor-layout{display:grid;grid-template-columns:1fr 240px;gap:1rem;margin-bottom:1rem}
    @media(max-width:700px){.editor-layout{grid-template-columns:1fr}}
    .io-label{display:block;font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.3rem}
    .editor-col{display:flex;flex-direction:column;gap.3rem;gap:.3rem}
    .editor-wrap{position:relative;min-height:280px}
    .highlighted-text{position:absolute;inset:0;padding:.65rem .85rem;font-size:.88rem;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:transparent;border:1px solid #d1d5db;border-radius:8px;white-space:pre-wrap;word-wrap:break-word;pointer-events:none;overflow:hidden}
    :host ::ng-deep .highlighted-text mark{background:#fbbf24;border-radius:2px;color:transparent}
    :host ::ng-deep .highlighted-text mark.current{background:#f97316;box-shadow:0 0 0 2px #f97316}
    .editor-ta{position:relative;z-index:1;width:100%;min-height:280px;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.88rem;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;resize:vertical;outline:none;box-sizing:border-box;background:transparent;color:#374151}
    .editor-ta.overlay{position:absolute;inset:0;height:100%;color:#374151;caret-color:#374151}
    .ta-footer{display:flex;align-items:center;gap.5rem;gap:.5rem;font-size:.68rem;color:#9ca3af;flex-wrap:wrap}
    .tb-btn{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.18rem .5rem;cursor:pointer;font-size:.68rem;font-weight:600}
    .matches-col{display:flex;flex-direction:column;gap.3rem;gap:.3rem}
    .match-nav{display:flex;align-items:center;gap.5rem;gap:.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:7px;padding:.3rem .6rem;justify-content:center}
    .nav-btn{background:none;border:none;cursor:pointer;font-size:.88rem;padding:.1rem .35rem;border-radius:4px}
    .nav-btn:hover{background:#e5e7eb}
    .nav-cur{font-size:.75rem;font-weight:700;color:#374151;min-width:50px;text-align:center}
    .matches-list{flex:1;overflow-y:auto;max-height:260px;display:flex;flex-direction:column;gap.2rem;gap:.2rem}
    .match-item{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:.3rem .5rem;cursor:pointer;font-size:.72rem;display:flex;align-items:center;gap.35rem;gap:.35rem}
    .match-item.current{border-color:#f97316;background:#fff7ed}
    .mi-idx{font-size:.6rem;color:#9ca3af;min-width:18px}
    .mi-context{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace}
    :host ::ng-deep .mi-context mark{background:#fbbf24;border-radius:2px}
    .history-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .hs-title{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.4rem;margin-bottom:.4rem}
    .hist-list{display:flex;flex-direction:column;gap.2rem;gap:.2rem}
    .hist-item{display:flex;align-items:center;gap.5rem;gap:.5rem;font-size:.78rem}
    .hi-find{color:#dc2626}.hi-arrow{color:#9ca3af}.hi-replace{color:#059669}
    .hi-count{background:#f3f4f6;border-radius:99px;padding:.05rem .35rem;font-size:.68rem;font-weight:700;color:#6b7280}
    .mono{font-family:monospace}
  `]
})
export class FindReplaceComponent {
  mainText = 'The quick brown fox jumps over the lazy dog.\nThe dog barked at the fox.\nA quick response was given by the dog to the fox.\nFoxes are quick and clever animals.\nThe lazy brown dog sat near the log.';
  findText = 'dog'; replaceText = 'cat';
  caseSensitive = false; wholeWord = false; useRegex = false;
  currentMatch = signal(0);
  history = signal<{find:string,replace:string,count:number}[]>([]);
wordCount(): number {
  return this.mainText
    ? this.mainText.split(/\s+/).filter(w => w).length
    : 0;
}
  private getRegex(): RegExp | null {
    if (!this.findText) return null;
    try {
      let pattern = this.useRegex ? this.findText : this.findText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if (this.wholeWord) pattern = `\\b${pattern}\\b`;
      const flags = this.caseSensitive ? 'g' : 'gi';
      return new RegExp(pattern, flags);
    } catch { return null; }
  }

  formatReplace(h: { find: string; replace: string; count: number }): string {
  return h.replace ? `"${h.replace}"` : '[deleted]';
}
  matches(): {index:number,length:number}[] {
    const re = this.getRegex();
    if (!re) return [];
    const result: {index:number,length:number}[] = [];
    let m;
    const re2 = new RegExp(re.source, re.flags);
    while ((m = re2.exec(this.mainText)) !== null) {
      result.push({index:m.index,length:m[0].length});
      if (!re2.global) break;
    }
    return result;
  }

  doFind() { this.currentMatch.set(0); }

  highlightedText(): string {
    if (!this.findText || !this.matches().length) return this.esc(this.mainText);
    let result = ''; let last = 0;
    this.matches().forEach((m, i) => {
      result += this.esc(this.mainText.slice(last, m.index));
      const cls = i === this.currentMatch() ? 'mark current' : 'mark';
      result += `<mark class="${cls}">${this.esc(this.mainText.slice(m.index, m.index+m.length))}</mark>`;
      last = m.index + m.length;
    });
    result += this.esc(this.mainText.slice(last));
    return result;
  }

  getContext(m: {index:number,length:number}): string {
    const start = Math.max(0, m.index - 15);
    const end = Math.min(this.mainText.length, m.index + m.length + 15);
    const pre = this.esc(this.mainText.slice(start, m.index));
    const match = `<mark>${this.esc(this.mainText.slice(m.index, m.index+m.length))}</mark>`;
    const post = this.esc(this.mainText.slice(m.index+m.length, end));
    return `${start>0?'…':''}${pre}${match}${post}${end<this.mainText.length?'…':''}`;
  }

  replaceCurrent() {
    const ms = this.matches();
    if (!ms.length) return;
    const m = ms[this.currentMatch()];
    this.mainText = this.mainText.slice(0,m.index) + this.replaceText + this.mainText.slice(m.index+m.length);
  }

  replaceAll() {
    const re = this.getRegex();
    if (!re) return;
    const count = this.matches().length;
    this.history.update(h => [{find:this.findText,replace:this.replaceText,count : count},...h.slice(0,9)]);
    this.mainText = this.mainText.replace(re, this.replaceText);
    this.doFind();
  }

  undoReplace() {}

  prevMatch() { const c=this.currentMatch(); this.currentMatch.set(c>0?c-1:this.matches().length-1); }
  nextMatch() { const c=this.currentMatch(); this.currentMatch.set(c<this.matches().length-1?c+1:0); }

  esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  async paste() { try { this.mainText = await navigator.clipboard.readText(); this.doFind(); } catch {} }
}

type FormatType = 'lorem' | 'cicero' | 'lorem_ext' | 'hipster' | 'corporate';

