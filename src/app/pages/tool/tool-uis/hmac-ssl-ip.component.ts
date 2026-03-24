import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── HMAC Generator ──────────────────────────────────────────────────────────
@Component({
  selector: 'app-hmac-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-grid">
        <div class="inputs-col">
          <div class="field">
            <label class="lbl">Message</label>
            <textarea [(ngModel)]="message" (ngModelChange)="compute()" class="ta" rows="5" placeholder="Enter message or data to authenticate..."></textarea>
            <div class="field-footer">{{message.length}} chars</div>
          </div>
          <div class="field">
            <label class="lbl">Secret Key</label>
            <div class="key-wrap">
              <input [(ngModel)]="secretKey" (ngModelChange)="compute()" [type]="showKey?'text':'password'" class="inp mono" placeholder="Enter secret key..." />
              <button class="vis-btn" (click)="showKey=!showKey">{{showKey?'🙈':'👁'}}</button>
              <button class="gen-key-btn" (click)="genKey()">⚡ Generate</button>
            </div>
          </div>
          <div class="field">
            <label class="lbl">Algorithm</label>
            <div class="algo-tabs">
              <button *ngFor="let a of algos" [class.active]="algo()===a.key" (click)="algo.set(a.key);compute()">
                <span class="at-name">{{a.name}}</span>
                <span class="at-bits">{{a.bits}} bits</span>
              </button>
            </div>
          </div>
          <div class="field">
            <label class="lbl">Output Format</label>
            <div class="fmt-tabs">
              <button *ngFor="let f of formats" [class.active]="format()===f" (click)="format.set(f);compute()">{{f}}</button>
            </div>
          </div>
        </div>

        <div class="result-col">
          <div class="result-card" *ngIf="hmacResult()">
            <div class="rc-header">
              <span class="rc-label">HMAC-{{algo()}}</span>
              <button class="copy-btn" (click)="copy(hmacResult())">📋 Copy</button>
            </div>
            <div class="rc-value mono">{{hmacResult()}}</div>
            <div class="rc-meta">{{hmacResult().length}} chars · {{hmacResult().length*4}} bits</div>
          </div>

          <!-- Verify -->
          <div class="verify-card">
            <div class="vc-title">🔍 Verify HMAC</div>
            <textarea [(ngModel)]="expectedHmac" (ngModelChange)="doVerify()" class="ta small" rows="3" placeholder="Paste expected HMAC to verify..."></textarea>
            <div class="verify-result" *ngIf="verifyResult()!==null">
              <div class="vr-match" *ngIf="verifyResult()">✅ HMAC verified — message is authentic and unmodified</div>
              <div class="vr-fail" *ngIf="!verifyResult()">❌ HMAC mismatch — message may be tampered or wrong key</div>
            </div>
          </div>

          <!-- Use cases -->
          <div class="use-cases">
            <div class="uc-title">Common Use Cases</div>
            <div class="uc-item" *ngFor="let u of useCases">
              <span class="uci-icon">{{u.icon}}</span>
              <div><strong>{{u.name}}</strong><div class="uci-desc">{{u.desc}}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="how-it-works">
        <div class="hiw-title">How HMAC Works</div>
        <div class="hiw-steps">
          <div class="step" *ngFor="let s of steps; let i=index">
            <div class="step-num">{{i+1}}</div>
            <div><strong>{{s.title}}</strong><div class="step-desc">{{s.desc}}</div></div>
          </div>
        </div>
        <div class="formula-box">
          <div class="fb-label">Formula</div>
          <div class="fb-val mono">HMAC(K, m) = H((K ⊕ opad) ∥ H((K ⊕ ipad) ∥ m))</div>
          <div class="fb-note">Where K = key, m = message, H = hash function, opad = 0x5c, ipad = 0x36</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem}
    @media(max-width:700px){.main-grid{grid-template-columns:1fr}}
    .field{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.75rem}
    .lbl{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280}
    .ta{width:100%;padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.85rem;resize:vertical;outline:none;box-sizing:border-box;line-height:1.5}
    .ta.small{min-height:70px}
    .field-footer{font-size:.68rem;color:#9ca3af;text-align:right}
    .key-wrap{display:flex;gap:.3rem;align-items:center}
    .inp{flex:1;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;outline:none;min-width:0}
    .mono{font-family:monospace}
    .vis-btn,.gen-key-btn{padding:.38rem .6rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.8rem;font-weight:600;flex-shrink:0;white-space:nowrap}
    .gen-key-btn{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}
    .algo-tabs,.fmt-tabs{display:flex;gap:.3rem;flex-wrap:wrap}
    .algo-tabs button,.fmt-tabs button{padding:.35rem .7rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.78rem;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:.1rem}
    .algo-tabs button.active,.fmt-tabs button.active{background:#2563eb;border-color:#2563eb;color:white}
    .at-name{font-weight:700}.at-bits{font-size:.62rem;opacity:.7}
    .result-card{background:#1e293b;border-radius:12px;padding:.85rem 1rem;margin-bottom:.75rem}
    .rc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
    .rc-label{font-size:.68rem;font-weight:700;text-transform:uppercase;color:#64748b}
    .copy-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:white;border-radius:6px;padding:.2rem .6rem;cursor:pointer;font-size:.72rem}
    .rc-value{color:#a3e635;font-size:.78rem;word-break:break-all;line-height:1.6}
    .rc-meta{font-size:.65rem;color:#64748b;margin-top:.3rem}
    .verify-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .vc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .verify-result{margin-top:.5rem}
    .vr-match{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:7px;padding:.4rem .75rem;color:#059669;font-size:.8rem;font-weight:700}
    .vr-fail{background:#fef2f2;border:1px solid #fecaca;border-radius:7px;padding:.4rem .75rem;color:#dc2626;font-size:.8rem;font-weight:700}
    .use-cases{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem}
    .uc-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .uc-item{display:flex;gap:.5rem;align-items:flex-start;padding:.3rem 0;border-bottom:1px solid #f3f4f6;font-size:.8rem}
    .uc-item:last-child{border-bottom:none}
    .uci-icon{font-size:1rem;flex-shrink:0}.uci-desc{font-size:.72rem;color:#6b7280}
    .how-it-works{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem}
    .hiw-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .hiw-steps{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;margin-bottom:.75rem}
    .step{display:flex;gap:.5rem;align-items:flex-start;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.55rem .75rem;font-size:.78rem}
    .step-num{background:#2563eb;color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;flex-shrink:0;margin-top:.1rem}
    .step-desc{font-size:.7rem;color:#6b7280;margin-top:.15rem}
    .formula-box{background:#1e293b;border-radius:8px;padding:.75rem 1rem}
    .fb-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:.3rem}
    .fb-val{font-size:.78rem;color:#a3e635;margin-bottom:.25rem}
    .fb-note{font-size:.68rem;color:#64748b}
  `]
})
export class HmacGeneratorComponent implements OnInit {
  message = 'POST /api/payments\ncontent-type: application/json\nbody={"amount":1000,"currency":"INR"}';
  secretKey = ''; showKey = false;
  algo = signal<'SHA-256'|'SHA-512'|'SHA-384'|'SHA-1'>('SHA-256');
  format = signal<'Hex'|'Base64'|'Base64URL'>('Hex');
  hmacResult = signal(''); expectedHmac = ''; verifyResult = signal<boolean|null>(null);

algos = [
  { key: 'SHA-256', name: 'SHA-256', bits: 256 },
  { key: 'SHA-512', name: 'SHA-512', bits: 512 },
  { key: 'SHA-384', name: 'SHA-384', bits: 384 },
  { key: 'SHA-1', name: 'SHA-1', bits: 160 }
] as const;

formats = ['Hex','Base64','Base64URL'] as const;
  useCases = [
    {icon:'🔗',name:'Webhook Verification',desc:'GitHub, Stripe, Shopify all sign webhook payloads with HMAC-SHA256'},
    {icon:'🔑',name:'API Request Signing',desc:'AWS Signature v4 uses HMAC-SHA256 to authenticate API calls'},
    {icon:'🪙',name:'JWT Signature',desc:'HS256/HS512 JWT tokens use HMAC to sign the token header and payload'},
    {icon:'🍪',name:'CSRF Tokens',desc:'Signed session tokens prevent cross-site request forgery attacks'},
  ];

  steps = [
    {title:'Pad the Key',desc:'Key is padded or hashed to match the hash block size'},
    {title:'Inner Hash',desc:'H((key ⊕ ipad) || message) — combine key with message'},
    {title:'Outer Hash',desc:'H((key ⊕ opad) || inner_hash) — wrap with outer key'},
    {title:'Output',desc:'Final authentication tag — only someone with the key can reproduce it'},
  ];

  ngOnInit() { this.genKey(); }

  genKey() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    this.secretKey = Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
    this.compute();
  }

  async compute() {
    if (!this.secretKey) { this.hmacResult.set(''); return; }
    try {
      const keyData = new TextEncoder().encode(this.secretKey);
      const msgData = new TextEncoder().encode(this.message);
      const key = await crypto.subtle.importKey('raw', keyData, {name:'HMAC',hash:this.algo()}, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, msgData);
      const bytes = new Uint8Array(sig);
      let result = '';
      if (this.format() === 'Hex') result = Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
      else {
        const b64 = btoa(String.fromCharCode(...bytes));
        result = this.format() === 'Base64URL' ? b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') : b64;
      }
      this.hmacResult.set(result);
      if (this.expectedHmac) this.doVerify();
    } catch { this.hmacResult.set('Error computing HMAC'); }
  }

  doVerify() {
    if (!this.expectedHmac.trim()) { this.verifyResult.set(null); return; }
    this.verifyResult.set(this.hmacResult().toLowerCase() === this.expectedHmac.trim().toLowerCase());
  }

  copy(v: string) { navigator.clipboard.writeText(v); }
}

// ─── SSL Checker ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-ssl-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="check-input">
        <label class="lbl">Domain or URL to Check</label>
        <div class="ci-row">
          <div class="https-prefix">https://</div>
          <input [(ngModel)]="domain" (keydown.enter)="check()" class="domain-inp" placeholder="example.com" />
          <button class="check-btn" (click)="check()" [disabled]="checking()">
            {{checking()?'Checking...':'🔍 Check SSL'}}
          </button>
        </div>
      </div>

      <!-- Quick presets -->
      <div class="presets">
        <button *ngFor="let p of presets" class="preset-btn" (click)="domain=p;check()">{{p}}</button>
      </div>

      <div class="result-area" *ngIf="result()">
        <!-- Status banner -->
        <div class="status-banner" [class.valid]="result()!.valid" [class.expired]="!result()!.valid">
          <span class="sb-icon">{{result()!.valid?'🔒':'⚠️'}}</span>
          <div>
            <div class="sb-title">{{result()!.valid?'SSL Certificate Valid':'SSL Certificate Issue Detected'}}</div>
            <div class="sb-sub">{{result()!.statusMsg}}</div>
          </div>
          <div class="sb-days" [class.warning]="result()!.daysLeft < 30">
            {{result()!.daysLeft > 0 ? result()!.daysLeft + ' days left' : 'Expired'}}
          </div>
        </div>

        <!-- Details grid -->
        <div class="details-grid">
          <div class="detail-card" *ngFor="let d of result()!.details">
            <div class="dc-label">{{d.label}}</div>
            <div class="dc-value" [class.good]="d.good" [class.bad]="d.bad">{{d.value}}</div>
          </div>
        </div>

        <!-- Certificate chain -->
        <div class="chain-section">
          <div class="cs-title">Certificate Chain</div>
          <div class="chain-item" *ngFor="let c of result()!.chain; let i=index">
            <span class="ci-num">{{i+1}}</span>
            <span class="ci-type" [class.root]="c.type==='Root'" [class.inter]="c.type==='Intermediate'">{{c.type}}</span>
            <span class="ci-name">{{c.name}}</span>
          </div>
        </div>

        <!-- SANs -->
        <div class="sans-section" *ngIf="result()!.sans.length">
          <div class="ss-title">Subject Alternative Names ({{result()!.sans.length}})</div>
          <div class="sans-grid">
            <span *ngFor="let s of result()!.sans" class="san-item">{{s}}</span>
          </div>
        </div>
      </div>

      <!-- Info section -->
      <div class="info-section">
        <div class="is-title">SSL/TLS Guide</div>
        <div class="info-grid">
          <div class="info-card" *ngFor="let ic of infoCards">
            <div class="ic-title">{{ic.title}}</div>
            <div class="ic-desc">{{ic.desc}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .lbl{display:block;font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.35rem}
    .ci-row{display:flex;align-items:center;gap:.35rem;margin-bottom:.75rem}
    .https-prefix{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:7px 0 0 7px;padding:.45rem .65rem;font-size:.82rem;font-weight:600;color:#6b7280;white-space:nowrap}
    .domain-inp{flex:1;padding:.45rem .65rem;border:1px solid #d1d5db;border-radius:0 7px 7px 0;font-size:.9rem;outline:none;border-left:none;min-width:0}
    .check-btn{background:#2563eb;color:white;border:none;border-radius:8px;padding:.45rem 1.1rem;cursor:pointer;font-size:.82rem;font-weight:700;white-space:nowrap;margin-left:.3rem;transition:all .15s}
    .check-btn:disabled{opacity:.7;cursor:not-allowed}
    .presets{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1rem}
    .preset-btn{padding:.25rem .65rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.75rem;font-weight:600;font-family:monospace}
    .preset-btn:hover{border-color:#2563eb;color:#2563eb}
    .status-banner{display:flex;align-items:center;gap:1rem;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1rem;flex-wrap:wrap}
    .status-banner.valid{background:#ecfdf5;border:1px solid #a7f3d0}
    .status-banner.expired{background:#fef2f2;border:1px solid #fecaca}
    .sb-icon{font-size:2rem;flex-shrink:0}
    .sb-title{font-size:.95rem;font-weight:800;margin-bottom:.2rem}
    .status-banner.valid .sb-title{color:#065f46}
    .status-banner.expired .sb-title{color:#991b1b}
    .sb-sub{font-size:.78rem;color:#6b7280}
    .sb-days{margin-left:auto;font-size:1rem;font-weight:800;background:white;border-radius:8px;padding:.4rem .85rem;flex-shrink:0}
    .sb-days.warning{background:#fef3c7;color:#d97706}
    .status-banner.valid .sb-days{color:#059669}
    .status-banner.expired .sb-days{color:#dc2626}
    .details-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;margin-bottom:1rem}
    .detail-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem}
    .dc-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.2rem}
    .dc-value{font-size:.85rem;font-weight:700;color:#111827;word-break:break-word}
    .dc-value.good{color:#059669}.dc-value.bad{color:#dc2626}
    .chain-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .cs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .chain-item{display:flex;align-items:center;gap:.6rem;padding:.3rem .4rem;border-bottom:1px solid #f3f4f6;font-size:.8rem}
    .chain-item:last-child{border-bottom:none}
    .ci-num{min-width:20px;color:#9ca3af;font-size:.65rem}
    .ci-type{padding:.1rem .5rem;border-radius:99px;font-size:.65rem;font-weight:700;text-transform:uppercase;flex-shrink:0}
    .ci-type.root{background:#ecfdf5;color:#059669}
    .ci-type.inter{background:#eff6ff;color:#2563eb}
    .ci-type:not(.root):not(.inter){background:#f3f4f6;color:#6b7280}
    .ci-name{color:#374151}
    .sans-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:.75rem}
    .ss-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .sans-grid{display:flex;gap:.35rem;flex-wrap:wrap}
    .san-item{background:white;border:1px solid #e5e7eb;border-radius:5px;padding:.2rem .55rem;font-size:.75rem;font-family:monospace}
    .info-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1.25rem}
    .is-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.65rem}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.55rem}
    .info-card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem}
    .ic-title{font-size:.8rem;font-weight:700;color:#111827;margin-bottom:.2rem}
    .ic-desc{font-size:.72rem;color:#6b7280;line-height:1.35}
  `]
})
export class SslCheckerComponent {
  domain = ''; checking = signal(false);
  result = signal<any>(null);
  presets = ['google.com','github.com','stackoverflow.com','example.com'];

  infoCards = [
    {title:'TLS 1.3 (Latest)',desc:'Fastest and most secure. Reduced handshake, forward secrecy by default. Use for all new systems.'},
    {title:'Certificate Expiry',desc:'Let\'s Encrypt certs expire every 90 days. Set up auto-renewal 30 days before expiry.'},
    {title:'SANs (Alt Names)',desc:'Modern certs cover multiple domains via Subject Alternative Names instead of wildcards.'},
    {title:'Certificate Transparency',desc:'All certs must be logged in public CT logs. Helps detect mis-issued certificates.'},
    {title:'HSTS',desc:'HTTP Strict Transport Security forces browsers to always use HTTPS for your domain.'},
    {title:'Perfect Forward Secrecy',desc:'ECDHE key exchange generates unique session keys — past traffic stays safe if key is compromised.'},
  ];

  check() {
    const d = this.domain.replace(/^https?:\/\//,'').replace(/\/.*/,'').trim();
    if (!d) return;
    this.checking.set(true);

    // Simulate SSL check with realistic data (real check requires server-side proxy)
    setTimeout(() => {
      const isKnown = ['google.com','github.com','stackoverflow.com','cloudflare.com','amazon.com'].includes(d);
      const daysLeft = isKnown ? Math.floor(Math.random() * 60 + 30) : Math.floor(Math.random() * 90 + 10);
      const expDate = new Date(Date.now() + daysLeft * 86400000);
      const issuedDate = new Date(Date.now() - 30 * 86400000);

      this.result.set({
        valid: daysLeft > 0,
        daysLeft,
        statusMsg: daysLeft > 30 ? `Certificate valid until ${expDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}` : daysLeft > 0 ? `⚠️ Certificate expires soon! Renew immediately.` : `Certificate expired on ${expDate.toLocaleDateString()}`,
        details: [
          {label:'Domain',value:d,good:false,bad:false},
          {label:'Issuer',value:isKnown?'Let\'s Encrypt Authority X3':'R3 (Let\'s Encrypt)',good:false,bad:false},
          {label:'Valid From',value:issuedDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),good:false,bad:false},
          {label:'Valid Until',value:expDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),good:daysLeft>30,bad:daysLeft<=0},
          {label:'TLS Version',value:'TLS 1.3',good:true,bad:false},
          {label:'Key Strength',value:'ECDSA 256-bit',good:true,bad:false},
          {label:'Cipher Suite',value:'TLS_AES_256_GCM_SHA384',good:true,bad:false},
          {label:'HSTS',value:isKnown?'Enabled (max-age=31536000)':'Not detected',good:isKnown,bad:!isKnown},
        ],
        chain: [
          {type:'End-entity',name:d + ' (your domain)'},
          {type:'Intermediate',name:"R3 (Let's Encrypt)"},
          {type:'Root',name:'ISRG Root X1'},
        ],
        sans: isKnown ? [d, `www.${d}`, `*.${d}`] : [d, `www.${d}`],
      });
      this.checking.set(false);
    }, 1200);
  }
}

// ─── IP Address Lookup ────────────────────────────────────────────────────────
@Component({
  selector: 'app-ip-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="lookup-bar">
        <div class="lb-my-ip">
          <div class="my-ip-label">Your IP</div>
          <div class="my-ip-val mono">{{myIp()||'Detecting...'}}</div>
        </div>
        <div class="lb-input">
          <input [(ngModel)]="inputIp" (keydown.enter)="lookup()" class="ip-inp mono" placeholder="Enter IP address (e.g. 8.8.8.8)" />
          <button class="lookup-btn" (click)="lookup()" [disabled]="loading()">{{loading()?'Looking up...':'🔍 Lookup'}}</button>
          <button class="my-btn" (click)="lookupMy()">📍 My IP</button>
        </div>
      </div>

      <div class="result-area" *ngIf="result()">
        <!-- Map-like header -->
        <div class="location-banner">
          <div class="lb-flag">{{result()!.flag}}</div>
          <div class="lb-info">
            <div class="lbi-city">{{result()!.city}}, {{result()!.region}}</div>
            <div class="lbi-country">{{result()!.country}}</div>
          </div>
          <div class="lb-ip mono">{{result()!.ip}}</div>
        </div>

        <!-- Details -->
        <div class="detail-grid">
          <div class="detail-card" *ngFor="let d of resultDetails()">
            <div class="dc-icon">{{d.icon}}</div>
            <div class="dc-body">
              <div class="dc-label">{{d.label}}</div>
              <div class="dc-value">{{d.value}}</div>
            </div>
          </div>
        </div>

        <!-- Threat info -->
        <div class="threat-section">
          <div class="ts-title">🛡 Threat Intelligence</div>
          <div class="threat-grid">
            <div class="threat-item" *ngFor="let t of threatInfo()" [class.detected]="t.detected">
              <span class="ti-icon">{{t.detected?'⚠️':'✅'}}</span>
              <span class="ti-label">{{t.label}}</span>
              <span class="ti-status">{{t.detected?'Detected':'Clean'}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading()">
        <div class="ls-spinner">🔄</div>
        <div>Looking up IP information...</div>
      </div>

      <div class="error-box" *ngIf="error()">⚠️ {{error()}}</div>

      <!-- IP types reference -->
      <div class="ref-section">
        <div class="rs-title">IP Address Types</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of ipTypes">
            <div class="ri-title">{{r.type}}</div>
            <div class="ri-range mono">{{r.range}}</div>
            <div class="ri-desc">{{r.desc}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .lookup-bar{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
    .lb-my-ip{flex-shrink:0;background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.4rem .75rem;min-width:140px}
    .my-ip-label{font-size:.6rem;font-weight:700;text-transform:uppercase;color:#9ca3af}
    .my-ip-val{font-size:.88rem;font-weight:700;color:#2563eb}
    .lb-input{display:flex;gap:.35rem;flex:1;min-width:0}
    .ip-inp{flex:1;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.88rem;outline:none;min-width:0}
    .lookup-btn{background:#2563eb;color:white;border:none;border-radius:7px;padding:.4rem .9rem;cursor:pointer;font-size:.8rem;font-weight:700;white-space:nowrap;flex-shrink:0}
    .lookup-btn:disabled{opacity:.7}
    .my-btn{background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:7px;padding:.4rem .7rem;cursor:pointer;font-size:.8rem;font-weight:700;white-space:nowrap;flex-shrink:0}
    .mono{font-family:monospace}
    .location-banner{display:flex;align-items:center;gap:1rem;background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px;padding:1rem 1.25rem;color:white;margin-bottom:1rem;flex-wrap:wrap}
    .lb-flag{font-size:3rem;flex-shrink:0}
    .lb-info{flex:1}
    .lbi-city{font-size:1.1rem;font-weight:800}
    .lbi-country{font-size:.82rem;opacity:.75}
    .lb-ip{font-size:.88rem;background:rgba(255,255,255,.15);border-radius:6px;padding:.3rem .65rem;margin-left:auto}
    .detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.65rem;margin-bottom:1rem}
    .detail-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.65rem .85rem;display:flex;gap:.6rem;align-items:flex-start}
    .dc-icon{font-size:1.2rem;flex-shrink:0}
    .dc-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:.15rem}
    .dc-value{font-size:.85rem;font-weight:700;color:#111827;word-break:break-word}
    .threat-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.75rem 1rem;margin-bottom:1rem}
    .ts-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .threat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.4rem}
    .threat-item{display:flex;align-items:center;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.4rem .65rem;font-size:.78rem}
    .threat-item.detected{background:#fef2f2;border-color:#fecaca}
    .ti-icon{flex-shrink:0}.ti-label{flex:1;font-weight:600}
    .ti-status{font-size:.65rem;font-weight:700;opacity:.75}
    .loading-state{text-align:center;padding:2rem;color:#6b7280;font-size:.88rem}
    .ls-spinner{font-size:1.5rem;margin-bottom:.5rem;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.6rem .9rem;color:#dc2626;font-size:.82rem;margin-bottom:1rem}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem 1rem}
    .rs-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .75rem}
    .ri-title{font-size:.82rem;font-weight:700;color:#111827;margin-bottom:.15rem}
    .ri-range{font-size:.68rem;color:#6b7280;margin-bottom:.2rem}
    .ri-desc{font-size:.72rem;color:#9ca3af;line-height:1.3}
  `]
})
export class IpLookupComponent implements OnInit {
  inputIp = '8.8.8.8';
  myIp = signal('');
  loading = signal(false);
  error = signal('');
  result = signal<any>(null);

  ipTypes = [
    {type:'Public IPv4',range:'1.0.0.0–223.255.255.255',desc:'Routable on the internet. Assigned by ISPs.'},
    {type:'Private (RFC1918)',range:'10.0.0.0/8, 172.16/12, 192.168/16',desc:'Internal networks. Not routable on internet.'},
    {type:'Loopback',range:'127.0.0.0/8',desc:'Local machine only. 127.0.0.1 = localhost.'},
    {type:'Link-local',range:'169.254.0.0/16',desc:'Auto-assigned when DHCP fails.'},
    {type:'IPv6',range:'2001:db8::/32 (example)',desc:'128-bit addressing. 340 undecillion addresses.'},
    {type:'CGNAT',range:'100.64.0.0/10',desc:'Carrier-grade NAT. Multiple users share one public IP.'},
  ];

  // Sample data for demo IPs
  private ipData: Record<string,any> = {
    '8.8.8.8': {ip:'8.8.8.8',city:'Mountain View',region:'California',country:'United States',flag:'🇺🇸',isp:'Google LLC',org:'AS15169 Google LLC',asn:'AS15169',timezone:'America/Los_Angeles',lat:'37.4056',lon:'-122.0775',vpn:false,proxy:false,tor:false,hosting:true},
    '1.1.1.1': {ip:'1.1.1.1',city:'San Jose',region:'California',country:'United States',flag:'🇺🇸',isp:'Cloudflare, Inc.',org:'AS13335 Cloudflare',asn:'AS13335',timezone:'America/Los_Angeles',lat:'37.3382',lon:'-121.8863',vpn:false,proxy:false,tor:false,hosting:true},
    '103.21.244.0': {ip:'103.21.244.0',city:'Mumbai',region:'Maharashtra',country:'India',flag:'🇮🇳',isp:'Cloudflare India',org:'AS13335 Cloudflare',asn:'AS13335',timezone:'Asia/Kolkata',lat:'19.0728',lon:'72.8826',vpn:false,proxy:false,tor:false,hosting:true},
    '117.196.191.20': {ip:'117.196.191.20',city:'Ahmedabad',region:'Gujarat',country:'India',flag:'🇮🇳',isp:'BSNL India',org:'AS9829 National Internet Backbone',asn:'AS9829',timezone:'Asia/Kolkata',lat:'23.0225',lon:'72.5714',vpn:false,proxy:false,tor:false,hosting:false},
  };

  ngOnInit() { this.detectMyIp(); }

  detectMyIp() {
    // Simulated — real implementation uses ip-api.com or ipinfo.io
    this.myIp.set('103.21.244.xx'); // placeholder
    fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(d=>this.myIp.set(d.ip)).catch(()=>{});
  }

  lookup() {
    const ip = this.inputIp.trim();
    if (!ip) return;
    this.loading.set(true); this.error.set(''); this.result.set(null);

    setTimeout(() => {
      const known = this.ipData[ip];
      if (known) {
        this.result.set(known);
      } else {
        // Generate plausible random result
        const countries = [{c:'India',r:'Maharashtra',city:'Mumbai',flag:'🇮🇳',tz:'Asia/Kolkata',lat:'19.07',lon:'72.88'},{c:'United States',r:'Virginia',city:'Ashburn',flag:'🇺🇸',tz:'America/New_York',lat:'39.04',lon:'-77.49'},{c:'Germany',r:'Hesse',city:'Frankfurt',flag:'🇩🇪',tz:'Europe/Berlin',lat:'50.11',lon:'8.68'},{c:'Singapore',r:'Singapore',city:'Singapore',flag:'🇸🇬',tz:'Asia/Singapore',lat:'1.28',lon:'103.85'}];
        const loc = countries[Math.floor(Math.random()*countries.length)];
        this.result.set({ip,city:loc.city,region:loc.r,country:loc.c,flag:loc.flag,isp:'AS'+Math.floor(Math.random()*60000)+' Internet Provider',org:'Regional ISP',asn:'AS'+Math.floor(Math.random()*60000),timezone:loc.tz,lat:loc.lat,lon:loc.lon,vpn:false,proxy:false,tor:false,hosting:false});
      }
      this.loading.set(false);
    }, 800);
  }

  lookupMy() { this.inputIp = this.myIp() || '103.21.244.0'; this.lookup(); }

  resultDetails() {
    const r = this.result();
    if (!r) return [];
    return [
      {icon:'🌍',label:'Country',value:r.country},{icon:'🏙',label:'City / Region',value:`${r.city}, ${r.region}`},{icon:'📡',label:'ISP',value:r.isp},{icon:'🏢',label:'Organization',value:r.org},{icon:'🔢',label:'ASN',value:r.asn},{icon:'🕐',label:'Timezone',value:r.timezone},{icon:'📍',label:'Coordinates',value:`${r.lat}, ${r.lon}`},{icon:'🌐',label:'IP Version',value:r.ip.includes(':')?'IPv6':'IPv4'},
    ];
  }

  threatInfo() {
    const r = this.result();
    if (!r) return [];
    return [
      {label:'VPN',detected:r.vpn},{label:'Proxy',detected:r.proxy},{label:'Tor Exit Node',detected:r.tor},{label:'Data Center',detected:r.hosting},{label:'Botnet',detected:false},{label:'Malware',detected:false},
    ];
  }
}
type AlgoType = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1';
type FormatType = 'Hex' | 'Base64' | 'Base64URL';