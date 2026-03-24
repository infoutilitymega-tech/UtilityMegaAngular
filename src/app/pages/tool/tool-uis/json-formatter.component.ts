import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="toolbar">
        <div class="tb-left">
          <button class="btn-action" (click)="format()">✨ Format</button>
          <button class="btn-action" (click)="minify()">⚡ Minify</button>
          <button class="btn-action warn" (click)="clear()">🗑 Clear</button>
          <div class="indent-group">
            <span class="tb-label">Indent:</span>
            <button *ngFor="let n of [2,4]" class="btn-indent" [class.active]="indent===n" (click)="indent=n;format()">{{n}}</button>
            <button class="btn-indent" [class.active]="indent===0" (click)="indent=0;format()">Tab</button>
          </div>
        </div>
        <div class="tb-right">
          <button class="btn-action secondary" (click)="copy(outputText)">📋 Copy</button>
          <button class="btn-action secondary" (click)="download()">⬇ Download</button>
          <span class="status-badge" [class.ok]="status()==='valid'" [class.err]="status()==='error'" [class.empty]="status()==='empty'">
            {{status()==='valid'?'✅ Valid JSON':status()==='error'?'❌ Invalid':'— Empty'}}
          </span>
        </div>
      </div>

      <div class="editor-layout">
        <div class="editor-panel">
          <div class="panel-label">Input JSON</div>
          <textarea [(ngModel)]="inputText" (ngModelChange)="onInput()" class="editor-ta" placeholder='Paste JSON here...&#10;&#10;{"name":"John","age":30,"city":"Mumbai"}'></textarea>
          <div class="panel-stats">{{inputText.length}} chars</div>
        </div>
        <div class="editor-panel">
          <div class="panel-label">Output</div>
          <pre class="editor-output" [class.error-output]="status()==='error'">{{outputText || '// formatted output appears here'}}</pre>
          <div class="panel-stats">{{outputText.length}} chars · {{lineCount()}} lines</div>
        </div>
      </div>

      <div class="error-box" *ngIf="errorMsg()">
        <span class="err-icon">⚠️</span> {{errorMsg()}}
      </div>

      <!-- Tree View -->
      <div class="tree-section" *ngIf="parsedData() && status()==='valid'">
        <div class="ts-header">
          <span class="ts-title">🌳 Tree View</span>
          <button class="btn-sm" (click)="treeExpanded=!treeExpanded">{{treeExpanded?'Collapse All':'Expand All'}}</button>
        </div>
        <div class="json-tree">
          <ng-container *ngTemplateOutlet="treeNode; context:{data: parsedData(), key: null, depth: 0}"></ng-container>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row" *ngIf="status()==='valid'">
        <div class="stat-card" *ngFor="let s of jsonStats()">
          <div class="sc-val">{{s.val}}</div>
          <div class="sc-label">{{s.label}}</div>
        </div>
      </div>

      <!-- Samples -->
      <div class="samples-section">
        <div class="samples-title">Try Sample JSON:</div>
        <div class="sample-btns">
          <button *ngFor="let s of samples" class="btn-sample" (click)="loadSample(s)">{{s.name}}</button>
        </div>
      </div>
    </div>

    <ng-template #treeNode let-data="data" let-key="key" let-depth="depth">
      <div class="tree-node" [style.margin-left.px]="depth*16">
        <ng-container *ngIf="isObject(data)">
          <div class="tn-row object-row">
            <span class="tn-key" *ngIf="key!==null">"{{key}}": </span>
            <span class="tn-brace">{{isArray(data)?'[':'{'}} <span class="tn-count">{{objectKeys(data).length}} {{isArray(data)?'items':'keys'}}</span></span>
          </div>
          <ng-container *ngIf="treeExpanded">
            <ng-container *ngFor="let k of objectKeys(data)">
              <ng-container *ngTemplateOutlet="treeNode; context:{data: data[k], key: k, depth: depth+1}"></ng-container>
            </ng-container>
          </ng-container>
          <div class="tn-close" [style.margin-left.px]="depth*16">{{isArray(data)?']':'}'}}</div>
        </ng-container>
        <ng-container *ngIf="!isObject(data)">
          <div class="tn-row leaf-row">
            <span class="tn-key" *ngIf="key!==null">"{{key}}": </span>
            <span class="tn-val" [class]="getType(data)">{{formatVal(data)}}</span>
          </div>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem 1rem;margin-bottom:1rem}
    .tb-left,.tb-right{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .btn-action{padding:.35rem .85rem;border:none;border-radius:6px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:.8rem}
    .btn-action.warn{background:#dc2626}
    .btn-action.secondary{background:#f3f4f6;border:1px solid #e5e7eb;color:#374151}
    .indent-group{display:flex;align-items:center;gap:.25rem;margin-left:.5rem}
    .tb-label{font-size:.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .btn-indent{padding:.25rem .55rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.78rem;font-weight:600}
    .btn-indent.active{background:#2563eb;border-color:#2563eb;color:white}
    .status-badge{font-size:.72rem;font-weight:700;padding:.25rem .7rem;border-radius:99px;background:#f3f4f6;color:#6b7280}
    .status-badge.ok{background:#ecfdf5;color:#059669}
    .status-badge.err{background:#fef2f2;color:#dc2626}
    .editor-layout{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
    @media(max-width:700px){.editor-layout{grid-template-columns:1fr}}
    .editor-panel{display:flex;flex-direction:column;gap:.3rem}
    .panel-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .editor-ta{width:100%;height:280px;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .editor-output{width:100%;height:280px;padding:.65rem .85rem;border:1px solid #e5e7eb;border-radius:8px;font-size:.82rem;font-family:monospace;background:#1e293b;color:#a3e635;overflow:auto;margin:0;white-space:pre;line-height:1.5;box-sizing:border-box}
    .editor-output.error-output{color:#f87171}
    .panel-stats{font-size:.68rem;color:#9ca3af;text-align:right}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.65rem 1rem;font-size:.82rem;color:#dc2626;margin-bottom:1rem;display:flex;align-items:flex-start;gap:.5rem}
    .tree-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .ts-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.65rem}
    .ts-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151}
    .btn-sm{background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:6px;padding:.2rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700}
    .json-tree{max-height:260px;overflow:auto;font-family:monospace;font-size:.78rem}
    .tn-row{padding:.1rem 0;display:flex;align-items:baseline;gap:.2rem}
    .tn-key{color:#60a5fa;font-weight:600}
    .tn-brace{color:#e2e8f0}
    .tn-count{font-size:.68rem;color:#64748b;font-family:sans-serif}
    .tn-close{color:#e2e8f0;padding:.1rem 0}
    .tn-val.string{color:#4ade80}
    .tn-val.number{color:#fb923c}
    .tn-val.boolean{color:#a78bfa}
    .tn-val.null{color:#9ca3af;font-style:italic}
    .stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.6rem;margin-bottom:1rem}
    .stat-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .85rem;text-align:center}
    .sc-val{font-size:1.35rem;font-weight:800;color:#111827}
    .sc-label{font-size:.65rem;text-transform:uppercase;color:#9ca3af;font-weight:700}
    .samples-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem}
    .samples-title{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.5rem}
    .sample-btns{display:flex;gap:.4rem;flex-wrap:wrap}
    .btn-sample{padding:.3rem .75rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;transition:all .15s}
    .btn-sample:hover{border-color:#2563eb;color:#2563eb}
  `]
})
export class JsonFormatterComponent implements OnInit {
  inputText = ''; outputText = ''; indent = 2; treeExpanded = true;
  status = signal<'empty'|'valid'|'error'>('empty');
  errorMsg = signal(''); parsedData = signal<any>(null);

  samples = [
    {name:'Person', json:'{"name":"Priya Sharma","age":28,"city":"Mumbai","skills":["Angular","TypeScript","Node.js"],"address":{"street":"MG Road","pin":"400001"}}'},
    {name:'Array', json:'[{"id":1,"product":"Laptop","price":75000,"inStock":true},{"id":2,"product":"Mouse","price":850,"inStock":false},{"id":3,"product":"Keyboard","price":2500,"inStock":true}]'},
    {name:'Nested', json:'{"company":"TechCorp","employees":{"total":150,"departments":{"engineering":60,"sales":40,"hr":20,"finance":30}},"founded":2010,"public":false}'},
    {name:'Config', json:'{"server":{"host":"localhost","port":3000,"debug":true},"database":{"url":"mongodb://localhost:27017","name":"myapp","pool":10},"jwt":{"secret":"abc123","expiresIn":"7d"}}'},
    {name:'Invalid', json:'{"name":"test", age: 30, "city":"Mumbai"}'},
  ];

  ngOnInit() { this.loadSample(this.samples[0]); }

  onInput() {
    if (!this.inputText.trim()) { this.status.set('empty'); this.outputText = ''; this.errorMsg.set(''); this.parsedData.set(null); return; }
    this.format();
  }

  format() {
    if (!this.inputText.trim()) return;
    try {
      const parsed = JSON.parse(this.inputText);
      const indentVal = this.indent === 0 ? '\t' : this.indent;
      this.outputText = JSON.stringify(parsed, null, indentVal);
      this.status.set('valid'); this.errorMsg.set(''); this.parsedData.set(parsed);
    } catch (e: any) {
      this.status.set('error');
      this.errorMsg.set(e.message);
      this.outputText = this.inputText;
      this.parsedData.set(null);
    }
  }

  minify() {
    try {
      const parsed = JSON.parse(this.inputText);
      this.outputText = JSON.stringify(parsed);
      this.status.set('valid'); this.errorMsg.set(''); this.parsedData.set(parsed);
    } catch (e: any) { this.status.set('error'); this.errorMsg.set(e.message); }
  }

  clear() { this.inputText = ''; this.outputText = ''; this.status.set('empty'); this.errorMsg.set(''); this.parsedData.set(null); }

  lineCount() { return this.outputText ? this.outputText.split('\n').length : 0; }

  jsonStats() {
    const d = this.parsedData();
    if (!d) return [];
    const count = (o: any): {keys:number,strings:number,numbers:number,booleans:number,nulls:number,arrays:number,objects:number} => {
      let r = {keys:0,strings:0,numbers:0,booleans:0,nulls:0,arrays:0,objects:0};
      const walk = (v: any) => {
        if (Array.isArray(v)) { r.arrays++; v.forEach(walk); }
        else if (v === null) r.nulls++;
        else if (typeof v === 'object') { r.objects++; Object.keys(v).forEach(k => { r.keys++; walk(v[k]); }); }
        else if (typeof v === 'string') r.strings++;
        else if (typeof v === 'number') r.numbers++;
        else if (typeof v === 'boolean') r.booleans++;
      };
      walk(o); return r;
    };
    const s = count(d);
    return [
      {val:s.keys,label:'Keys'},{val:s.strings,label:'Strings'},{val:s.numbers,label:'Numbers'},
      {val:s.booleans,label:'Booleans'},{val:s.arrays,label:'Arrays'},{val:s.objects,label:'Objects'},
      {val:s.nulls,label:'Nulls'},{val:this.outputText.length,label:'Bytes'},
    ];
  }

  loadSample(s: any) { this.inputText = s.json; this.format(); }
  copy(t: string) { navigator.clipboard.writeText(t); }
  download() {
    const b = new Blob([this.outputText], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'formatted.json'; a.click();
  }
  isObject(v: any) { return v !== null && typeof v === 'object'; }
  isArray(v: any) { return Array.isArray(v); }
  objectKeys(v: any) { return Object.keys(v); }
  getType(v: any) { if (v === null) return 'null'; return typeof v; }
  formatVal(v: any) {
    if (v === null) return 'null';
    if (typeof v === 'string') return `"${v}"`;
    return String(v);
  }
}
