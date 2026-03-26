import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Text to Slug ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-text-to-slug',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-section">
        <div class="field">
          <label class="lbl">Input Text</label>
          <input [(ngModel)]="inputText" (ngModelChange)="convert()" class="inp large" placeholder="Enter title, heading or text to slugify..." />
        </div>

        <div class="slug-outputs" *ngIf="inputText.trim()">
          <div class="slug-row" *ngFor="let s of slugVariants()">
            <div class="sr-header">
              <span class="sr-label">{{s.label}}</span>
              <span class="sr-desc">{{s.desc}}</span>
            </div>
            <div class="sr-value-row">
              <code class="slug-code">{{s.value}}</code>
              <button class="copy-btn" (click)="copy(s.value)">📋</button>
            </div>
          </div>
        </div>
      </div>

      <div class="options-card">
        <div class="oc-title">Customization Options</div>
        <div class="options-grid">
          <div class="field"><label class="lbl">Separator</label>
            <div class="sep-btns">
              <button *ngFor="let s of separators" [class.active]="separator===s.val" (click)="separator=s.val;convert()" class="sep-btn">{{s.label}}</button>
            </div></div>
          <div class="field"><label class="lbl">Max Length</label>
            <input type="number" [(ngModel)]="maxLength" (ngModelChange)="convert()" class="inp-sm" min="10" max="200" /></div>
          <div class="field"><label class="lbl">Case</label>
            <div class="sep-btns">
              <button [class.active]="slugCase==='lower'" (click)="slugCase='lower';convert()">lowercase</button>
              <button [class.active]="slugCase==='upper'" (click)="slugCase='upper';convert()">UPPER</button>
              <button [class.active]="slugCase==='keep'" (click)="slugCase='keep';convert()">Keep</button>
            </div></div>
          <div class="field options-checks">
            <label class="chk"><input type="checkbox" [(ngModel)]="removeStopWords" (change)="convert()" /> Remove stop words</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="transliterate" (change)="convert()" /> Transliterate (e.g. ñ→n)</label>
          </div>
        </div>
      </div>

      <div class="batch-section">
        <div class="bs-title">Batch Converter</div>
        <div class="batch-grid">
          <div class="field">
            <label class="lbl">Input (one title per line)</label>
            <textarea [(ngModel)]="batchInput" (ngModelChange)="batchConvert()" class="ta" rows="6" placeholder="Title One&#10;Another Great Post&#10;My Blog Post Title"></textarea>
          </div>
          <div class="field">
            <label class="lbl">Slugs Output <button class="copy-btn-sm" (click)="copyBatch()">📋 Copy All</button></label>
            <pre class="batch-output">{{batchOutput()}}</pre>
          </div>
        </div>
      </div>

      <div class="ref-section">
        <div class="ref-title">Slug Best Practices</div>
        <div class="ref-grid">
          <div class="ref-card" *ngFor="let r of bestPractices"><span class="rc-icon">{{r.icon}}</span><div><strong>{{r.title}}</strong><div class="rc-desc">{{r.desc}}</div></div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .main-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp{padding:.45rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.92rem;outline:none;width:100%;box-sizing:border-box}
    .inp.large{font-size:1rem}
    .inp-sm{width:80px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.85rem;outline:none}
    .slug-outputs{display:flex;flex-direction:column;gap.5rem;gap:.5rem;margin-top:.5rem}
    .slug-row{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem}
    .sr-header{display:flex;align-items:center;gap.5rem;gap:.5rem;margin-bottom.3rem;margin-bottom:.3rem}
    .sr-label{font-size:.72rem;font-weight:700;color:#374151;min-width:100px}
    .sr-desc{font-size:.65rem;color:#9ca3af}
    .sr-value-row{display:flex;align-items:center;gap.4rem;gap:.4rem}
    .slug-code{flex:1;font-family:monospace;font-size:.85rem;color:#6366f1;background:#f5f3ff;border-radius:5px;padding:.25rem .55rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .5rem;cursor:pointer;font-size:.7rem;font-weight:700;flex-shrink:0}
    .options-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .oc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.65rem;margin-bottom:.65rem}
    .options-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap.75rem;gap:.75rem}
    .sep-btns{display:flex;gap.2rem;gap:.2rem;flex-wrap:wrap}
    .sep-btns button{padding:.25rem .55rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.75rem;font-weight:700;font-family:monospace}
    .sep-btns button.active{border-color:#6366f1;background:#f5f3ff;color:#6366f1}
    .options-checks{gap.25rem;gap:.25rem}
    .chk{display:flex;align-items:center;gap.3rem;gap:.3rem;cursor:pointer;font-size:.78rem}
    .batch-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:1rem}
    .bs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .batch-grid{display:grid;grid-template-columns:1fr 1fr;gap.75rem;gap:.75rem}
    @media(max-width:680px){.batch-grid{grid-template-columns:1fr}}
    .ta{padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;width:100%;box-sizing:border-box}
    .copy-btn-sm{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:5px;padding:.15rem .45rem;cursor:pointer;font-size:.65rem;font-weight:700;margin-left:.5rem}
    .batch-output{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.82rem;font-family:monospace;line-height:1.7;margin:0;min-height:130px;overflow-x:auto;white-space:pre-wrap;color:#6366f1}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap.45rem;gap:.45rem}
    .ref-card{display:flex;gap.4rem;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .7rem;font-size:.78rem}
    .rc-icon{font-size:.9rem;flex-shrink:0}
    .rc-desc{font-size:.68rem;color:#9ca3af;margin-top.1rem;margin-top:.1rem}
  `]
})
export class TextToSlugComponent {
  inputText = 'How to Build a Scalable Web Application in 2024!';
  separator = '-'; maxLength = 80; slugCase = 'lower';
  removeStopWords = false; transliterate = true;
  batchInput = 'Hello World\nMy First Blog Post\nTop 10 JavaScript Tips';

  separators = [{val:'-',label:'-'},{val:'_',label:'_'},{val:'.',label:'.'},{val:'',label:'none'}];

  bestPractices = [
    {icon:'🔡',title:'Use lowercase',desc:'Search engines treat uppercase/lowercase differently. Lowercase slugs are safer.'},
    {icon:'🔗',title:'Use hyphens',desc:'Google recommends hyphens (-) over underscores (_) as word separators in URLs.'},
    {icon:'✂️',title:'Keep it short',desc:'Ideal slug length is 3–5 words. Shorter URLs are easier to share and remember.'},
    {icon:'🚫',title:'Remove special chars',desc:'Remove accents, symbols and punctuation. Only a-z, 0-9 and hyphens in URLs.'},
    {icon:'📏',title:'Avoid stop words',desc:'Skip "the", "a", "and" etc. They add length without improving SEO meaning.'},
    {icon:'♻️',title:'Keep it stable',desc:'Changing a URL after publication breaks links and hurts SEO. Plan slugs carefully.'},
  ];

  convert() {}

  slugify(text: string, sep: string = this.separator): string {
    let s = text.trim();
    // Transliterate common characters
    if (this.transliterate) {
      s = s.replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u').replace(/[ýÿ]/g,'y').replace(/[ñ]/g,'n').replace(/[ç]/g,'c').replace(/[ß]/g,'ss').replace(/[æ]/g,'ae').replace(/[œ]/g,'oe');
    }
    // Apply case
    if (this.slugCase === 'lower') s = s.toLowerCase();
    else if (this.slugCase === 'upper') s = s.toUpperCase();
    // Remove stop words
    if (this.removeStopWords) {
      const stops = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can']);
      s = s.split(/\s+/).filter(w => !stops.has(w.toLowerCase())).join(' ');
    }
    // Replace non-alphanumeric
    s = s.replace(/[^a-zA-Z0-9\s-_]/g,' ').trim().replace(/\s+/g, sep || '-');
    // Remove consecutive separators
    if (sep) s = s.replace(new RegExp(`\\${sep}{2,}`,'g'), sep).replace(new RegExp(`^\\${sep}|\\${sep}$`,'g'),'');
    // Max length
    if (this.maxLength && s.length > this.maxLength) {
      s = s.slice(0, this.maxLength);
      if (sep && s.endsWith(sep)) s = s.slice(0,-1);
    }
    return s;
  }

  slugVariants() {
    if (!this.inputText.trim()) return [];
    const base = this.slugify(this.inputText);
    return [
      {label:'URL Slug',desc:'For blog posts, pages',value:base},
      {label:'Permalink',desc:'With domain',value:`https://yourdomain.com/${base}`},
      {label:'Anchor ID',desc:'For HTML #id attribute',value:`#${base}`},
      {label:'Filename',desc:'For file naming',value:`${base}.html`},
    ];
  }

  batchConvert(): string { return ''; }
  batchOutput(): string {
    return this.batchInput.split('\n').filter(l=>l.trim()).map(l=>this.slugify(l)).join('\n');
  }

  copy(t: string) { navigator.clipboard.writeText(t); }
  copyBatch() { navigator.clipboard.writeText(this.batchOutput()); }
}

