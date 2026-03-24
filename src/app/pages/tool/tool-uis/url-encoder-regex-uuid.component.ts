import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── URL Encoder/Decoder ─────────────────────────────────────────────────────
@Component({
  selector: 'app-url-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="setMode(m.key);convert()">{{m.label}}</button>
      </div>

      <div *ngIf="mode()==='encode' || mode()==='decode'" class="io-grid">
        <div class="io-box">
          <label class="io-label">{{mode()==='encode'?'Plain Text / URL':'Encoded URL'}}</label>
          <textarea [(ngModel)]="inputText" (ngModelChange)="convert()" class="io-ta" rows="7"
            [placeholder]="mode()==='encode'?'Enter URL or text to encode...':'Paste percent-encoded URL to decode...'"></textarea>
          <div class="options-row">
            <label class="chk"><input type="checkbox" [(ngModel)]="encodeComponent" (change)="convert()" /> encodeURIComponent (encode /, ?, &, =)</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="spaceAsPlus" (change)="convert()" /> Spaces as + (form encoding)</label>
          </div>
        </div>
        <div class="io-box">
          <div class="io-hdr">
            <label class="io-label">Output</label>
            <button class="copy-btn" (click)="copy(outputText)">📋 Copy</button>
          </div>
          <textarea class="io-ta output" [value]="outputText" readonly rows="7"></textarea>
          <div class="ta-stats">{{outputText.length}} chars</div>
        </div>
      </div>

      <div *ngIf="mode()==='parse'">
        <div class="field"><label class="io-label">Full URL to Parse</label>
          <input [(ngModel)]="parseUrl" (ngModelChange)="parseUrlFn()" class="inp mono" placeholder="https://user:pass@example.com:8080/path?foo=bar&baz=1#section" /></div>
        <div class="parse-grid" *ngIf="parsedParts().length">
          <div class="parse-item" *ngFor="let p of parsedParts()">
            <span class="pi-key">{{p.key}}</span>
            <span class="pi-val mono">{{p.value||'—'}}</span>
            <button class="copy-sm" *ngIf="p.value" (click)="copy(p.value)">📋</button>
          </div>
        </div>
        <div class="qp-section" *ngIf="queryParams().length">
          <div class="qp-title">Query Parameters ({{queryParams().length}})</div>
          <div class="qp-row" *ngFor="let q of queryParams()">
            <span class="qp-key">{{q.key}}</span><span class="eq">=</span><span class="qp-val">{{q.value}}</span>
            <button class="copy-sm" (click)="copy(q.value)">📋</button>
          </div>
        </div>
      </div>

      <div *ngIf="mode()==='build'">
        <div class="build-grid">
          <div class="field"><label class="io-label">Protocol</label>
            <select [(ngModel)]="bu.protocol" (ngModelChange)="buildUrlFn()" class="sel"><option>https://</option><option>http://</option><option>ftp://</option><option>mailto:</option></select></div>
          <div class="field"><label class="io-label">Host</label><input [(ngModel)]="bu.host" (ngModelChange)="buildUrlFn()" class="inp" placeholder="example.com" /></div>
          <div class="field"><label class="io-label">Port</label><input [(ngModel)]="bu.port" (ngModelChange)="buildUrlFn()" class="inp" placeholder="8080" /></div>
          <div class="field"><label class="io-label">Path</label><input [(ngModel)]="bu.path" (ngModelChange)="buildUrlFn()" class="inp mono" placeholder="/api/v1/users" /></div>
        </div>
        <div class="params-panel">
          <div class="pp-header">Query Parameters <button class="btn-add-param" (click)="bu.params.push({key:'',value:''})">+ Add</button></div>
          <div class="param-row" *ngFor="let p of bu.params; let i=index">
            <input [(ngModel)]="p.key" (ngModelChange)="buildUrlFn()" class="inp ph" placeholder="key" />
            <span class="eq">=</span>
            <input [(ngModel)]="p.value" (ngModelChange)="buildUrlFn()" class="inp ph" placeholder="value" />
            <button class="rm-btn" (click)="bu.params.splice(i,1);buildUrlFn()">✕</button>
          </div>
        </div>
        <div class="field"><label class="io-label">Fragment (#)</label><input [(ngModel)]="bu.fragment" (ngModelChange)="buildUrlFn()" class="inp" placeholder="section-id" /></div>
        <div class="built-result" *ngIf="builtUrl()">
          <div class="br-label">Built URL</div>
          <div class="br-val mono">{{builtUrl()}}</div>
          <button class="copy-btn" (click)="copy(builtUrl())">📋 Copy</button>
        </div>
      </div>

      <div class="ref-section">
        <div class="ref-title">Common URL-Encoded Characters</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of encRef"><span>{{r.c}}</span><span class="mono">{{r.e}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.3rem;background:#f3f4f6;border-radius:8px;padding:.3rem;margin-bottom:1rem;flex-wrap:wrap}
    .mode-tabs button{flex:1;min-width:70px;padding:.4rem;border:none;background:none;border-radius:6px;font-size:.8rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .io-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:.85rem}
    @media(max-width:680px){.io-grid{grid-template-columns:1fr}}
    .io-box{display:flex;flex-direction:column;gap:.3rem}
    .io-hdr{display:flex;justify-content:space-between;align-items:center}
    .io-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .io-ta{width:100%;padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .io-ta.output{background:#f8fafc}
    .options-row{display:flex;gap:1rem;flex-wrap:wrap;font-size:.78rem}
    .chk{display:flex;align-items:center;gap:.3rem;cursor:pointer}
    .ta-stats{font-size:.68rem;color:#9ca3af;text-align:right}
    .copy-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:6px;padding:.2rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700}
    .field{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.6rem}
    .inp,.sel{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;box-sizing:border-box;outline:none}
    .mono{font-family:monospace}
    .parse-grid{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:.75rem}
    .parse-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .85rem;border-bottom:1px solid #f3f4f6}
    .parse-item:last-child{border-bottom:none}
    .pi-key{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;min-width:90px;flex-shrink:0}
    .pi-val{flex:1;font-size:.82rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy-sm{background:none;border:none;cursor:pointer;font-size:.7rem;opacity:.6;flex-shrink:0}
    .qp-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:.75rem 1rem}
    .qp-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#1d4ed8;margin-bottom:.5rem}
    .qp-row{display:flex;align-items:center;gap:.4rem;font-size:.83rem;margin-bottom:.25rem}
    .qp-key{font-weight:700;color:#2563eb}.qp-val{color:#374151}
    .eq{color:#9ca3af;font-weight:700}
    .build-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.6rem;margin-bottom:.75rem}
    .params-panel{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .pp-header{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.5rem}
    .btn-add-param{background:#2563eb;color:white;border:none;border-radius:5px;padding:.2rem .6rem;cursor:pointer;font-size:.72rem}
    .param-row{display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem}
    .inp.ph{flex:1;width:auto}
    .rm-btn{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:5px;padding:.2rem .5rem;cursor:pointer;font-size:.72rem}
    .built-result{background:#1e293b;border-radius:10px;padding:.85rem 1rem}
    .br-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:.4rem}
    .br-val{font-size:.82rem;color:#a3e635;word-break:break-all;margin-bottom:.5rem}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-top:.85rem}
    .ref-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:.3rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.3rem .5rem;display:flex;justify-content:space-between;font-size:.78rem}
    .ref-item .mono{color:#2563eb}
  `]
})
export class UrlEncoderComponent {
  mode = signal<'encode'|'decode'|'parse'|'build'>('encode');
  inputText = 'https://example.com/search?q=hello world&lang=en#section 1';
  outputText = ''; encodeComponent = false; spaceAsPlus = false;
  parseUrl = 'https://user:pass@example.com:8080/path?foo=bar&baz=hello+world#section';
  parsedParts = signal<{key:string,value:string}[]>([]);
  queryParams = signal<{key:string,value:string}[]>([]);
  bu = {protocol:'https://',host:'example.com',port:'',path:'/api/search',params:[{key:'q',value:'hello world'},{key:'lang',value:'en'}],fragment:'results'};
  builtUrl = signal('');
  encRef = [{c:' ',e:'%20'},{c:'!',e:'%21'},{c:'"',e:'%22'},{c:'#',e:'%23'},{c:'$',e:'%24'},{c:'%',e:'%25'},{c:'&',e:'%26'},{c:"'",e:'%27'},{c:'(',e:'%28'},{c:')',e:'%29'},{c:'+',e:'%2B'},{c:',',e:'%2C'},{c:'/',e:'%2F'},{c:':',e:'%3A'},{c:';',e:'%3B'},{c:'=',e:'%3D'},{c:'?',e:'%3F'},{c:'@',e:'%40'},{c:'[',e:'%5B'},{c:']',e:'%5D'}];
  modes : { key: 'encode' | 'decode' | 'parse' | 'build'; label: string }[] = [{key:'encode',label:'🔒 Encode'},{key:'decode',label:'🔓 Decode'},{key:'parse',label:'🔍 Parse URL'},{key:'build',label:'🔨 Build URL'}];

  constructor() { this.convert(); this.parseUrlFn(); this.buildUrlFn(); }
setMode(m: 'encode' | 'decode' | 'parse' | 'build') {
  this.mode.set(m);
  this.convert();
}
  convert() {
    if (!this.inputText) { this.outputText = ''; return; }
    try {
      if (this.mode() === 'encode') {
        let r = this.encodeComponent ? encodeURIComponent(this.inputText) : this.inputText.replace(/[^a-zA-Z0-9\-_.~:/?#[\]@!$&'()*+,;=%]/g, c => encodeURIComponent(c));
        if (this.spaceAsPlus) r = r.replace(/%20/g, '+');
        this.outputText = r;
      } else {
        let t = this.spaceAsPlus ? this.inputText.replace(/\+/g,'%20') : this.inputText;
        this.outputText = decodeURIComponent(t);
      }
    } catch { this.outputText = 'Error: invalid input'; }
  }

  parseUrlFn() {
    try {
      const u = new URL(this.parseUrl);
      this.parsedParts.set([{key:'Protocol',value:u.protocol},{key:'Username',value:u.username},{key:'Password',value:u.password},{key:'Hostname',value:u.hostname},{key:'Port',value:u.port},{key:'Pathname',value:u.pathname},{key:'Search',value:u.search},{key:'Hash',value:u.hash},{key:'Origin',value:u.origin}]);
      const qp: any[] = []; u.searchParams.forEach((v,k) => qp.push({key:k,value:v}));
      this.queryParams.set(qp);
    } catch { this.parsedParts.set([{key:'Error',value:'Invalid URL format'}]); this.queryParams.set([]); }
  }

  buildUrlFn() {
    if (!this.bu.host) { this.builtUrl.set(''); return; }
    let url = this.bu.protocol + this.bu.host;
    if (this.bu.port) url += ':' + this.bu.port;
    url += this.bu.path || '/';
    const valid = this.bu.params.filter(p => p.key);
    if (valid.length) url += '?' + valid.map(p => encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value)).join('&');
    if (this.bu.fragment) url += '#' + this.bu.fragment;
    this.builtUrl.set(url);
  }

  copy(v: string) { if (v) navigator.clipboard.writeText(v); }
}

// ─── Regex Tester ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="regex-input-row">
        <span class="re-slash">/</span>
        <input [(ngModel)]="pattern" (ngModelChange)="test()" class="re-inp" placeholder="[a-z]+" />
        <span class="re-slash">/</span>
        <div class="flags-group">
          <button *ngFor="let f of allFlags" [class.active]="flags.includes(f)" (click)="toggleFlag(f)" class="flag-btn" [title]="flagDesc(f)">{{f}}</button>
        </div>
      </div>

      <div class="test-section">
        <div class="ts-header">
          <label class="ts-label">Test String</label>
          <div class="ts-meta" *ngIf="matches().length">
            <span class="match-count">{{matches().length}} match{{matches().length===1?'':'es'}}</span>
          </div>
        </div>
        <div class="highlighted-area" [innerHTML]="highlightedText()"></div>
        <textarea [(ngModel)]="testStr" (ngModelChange)="test()" class="ts-ta" rows="5" placeholder="Enter your test string here..."></textarea>
      </div>

      <div class="error-box" *ngIf="regexError()">⚠️ {{regexError()}}</div>

      <!-- Matches table -->
      <div class="matches-section" *ngIf="matches().length">
        <div class="ms-title">Matches ({{matches().length}})</div>
        <div class="matches-table">
          <div class="mt-header"><span>#</span><span>Match</span><span>Index</span><span>Groups</span></div>
          <div class="mt-row" *ngFor="let m of matches(); let i=index">
            <span class="m-num">{{i+1}}</span>
            <span class="m-val mono">{{m.value}}</span>
            <span class="m-idx">{{m.index}}–{{m.index+m.value.length}}</span>
            <span class="m-groups mono">{{m.groups.length?m.groups.join(', '):'—'}}</span>
          </div>
        </div>
      </div>

      <!-- Common patterns -->
      <div class="patterns-section">
        <div class="ps-title">Common Patterns</div>
        <div class="pattern-grid">
          <div class="pattern-item" *ngFor="let p of commonPatterns" (click)="loadPattern(p)">
            <span class="pat-name">{{p.name}}</span>
            <span class="pat-re mono">/{{p.pattern}}/{{p.flags}}</span>
          </div>
        </div>
      </div>

      <!-- Flag reference -->
      <div class="flag-ref">
        <div class="fr-title">Flag Reference</div>
        <div class="fr-grid">
          <div class="fr-item" *ngFor="let f of flagDefs"><span class="fi-flag">{{f.flag}}</span><span class="fi-name">{{f.name}}</span><span class="fi-desc">{{f.desc}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .regex-input-row{display:flex;align-items:center;gap:.3rem;background:#1e293b;border-radius:10px;padding:.65rem 1rem;margin-bottom:1rem}
    .re-slash{color:#a3e635;font-size:1.3rem;font-weight:700;font-family:monospace}
    .re-inp{flex:1;background:transparent;border:none;outline:none;color:#e2e8f0;font-size:1rem;font-family:monospace;caret-color:#a3e635}
    .flags-group{display:flex;gap:.2rem}
    .flag-btn{padding:.2rem .45rem;border:1px solid #475569;border-radius:4px;background:transparent;color:#94a3b8;cursor:pointer;font-family:monospace;font-weight:700;font-size:.78rem}
    .flag-btn.active{background:#a3e635;border-color:#a3e635;color:#0f172a}
    .test-section{margin-bottom:1rem}
    .ts-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem}
    .ts-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .match-count{background:#eff6ff;color:#2563eb;border-radius:99px;padding:.15rem .6rem;font-size:.72rem;font-weight:700}
    .highlighted-area{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:.55rem .85rem;font-family:monospace;font-size:.85rem;min-height:30px;line-height:1.6;margin-bottom:.4rem;white-space:pre-wrap;word-break:break-all}
    :host ::ng-deep .hl{background:#fbbf24;border-radius:2px;padding:0 1px}
    :host ::ng-deep .hl-group{background:#93c5fd;border-radius:2px;padding:0 1px}
    .ts-ta{width:100%;padding:.55rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.85rem;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.55rem .85rem;color:#dc2626;font-size:.82rem;margin-bottom:1rem}
    .matches-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .ms-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .matches-table{overflow-x:auto}
    .mt-header,.mt-row{display:grid;grid-template-columns:30px 1fr 80px 1fr;gap:.5rem;padding:.35rem .5rem;font-size:.78rem}
    .mt-header{background:#e5e7eb;border-radius:5px;font-weight:700;color:#6b7280;text-transform:uppercase;font-size:.65rem}
    .mt-row{border-bottom:1px solid #f3f4f6;align-items:center}
    .mt-row:last-child{border-bottom:none}
    .m-num{color:#9ca3af}.m-val{font-weight:600}.m-idx{color:#6b7280}.mono{font-family:monospace}
    .patterns-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .pattern-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.4rem}
    .pattern-item{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.5rem .75rem;cursor:pointer;transition:all .15s}
    .pattern-item:hover{border-color:#2563eb}
    .pat-name{display:block;font-size:.78rem;font-weight:700;color:#111827;margin-bottom:.15rem}
    .pat-re{font-size:.68rem;color:#6b7280;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .flag-ref{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem}
    .fr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .fr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.4rem}
    .fr-item{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.4rem .7rem;display:flex;align-items:center;gap:.5rem}
    .fi-flag{font-family:monospace;font-weight:800;color:#2563eb;min-width:16px}
    .fi-name{font-size:.72rem;font-weight:700;color:#374151;min-width:60px}
    .fi-desc{font-size:.68rem;color:#6b7280;flex:1}
  `]
})
export class RegexTesterComponent {
  pattern = '[A-Z][a-z]+'; flags = 'g'; testStr = 'Hello World from Mumbai! Testing 123 Regular Expressions.';
  allFlags = ['g','i','m','s','u','y'];
  matches = signal<{value:string,index:number,groups:string[]}[]>([]);
  regexError = signal(''); highlightedText = signal('');

  commonPatterns = [
    {name:'Email',pattern:'^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$',flags:'i'},
    {name:'Indian Phone',pattern:'[6-9]\\d{9}',flags:'g'},
    {name:'URL',pattern:'https?:\\/\\/[\\w-]+(?:\\.[\\w-]+)+',flags:'gi'},
    {name:'IPv4',pattern:'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',flags:'g'},
    {name:'Date DD/MM/YYYY',pattern:'\\d{2}\\/\\d{2}\\/\\d{4}',flags:'g'},
    {name:'Hex Color',pattern:'#[0-9a-fA-F]{3,6}\\b',flags:'g'},
    {name:'Number',pattern:'-?\\d+(?:\\.\\d+)?',flags:'g'},
    {name:'Whitespace',pattern:'\\s+',flags:'g'},
    {name:'HTML Tags',pattern:'<[^>]+>',flags:'g'},
    {name:'Word boundary',pattern:'\\bword\\b',flags:'gi'},
    {name:'Duplicate words',pattern:'\\b(\\w+)\\s+\\1\\b',flags:'gi'},
    {name:'PAN (India)',pattern:'[A-Z]{5}[0-9]{4}[A-Z]',flags:'g'},
  ];

  flagDefs = [{flag:'g',name:'global',desc:'Find all matches'},{flag:'i',name:'ignore case',desc:'Case-insensitive'},{flag:'m',name:'multiline',desc:'^ and $ match line starts/ends'},{flag:'s',name:'dotAll',desc:'. matches newlines too'},{flag:'u',name:'unicode',desc:'Unicode mode'},{flag:'y',name:'sticky',desc:'Match from lastIndex only'}];

  constructor() { this.test(); }

  toggleFlag(f: string) { this.flags = this.flags.includes(f) ? this.flags.replace(f,'') : this.flags + f; this.test(); }

  flagDesc(f: string) { return this.flagDefs.find(x=>x.flag===f)?.name || ''; }

  test() {
    this.regexError.set('');
    if (!this.pattern) { this.matches.set([]); this.highlightedText.set(this.escHtml(this.testStr)); return; }
    try {
      const re = new RegExp(this.pattern, this.flags.includes('g') ? this.flags : this.flags+'g');
      const ms: any[] = [];
      let m;
      const re2 = new RegExp(this.pattern, this.flags.includes('g') ? this.flags : this.flags+'g');
      while ((m = re2.exec(this.testStr)) !== null) {
        ms.push({value:m[0],index:m.index,groups:m.slice(1).filter(g=>g!==undefined)});
        if (!this.flags.includes('g')) break;
      }
      this.matches.set(ms);
      this.buildHighlight(ms);
    } catch (e: any) { this.regexError.set(e.message); this.matches.set([]); this.highlightedText.set(this.escHtml(this.testStr)); }
  }

  buildHighlight(ms: any[]) {
    if (!ms.length) { this.highlightedText.set(this.escHtml(this.testStr)); return; }
    let result = ''; let last = 0;
    const sorted = [...ms].sort((a,b) => a.index - b.index);
    for (const m of sorted) {
      result += this.escHtml(this.testStr.slice(last, m.index));
      result += `<mark class="hl">${this.escHtml(m.value)}</mark>`;
      last = m.index + m.value.length;
    }
    result += this.escHtml(this.testStr.slice(last));
    this.highlightedText.set(result);
  }

  loadPattern(p: any) { this.pattern = p.pattern; this.flags = p.flags; this.test(); }
  escHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}

// ─── UUID Generator ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-uuid-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="generator-panel">
        <div class="gp-header">
          <div class="type-select">
            <label class="gp-label">UUID Version</label>
            <div class="type-tabs">
              <button *ngFor="let t of uuidTypes" [class.active]="uuidType()===t.key" (click)="uuidType.set(t.key)">{{t.label}}</button>
            </div>
          </div>
          <div class="count-select">
            <label class="gp-label">Count</label>
            <input type="number" [(ngModel)]="count" min="1" max="100" class="count-inp" />
          </div>
          <div class="format-select" *ngIf="uuidType()==='v5'">
            <label class="gp-label">Namespace</label>
            <select [(ngModel)]="v5namespace" class="sel-sm">
              <option value="dns">DNS</option><option value="url">URL</option><option value="oid">OID</option>
            </select>
            <input [(ngModel)]="v5name" class="ns-inp" placeholder="Name (e.g. example.com)" />
          </div>
        </div>
        <div class="gen-actions">
          <button class="btn-generate" (click)="generate()">⚡ Generate {{count > 1 ? count+' UUIDs' : 'UUID'}}</button>
          <button class="btn-secondary" (click)="copyAll()">📋 Copy All</button>
          <button class="btn-secondary" (click)="download()">⬇ Download</button>
          <button class="btn-secondary warn" (click)="uuids.set([])">🗑 Clear</button>
          <div class="format-toggles">
            <label class="chk"><input type="checkbox" [(ngModel)]="uppercase" (change)="applyFormat()" /> Uppercase</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="noDashes" (change)="applyFormat()" /> No dashes</label>
            <label class="chk"><input type="checkbox" [(ngModel)]="braces" (change)="applyFormat()" /> Braces</label>
          </div>
        </div>
      </div>

      <div class="uuid-list" *ngIf="uuids().length">
        <div class="uuid-item" *ngFor="let u of uuids(); let i=index">
          <span class="ui-num">{{i+1}}</span>
          <span class="ui-val mono">{{u}}</span>
          <button class="ui-copy" (click)="copySingle(u)">📋</button>
        </div>
      </div>

      <!-- Validator -->
      <div class="validator-section">
        <div class="vs-title">🔍 UUID Validator</div>
        <div class="vs-row">
          <input [(ngModel)]="validateInput" (ngModelChange)="validate()" class="validate-inp mono" placeholder="Paste a UUID to validate..." />
          <div class="vs-result" *ngIf="validateInput">
            <span class="vr-badge" [class.valid]="isValid()" [class.invalid]="!isValid()">{{isValid()?'✅ Valid':'❌ Invalid'}}</span>
            <span class="vr-version" *ngIf="isValid()">{{detectedVersion()}}</span>
          </div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-cards">
        <div class="info-card" *ngFor="let ic of infoCards">
          <div class="ic-title">{{ic.title}}</div>
          <div class="ic-desc">{{ic.desc}}</div>
          <div class="ic-example mono">{{ic.example}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .generator-panel{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1rem}
    .gp-header{display:flex;gap:1.25rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:.85rem}
    .type-select,.count-select,.format-select{display:flex;flex-direction:column;gap:.3rem}
    .gp-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .type-tabs{display:flex;background:#e5e7eb;border-radius:6px;overflow:hidden}
    .type-tabs button{padding:.3rem .7rem;border:none;background:none;cursor:pointer;font-size:.78rem;font-weight:600;color:#6b7280}
    .type-tabs button.active{background:#2563eb;color:white}
    .count-inp{width:70px;padding:.35rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.88rem;outline:none}
    .sel-sm{padding:.3rem .5rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem}
    .ns-inp{padding:.35rem .65rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem;min-width:180px;outline:none}
    .gen-actions{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
    .btn-generate{background:#2563eb;color:white;border:none;padding:.45rem 1.25rem;border-radius:8px;font-weight:700;cursor:pointer;font-size:.85rem}
    .btn-secondary{background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .85rem;cursor:pointer;font-size:.78rem;font-weight:600}
    .btn-secondary.warn{color:#dc2626;border-color:#fecaca}
    .format-toggles{display:flex;gap:.75rem;margin-left:.5rem;flex-wrap:wrap}
    .chk{display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer}
    .uuid-list{background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:1rem;max-height:320px;overflow-y:auto}
    .uuid-item{display:flex;align-items:center;gap:.75rem;padding:.5rem .85rem;border-bottom:1px solid rgba(255,255,255,.05)}
    .uuid-item:last-child{border-bottom:none}
    .ui-num{font-size:.68rem;color:#64748b;min-width:24px;text-align:right;flex-shrink:0}
    .ui-val{flex:1;font-size:.82rem;color:#a3e635;letter-spacing:.03em}
    .ui-copy{background:rgba(255,255,255,.1);border:none;border-radius:5px;padding:.2rem .45rem;cursor:pointer;font-size:.72rem;color:white}
    .mono{font-family:monospace}
    .validator-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .vs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .vs-row{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
    .validate-inp{flex:1;padding:.45rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.85rem;outline:none;min-width:0}
    .vs-result{display:flex;align-items:center;gap:.5rem}
    .vr-badge{padding:.25rem .7rem;border-radius:99px;font-size:.75rem;font-weight:700}
    .vr-badge.valid{background:#ecfdf5;color:#059669}
    .vr-badge.invalid{background:#fef2f2;color:#dc2626}
    .vr-version{font-size:.75rem;color:#6b7280;font-weight:600}
    .info-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.65rem}
    .info-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem .85rem}
    .ic-title{font-size:.78rem;font-weight:700;color:#111827;margin-bottom:.2rem}
    .ic-desc{font-size:.72rem;color:#6b7280;margin-bottom:.3rem;line-height:1.35}
    .ic-example{font-size:.68rem;color:#9ca3af}
  `]
})
export class UuidGeneratorComponent {
  uuidType = signal<'v4'|'v1'|'v5'|'ulid'>('v4');
  count = 5; uppercase = false; noDashes = false; braces = false;
  v5namespace = 'dns'; v5name = 'example.com';
  uuids = signal<string[]>([]); validateInput = '';

  uuidTypes : { key: 'v4' | 'v1' | 'v5' | 'ulid'; label: string }[] = [{key:'v4',label:'v4 (Random)'},{key:'v1',label:'v1 (Time)'},{key:'v5',label:'v5 (Name)'},{key:'ulid',label:'ULID'}];

  infoCards = [
    {title:'UUID v4 (Random)',desc:'128-bit cryptographically random. Most common for database IDs, API keys.',example:'550e8400-e29b-41d4-a716-446655440000'},
    {title:'UUID v1 (Time-based)',desc:'Includes timestamp + MAC address. Sortable but may reveal system info.',example:'6ba7b810-9dad-11d1-80b4-00c04fd430c8'},
    {title:'UUID v5 (Name-based)',desc:'SHA-1 hash of namespace + name. Same inputs always give same UUID.',example:'886313e1-3b8a-5372-9b90-0c9aee199e5d'},
    {title:'ULID (Sortable)',desc:'26-char lexicographically sortable. Encodes timestamp for natural ordering.',example:'01ARZ3NDEKTSV4RRFFQ69G5FAV'},
  ];

  constructor() { this.generate(); }

  generate() {
    const raw: string[] = [];
    for (let i = 0; i < Math.min(this.count, 100); i++) {
      if (this.uuidType() === 'v4') raw.push(this.v4());
      else if (this.uuidType() === 'v1') raw.push(this.v1());
      else if (this.uuidType() === 'v5') raw.push(this.v5Sync(this.v5name));
      else raw.push(this.ulid());
    }
    this.uuids.set(raw.map(u => this.applyFormatTo(u)));
  }

  v4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  v1(): string {
    const now = Date.now();
    const epochOffset = 122192928000000000n;
    const ts = BigInt(now) * 10000n + epochOffset;
    const tLow = (ts & 0xFFFFFFFFn).toString(16).padStart(8,'0');
    const tMid = ((ts >> 32n) & 0xFFFFn).toString(16).padStart(4,'0');
    const tHi = ((ts >> 48n) & 0x0FFFn | 0x1000n).toString(16).padStart(4,'0');
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2,'0'));
    rand[0] = ((parseInt(rand[0],16) & 0x3f) | 0x80).toString(16).padStart(2,'0');
    return `${tLow}-${tMid}-${tHi}-${rand.slice(0,2).join('')}-${rand.slice(2).join('')}`;
  }

  v5Sync(name: string): string {
    // Simplified deterministic v5-like using hash of namespace+name
    const nsMap: Record<string,string> = {dns:'6ba7b810-9dad-11d1-80b4-00c04fd430c8',url:'6ba7b811-9dad-11d1-80b4-00c04fd430c8',oid:'6ba7b812-9dad-11d1-80b4-00c04fd430c8'};
    const input = (nsMap[this.v5namespace]||nsMap['dns']) + name;
    let h = 0;
    for (let i = 0; i < input.length; i++) { h = Math.imul(31, h) + input.charCodeAt(i) | 0; }
    const abs = Math.abs(h);
    const hex = abs.toString(16).padStart(8,'0').repeat(4).slice(0,32);
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-${((parseInt(hex.slice(16,18),16)&0x3f)|0x80).toString(16)}${hex.slice(18,20)}-${hex.slice(20,32)}`;
  }

  ulid(): string {
    const t = Date.now();
    const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let ts = '';
    let n = t;
    for (let i = 9; i >= 0; i--) { ts = chars[n % 32] + ts; n = Math.floor(n / 32); }
    let rand = '';
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    for (const b of bytes) rand += chars[b % 32];
    return ts + rand;
  }

  applyFormat() { this.uuids.set(this.uuids().map(u => this.applyFormatTo(u))); }

  applyFormatTo(u: string): string {
    if (this.noDashes && !u.match(/^[0-9A-Z]{26}$/)) u = u.replace(/-/g,'');
    if (this.uppercase) u = u.toUpperCase();
    else u = u.toLowerCase();
    if (this.braces) u = `{${u}}`;
    return u;
  }

  validate() {}
  isValid() {
    const u = this.validateInput.replace(/[{}]/g,'').trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(u) || /^[0-9A-Z]{26}$/.test(u);
  }
  detectedVersion() {
    const u = this.validateInput.replace(/[{}]/g,'').trim();
    if (/^[0-9A-Z]{26}$/.test(u)) return 'ULID';
    const m = u.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])/i);
    return m ? `UUID version ${m[1]}` : '';
  }

  copySingle(u: string) { navigator.clipboard.writeText(u); }
  copyAll() { navigator.clipboard.writeText(this.uuids().join('\n')); }
  download() {
    const b = new Blob([this.uuids().join('\n')], {type:'text/plain'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'uuids.txt'; a.click();
  }
}
