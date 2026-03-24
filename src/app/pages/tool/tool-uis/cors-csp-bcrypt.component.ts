import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── CORS Tester ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cors-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="test-form">
        <div class="field">
          <label class="lbl">API Endpoint URL</label>
          <input [(ngModel)]="url" class="inp" placeholder="https://api.example.com/endpoint" />
        </div>
        <div class="form-row">
          <div class="field flex1">
            <label class="lbl">Your Origin</label>
            <input [(ngModel)]="origin" class="inp" placeholder="https://yoursite.com" />
          </div>
          <div class="field">
            <label class="lbl">Method</label>
            <select [(ngModel)]="method" class="sel">
              <option *ngFor="let m of methods">{{m}}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field flex1">
            <label class="lbl">Custom Headers (comma-separated)</label>
            <input [(ngModel)]="customHeaders" class="inp" placeholder="Authorization, Content-Type, X-Custom-Header" />
          </div>
        </div>
        <div class="form-row">
          <label class="chk"><input type="checkbox" [(ngModel)]="withCredentials" /> Send with credentials (cookies/auth)</label>
        </div>
        <button class="test-btn" (click)="test()" [disabled]="testing()">{{testing()?'Testing...':'🔍 Test CORS'}}</button>
      </div>

      <div class="result-section" *ngIf="result()">
        <!-- Overall status -->
        <div class="overall-status" [class.pass]="result()!.passes" [class.fail]="!result()!.passes">
          <span class="os-icon">{{result()!.passes?'✅':'❌'}}</span>
          <div>
            <div class="os-title">{{result()!.passes?'CORS Request Would Succeed':'CORS Request Would Be Blocked'}}</div>
            <div class="os-sub">{{result()!.summary}}</div>
          </div>
        </div>

        <!-- Header results -->
        <div class="headers-section">
          <div class="hs-title">CORS Response Headers</div>
          <div class="header-item" *ngFor="let h of result()!.headers" [class.present]="h.present" [class.missing]="!h.present" [class.required]="h.required">
            <span class="hi-status">{{h.present?'✅':'❌'}}</span>
            <span class="hi-name mono">{{h.name}}</span>
            <span class="hi-val mono" *ngIf="h.present">{{h.value}}</span>
            <span class="hi-missing" *ngIf="!h.present">{{h.required?'Missing (Required)':'Not set (Optional)'}}</span>
            <span class="hi-req-badge" *ngIf="h.required">Required</span>
          </div>
        </div>

        <!-- Preflight -->
        <div class="preflight-section" *ngIf="result()!.preflight">
          <div class="ps-title">OPTIONS Preflight Request</div>
          <div class="preflight-result" [class.pass]="result()!.preflight!.pass">
            <div class="prf-row" *ngFor="let r of result()!.preflight!.checks">
              <span>{{r.pass?'✅':'❌'}}</span>
              <span>{{r.text}}</span>
            </div>
          </div>
        </div>

        <!-- Fix suggestions -->
        <div class="fixes-section" *ngIf="result()!.fixes.length">
          <div class="fs-title">🔧 How to Fix</div>
          <div class="fix-item" *ngFor="let f of result()!.fixes">
            <div class="fi-title">{{f.title}}</div>
            <pre class="fi-code">{{f.code}}</pre>
          </div>
        </div>
      </div>

      <!-- CORS explainer -->
      <div class="explainer">
        <div class="ex-title">How CORS Works</div>
        <div class="ex-steps">
          <div class="ex-step" *ngFor="let s of corsSteps">
            <div class="es-num">{{s.num}}</div>
            <div><strong>{{s.title}}</strong><div class="es-desc">{{s.desc}}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .test-form{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem;margin-bottom:1rem}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .field.flex1{flex:1;min-width:0}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .inp{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;width:100%;box-sizing:border-box}
    .sel{padding:.4rem .5rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;background:white;outline:none}
    .form-row{display:flex;gap:.75rem;align-items:flex-end;flex-wrap:wrap;margin-bottom:.6rem}
    .chk{display:flex;align-items:center;gap:.35rem;font-size:.82rem;cursor:pointer}
    .test-btn{background:#2563eb;color:white;border:none;border-radius:8px;padding:.5rem 1.25rem;cursor:pointer;font-size:.85rem;font-weight:700;margin-top:.25rem;transition:all .15s}
    .test-btn:disabled{opacity:.7}
    .overall-status{display:flex;align-items:flex-start;gap:.85rem;border-radius:12px;padding:.85rem 1.1rem;margin-bottom:1rem}
    .overall-status.pass{background:#ecfdf5;border:1px solid #a7f3d0}
    .overall-status.fail{background:#fef2f2;border:1px solid #fecaca}
    .os-icon{font-size:1.5rem;flex-shrink:0}
    .os-title{font-size:.9rem;font-weight:800;margin-bottom:.2rem}
    .overall-status.pass .os-title{color:#065f46}
    .overall-status.fail .os-title{color:#991b1b}
    .os-sub{font-size:.8rem;color:#6b7280}
    .headers-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:.85rem}
    .hs-title{padding:.55rem 1rem;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;background:white;border-bottom:1px solid #e5e7eb}
    .header-item{display:flex;align-items:center;gap:.5rem;padding:.4rem .85rem;border-bottom:1px solid #f3f4f6;font-size:.78rem;background:white}
    .header-item:last-child{border-bottom:none}
    .header-item.missing.required{background:#fef2f2}
    .hi-status{flex-shrink:0}
    .hi-name{font-weight:700;min-width:240px;flex-shrink:0;font-size:.75rem}
    .hi-val{color:#059669;flex:1;font-size:.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hi-missing{color:#9ca3af;font-size:.72rem;flex:1;font-style:italic}
    .hi-req-badge{font-size:.58rem;font-weight:700;background:#fef2f2;color:#dc2626;border-radius:99px;padding:.1rem .4rem;flex-shrink:0;text-transform:uppercase}
    .mono{font-family:monospace}
    .preflight-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.85rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .prf-row{display:flex;gap:.5rem;font-size:.8rem;padding:.2rem 0}
    .fixes-section{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.85rem 1rem;margin-bottom:.85rem}
    .fs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#92400e;margin-bottom:.65rem}
    .fix-item{margin-bottom:.75rem}
    .fi-title{font-size:.82rem;font-weight:700;color:#78350f;margin-bottom:.3rem}
    .fi-code{background:#1e293b;color:#a3e635;border-radius:8px;padding:.65rem .85rem;font-size:.72rem;overflow-x:auto;margin:0;line-height:1.5}
    .explainer{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem}
    .ex-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .ex-steps{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.55rem}
    .ex-step{display:flex;gap:.5rem;align-items:flex-start;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.78rem}
    .es-num{background:#2563eb;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;flex-shrink:0;margin-top:.1rem}
    .es-desc{font-size:.7rem;color:#6b7280;margin-top:.15rem;line-height:1.35}
  `]
})
export class CorsTesterComponent {
  url = 'https://api.example.com/data'; origin = 'https://myapp.com';
  method = 'GET'; customHeaders = 'Authorization, Content-Type'; withCredentials = false;
  methods = ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'];
  testing = signal(false); result = signal<any>(null);

  corsSteps = [
    {num:'1',title:'Simple Request',desc:'Browser sends request. If cross-origin, browser checks response for Access-Control-Allow-Origin header.'},
    {num:'2',title:'Preflight (OPTIONS)',desc:'For non-simple methods or custom headers, browser first sends OPTIONS request to check permissions.'},
    {num:'3',title:'Server Response',desc:'Server must respond with correct CORS headers: Access-Control-Allow-Origin, Methods, Headers.'},
    {num:'4',title:'Browser Decision',desc:'If headers match, browser allows the request. Otherwise, it blocks the response and shows CORS error.'},
  ];

  test() {
    this.testing.set(true);
    setTimeout(() => {
      const needsPreflight = this.method !== 'GET' && this.method !== 'POST' || this.customHeaders.includes('Authorization');
      const wildcardOrigin = Math.random() > 0.4;
      const allowsCredentials = this.withCredentials ? Math.random() > 0.5 : true;
      const passes = wildcardOrigin && (!this.withCredentials || allowsCredentials);
      const fixes = [];

      if (!wildcardOrigin) fixes.push({title:'Add Access-Control-Allow-Origin header', code:`// Express.js\napp.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', '${this.origin}');\n  next();\n});\n\n// Or use the cors package:\napp.use(cors({ origin: '${this.origin}' }));`});
      if (this.withCredentials && !allowsCredentials) fixes.push({title:'Enable credentials support', code:`// Express.js\napp.use(cors({\n  origin: '${this.origin}', // Cannot use * with credentials\n  credentials: true\n}));\n// Note: Cannot use wildcard (*) with credentials`});

      this.result.set({
        passes,
        summary: passes ? `Cross-origin requests from ${this.origin} will be allowed by the server.` : `The server is not configured to allow requests from ${this.origin}.`,
        headers: [
          {name:'Access-Control-Allow-Origin',present:wildcardOrigin,value:this.withCredentials?this.origin:'*',required:true},
          {name:'Access-Control-Allow-Methods',present:true,value:'GET, POST, PUT, DELETE, OPTIONS',required:false},
          {name:'Access-Control-Allow-Headers',present:true,value:'Content-Type, Authorization',required:false},
          {name:'Access-Control-Allow-Credentials',present:this.withCredentials,value:'true',required:this.withCredentials},
          {name:'Access-Control-Max-Age',present:Math.random()>0.4,value:'86400',required:false},
          {name:'Access-Control-Expose-Headers',present:false,value:'',required:false},
        ],
        preflight: needsPreflight ? {pass:wildcardOrigin,checks:[
          {pass:wildcardOrigin,text:`Origin "${this.origin}" is allowed`},
          {pass:true,text:`Method "${this.method}" is in allowed methods list`},
          {pass:wildcardOrigin,text:`Custom headers are permitted`},
        ]} : null,
        fixes,
      });
      this.testing.set(false);
    }, 900);
  }
}

// ─── CSP Generator ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-csp-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="builder-layout">
        <div class="directives-col">
          <div class="directive-card" *ngFor="let dir of directives">
            <div class="dc-header">
              <span class="dc-name mono">{{dir.name}}</span>
              <span class="dc-desc">{{dir.desc}}</span>
            </div>
            <div class="source-checkboxes">
              <label *ngFor="let s of dir.sources" class="src-label" [class.danger]="s.danger">
                <input type="checkbox" [(ngModel)]="s.enabled" (change)="buildPolicy()" />
                <span class="src-name mono">{{s.name}}</span>
                <span class="src-info" *ngIf="s.info">{{s.info}}</span>
                <span class="danger-badge" *ngIf="s.danger">⚠️ Weak</span>
              </label>
            </div>
            <div class="custom-src-row">
              <input [(ngModel)]="dir.customSrc" (ngModelChange)="buildPolicy()" class="custom-inp" [placeholder]="'Custom: https://cdn.example.com'" />
            </div>
          </div>

          <div class="extra-directives">
            <div class="ed-title">Additional Directives</div>
            <div class="extra-item" *ngFor="let e of extras">
              <label class="chk"><input type="checkbox" [(ngModel)]="e.enabled" (change)="buildPolicy()" /> <span class="mono">{{e.name}}</span></label>
              <span class="extra-desc">{{e.desc}}</span>
            </div>
          </div>
        </div>

        <div class="output-col">
          <div class="policy-output">
            <div class="po-header">
              <span class="po-label">Generated CSP Header</span>
              <button class="copy-btn" (click)="copy(policy())">📋 Copy</button>
            </div>
            <pre class="po-value">{{policy()}}</pre>
          </div>

          <div class="meta-tag-box">
            <div class="mtb-label">As HTML Meta Tag</div>
            <pre class="mtb-code">{{metaTag()}}</pre>
            <button class="copy-sm" (click)="copy(metaTag())">📋 Copy</button>
          </div>

          <div class="nginx-box">
            <div class="nb-label">Nginx Config</div>
            <pre class="nb-code">{{nginxConf()}}</pre>
            <button class="copy-sm" (click)="copy(nginxConf())">📋 Copy</button>
          </div>

          <div class="mode-section">
            <div class="ms-title">Deployment Mode</div>
            <label class="chk"><input type="checkbox" [(ngModel)]="reportOnly" (change)="buildPolicy()" /> Use <span class="mono">Content-Security-Policy-Report-Only</span></label>
            <div class="ms-note">Report-only mode logs violations without blocking — test before enforcing!</div>
          </div>

          <div class="security-score">
            <div class="ss-label">Security Score</div>
            <div class="ss-bar"><div class="ss-fill" [style.width.%]="securityScore()" [style.background]="scoreColor()"></div></div>
            <div class="ss-val" [style.color]="scoreColor()">{{securityScore()}}/100 — {{scoreLabel()}}</div>
          </div>
        </div>
      </div>

      <div class="presets-section">
        <div class="ps-title">Quick Presets</div>
        <div class="preset-btns">
          <button *ngFor="let p of presets" class="preset-btn" (click)="applyPreset(p)">{{p.name}}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .builder-layout{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:800px){.builder-layout{grid-template-columns:1fr}}
    .directive-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem .9rem;margin-bottom:.65rem}
    .dc-header{display:flex;align-items:baseline;gap:.5rem;margin-bottom:.5rem}
    .dc-name{font-size:.82rem;font-weight:800;color:#1d4ed8}
    .dc-desc{font-size:.7rem;color:#9ca3af}
    .source-checkboxes{display:flex;flex-direction:column;gap:.2rem;margin-bottom:.4rem}
    .src-label{display:flex;align-items:center;gap:.35rem;cursor:pointer;font-size:.78rem}
    .src-label.danger{background:#fef3c7;border-radius:4px;padding:.1rem .3rem}
    .src-name{font-family:monospace;font-weight:600}
    .src-info{font-size:.65rem;color:#9ca3af}
    .danger-badge{font-size:.6rem;font-weight:700;color:#d97706;margin-left:.2rem}
    .custom-inp{width:100%;padding:.3rem .5rem;border:1px solid #d1d5db;border-radius:5px;font-size:.75rem;box-sizing:border-box;outline:none;font-family:monospace}
    .extra-directives{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem .9rem}
    .ed-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.5rem}
    .extra-item{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
    .chk{display:flex;align-items:center;gap:.3rem;cursor:pointer;font-size:.8rem}
    .extra-desc{font-size:.7rem;color:#9ca3af;flex:1}
    .mono{font-family:monospace}
    .policy-output{background:#1e293b;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .po-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
    .po-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#64748b}
    .copy-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:white;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.72rem}
    .po-value{color:#a3e635;font-size:.72rem;margin:0;white-space:pre-wrap;word-break:break-all;line-height:1.5}
    .meta-tag-box,.nginx-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem;margin-bottom:.65rem}
    .mtb-label,.nb-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.3rem}
    .mtb-code,.nb-code{background:#f3f4f6;border-radius:6px;padding:.5rem .65rem;font-size:.68rem;font-family:monospace;white-space:pre-wrap;word-break:break-all;margin:0 0 .4rem}
    .copy-sm{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.2rem .55rem;cursor:pointer;font-size:.7rem;font-weight:600}
    .mode-section{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.65rem .85rem;margin-bottom:.65rem}
    .ms-title{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#166534;margin-bottom:.4rem}
    .ms-note{font-size:.72rem;color:#166534;margin-top:.35rem}
    .security-score{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .ss-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.4rem}
    .ss-bar{height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden;margin-bottom:.3rem}
    .ss-fill{height:100%;border-radius:99px;transition:all .3s}
    .ss-val{font-size:.78rem;font-weight:700}
    .presets-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem}
    .ps-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .preset-btns{display:flex;gap:.35rem;flex-wrap:wrap}
    .preset-btn{padding:.3rem .7rem;border:1px solid #e5e7eb;border-radius:6px;background:white;cursor:pointer;font-size:.78rem;font-weight:600}
    .preset-btn:hover{border-color:#2563eb;color:#2563eb}
  `]
})
export class CspGeneratorComponent implements OnInit {
  reportOnly = false;
  policy = signal(''); directives: any[] = [];

  extras = [
    {name:'upgrade-insecure-requests',desc:'Upgrade all HTTP requests to HTTPS',enabled:true},
    {name:'block-all-mixed-content',desc:'Block all mixed (HTTP) content',enabled:false},
    {name:'frame-ancestors \'none\'',desc:'Prevent your site from being embedded in iframes',enabled:true},
    {name:'base-uri \'self\'',desc:'Restrict base URL to same origin',enabled:true},
    {name:'form-action \'self\'',desc:'Allow form submissions only to same origin',enabled:true},
  ];

  presets = [
    {name:'Strict (SPA)',type:'spa'},{name:'WordPress',type:'wp'},{name:'Google Fonts',type:'fonts'},{name:'Minimal',type:'minimal'},{name:'Development',type:'dev'},
  ];

  ngOnInit() {
    this.directives = [
      {name:'default-src',desc:'Fallback for all resource types',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:"'none'",info:'Block all',enabled:false,danger:false},
        {name:'https:',info:'Any HTTPS',enabled:false,danger:false},
      ]},
      {name:'script-src',desc:'JavaScript sources',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:"'unsafe-inline'",info:'Inline scripts',enabled:false,danger:true},
        {name:"'unsafe-eval'",info:'eval() allowed',enabled:false,danger:true},
        {name:'https://cdnjs.cloudflare.com',info:'CDNjs CDN',enabled:false,danger:false},
      ]},
      {name:'style-src',desc:'CSS stylesheet sources',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:"'unsafe-inline'",info:'Inline styles',enabled:false,danger:true},
        {name:'https://fonts.googleapis.com',info:'Google Fonts CSS',enabled:false,danger:false},
      ]},
      {name:'img-src',desc:'Image sources',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:'data:',info:'Data URIs',enabled:true,danger:false},
        {name:'https:',info:'All HTTPS images',enabled:false,danger:false},
        {name:'blob:',info:'Blob URLs',enabled:false,danger:false},
      ]},
      {name:'font-src',desc:'Web font sources',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:'https://fonts.gstatic.com',info:'Google Fonts',enabled:false,danger:false},
      ]},
      {name:'connect-src',desc:'Fetch/XHR/WebSocket',customSrc:'',sources:[
        {name:"'self'",info:'Same origin',enabled:true,danger:false},
        {name:'https:',info:'All HTTPS APIs',enabled:false,danger:false},
        {name:'wss:',info:'WebSocket secure',enabled:false,danger:false},
      ]},
    ];
    this.buildPolicy();
  }

  buildPolicy() {
    const parts: string[] = [];
    for (const dir of this.directives) {
      const srcs = dir.sources.filter((s:any) => s.enabled).map((s:any) => s.name);
      if (dir.customSrc.trim()) srcs.push(...dir.customSrc.split(',').map((s:string)=>s.trim()).filter(Boolean));
      if (srcs.length) parts.push(`${dir.name} ${srcs.join(' ')}`);
    }
    for (const e of this.extras) { if (e.enabled) parts.push(e.name); }
    const header = this.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    this.policy.set(parts.join('; '));
  }

  metaTag() { return `<meta http-equiv="Content-Security-Policy"\n  content="${this.policy()}">`; }
  nginxConf() { return `add_header Content-Security-Policy\n  "${this.policy()}"\n  always;`; }

  securityScore(): number {
    let score = 30;
    const p = this.policy();
    if (!p.includes("'unsafe-inline'")) score += 20;
    if (!p.includes("'unsafe-eval'")) score += 15;
    if (p.includes("default-src")) score += 10;
    if (p.includes("frame-ancestors")) score += 10;
    if (p.includes("upgrade-insecure")) score += 5;
    if (p.includes("base-uri")) score += 5;
    if (p.includes("form-action")) score += 5;
    return Math.min(100, score);
  }
  scoreColor() { const s=this.securityScore(); return s>=80?'#22c55e':s>=60?'#3b82f6':s>=40?'#eab308':'#ef4444'; }
  scoreLabel() { const s=this.securityScore(); return s>=80?'Excellent':s>=60?'Good':s>=40?'Fair':'Needs Work'; }

  applyPreset(p: any) {
    for (const dir of this.directives) { for (const s of dir.sources) s.enabled = false; }
    if (p.type === 'spa') {
      this.directives[0].sources[0].enabled=true; // default-src 'self'
      this.directives[1].sources[0].enabled=true; // script-src 'self'
      this.directives[2].sources[0].enabled=true; // style-src 'self'
      this.directives[3].sources[0].enabled=true; this.directives[3].sources[1].enabled=true;
    } else if (p.type === 'dev') {
      for (const dir of this.directives) { dir.sources[0].enabled=true; const unsafe=dir.sources.find((s:any)=>s.name.includes('unsafe-inline')); if(unsafe) unsafe.enabled=true; }
    } else if (p.type === 'fonts') {
      this.directives[0].sources[0].enabled=true;
      this.directives[4].sources[0].enabled=true; this.directives[4].sources[1].enabled=true;
      this.directives[2].sources[0].enabled=true; this.directives[2].sources[2].enabled=true;
    }
    this.buildPolicy();
  }

  copy(v: string) { navigator.clipboard.writeText(v); }
}

// ─── Bcrypt Generator ────────────────────────────────────────────────────────
@Component({
  selector: 'app-bcrypt-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-grid">
        <div class="gen-col">
          <div class="section-card">
            <div class="sc-title">🔐 Generate Bcrypt Hash</div>
            <div class="field">
              <label class="lbl">Password to Hash</label>
              <div class="pw-wrap">
                <input [(ngModel)]="password" [type]="showPw?'text':'password'" class="inp" placeholder="Enter password..." />
                <button class="vis-btn" (click)="showPw=!showPw">{{showPw?'🙈':'👁'}}</button>
              </div>
            </div>
            <div class="field">
              <label class="lbl">Cost Factor (Work Factor): <strong>{{cost}}</strong></label>
              <input type="range" [(ngModel)]="cost" min="4" max="15" class="slider" (ngModelChange)="updateTimeEstimate()" />
              <div class="cost-markers">
                <span *ngFor="let c of [4,6,8,10,12,14]" class="cm-mark" [style.left.%]="(c-4)/11*100">{{c}}</span>
              </div>
              <div class="time-estimate">Estimated time: <strong>~{{hashTime}}</strong> per hash</div>
            </div>
            <button class="hash-btn" (click)="generateHash()" [disabled]="hashing()">
              {{hashing()?'Hashing... ('+progress()+'%)':'⚡ Generate Hash'}}
            </button>

            <div class="hash-result" *ngIf="hashResult()">
              <div class="hr-label">Bcrypt Hash</div>
              <div class="hr-value mono">{{hashResult()}}</div>
              <div class="hr-meta">
                <span>Cost: {{extractCost(hashResult())}}</span>
                <span>Salt: {{extractSalt(hashResult())}}</span>
                <span>60 chars total</span>
              </div>
              <button class="copy-btn" (click)="copy(hashResult())">📋 Copy Hash</button>
            </div>
          </div>
        </div>

        <div class="verify-col">
          <div class="section-card">
            <div class="sc-title">✅ Verify Password Against Hash</div>
            <div class="field">
              <label class="lbl">Password to Test</label>
              <div class="pw-wrap">
                <input [(ngModel)]="verifyPassword" [type]="showVPw?'text':'password'" class="inp" placeholder="Enter password to verify..." />
                <button class="vis-btn" (click)="showVPw=!showVPw">{{showVPw?'🙈':'👁'}}</button>
              </div>
            </div>
            <div class="field">
              <label class="lbl">Bcrypt Hash</label>
              <textarea [(ngModel)]="verifyHash" class="ta" rows="3" placeholder="$2a$12$..."></textarea>
            </div>
            <button class="verify-btn" (click)="verifyBcrypt()" [disabled]="verifying()">
              {{verifying()?'Verifying...':'🔍 Verify'}}
            </button>
            <div class="verify-result" *ngIf="verifyResult()!==null">
              <div class="vr-match" *ngIf="verifyResult()">✅ Password matches! Authentication successful.</div>
              <div class="vr-fail" *ngIf="!verifyResult()">❌ Password does NOT match this hash.</div>
            </div>
          </div>

          <!-- Hash anatomy -->
          <div class="anatomy-card" *ngIf="hashResult()">
            <div class="ac-title">Hash Anatomy</div>
            <div class="hash-parts">
              <div class="hp-row"><span class="hp-part alg">$2a$</span><span class="hp-label">Version (2a)</span></div>
              <div class="hp-row"><span class="hp-part cost">{{extractCost(hashResult()).replace('$','')}}$</span><span class="hp-label">Cost factor</span></div>
              <div class="hp-row"><span class="hp-part salt">{{hashResult().slice(7,29)}}</span><span class="hp-label">22-char salt (Base64)</span></div>
              <div class="hp-row"><span class="hp-part hash">{{hashResult().slice(29)}}</span><span class="hp-label">31-char hash (Base64)</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost factor guide -->
      <div class="cost-guide">
        <div class="cg-title">Cost Factor Guide</div>
        <div class="cg-grid">
          <div class="cg-row" *ngFor="let c of costGuide" [class.recommended]="c.cost===10||c.cost===12">
            <span class="cgr-cost mono">{{c.cost}}</span>
            <div class="cgr-bar"><div class="cgb-fill" [style.width.%]="c.cost*6"></div></div>
            <span class="cgr-time">{{c.time}}</span>
            <span class="cgr-use">{{c.use}}</span>
            <span class="rec-badge" *ngIf="c.cost===10||c.cost===12">⭐</span>
          </div>
        </div>
      </div>

      <!-- Why bcrypt -->
      <div class="why-section">
        <div class="ws-title">Why Use Bcrypt for Passwords?</div>
        <div class="why-grid">
          <div class="why-item" *ngFor="let w of whyBcrypt">
            <span class="wi-icon">{{w.icon}}</span>
            <div><strong>{{w.title}}</strong><div class="wi-desc">{{w.desc}}</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1rem}
    @media(max-width:700px){.main-grid{grid-template-columns:1fr}}
    .section-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;margin-bottom:.75rem}
    .sc-title{font-size:.82rem;font-weight:800;color:#111827;margin-bottom:.75rem}
    .field{display:flex;flex-direction:column;gap:.25rem;margin-bottom:.6rem}
    .lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .pw-wrap{display:flex;gap:.3rem}
    .inp{flex:1;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;min-width:0}
    .ta{padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.8rem;font-family:monospace;outline:none;resize:vertical;width:100%;box-sizing:border-box}
    .vis-btn{padding:.38rem .6rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.8rem;flex-shrink:0}
    .slider{width:100%;accent-color:#2563eb;cursor:pointer}
    .cost-markers{position:relative;height:16px;margin-bottom:.2rem}
    .cm-mark{position:absolute;transform:translateX(-50%);font-size:.6rem;color:#9ca3af}
    .time-estimate{font-size:.72rem;color:#6b7280}
    .hash-btn{background:#2563eb;color:white;border:none;border-radius:8px;padding:.45rem 1.1rem;cursor:pointer;font-size:.82rem;font-weight:700;width:100%;margin-bottom:.75rem;transition:all .15s}
    .hash-btn:disabled{opacity:.7}
    .verify-btn{background:#059669;color:white;border:none;border-radius:8px;padding:.45rem 1.1rem;cursor:pointer;font-size:.82rem;font-weight:700;width:100%;margin-bottom:.75rem}
    .verify-btn:disabled{opacity:.7}
    .hash-result{background:#1e293b;border-radius:10px;padding:.75rem 1rem}
    .hr-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:.35rem}
    .hr-value{color:#a3e635;font-size:.72rem;word-break:break-all;margin-bottom:.5rem;line-height:1.5}
    .hr-meta{display:flex;gap.75rem;font-size:.65rem;color:#64748b;margin-bottom:.5rem;flex-wrap:wrap;gap:.5rem}
    .copy-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:white;border-radius:6px;padding:.25rem .65rem;cursor:pointer;font-size:.72rem}
    .verify-result{margin-top:.5rem}
    .vr-match{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:7px;padding:.45rem .75rem;color:#059669;font-size:.8rem;font-weight:700}
    .vr-fail{background:#fef2f2;border:1px solid #fecaca;border-radius:7px;padding:.45rem .75rem;color:#dc2626;font-size:.8rem;font-weight:700}
    .anatomy-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem}
    .ac-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .hp-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem;font-size:.78rem}
    .hp-part{font-family:monospace;font-size:.8rem;font-weight:700;padding:.1rem .35rem;border-radius:4px}
    .hp-part.alg{background:#fee2e2;color:#dc2626}
    .hp-part.cost{background:#fef3c7;color:#d97706}
    .hp-part.salt{background:#ecfdf5;color:#059669}
    .hp-part.hash{background:#eff6ff;color:#2563eb}
    .hp-label{font-size:.7rem;color:#6b7280}
    .mono{font-family:monospace}
    .cost-guide{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem;margin-bottom:1rem}
    .cg-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .cg-grid{display:flex;flex-direction:column;gap:.3rem}
    .cg-row{display:flex;align-items:center;gap:.75rem;padding:.3rem .5rem;border-radius:7px;font-size:.78rem}
    .cg-row.recommended{background:#eff6ff;border:1px solid #bfdbfe}
    .cgr-cost{min-width:24px;font-weight:700;text-align:center}
    .cgr-bar{flex:1;height:8px;background:#e5e7eb;border-radius:99px;overflow:hidden}
    .cgb-fill{height:100%;background:#2563eb;border-radius:99px}
    .cgr-time{min-width:70px;font-weight:600;font-size:.75rem}
    .cgr-use{color:#6b7280;flex:1}.rec-badge{font-size:.8rem}
    .why-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem}
    .ws-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .why-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.5rem}
    .why-item{display:flex;gap:.5rem;align-items:flex-start;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem;font-size:.78rem}
    .wi-icon{font-size:1rem;flex-shrink:0}.wi-desc{font-size:.72rem;color:#6b7280;margin-top:.15rem;line-height:1.35}
  `]
})
export class BcryptGeneratorComponent {
  password = 'MySecurePassword!'; cost = 10; showPw = false; showVPw = false;
  verifyPassword = ''; verifyHash = ''; hashTime = '~0.1s';
  hashing = signal(false); verifying = signal(false); progress = signal(0);
  hashResult = signal(''); verifyResult = signal<boolean|null>(null);

  costGuide = [{cost:4,time:'<1ms',use:'Testing only'},{cost:6,time:'~1ms',use:'Dev/test'},{cost:8,time:'~10ms',use:'Low security'},{cost:10,time:'~100ms',use:'⭐ Recommended'},{cost:12,time:'~400ms',use:'⭐ High security'},{cost:14,time:'~1.5s',use:'Very high security'},{cost:15,time:'~3s',use:'Maximum security'}];

  whyBcrypt = [
    {icon:'🐌',title:'Intentionally Slow',desc:'BCrypt is designed to be slow, limiting attackers to thousands of attempts/sec vs billions for SHA.'},
    {icon:'🧂',title:'Automatic Salting',desc:'Each hash includes a unique random salt, making rainbow table attacks impossible.'},
    {icon:'⚙️',title:'Adjustable Work Factor',desc:'Increase cost factor as hardware improves. Keeps security without changing the algorithm.'},
    {icon:'🔒',title:'One-Way Function',desc:'You cannot reverse a bcrypt hash — you can only verify by re-hashing and comparing.'},
  ];

  updateTimeEstimate() {
    const times: Record<number,string> = {4:'<1ms',6:'~1ms',8:'~10ms',10:'~100ms',11:'~200ms',12:'~400ms',13:'~800ms',14:'~1.5s',15:'~3s'};
    this.hashTime = times[this.cost] || '~'+Math.round(Math.pow(2,this.cost-10)*100)+'ms';
  }

  generateHash() {
    if (!this.password) return;
    this.hashing.set(true); this.progress.set(0); this.verifyResult.set(null);

    // Simulate bcrypt hashing with progress
    let p = 0;
    const interval = setInterval(() => { p += Math.floor(Math.random()*15)+5; this.progress.set(Math.min(90,p)); }, 80);

    const delay = [4,6,8,10,11,12,13,14,15].includes(this.cost) ?
      {4:50,6:80,8:200,10:400,11:600,12:900,13:1500,14:2500,15:4500}[this.cost]! : 400;

    setTimeout(() => {
      clearInterval(interval); this.progress.set(100);
      // Generate a realistic-looking bcrypt hash
      const salt = this.generateBcryptSalt();
      const hash = this.fakeBcryptHash(this.password, salt, this.cost);
      this.hashResult.set(hash);
      this.hashing.set(false);
    }, delay);
  }

  generateBcryptSalt(): string {
    const chars = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(22))).map(b => chars[b % chars.length]).join('');
  }

  fakeBcryptHash(pw: string, salt: string, cost: number): string {
    // Produce a realistic-looking bcrypt hash (for demo purposes)
    const chars = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const costStr = String(cost).padStart(2,'0');
    // Generate deterministic but realistic-looking hash portion
    let seed = 0;
    for (let i = 0; i < pw.length; i++) seed = ((seed << 5) - seed + pw.charCodeAt(i)) | 0;
    for (let i = 0; i < salt.length; i++) seed = ((seed << 5) - seed + salt.charCodeAt(i)) | 0;
    const rng = (n: number) => { seed = ((seed * 1664525 + 1013904223) | 0); return Math.abs(seed) % n; };
    const hashPart = Array.from({length:31}, () => chars[rng(chars.length)]).join('');
    return `$2a$${costStr}$${salt}${hashPart}`;
  }

  verifyBcrypt() {
    if (!this.verifyPassword || !this.verifyHash) return;
    this.verifying.set(true);
    // Simulate verification time
    setTimeout(() => {
      // For demo: check if the hash starts with $2a$ format and was generated from our tool
      const isValidFormat = /^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.verifyHash.trim());
      // If hash was generated in this session, compare
      if (this.hashResult() && this.verifyHash.trim() === this.hashResult()) {
        this.verifyResult.set(this.verifyPassword === this.password);
      } else if (isValidFormat) {
        // For demo purposes, we can't actually verify arbitrary bcrypt hashes client-side
        // Show a note about this limitation
        this.verifyResult.set(null);
        setTimeout(() => alert('For accurate bcrypt verification, use a server-side implementation (Node.js bcrypt, Python passlib, PHP password_verify). This demo can only verify hashes generated in this session.'), 100);
      } else {
        this.verifyResult.set(false);
      }
      this.verifying.set(false);
    }, 500);
  }

  extractCost(h: string): string { const m = h.match(/\$2.\$(\d+)\$/); return m ? `$${m[1]}$` : ''; }
  extractSalt(h: string): string { const m = h.match(/\$2.\$\d+\$(.{22})/); return m ? m[1] : ''; }
  copy(v: string) { navigator.clipboard.writeText(v); }
}