// ─── Text Reverser ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-text-reverser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="mode.set(m.key)">{{m.icon}} {{m.label}}</button>
      </div>

      <div class="io-layout">
        <div class="io-col">
          <label class="lbl">Input</label>
          <textarea [(ngModel)]="inputText" class="io-ta" rows="8" placeholder="Enter your text here..."></textarea>
          <div class="footer-row"><span>{{inputText.length}} chars</span><button class="paste-btn" (click)="paste()">📋 Paste</button></div>
        </div>
        <div class="arrow-col"><div class="arrow">→</div></div>
        <div class="io-col">
          <div class="out-header">
            <label class="lbl">{{activeModeData()?.label}} Output</label>
            <button class="copy-btn" (click)="copy()">📋 Copy</button>
          </div>
          <div class="output-box">{{output()}}</div>
          <div class="footer-row"><span>{{output().length}} chars</span></div>
        </div>
      </div>

      <div class="mode-cards">
        <div class="mode-card" *ngFor="let m of modes" (click)="mode.set(m.key)" [class.active]="mode()===m.key">
          <div class="mc-icon">{{m.icon}}</div>
          <div class="mc-name">{{m.label}}</div>
          <div class="mc-example mono">{{getExample(m.key)}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap.3rem;background:#f3f4f6;border-radius:8px;padding:.3rem;margin-bottom:1rem;flex-wrap:wrap;gap:.3rem}
    .mode-tabs button{flex:1;min-width:100px;padding:.38rem .5rem;border:none;background:none;border-radius:6px;font-size:.78rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#6366f1;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .io-layout{display:grid;grid-template-columns:1fr 40px 1fr;gap.5rem;margin-bottom:1rem;align-items:start;gap:.5rem}
    @media(max-width:680px){.io-layout{grid-template-columns:1fr}.arrow-col{display:none}}
    .io-col{display:flex;flex-direction:column;gap.25rem;gap:.25rem}
    .lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .io-ta{width:100%;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.9rem;line-height:1.6;resize:vertical;outline:none;box-sizing:border-box;font-family:monospace}
    .output-box{min-height:180px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.65rem .85rem;font-size:.9rem;line-height:1.6;font-family:monospace;white-space:pre-wrap;word-break:break-all}
    .arrow-col{display:flex;align-items:center;justify-content:center;padding-top:1.5rem}
    .arrow{font-size:1.5rem;color:#d1d5db;font-weight:700}
    .out-header{display:flex;justify-content:space-between;align-items:center}
    .copy-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .55rem;cursor:pointer;font-size:.7rem;font-weight:700}
    .paste-btn{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.15rem .45rem;cursor:pointer;font-size:.68rem;font-weight:600}
    .footer-row{display:flex;justify-content:space-between;font-size:.68rem;color:#9ca3af}
    .mode-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap.4rem;gap:.4rem}
    .mode-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem .75rem;cursor:pointer;text-align:center;transition:all .15s}
    .mode-card.active{border-color:#6366f1;background:#f5f3ff}
    .mode-card:hover{border-color:#a5b4fc}
    .mc-icon{font-size:1.3rem;margin-bottom.2rem;margin-bottom:.2rem}
    .mc-name{font-size:.75rem;font-weight:700;color:#111827;margin-bottom.15rem;margin-bottom:.15rem}
    .mc-example{font-size:.62rem;color:#9ca3af}
    .mono{font-family:monospace}
  `]
})
export class TextReverserComponent {
  inputText = 'Hello, World! Reverse me.';
  mode = signal('chars');

  modes = [
    {key:'chars',icon:'🔤',label:'Reverse Characters'},
    {key:'words',icon:'📝',label:'Reverse Words'},
    {key:'lines',icon:'📋',label:'Reverse Lines'},
    {key:'sentences',icon:'💬',label:'Reverse Sentences'},
    {key:'flip',icon:'🙃',label:'Upside Down Text'},
    {key:'mirror',icon:'🪞',label:'Mirror (RTL)'},
  ];

  flipMap: Record<string,string> = {'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ı','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z','A':'∀','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'פ','H':'H','I':'I','J':'ɾ','K':'ʞ','L':'˥','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Q','R':'ᴚ','S':'S','T':'┴','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','.':'˙',',':'\'','!':'¡','?':'¿','"':',','\'':'„','(':')',')':"(",'[':']',']':'['};

  output(): string {
    const t = this.inputText;
    switch (this.mode()) {
      case 'chars': return t.split('').reverse().join('');
      case 'words': return t.split(' ').reverse().join(' ');
      case 'lines': return t.split('\n').reverse().join('\n');
      case 'sentences': return t.split(/(?<=[.!?])\s+/).reverse().join(' ');
      case 'flip': return t.split('').map(c=>this.flipMap[c]||c).reverse().join('');
      case 'mirror': return t.split('').reverse().join('');
      default: return t;
    }
  }

  activeModeData() { return this.modes.find(m=>m.key===this.mode()); }
  getExample(key: string): string {
    const ex = 'Hello';
    const old = this.inputText; this.inputText = ex;
    const result = this.output().slice(0,12);
    this.inputText = old;
    return result;
  }
  copy() { navigator.clipboard.writeText(this.output()); }
  async paste() { try { this.inputText = await navigator.clipboard.readText(); } catch {} }
}

// ─── Line Sorter ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-line-sorter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="io-layout">
        <div class="io-col">
          <label class="lbl">Input Lines</label>
          <textarea [(ngModel)]="inputText" (ngModelChange)="sort()" class="io-ta" rows="12" placeholder="Paste lines to sort...&#10;&#10;Banana&#10;apple&#10;cherry&#10;Date&#10;elderberry"></textarea>
          <div class="footer-row"><span>{{inputLines()}} lines</span><button class="paste-btn" (click)="paste()">📋 Paste</button></div>
        </div>

        <div class="controls-col">
          <div class="ctrl-title">Sort Settings</div>
          <div class="ctrl-group">
            <div class="cg-label">Order</div>
            <div class="order-btns">
              <button *ngFor="let o of orders" [class.active]="order===o.key" (click)="order=o.key;sort()" class="ord-btn">{{o.icon}} {{o.label}}</button>
            </div>
          </div>
          <div class="ctrl-group">
            <div class="cg-label">Options</div>
            <label class="chk"><input type="checkbox" [(ngModel)]="caseSensitive" (change)="sort()" /> Case-sensitive</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="trimLines" (change)="sort()" /> Trim whitespace</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="removeDuplicates" (change)="sort()" /> Remove duplicates</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="removeEmpty" (change)="sort()" /> Remove empty lines</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="naturalSort" (change)="sort()" /> Natural number sort</label>
          </div>
          <div class="ctrl-group">
            <div class="cg-label">Number Order</div>
            <label class="chk"><input type="radio" [(ngModel)]="numOrder" value="auto" (change)="sort()" /> Auto-detect</label>
            <label class="chk"><input type="radio" [(ngModel)]="numOrder" value="numeric" (change)="sort()" /> Numeric</label>
          </div>
          <div class="stats-box" *ngIf="inputText.trim()">
            <div class="sb-row"><span>Input</span><strong>{{inputLines()}} lines</strong></div>
            <div class="sb-row"><span>Output</span><strong>{{outputLines()}} lines</strong></div>
            <div class="sb-row" *ngIf="removedCount()"><span>Removed</span><strong>{{removedCount()}}</strong></div>
          </div>
        </div>

        <div class="io-col">
          <div class="out-header">
            <label class="lbl">Sorted Output</label>
            <div class="oh-actions">
              <button class="copy-btn" (click)="copy()">📋 Copy</button>
              <button class="copy-btn" (click)="download()">⬇</button>
            </div>
          </div>
          <div class="output-box">{{output()}}</div>
          <div class="footer-row"><span>{{outputLines()}} lines</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .io-layout{display:grid;grid-template-columns:1fr 180px 1fr;gap.75rem;gap:.75rem}
    @media(max-width:800px){.io-layout{grid-template-columns:1fr 1fr}}
    @media(max-width:580px){.io-layout{grid-template-columns:1fr}}
    .lbl{display:block;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.2rem;margin-bottom:.2rem}
    .io-ta{width:100%;min-height:280px;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.85rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.6}
    .output-box{min-height:280px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.65rem .85rem;font-size:.85rem;font-family:monospace;white-space:pre-wrap;line-height:1.6;overflow-y:auto;max-height:360px}
    .footer-row{display:flex;justify-content:space-between;align-items:center;font-size:.68rem;color:#9ca3af;margin-top.2rem;margin-top:.2rem}
    .paste-btn{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.15rem .45rem;cursor:pointer;font-size:.68rem;font-weight:600}
    .out-header{display:flex;justify-content:space-between;align-items:center;margin-bottom.2rem;margin-bottom:.2rem}
    .oh-actions{display:flex;gap.2rem;gap:.2rem}
    .copy-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .5rem;cursor:pointer;font-size:.7rem;font-weight:700}
    .ctrl-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#374151;margin-bottom.6rem;margin-bottom:.6rem}
    .ctrl-group{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .7rem;margin-bottom.4rem;margin-bottom:.4rem}
    .cg-label{font-size:.6rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom.3rem;margin-bottom:.3rem}
    .order-btns{display:flex;flex-direction:column;gap.2rem;gap:.2rem}
    .ord-btn{padding:.3rem .5rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600;text-align:left;transition:all .1s}
    .ord-btn.active{border-color:#6366f1;background:#f5f3ff;color:#6366f1}
    .chk{display:flex;align-items:center;gap.25rem;gap:.25rem;cursor:pointer;font-size:.75rem;margin-bottom.2rem;margin-bottom:.2rem}
    .stats-box{background:#f5f3ff;border:1px solid #c7d2fe;border-radius:8px;padding:.5rem .7rem}
    .sb-row{display:flex;justify-content:space-between;font-size:.75rem;padding:.1rem 0}
    .sb-row span{color:#6b7280}
  `]
})
export class LineSorterComponent {
  inputText = 'Banana\napple\n3. cherry\n1. Date\n2. elderberry\nbanana\napple';
  order = 'asc'; caseSensitive = false; trimLines = true; removeDuplicates = false; removeEmpty = false; naturalSort = true; numOrder = 'auto';
  orders = [{key:'asc',icon:'🔼',label:'A → Z'},{key:'desc',icon:'🔽',label:'Z → A'},{key:'len_asc',icon:'📏',label:'Shortest first'},{key:'len_desc',icon:'📐',label:'Longest first'},{key:'shuffle',icon:'🔀',label:'Random shuffle'}];

  sort() {}

  getLines(): string[] {
    let lines = this.inputText.split('\n');
    if (this.trimLines) lines = lines.map(l=>l.trim());
    if (this.removeEmpty) lines = lines.filter(l=>l.length>0);
    if (this.removeDuplicates) { const seen = new Set<string>(); lines = lines.filter(l=>{const k=this.caseSensitive?l:l.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;}); }
    return lines;
  }

  output(): string {
    const lines = this.getLines();
    const cmp = (a: string, b: string) => {
      const ka = this.caseSensitive?a:a.toLowerCase();
      const kb = this.caseSensitive?b:b.toLowerCase();
      if (this.naturalSort) {
        const na = parseFloat(a.replace(/^[\d.]+\.\s*/,''));
        const nb = parseFloat(b.replace(/^[\d.]+\.\s*/,''));
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
      }
      return ka.localeCompare(kb);
    };
    if (this.order==='asc') return [...lines].sort(cmp).join('\n');
    if (this.order==='desc') return [...lines].sort((a,b)=>cmp(b,a)).join('\n');
    if (this.order==='len_asc') return [...lines].sort((a,b)=>a.length-b.length).join('\n');
    if (this.order==='len_desc') return [...lines].sort((a,b)=>b.length-a.length).join('\n');
    if (this.order==='shuffle') return [...lines].sort(()=>Math.random()-.5).join('\n');
    return lines.join('\n');
  }

  inputLines() { return this.inputText.split('\n').length; }
  outputLines() { return this.output().split('\n').filter(l=>l).length; }
  removedCount() { return this.inputLines() - this.outputLines(); }
  copy() { navigator.clipboard.writeText(this.output()); }
  download() { const b=new Blob([this.output()],{type:'text/plain'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='sorted-lines.txt';a.click(); }
  async paste() { try { this.inputText = await navigator.clipboard.readText(); } catch {} }
}

// ─── String Encoder/Decoder ───────────────────────────────────────────────────
@Component({
  selector: 'app-string-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="mode.set(m.key)">{{m.label}}</button>
      </div>

      <div class="io-grid">
        <div class="io-col">
          <label class="lbl">Input</label>
          <textarea [(ngModel)]="inputText" (ngModelChange)="encode()" class="io-ta" rows="7" [placeholder]="activePlaceholder()"></textarea>
          <div class="footer-row"><span>{{inputText.length}} chars</span><button class="paste-btn" (click)="paste()">📋 Paste</button></div>
        </div>
        <div class="io-col">
          <div class="oh">
            <label class="lbl">Encoded / Decoded Output</label>
            <button class="copy-btn" (click)="copy()">📋 Copy</button>
          </div>
          <div class="output-box">{{output()}}</div>
          <div class="footer-row"><span>{{output().length}} chars</span></div>
        </div>
      </div>

      <div class="encode-decode-btns">
        <button class="ed-btn active" (click)="direction='encode';encode()">🔒 Encode</button>
        <button class="ed-btn" (click)="direction='decode';encode()">🔓 Decode</button>
        <button class="ed-btn swap" (click)="swap()">⇄ Swap Input/Output</button>
      </div>

      <!-- All formats at once -->
      <div class="all-encodings" *ngIf="inputText.trim()">
        <div class="ae-title">All Encodings</div>
        <div class="ae-grid">
          <div class="ae-item" *ngFor="let m of modes">
            <span class="aei-label">{{m.label}}</span>
            <span class="aei-val mono">{{encodeWith(inputText, m.key)}}</span>
            <button class="copy-sm" (click)="copy2(encodeWith(inputText,m.key))">📋</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap.25rem;flex-wrap:wrap;background:#f3f4f6;border-radius:8px;padding:.3rem;margin-bottom:1rem;gap:.25rem}
    .mode-tabs button{flex:1;min-width:80px;padding:.35rem .4rem;border:none;background:none;border-radius:6px;font-size:.75rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#6366f1;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .io-grid{display:grid;grid-template-columns:1fr 1fr;gap.85rem;gap:.85rem;margin-bottom:.65rem}
    @media(max-width:680px){.io-grid{grid-template-columns:1fr}}
    .io-col{display:flex;flex-direction:column;gap.2rem;gap:.2rem}
    .lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .io-ta{width:100%;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .output-box{min-height:150px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.65rem .85rem;font-size:.82rem;font-family:monospace;white-space:pre-wrap;word-break:break-all;line-height:1.5}
    .footer-row{display:flex;justify-content:space-between;font-size:.68rem;color:#9ca3af}
    .oh{display:flex;justify-content:space-between;align-items:center}
    .copy-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .5rem;cursor:pointer;font-size:.7rem;font-weight:700}
    .paste-btn{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.15rem .45rem;cursor:pointer;font-size:.68rem;font-weight:600}
    .encode-decode-btns{display:flex;gap.4rem;margin-bottom:1rem;flex-wrap:wrap;gap:.4rem}
    .ed-btn{padding:.38rem .9rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-size:.8rem;font-weight:700}
    .ed-btn.active{background:#6366f1;border-color:#6366f1;color:white}
    .ed-btn.swap{margin-left:auto}
    .all-encodings{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .ae-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.6rem;margin-bottom:.6rem}
    .ae-grid{display:flex;flex-direction:column;gap.3rem;gap:.3rem}
    .ae-item{display:flex;align-items:center;gap.5rem;gap:.5rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .6rem}
    .aei-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;min-width:100px;flex-shrink:0}
    .aei-val{flex:1;font-size:.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151}
    .copy-sm{background:none;border:none;cursor:pointer;font-size:.7rem;opacity:.6;flex-shrink:0}
    .copy-sm:hover{opacity:1}
    .mono{font-family:monospace}
    .tool-wrap {
  max-width: 830px;
  margin: 0 auto;
  padding: 1rem;
}

/* ─── Tablet (≤ 900px) ─── */
@media (max-width: 900px) {
  .tool-wrap {
    max-width: 100%;
    padding: 0.9rem;
  }

  .mode-tabs button {
    font-size: 0.72rem;
    padding: 0.3rem;
  }

  .ed-btn {
    flex: 1;
    text-align: center;
  }
}

/* ─── Mobile (≤ 680px) ─── */
@media (max-width: 680px) {

  /* Stack input/output */
  .io-grid {
    grid-template-columns: 1fr !important;
    gap: 0.6rem;
  }

  /* Tabs wrap nicely */
  .mode-tabs {
    flex-wrap: wrap;
  }

  .mode-tabs button {
    flex: 1 1 calc(50% - 4px);
    font-size: 0.7rem;
  }

  /* Buttons stack */
  .encode-decode-btns {
    flex-direction: column;
  }

  .ed-btn {
    width: 100%;
  }

  .ed-btn.swap {
    margin-left: 0;
  }

  /* Output box */
  .output-box {
    font-size: 0.75rem;
    min-height: 120px;
  }

  .io-ta {
    font-size: 0.75rem;
  }

  /* All encodings */
  .ae-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .aei-label {
    min-width: auto;
  }

  .aei-val {
    white-space: normal;
    word-break: break-all;
  }

  .copy-sm {
    align-self: flex-end;
  }
}

/* ─── Small Mobile (≤ 420px) ─── */
@media (max-width: 420px) {
  .mode-tabs button {
    flex: 1 1 100%;
  }

  .lbl {
    font-size: 0.6rem;
  }

  .footer-row {
    font-size: 0.6rem;
  }
}
  `]
})
export class StringEncoderComponent {
  inputText = 'Hello World! Special chars: < > & " \' © 2024';
  mode = signal('html'); direction = 'encode';
  modes = [{key:'html',label:'HTML Entities'},{key:'url',label:'URL Encode'},{key:'base64',label:'Base64'},{key:'hex',label:'Hex'},{key:'binary',label:'Binary'},{key:'unicode',label:'Unicode Escape'},{key:'ascii',label:'ASCII Codes'},{key:'rot13',label:'ROT13'}];

  activePlaceholder(): string {
    const m = this.mode();
    if (m==='base64') return 'Enter text to encode to Base64...';
    if (m==='html') return 'Enter text with HTML special chars: <>&"\'...';
    if (m==='url') return 'Enter URL or query string to encode...';
    return 'Enter text to encode...';
  }

  encodeWith(text: string, key: string): string {
    try {
      switch(key) {
        case 'html': return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/©/g,'&copy;').replace(/®/g,'&reg;').replace(/™/g,'&trade;');
        case 'url': return encodeURIComponent(text);
        case 'base64': return btoa(unescape(encodeURIComponent(text)));
        case 'hex': return Array.from(text).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join(' ');
        case 'binary': return Array.from(text).map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
        case 'unicode': return Array.from(text).map(c=>`\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`).join('');
        case 'ascii': return Array.from(text).map(c=>c.charCodeAt(0)).join(' ');
        case 'rot13': return text.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b);});
        default: return text;
      }
    } catch { return 'Error encoding'; }
  }

  decodeWith(text: string, key: string): string {
    try {
      switch(key) {
        case 'html': { const el=document.createElement('div');el.innerHTML=text;return el.textContent||''; }
        case 'url': return decodeURIComponent(text.replace(/\+/g,' '));
        case 'base64': return decodeURIComponent(escape(atob(text.trim())));
        case 'hex': return text.split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join('');
        case 'binary': return text.split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join('');
        case 'unicode': return text.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
        case 'ascii': return text.split(/\s+/).map(n=>String.fromCharCode(+n)).join('');
        case 'rot13': return this.encodeWith(text,'rot13');
        default: return text;
      }
    } catch { return 'Error decoding'; }
  }

  encode() {}
  output(): string { return this.direction==='encode' ? this.encodeWith(this.inputText,this.mode()) : this.decodeWith(this.inputText,this.mode()); }
  copy() { navigator.clipboard.writeText(this.output()); }
  copy2(t: string) { navigator.clipboard.writeText(t); }
  async paste() { try { this.inputText = await navigator.clipboard.readText(); } catch {} }
  swap() { const o = this.output(); this.inputText = o; }
}

// ─── Text Diff Highlighter ────────────────────────────────────────────────────
@Component({
  selector: 'app-text-diff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="diff-controls">
        <div class="dc-group">
          <span class="dc-label">Compare by</span>
          <div class="compare-tabs">
            <button *ngFor="let m of diffModes" [class.active]="diffMode()===m.key" (click)="diffMode.set(m.key)">{{m.label}}</button>
          </div>
        </div>
        <div class="dc-stats" *ngIf="stats()">
          <span class="added-badge">+{{stats()!.added}} added</span>
          <span class="removed-badge">-{{stats()!.removed}} removed</span>
          <span class="same-badge">={{stats()!.same}} same</span>
        </div>
      </div>

      <div class="io-layout">
        <div class="io-col">
          <label class="lbl">Original</label>
          <textarea [(ngModel)]="text1" class="io-ta" rows="10" placeholder="Original text..."></textarea>
        </div>
        <div class="io-col">
          <label class="lbl">Modified</label>
          <textarea [(ngModel)]="text2" class="io-ta" rows="10" placeholder="Modified text..."></textarea>
        </div>
      </div>

      <button class="compare-btn" (click)="runDiff()">🔍 Compare Texts</button>

      <div class="diff-result" *ngIf="diffResult().length">
        <div class="dr-header">
          <div class="view-toggle">
            <button [class.active]="view()==='split'" (click)="view.set('split')">⊟ Split</button>
            <button [class.active]="view()==='unified'" (click)="view.set('unified')">≡ Unified</button>
          </div>
          <button class="copy-btn" (click)="copyDiff()">📋 Copy Diff</button>
        </div>

        <div class="split-view" *ngIf="view()==='split'">
          <div class="sv-col left">
            <div class="sv-label">Original</div>
            <div class="sv-content" [innerHTML]="splitLeft()"></div>
          </div>
          <div class="sv-col right">
            <div class="sv-label">Modified</div>
            <div class="sv-content" [innerHTML]="splitRight()"></div>
          </div>
        </div>

        <div class="unified-view" *ngIf="view()==='unified'">
          <div *ngFor="let line of diffResult()" class="uv-line" [class.added]="line.type==='added'" [class.removed]="line.type==='removed'">
            <span class="uv-sign">{{line.type==='added'?'+':line.type==='removed'?'-':' '}}</span>
            <span class="uv-text">{{line.text}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .diff-controls{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem 1rem;margin-bottom:1rem;gap:.5rem}
    .dc-group{display:flex;align-items:center;gap.5rem;gap:.5rem}
    .dc-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .compare-tabs{display:flex;gap.2rem;gap:.2rem}
    .compare-tabs button,.view-toggle button{padding:.3rem .65rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600}
    .compare-tabs button.active,.view-toggle button.active{background:#6366f1;border-color:#6366f1;color:white}
    .dc-stats{display:flex;gap.35rem;gap:.35rem;flex-wrap:wrap}
    .added-badge,.removed-badge,.same-badge{font-size:.72rem;font-weight:700;border-radius:99px;padding:.15rem .55rem}
    .added-badge{background:#dcfce7;color:#166534}
    .removed-badge{background:#fef2f2;color:#991b1b}
    .same-badge{background:#f3f4f6;color:#6b7280}
    .io-layout{display:grid;grid-template-columns:1fr 1fr;gap.85rem;margin-bottom:.65rem;gap:.85rem}
    @media(max-width:680px){.io-layout{grid-template-columns:1fr}}
    .lbl{display:block;font-size:.65rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom.2rem;margin-bottom:.2rem}
    .io-ta{width:100%;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.6}
    .compare-btn{background:#6366f1;color:white;border:none;border-radius:9px;padding:.5rem 1.5rem;cursor:pointer;font-weight:800;font-size:.88rem;margin-bottom:1rem}
    .diff-result{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
    .dr-header{display:flex;justify-content:space-between;align-items:center;padding:.55rem .85rem;background:white;border-bottom:1px solid #e5e7eb}
    .view-toggle{display:flex;gap.2rem;gap:.2rem}
    .copy-btn{background:#eff0ff;border:1px solid #c7d2fe;color:#6366f1;border-radius:6px;padding:.2rem .55rem;cursor:pointer;font-size:.72rem;font-weight:700}
    .split-view{display:grid;grid-template-columns:1fr 1fr}
    .sv-col{font-size:.82rem;font-family:monospace;line-height:1.6}
    .sv-col.left{border-right:1px solid #e5e7eb}
    .sv-label{padding:.3rem .75rem;font-size:.62rem;font-weight:700;text-transform:uppercase;color:#9ca3af;background:#f8fafc;border-bottom:1px solid #f3f4f6}
    .sv-content{padding:.4rem .75rem;overflow-x:auto;min-height:100px}
    :host ::ng-deep .del-text{background:#fef2f2;text-decoration:line-through;color:#991b1b;display:block}
    :host ::ng-deep .add-text{background:#ecfdf5;color:#166534;display:block}
    :host ::ng-deep .same-text{display:block;color:#374151}
    .unified-view{max-height:400px;overflow-y:auto;padding:.25rem}
    .uv-line{display:flex;gap.3rem;padding:.15rem .5rem;font-size:.82rem;font-family:monospace;line-height:1.5;gap:.3rem}
    .uv-line.added{background:#ecfdf5}
    .uv-line.removed{background:#fef2f2}
    .uv-sign{font-weight:800;min-width:12px;flex-shrink:0}
    .uv-line.added .uv-sign{color:#059669}
    .uv-line.removed .uv-sign{color:#dc2626}
    .uv-text{white-space:pre-wrap;word-break:break-word}
  `]
})
export class TextDiffHighlighterComponent {
  text1 = `The quick brown fox jumps over the lazy dog.
A stitch in time saves nine.
To be or not to be, that is the question.
All that glitters is not gold.`;

  text2 = `The quick brown fox leaps over the sleepy dog.
A stitch in time saves nine.
To be or not to be, that is the real question.
All that glitters is not gold.
New line added here.`;

  diffMode = signal<'lines'|'words'|'chars'>('lines');
  view = signal<'split'|'unified'>('unified');
  diffResult = signal<{type:'added'|'removed'|'same',text:string}[]>([]);
  stats = signal<{added:number,removed:number,same:number}|null>(null);

  diffModes : { key: 'lines' | 'words' | 'chars'; label: string }[] = [{key:'lines',label:'Lines'},{key:'words',label:'Words'},{key:'chars',label:'Chars'}];

  runDiff() {
    const split1 = this.splitBy(this.text1);
    const split2 = this.splitBy(this.text2);
    const result = this.lcs(split1, split2);
    const added = result.filter(r=>r.type==='added').length;
    const removed = result.filter(r=>r.type==='removed').length;
    const same = result.filter(r=>r.type==='same').length;
    this.diffResult.set(result);
    this.stats.set({added,removed,same});
  }

  splitBy(text: string): string[] {
    if (this.diffMode()==='lines') return text.split('\n');
    if (this.diffMode()==='words') return text.split(/(\s+)/);
    return text.split('');
  }

  lcs(a: string[], b: string[]): {type:'added'|'removed'|'same',text:string}[] {
    const result: {type:'added'|'removed'|'same',text:string}[] = [];
    let i=0, j=0;
    while (i<a.length || j<b.length) {
      if (i<a.length && j<b.length && a[i]===b[j]) { result.push({type:'same',text:a[i]}); i++; j++; }
      else if (j<b.length && (i>=a.length || b[j]!==a[i])) { result.push({type:'added',text:b[j]}); j++; }
      else { result.push({type:'removed',text:a[i]}); i++; }
    }
    return result;
  }

  splitLeft(): string {
    return this.diffResult().filter(l=>l.type!=='added').map(l=>
      `<span class="${l.type==='removed'?'del-text':'same-text'}">${this.esc(l.text)}</span>`
    ).join('');
  }

  splitRight(): string {
    return this.diffResult().filter(l=>l.type!=='removed').map(l=>
      `<span class="${l.type==='added'?'add-text':'same-text'}">${this.esc(l.text)}</span>`
    ).join('');
  }

  copyDiff(): void {
    const text = this.diffResult().map(l=>`${l.type==='added'?'+':l.type==='removed'?'-':' '} ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
  }

  esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}
