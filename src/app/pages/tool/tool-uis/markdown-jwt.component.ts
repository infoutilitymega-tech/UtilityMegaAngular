import { Component, signal, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Markdown Editor ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="toolbar">
        <div class="tb-left">
          <div class="tool-btns">
            <button *ngFor="let b of toolbarBtns" class="tb-btn" [title]="b.title" (click)="insertMarkdown(b)">{{b.icon}}</button>
          </div>
        </div>
        <div class="tb-right">
          <label class="chk"><input type="checkbox" [(ngModel)]="autoScroll" /> Auto-scroll</label>
          <button class="btn-action" (click)="copyHtml()">📋 Copy HTML</button>
          <button class="btn-action secondary" (click)="downloadMd()">⬇ .md</button>
          <button class="btn-action secondary" (click)="downloadHtml()">⬇ .html</button>
          <button class="btn-action secondary" (click)="clearAll()">🗑</button>
        </div>
      </div>

      <div class="stats-bar">
        <span>{{wordCount()}} words</span>
        <span>{{charCount()}} chars</span>
        <span>~{{readTime()}} min read</span>
        <span>{{lineCount()}} lines</span>
      </div>

      <div class="editor-layout">
        <div class="editor-pane">
          <div class="pane-header">📝 Markdown</div>
          <textarea #mdEditor [(ngModel)]="markdown" (ngModelChange)="render()" (scroll)="syncScroll($event)" class="md-ta" rows="20" [placeholder]="placeholder"></textarea>
        </div>
        <div class="preview-pane">
          <div class="pane-header">👁 Preview</div>
          <div #preview class="md-preview" [innerHTML]="rendered()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.6rem 1rem;margin-bottom:.5rem}
    .tb-left,.tb-right{display:flex;align-items:center;gap:.3rem;flex-wrap:wrap}
    .tool-btns{display:flex;gap:.2rem;flex-wrap:wrap}
    .tb-btn{padding:.3rem .55rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.82rem;transition:all .1s}
    .tb-btn:hover{background:#eff6ff;border-color:#bfdbfe}
    .btn-action{padding:.3rem .75rem;border:none;border-radius:6px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:.75rem}
    .btn-action.secondary{background:#f3f4f6;border:1px solid #e5e7eb;color:#374151}
    .chk{display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer}
    .stats-bar{display:flex;gap:1rem;font-size:.72rem;color:#9ca3af;margin-bottom:.6rem;flex-wrap:wrap}
    .editor-layout{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    @media(max-width:700px){.editor-layout{grid-template-columns:1fr}}
    .editor-pane,.preview-pane{display:flex;flex-direction:column;gap:.3rem}
    .pane-header{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .md-ta{width:100%;height:500px;padding:.75rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.85rem;resize:vertical;outline:none;box-sizing:border-box;line-height:1.6;tab-size:2}
    .md-preview{height:500px;overflow-y:auto;padding:.75rem 1rem;border:1px solid #e5e7eb;border-radius:8px;background:white;font-size:.9rem;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    :host ::ng-deep .md-preview h1{font-size:1.7rem;font-weight:800;border-bottom:2px solid #e5e7eb;padding-bottom:.4rem;margin:1rem 0 .6rem}
    :host ::ng-deep .md-preview h2{font-size:1.35rem;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:.3rem;margin:.85rem 0 .5rem}
    :host ::ng-deep .md-preview h3{font-size:1.1rem;font-weight:700;margin:.75rem 0 .4rem}
    :host ::ng-deep .md-preview p{margin:.5rem 0}
    :host ::ng-deep .md-preview code{background:#f3f4f6;padding:.15rem .35rem;border-radius:4px;font-size:.83em;font-family:monospace}
    :host ::ng-deep .md-preview pre{background:#1e293b;color:#a3e635;padding:1rem;border-radius:8px;overflow-x:auto;font-size:.82rem;line-height:1.5;margin:.5rem 0}
    :host ::ng-deep .md-preview pre code{background:none;color:inherit;padding:0}
    :host ::ng-deep .md-preview blockquote{border-left:4px solid #d1d5db;padding:.5rem 1rem;background:#f8fafc;margin:.5rem 0;border-radius:0 6px 6px 0;color:#6b7280}
    :host ::ng-deep .md-preview table{border-collapse:collapse;width:100%;margin:.5rem 0}
    :host ::ng-deep .md-preview th{background:#f3f4f6;padding:.4rem .75rem;border:1px solid #e5e7eb;font-weight:700;text-align:left}
    :host ::ng-deep .md-preview td{padding:.4rem .75rem;border:1px solid #e5e7eb}
    :host ::ng-deep .md-preview ul,:host ::ng-deep .md-preview ol{padding-left:1.5rem;margin:.4rem 0}
    :host ::ng-deep .md-preview li{margin:.2rem 0}
    :host ::ng-deep .md-preview a{color:#2563eb;text-decoration:underline}
    :host ::ng-deep .md-preview hr{border:none;border-top:2px solid #e5e7eb;margin:.75rem 0}
    :host ::ng-deep .md-preview img{max-width:100%;border-radius:6px}
    :host ::ng-deep .md-preview input[type=checkbox]{margin-right:.4rem}
    :host ::ng-deep .md-preview strong{font-weight:700}
    :host ::ng-deep .md-preview em{font-style:italic}
    :host ::ng-deep .md-preview del{text-decoration:line-through;color:#9ca3af}
  `]
})
export class MarkdownEditorComponent {
  @ViewChild('mdEditor') editorRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('preview') previewRef!: ElementRef<HTMLDivElement>;
  autoScroll = true;
  rendered = signal('');

  markdown = `# Welcome to the Markdown Editor

## Features
- **Live preview** with real-time rendering
- Support for *italic*, **bold**, and ~~strikethrough~~
- Code blocks with \`inline code\`
- Tables, blockquotes, and more

## Code Example
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Bold/Italic | ✅ |
| Code blocks | ✅ |
| Tables | ✅ |
| Task lists | ✅ |

## Task List
- [x] Build the editor
- [x] Add toolbar
- [ ] Add spell check

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler

---

Visit [UtilityMega](https://utilitymega.com) for more free tools!`;

  placeholder = '# Type Markdown here\n\nStart writing...';

  toolbarBtns = [
    {icon:'B',title:'Bold',before:'**',after:'**',wrap:true},{icon:'I',title:'Italic',before:'*',after:'*',wrap:true},{icon:'S',title:'Strikethrough',before:'~~',after:'~~',wrap:true},
    {icon:'H1',title:'Heading 1',before:'# ',after:'',line:true},{icon:'H2',title:'Heading 2',before:'## ',after:'',line:true},{icon:'H3',title:'Heading 3',before:'### ',after:'',line:true},
    {icon:'`',title:'Inline Code',before:'`',after:'`',wrap:true},{icon:'```',title:'Code Block',before:'```\n',after:'\n```',wrap:true},
    {icon:'🔗',title:'Link',before:'[',after:'](url)',wrap:true},{icon:'🖼',title:'Image',before:'![alt](',after:')',wrap:false,insert:'![alt text](image-url)'},
    {icon:'▸',title:'Quote',before:'> ',after:'',line:true},{icon:'─',title:'HR',before:'\n---\n',after:'',line:false,insert:'\n---\n'},
    {icon:'•',title:'List',before:'- ',after:'',line:true},{icon:'1.',title:'Ordered List',before:'1. ',after:'',line:true},
    {icon:'☑',title:'Task',before:'- [ ] ',after:'',line:true},{icon:'⊟',title:'Table',insert:'\n| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| A | B | C |\n',line:false},
  ];

  constructor() { this.render(); }

  render() {
    this.rendered.set(this.parseMarkdown(this.markdown));
  }

  parseMarkdown(md: string): string {
    let html = md;
    // Code blocks first
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/gm, (_, lang, code) => `<pre><code class="lang-${lang}">${this.escHtml(code.trim())}</code></pre>`);
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headers
    html = html.replace(/^###### (.+)$/gm,'<h6>$1</h6>').replace(/^##### (.+)$/gm,'<h5>$1</h5>').replace(/^#### (.+)$/gm,'<h4>$1</h4>').replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>');
    // HR
    html = html.replace(/^---+$/gm,'<hr>');
    // Blockquote
    html = html.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>');
    // Bold/Italic/Strike
    html = html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/~~(.+?)~~/g,'<del>$1</del>');
    // Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1">').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
    // Tables
    html = html.replace(/\|(.+)\|(\n\|[-| :]+\|)(\n\|.+\|)*/g, (match) => {
      const rows = match.trim().split('\n');
      const headers = rows[0].split('|').slice(1,-1).map(h=>`<th>${h.trim()}</th>`).join('');
      const body = rows.slice(2).map(r=>'<tr>'+r.split('|').slice(1,-1).map(c=>`<td>${c.trim()}</td>`).join('')+'</tr>').join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
    });
    // Task lists
    html = html.replace(/^- \[x\] (.+)$/gm,'<li><input type="checkbox" checked disabled> $1</li>').replace(/^- \[ \] (.+)$/gm,'<li><input type="checkbox" disabled> $1</li>');
    // Unordered lists
    html = html.replace(/((?:^- .+\n?)+)/gm, match => '<ul>' + match.replace(/^- (.+)$/gm,'<li>$1</li>') + '</ul>');
    // Ordered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, match => '<ol>' + match.replace(/^\d+\. (.+)$/gm,'<li>$1</li>') + '</ol>');
    // Paragraphs
    html = html.replace(/^(?!<[a-z]|\s*$)(.+)$/gm,'<p>$1</p>');
    // Newlines
    html = html.replace(/\n\n+/g,'');
    return html;
  }

  insertMarkdown(b: any) {
    const ta = this.editorRef?.nativeElement;
    if (!ta) { if (b.insert) { this.markdown += b.insert; this.render(); } return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = this.markdown.slice(start, end);
    let insert: string;
    if (b.insert) { insert = b.insert; }
    else if (b.wrap && selected) { insert = b.before + selected + b.after; }
    else { insert = b.before + (selected || (b.wrap ? 'text' : '')) + b.after; }
    this.markdown = this.markdown.slice(0,start) + insert + this.markdown.slice(end);
    this.render();
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + b.before.length, start + insert.length - b.after.length); }, 0);
  }

  wordCount() { return this.markdown.trim().split(/\s+/).filter(w=>w).length; }
  charCount() { return this.markdown.length; }
  lineCount() { return this.markdown.split('\n').length; }
  readTime() { return Math.max(1, Math.round(this.wordCount()/200)); }

  syncScroll(e: Event) {
    if (!this.autoScroll || !this.previewRef) return;
    const ta = e.target as HTMLTextAreaElement;
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight);
    const pv = this.previewRef.nativeElement;
    pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight);
  }

  copyHtml() { navigator.clipboard.writeText(this.rendered()); }
  downloadMd() { const b=new Blob([this.markdown],{type:'text/markdown'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='document.md';a.click(); }
  downloadHtml() {
    const full=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Document</title></head><body>${this.rendered()}</body></html>`;
    const b=new Blob([full],{type:'text/html'}); const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='document.html';a.click();
  }
  clearAll() { this.markdown=''; this.render(); }
  escHtml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
}

// ─── JWT Decoder ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-jwt-decoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="input-section">
        <label class="inp-label">Paste JWT Token</label>
        <textarea [(ngModel)]="jwtInput" (ngModelChange)="decode()" class="jwt-ta" rows="4" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"></textarea>
        <div class="security-note">🔒 All decoding happens in your browser — the token is never transmitted.</div>
      </div>

      <div class="jwt-parts" *ngIf="parts()">
        <!-- Encoded visualization -->
        <div class="encoded-visual">
          <span class="ev-part header" (click)="activeTab.set('header')">{{parts()!.rawHeader}}</span>.<span class="ev-part payload" (click)="activeTab.set('payload')">{{parts()!.rawPayload}}</span>.<span class="ev-part signature">{{parts()!.rawSignature}}</span>
        </div>

        <div class="tab-buttons">
          <button [class.active]="activeTab()==='header'" (click)="activeTab.set('header')" class="tab-btn header-btn">Header</button>
          <button [class.active]="activeTab()==='payload'" (click)="activeTab.set('payload')" class="tab-btn payload-btn">Payload</button>
          <button class="tab-btn sig-btn" [class.active]="activeTab()==='signature'" (click)="activeTab.set('signature')">Signature</button>
        </div>

        <!-- Header -->
        <div *ngIf="activeTab()==='header'" class="tab-content">
          <div class="decoded-json">{{jsonPretty(parts()!.header)}}</div>
          <div class="claims-grid">
            <div class="claim-row" *ngIf="parts()!.header?.alg"><span class="cr-key">alg</span><span class="cr-val">{{parts()!.header.alg}} — {{algDesc(parts()!.header.alg)}}</span></div>
            <div class="claim-row" *ngIf="parts()!.header?.typ"><span class="cr-key">typ</span><span class="cr-val">{{parts()!.header.typ}}</span></div>
            <div class="claim-row" *ngIf="parts()!.header?.kid"><span class="cr-key">kid</span><span class="cr-val">{{parts()!.header.kid}}</span></div>
          </div>
        </div>

        <!-- Payload -->
        <div *ngIf="activeTab()==='payload'" class="tab-content">
          <div class="decoded-json">{{jsonPretty(parts()!.payload)}}</div>
          <div class="claims-grid">
            <div class="claim-row" *ngFor="let c of payloadClaims()">
              <span class="cr-key">{{c.key}}</span>
              <span class="cr-val" [class.expired]="c.expired">{{c.display}}</span>
              <span class="cr-desc">{{c.desc}}</span>
            </div>
          </div>
          <!-- Expiry status -->
          <div class="expiry-status" *ngIf="expiryStatus()" [class.valid]="expiryStatus()!.valid" [class.expired]="!expiryStatus()!.valid">
            {{expiryStatus()!.valid ? '✅ Token is valid' : '❌ Token has expired'}} — {{expiryStatus()!.when}}
          </div>
        </div>

        <!-- Signature -->
        <div *ngIf="activeTab()==='signature'" class="tab-content">
          <div class="sig-note">
            <div class="sn-title">Signature</div>
            <div class="sig-raw mono">{{parts()!.rawSignature}}</div>
            <div class="sn-desc">To verify the signature you need the secret key (for HMAC) or the public key (for RS/ES algorithms). This tool only decodes — it cannot verify signatures without the key.</div>
          </div>
        </div>
      </div>

      <div class="error-box" *ngIf="errorMsg()">⚠️ {{errorMsg()}}</div>

      <!-- Sample JWTs -->
      <div class="samples-section">
        <div class="ss-title">Sample JWTs</div>
        <div class="sample-btns">
          <button *ngFor="let s of sampleJwts" class="sample-btn" (click)="jwtInput=s.token;decode()">{{s.name}}</button>
        </div>
      </div>

      <!-- Claims reference -->
      <div class="claims-ref">
        <div class="cr-title">Standard JWT Claims (RFC 7519)</div>
        <div class="cr-grid">
          <div class="cri" *ngFor="let c of claimsRef"><span class="cri-key mono">{{c.key}}</span><span class="cri-name">{{c.name}}</span><span class="cri-desc">{{c.desc}}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .inp-label{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.35rem}
    .jwt-ta{width:100%;padding:.65rem .85rem;border:1px solid #d1d5db;border-radius:8px;font-size:.82rem;font-family:monospace;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5;margin-bottom:.4rem}
    .security-note{font-size:.72rem;color:#6b7280;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:.35rem .75rem;margin-bottom:1rem}
    .jwt-parts{}
    .encoded-visual{background:#1e293b;border-radius:10px;padding:.75rem 1rem;font-family:monospace;font-size:.75rem;line-height:1.6;word-break:break-all;margin-bottom:.85rem;cursor:pointer}
    .ev-part{border-radius:3px;padding:.1rem .2rem}
    .ev-part.header{color:#fb923c;background:rgba(251,146,60,.1)}
    .ev-part.payload{color:#4ade80;background:rgba(74,222,128,.1)}
    .ev-part.signature{color:#a78bfa;background:rgba(167,139,250,.1)}
    .tab-buttons{display:flex;gap:.35rem;margin-bottom:.75rem}
    .tab-btn{padding:.35rem .85rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.8rem;font-weight:700}
    .header-btn.active{background:#fff7ed;border-color:#fdba74;color:#c2410c}
    .payload-btn.active{background:#f0fdf4;border-color:#86efac;color:#16a34a}
    .sig-btn.active{background:#faf5ff;border-color:#c4b5fd;color:#7c3aed}
    .tab-content{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .decoded-json{background:#1e293b;color:#a3e635;border-radius:8px;padding:.75rem 1rem;font-family:monospace;font-size:.75rem;white-space:pre-wrap;margin-bottom:.75rem;overflow-x:auto}
    .claims-grid{display:flex;flex-direction:column;gap:.3rem}
    .claim-row{display:flex;align-items:flex-start;gap:.5rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .65rem;font-size:.8rem;flex-wrap:wrap}
    .cr-key{font-family:monospace;font-weight:700;color:#2563eb;min-width:40px;flex-shrink:0}
    .cr-val{font-weight:600;flex:1}.cr-val.expired{color:#dc2626}
    .cr-desc{font-size:.72rem;color:#9ca3af}
    .expiry-status{margin-top:.75rem;border-radius:8px;padding:.6rem .85rem;font-size:.82rem;font-weight:700}
    .expiry-status.valid{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0}
    .expiry-status.expired{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
    .sig-note{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem 1rem}
    .sn-title{font-size:.75rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.4rem}
    .sig-raw{font-size:.75rem;word-break:break-all;color:#7c3aed;margin-bottom:.5rem;background:#faf5ff;padding:.4rem .65rem;border-radius:5px}
    .sn-desc{font-size:.78rem;color:#6b7280;line-height:1.4}
    .mono{font-family:monospace}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.6rem .9rem;color:#dc2626;font-size:.82rem;margin-bottom:1rem}
    .samples-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .ss-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .sample-btns{display:flex;gap:.4rem;flex-wrap:wrap}
    .sample-btn{padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.75rem;font-weight:600}
    .sample-btn:hover{border-color:#2563eb;color:#2563eb}
    .claims-ref{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem}
    .cr-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .cr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.35rem}
    .cri{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .65rem;display:flex;gap:.4rem;align-items:center;font-size:.75rem}
    .cri-key{min-width:28px;font-weight:700;color:#2563eb}
    .cri-name{font-weight:600;color:#374151;min-width:70px}
    .cri-desc{color:#9ca3af;font-size:.68rem}
  `]
})
export class JwtDecoderComponent {
  jwtInput = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJQcml5YSBTYXN0cmkiLCJlbWFpbCI6InByaXlhQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.mock_signature_here';
  activeTab = signal<'header'|'payload'|'signature'>('payload');
  parts = signal<{rawHeader:string,rawPayload:string,rawSignature:string,header:any,payload:any}|null>(null);
  errorMsg = signal('');

  sampleJwts = [
    {name:'HS256 User',token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJQcml5YSBTYXN0cmkiLCJlbWFpbCI6InByaXlhQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.mock_signature_here'},
    {name:'RS256 API',token:'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleV8wMSJ9.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkuZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzQ1NiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5LCJzY29wZXMiOlsicmVhZDp1c2VycyIsIndyaXRlOnBvc3RzIl19.signature'},
    {name:'Expired',token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ'},
  ];

  claimsRef = [
    {key:'iss',name:'Issuer',desc:'Who issued the token'},{key:'sub',name:'Subject',desc:'Who the token is about'},{key:'aud',name:'Audience',desc:'Intended recipients'},{key:'exp',name:'Expiration',desc:'When the token expires (Unix)'},{key:'nbf',name:'Not Before',desc:'Token valid from (Unix)'},{key:'iat',name:'Issued At',desc:'When token was issued (Unix)'},{key:'jti',name:'JWT ID',desc:'Unique identifier for the token'},
  ];

  constructor() { this.decode(); }

  decode() {
    this.errorMsg.set('');
    if (!this.jwtInput.trim()) { this.parts.set(null); return; }
    try {
      const parts = this.jwtInput.trim().split('.');
      if (parts.length !== 3) throw new Error('JWT must have exactly 3 parts separated by dots');
      const header = JSON.parse(this.b64Decode(parts[0]));
      const payload = JSON.parse(this.b64Decode(parts[1]));
      this.parts.set({rawHeader:parts[0],rawPayload:parts[1],rawSignature:parts[2],header,payload});
    } catch (e: any) { this.errorMsg.set(e.message); this.parts.set(null); }
  }

  b64Decode(s: string): string {
    s = s.replace(/-/g,'+').replace(/_/g,'/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  jsonPretty(o: any): string { return JSON.stringify(o, null, 2); }

  algDesc(alg: string): string {
    const m: Record<string,string> = {HS256:'HMAC-SHA256',HS384:'HMAC-SHA384',HS512:'HMAC-SHA512',RS256:'RSA-SHA256',RS384:'RSA-SHA384',RS512:'RSA-SHA512',ES256:'ECDSA-P256-SHA256',ES384:'ECDSA-P384-SHA384',ES512:'ECDSA-P521-SHA512',PS256:'RSA-PSS-SHA256',none:'No signature'};
    return m[alg] || alg;
  }

  payloadClaims() {
    const p = this.parts()?.payload;
    if (!p) return [];
    const now = Math.floor(Date.now()/1000);
    const fmt = (ts: number) => new Date(ts*1000).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
    const rel = (ts: number) => { const d=ts-now; return d>0?`expires in ${this.relTime(d)}`:`expired ${this.relTime(-d)} ago`; };
    return Object.entries(p).map(([key,val]) => {
      const isTs = ['exp','iat','nbf'].includes(key) && typeof val === 'number';
      const expired = key==='exp' && typeof val==='number' && val < now;
      return {key, display:isTs?`${val} — ${fmt(val as number)}`:(Array.isArray(val)?val.join(', '):String(val)), desc:isTs?rel(val as number):'', expired};
    });
  }

  expiryStatus() {
    const exp = this.parts()?.payload?.exp;
    if (!exp) return null;
    const now = Math.floor(Date.now()/1000);
    const diff = exp - now;
    return {valid:diff>0, when:diff>0?`Valid for ${this.relTime(diff)}`:`Expired ${this.relTime(-diff)} ago`};
  }

  relTime(secs: number): string {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.round(secs/60)}m`;
    if (secs < 86400) return `${Math.round(secs/3600)}h`;
    return `${Math.round(secs/86400)}d`;
  }
}
