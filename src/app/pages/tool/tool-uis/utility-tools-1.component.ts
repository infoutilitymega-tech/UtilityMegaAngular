import { Component, ElementRef, signal, ViewChild ,OnInit,OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── URL Encoder/Decoder ──────────────────────────────────────────────────────
@Component({
  selector: 'app-url-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button *ngFor="let m of modes" [class.active]="mode()===m.key" (click)="mode.set(m.key);process()">{{m.label}}</button>
      </div>
      <div class="editor-grid">
        <div class="editor-col">
          <div class="col-label">Input</div>
          <textarea [(ngModel)]="input" (ngModelChange)="process()" [placeholder]="getPlaceholder()" rows="10" class="code-area"></textarea>
          <div class="action-row">
            <button class="btn-clear" (click)="input='';output=''">Clear</button>
            <button class="btn-paste" (click)="paste()">📋 Paste</button>
            <button class="btn-swap" (click)="swap()">⇄ Swap</button>
          </div>
        </div>
        <div class="editor-col">
          <div class="col-label">Output <span class="mode-badge">{{getModeName()}}</span></div>
          <textarea [value]="output" readonly rows="10" class="code-area output-area"></textarea>
          <div class="action-row">
            <button class="btn-copy" (click)="copy()" [class.copied]="copied()">{{copied()?'✓ Copied!':'📋 Copy'}}</button>
            <span class="char-info" *ngIf="output">{{output.length}} chars</span>
          </div>
        </div>
      </div>
      <div class="info-cards">
        <div class="info-card" *ngFor="let c of getInfoCards()">
          <div class="info-title">{{c.title}}</div>
          <div class="info-desc">{{c.desc}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1rem;background:#f3f4f6;border-radius:10px;padding:.35rem}
    .mode-tabs button{flex:1;padding:.45rem .5rem;border:none;background:none;border-radius:7px;font-size:.78rem;font-weight:600;cursor:pointer;color:#6b7280;transition:all .15s;white-space:nowrap}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
    @media(max-width:700px){.editor-grid{grid-template-columns:1fr}}
    .editor-col{display:flex;flex-direction:column;gap:.5rem}
    .col-label{font-size:.78rem;font-weight:700;color:#374151;display:flex;align-items:center;gap:.4rem}
    .mode-badge{font-size:.65rem;background:#eff6ff;color:#2563eb;padding:.1rem .5rem;border-radius:99px;font-weight:700}
    .code-area{width:100%;padding:.75rem;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-size:.8rem;resize:vertical;box-sizing:border-box;outline:none;line-height:1.5}
    .code-area:focus{border-color:#2563eb}
    .output-area{background:#f8fafc;color:#1e3a5f}
    .action-row{display:flex;gap:.5rem;align-items:center}
    .btn-clear,.btn-paste,.btn-swap,.btn-copy{padding:.4rem .85rem;border:1px solid #e5e7eb;border-radius:7px;background:white;cursor:pointer;font-size:.78rem;font-weight:700;transition:all .15s}
    .btn-copy{background:#2563eb;color:white;border-color:#2563eb}
    .btn-copy.copied{background:#059669;border-color:#059669}
    .char-info{font-size:.72rem;color:#9ca3af;margin-left:.25rem}
    .info-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;margin-top:.5rem}
    .info-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem}
    .info-title{font-size:.78rem;font-weight:700;margin-bottom:.25rem;color:#374151}
    .info-desc{font-size:.72rem;color:#6b7280;line-height:1.5}
  `]
})
export class UrlEncoderComponent {
  modes = [
    {key:'encode',label:'URL Encode'},
    {key:'decode',label:'URL Decode'},
    {key:'component',label:'encodeURIComponent'},
    {key:'html',label:'HTML Encode'},
    {key:'htmldecode',label:'HTML Decode'},
  ];
  mode = signal('encode');
  input = ''; output = ''; copied = signal(false);

  process() {
    try {
      switch(this.mode()) {
        case 'encode': this.output = encodeURI(this.input); break;
        case 'decode': this.output = decodeURIComponent(this.input.replace(/\+/g,' ')); break;
        case 'component': this.output = encodeURIComponent(this.input); break;
        case 'html': this.output = this.input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); break;
        case 'htmldecode': this.output = this.input.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); break;
      }
    } catch(e) { this.output = 'Error: ' + (e as any).message; }
  }

  getPlaceholder() {
    const p: Record<string,string> = {
      encode:'Enter URL or text to encode...', decode:'Enter %20 encoded URL to decode...',
      component:'Enter string to encode as URI component...', html:'Enter text with <tags> & special chars...',
      htmldecode:'Enter &lt;HTML&gt; entities to decode...'
    };
    return p[this.mode()] ?? 'Enter text...';
  }
  getModeName() {
    const n: Record<string,string> = {encode:'encodeURI()',decode:'decodeURIComponent()',component:'encodeURIComponent()',html:'HTML Entities',htmldecode:'HTML Decode'};
    return n[this.mode()] ?? '';
  }
  getInfoCards() {
    return [
      {title:'%20 vs +',desc:'%20 is standard URL encoding for space. + represents space only in query strings (form data).'},
      {title:'Reserved chars',desc:'/:?#[]@!$&\'()*+,;= have special URL meaning. Encode them in data values.'},
      {title:'Safe chars',desc:'A-Z a-z 0-9 - _ . ~ never need encoding in any context.'},
    ];
  }
  paste() { navigator.clipboard.readText().then(t=>{ this.input=t; this.process(); }); }
  swap() { this.input=this.output; this.process(); }
  copy() { navigator.clipboard.writeText(this.output).then(()=>{ this.copied.set(true); setTimeout(()=>this.copied.set(false),2000); }); }
}

// ─── Color Picker Tool ────────────────────────────────────────────────────────
@Component({
  selector: 'app-color-picker-tool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="main-grid">
        <div class="picker-col">
          <div class="section-title">Color Picker</div>
          <div class="big-picker-wrap">
            <input type="color" [(ngModel)]="hexColor" (ngModelChange)="onHexChange()" class="big-color-input" />
          </div>
          <div class="swatch-large" [style.background]="hexColor"></div>
          <div class="color-name">{{hexColor.toUpperCase()}}</div>
          <div class="preset-section">
            <div class="preset-title">Presets</div>
            <div class="preset-grid">
              <div class="preset-dot" *ngFor="let c of presets" [style.background]="c" (click)="hexColor=c;onHexChange()" [title]="c"></div>
            </div>
          </div>
        </div>
        <div class="values-col">
          <div class="section-title">Color Values</div>
          <div class="value-cards">
            <div class="value-card" *ngFor="let v of colorValues()">
              <div class="vc-label">{{v.label}}</div>
              <div class="vc-val">{{v.value}}</div>
              <button class="vc-copy" (click)="copyVal(v.value,v.label)">{{copied()===v.label?'✓':'Copy'}}</button>
            </div>
          </div>
          <div class="shades-section">
            <div class="section-title">Shades & Tints</div>
            <div class="shades-row">
              <div class="shade" *ngFor="let s of shades()" [style.background]="s" (click)="hexColor=s;onHexChange()" [title]="s"></div>
            </div>
          </div>
          <div class="contrast-section">
            <div class="section-title">Contrast</div>
            <div class="contrast-demo" [style.background]="hexColor" [style.color]="contrastColor()">
              Sample text on {{hexColor}}
            </div>
            <div class="contrast-info">Text color: <strong>{{contrastColor()}}</strong> — ratio {{contrastRatio()}}:1</div>
          </div>
          <div class="harmony-section">
            <div class="section-title">Color Harmony</div>
            <div class="harmony-row">
              <div class="harm-item" *ngFor="let h of harmony()">
                <div class="harm-swatch" [style.background]="h.color" (click)="hexColor=h.color;onHexChange()"></div>
                <div class="harm-label">{{h.name}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .main-grid{display:grid;grid-template-columns:220px 1fr;gap:1.5rem}
    @media(max-width:700px){.main-grid{grid-template-columns:1fr}}
    .section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.65rem}
    .picker-col,.values-col{display:flex;flex-direction:column;gap:1rem}
    .big-picker-wrap{display:flex;justify-content:center}
    .big-color-input{width:160px;height:100px;border:none;border-radius:12px;cursor:pointer;padding:0;display:block}
    .swatch-large{height:60px;border-radius:10px;border:1px solid rgba(0,0,0,.1);transition:background .15s}
    .color-name{text-align:center;font-size:1rem;font-weight:800;font-family:monospace}
    .preset-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:.3rem}
    .preset-dot{width:24px;height:24px;border-radius:50%;cursor:pointer;border:1px solid rgba(0,0,0,.1);transition:transform .1s}
    .preset-dot:hover{transform:scale(1.2)}
    .value-cards{display:flex;flex-direction:column;gap:.4rem}
    .value-card{display:flex;align-items:center;gap:.75rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem .85rem}
    .vc-label{font-size:.72rem;font-weight:700;color:#9ca3af;text-transform:uppercase;min-width:40px}
    .vc-val{flex:1;font-family:monospace;font-size:.85rem;font-weight:600;color:#111827}
    .vc-copy{padding:.2rem .65rem;border:1px solid #e5e7eb;border-radius:5px;background:white;cursor:pointer;font-size:.7rem;font-weight:700;min-width:44px}
    .shades-row{display:flex;gap:.3rem;flex-wrap:wrap}
    .shade{width:32px;height:32px;border-radius:6px;cursor:pointer;border:1px solid rgba(0,0,0,.08);transition:transform .1s}
    .shade:hover{transform:scale(1.15)}
    .contrast-demo{padding:1rem;border-radius:8px;text-align:center;font-weight:700;font-size:.9rem;border:1px solid rgba(0,0,0,.05)}
    .contrast-info{font-size:.75rem;color:#6b7280;margin-top:.35rem}
    .harmony-row{display:flex;gap:.5rem;flex-wrap:wrap}
    .harm-item{display:flex;flex-direction:column;align-items:center;gap:.25rem}
    .harm-swatch{width:40px;height:40px;border-radius:8px;cursor:pointer;border:1px solid rgba(0,0,0,.08)}
    .harm-label{font-size:.62rem;color:#6b7280;text-align:center}
  `]
})
export class ColorPickerToolComponent {
  hexColor = '#2563eb';
  copied = signal('');
  presets = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#111827','#6b7280','#f3f4f6','#ffffff','#1e40af','#065f46','#7c2d12','#4c1d95','#831843','#164e63','#713f12','#14532d'];

  onHexChange() {}

  private hexToRgb(hex: string): {r:number,g:number,b:number} {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  }
  private rgbToHsl(r:number,g:number,b:number): {h:number,s:number,l:number} {
    r/=255;g/=255;b/=255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;const l=(max+min)/2;
    if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
    return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};
  }
  private hslToHex(h:number,s:number,l:number): string {
    s/=100;l/=100;const k=(n:number)=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=(n:number)=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
  }

  colorValues() {
    const {r,g,b} = this.hexToRgb(this.hexColor);
    const {h,s,l} = this.rgbToHsl(r,g,b);
    const cmykK = 1-Math.max(r,g,b)/255; const dk=1-cmykK||1;
    const cmykC=Math.round((1-r/255-cmykK)/dk*100),cmykM=Math.round((1-g/255-cmykK)/dk*100),cmykY=Math.round((1-b/255-cmykK)/dk*100);
    return [
      {label:'HEX', value:this.hexColor.toUpperCase()},
      {label:'RGB', value:`rgb(${r}, ${g}, ${b})`},
      {label:'RGBA', value:`rgba(${r}, ${g}, ${b}, 1)`},
      {label:'HSL', value:`hsl(${h}, ${s}%, ${l}%)`},
      {label:'CMYK', value:`cmyk(${cmykC}%, ${cmykM}%, ${cmykY}%, ${Math.round(cmykK*100)}%)`},
      {label:'CSS Var', value:`--color: ${this.hexColor};`},
    ];
  }

  shades() {
    const {h,s,l} = this.rgbToHsl(...Object.values(this.hexToRgb(this.hexColor)) as [number,number,number]);
    return [10,20,30,40,50,60,70,80,90].map(shade => this.hslToHex(h,s,shade));
  }

  contrastColor() {
    const {r,g,b}=this.hexToRgb(this.hexColor);
    const luminance=(0.299*r+0.587*g+0.114*b)/255;
    return luminance>0.5?'#000000':'#ffffff';
  }
  contrastRatio() {
    const {r,g,b}=this.hexToRgb(this.hexColor);
    const l=(0.299*r+0.587*g+0.114*b)/255;
    const light=Math.max(l,1-l),dark=Math.min(l,1-l);
    return ((light+.05)/(dark+.05)).toFixed(1);
  }
  harmony() {
    const {h,s,l} = this.rgbToHsl(...Object.values(this.hexToRgb(this.hexColor)) as [number,number,number]);
    return [
      {name:'Complement',color:this.hslToHex((h+180)%360,s,l)},
      {name:'Triadic 1',color:this.hslToHex((h+120)%360,s,l)},
      {name:'Triadic 2',color:this.hslToHex((h+240)%360,s,l)},
      {name:'Analogous 1',color:this.hslToHex((h+30)%360,s,l)},
      {name:'Analogous 2',color:this.hslToHex((h-30+360)%360,s,l)},
    ];
  }
  copyVal(val:string,label:string){navigator.clipboard.writeText(val);this.copied.set(label);setTimeout(()=>this.copied.set(''),2000);}
}

// ─── IP Lookup ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-ip-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="search-bar">
        <input [(ngModel)]="ipInput" placeholder="Enter IP address or leave blank for your IP..." class="ip-input" (keyup.enter)="lookup()" />
        <button class="btn-lookup" (click)="lookup()" [disabled]="loading()">{{loading()?'Looking up...':'🔍 Lookup'}}</button>
        <button class="btn-my" (click)="ipInput='';lookup()">📍 My IP</button>
      </div>
      <div class="loading-bar" *ngIf="loading()"><div class="sp"></div><span>Fetching IP information...</span></div>
      <div class="error-box" *ngIf="error()">{{error()}}</div>
      <div class="results-grid" *ngIf="result()">
        <div class="result-hero">
          <div class="ip-display">{{result().ip}}</div>
          <div class="ip-location">{{result().city}}, {{result().region}}, {{result().country_name}}</div>
          <div class="ip-flag">{{getFlagEmoji(result().country_code)}}</div>
        </div>
        <div class="info-grid">
          <div class="info-card" *ngFor="let item of getInfoItems()">
            <div class="ic-icon">{{item.icon}}</div>
            <div class="ic-body">
              <div class="ic-label">{{item.label}}</div>
              <div class="ic-val">{{item.value || 'N/A'}}</div>
            </div>
          </div>
        </div>
        <div class="map-placeholder" *ngIf="result().latitude">
          <div class="map-coords">📍 {{result().latitude}}°N, {{result().longitude}}°E</div>
          <a [href]="'https://www.google.com/maps?q='+result().latitude+','+result().longitude" target="_blank" class="map-link">Open in Google Maps →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .search-bar{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem}
    .ip-input{flex:1;min-width:200px;padding:.65rem .9rem;border:1px solid #d1d5db;border-radius:9px;font-size:.9rem;outline:none}
    .ip-input:focus{border-color:#2563eb}
    .btn-lookup,.btn-my{padding:.65rem 1.25rem;border:none;border-radius:9px;font-weight:700;cursor:pointer;font-size:.85rem;white-space:nowrap}
    .btn-lookup{background:#2563eb;color:white}
    .btn-lookup:disabled{opacity:.6;cursor:not-allowed}
    .btn-my{background:#f3f4f6;color:#374151;border:1px solid #e5e7eb}
    .loading-bar{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:#eff6ff;border-radius:8px;font-size:.875rem;font-weight:600;color:#1d4ed8}
    .sp{width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .error-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.75rem 1rem;color:#dc2626;font-size:.85rem}
    .result-hero{background:linear-gradient(135deg,#1e40af,#7c3aed);color:white;border-radius:14px;padding:1.75rem;text-align:center;margin-bottom:1rem}
    .ip-display{font-size:1.75rem;font-weight:900;font-family:monospace;margin-bottom:.4rem}
    .ip-location{font-size:.95rem;opacity:.85;margin-bottom:.4rem}
    .ip-flag{font-size:2rem}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.65rem;margin-bottom:1rem}
    .info-card{display:flex;align-items:center;gap:.75rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem}
    .ic-icon{font-size:1.25rem;flex-shrink:0}
    .ic-label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:.15rem}
    .ic-val{font-size:.85rem;font-weight:600;color:#111827}
    .map-placeholder{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1rem;text-align:center}
    .map-coords{font-size:.9rem;font-weight:700;color:#166534;margin-bottom:.4rem}
    .map-link{color:#2563eb;font-size:.82rem;font-weight:600;text-decoration:none}
  `]
})
export class IpLookupComponent {
  ipInput = ''; loading = signal(false); result = signal<any>(null); error = signal('');

  async lookup() {
    this.loading.set(true); this.error.set(''); this.result.set(null);
    try {
      const url = this.ipInput.trim() ? `https://ipapi.co/${this.ipInput.trim()}/json/` : 'https://ipapi.co/json/';
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.reason || 'Invalid IP address');
      this.result.set(data);
    } catch(e) { this.error.set('Could not fetch IP info: ' + (e as any).message); }
    this.loading.set(false);
  }

  getFlagEmoji(code: string) {
    if (!code) return '🌐';
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0)+127397));
  }
  getInfoItems() {
    const r = this.result();
    return [
      {icon:'🌍',label:'Country',value:r.country_name},
      {icon:'🏙️',label:'City',value:r.city},
      {icon:'🗺️',label:'Region',value:r.region},
      {icon:'📮',label:'Postal Code',value:r.postal},
      {icon:'🏢',label:'ISP / Org',value:r.org},
      {icon:'⏰',label:'Timezone',value:r.timezone},
      {icon:'💱',label:'Currency',value:r.currency_name},
      {icon:'📞',label:'Calling Code',value:'+'+r.country_calling_code},
      {icon:'🔢',label:'ASN',value:r.asn},
      {icon:'🌐',label:'IP Version',value:r.version},
    ];
  }
}

// ─── Barcode Generator ────────────────────────────────────────────────────────
@Component({
  selector: 'app-barcode-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="controls-grid">
        <div class="ctrl-col">
          <div class="field-group"><label>Barcode Content</label><input [(ngModel)]="content" (ngModelChange)="generate()" placeholder="Enter text or number..." class="main-input" /></div>
          <div class="field-group"><label>Barcode Type</label>
            <select [(ngModel)]="barcodeType" (ngModelChange)="generate()" class="sel">
              <option value="CODE128">CODE 128 (Universal)</option>
              <option value="EAN13">EAN-13 (Products)</option>
              <option value="EAN8">EAN-8</option>
              <option value="UPC">UPC-A (US Products)</option>
              <option value="CODE39">CODE 39</option>
              <option value="ITF14">ITF-14 (Shipping)</option>
            </select>
          </div>
          <div class="field-group"><label>Display Text</label>
            <div class="toggle-row"><input type="checkbox" [(ngModel)]="displayValue" (ngModelChange)="generate()" id="dv" /><label for="dv">Show text below barcode</label></div>
          </div>
          <div class="field-group"><label>Line Color</label><input type="color" [(ngModel)]="lineColor" (ngModelChange)="generate()" class="cpick" /></div>
          <div class="field-group"><label>Background</label><input type="color" [(ngModel)]="bgColor" (ngModelChange)="generate()" class="cpick" /></div>
          <div class="field-group"><label>Height (px)</label><input type="range" min="40" max="200" [(ngModel)]="height" (ngModelChange)="generate()" class="range" /><span class="rv">{{height}}px</span></div>
          <div class="field-group"><label>Width Scale</label><input type="range" min="1" max="4" step="0.5" [(ngModel)]="width" (ngModelChange)="generate()" class="range" /><span class="rv">{{width}}x</span></div>
        </div>
        <div class="preview-col">
          <div class="preview-title">Barcode Preview</div>
          <div class="barcode-wrap" [style.background]="bgColor">
            <svg #barcodeEl class="barcode-svg"></svg>
            <div class="barcode-error" *ngIf="barcodeError()">{{barcodeError()}}</div>
          </div>
          <div class="dl-row" *ngIf="!barcodeError()">
            <button class="btn-dl" (click)="download('png')">⬇ PNG</button>
            <button class="btn-dl svg" (click)="download('svg')">⬇ SVG</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .controls-grid{display:grid;grid-template-columns:280px 1fr;gap:1.5rem}
    @media(max-width:700px){.controls-grid{grid-template-columns:1fr}}
    .ctrl-col{display:flex;flex-direction:column;gap:.75rem}
    .field-group{display:flex;flex-direction:column;gap:.3rem}
    .field-group label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .main-input,.sel{padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box}
    .toggle-row{display:flex;align-items:center;gap:.5rem;font-size:.85rem}
    .cpick{width:56px;height:36px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;padding:2px}
    .range{width:100%;accent-color:#2563eb}
    .rv{font-size:.8rem;font-weight:700;color:#2563eb}
    .preview-col{display:flex;flex-direction:column;gap:1rem}
    .preview-title{font-size:.85rem;font-weight:800;color:#111827}
    .barcode-wrap{padding:1.5rem;border-radius:12px;border:1px solid #e5e7eb;display:flex;justify-content:center;align-items:center;min-height:160px;background:white}
    .barcode-svg{max-width:100%}
    .barcode-error{color:#dc2626;font-size:.82rem;text-align:center}
    .dl-row{display:flex;gap:.5rem}
    .btn-dl{flex:1;padding:.55rem;border:none;border-radius:8px;background:#2563eb;color:white;font-weight:700;cursor:pointer;font-size:.82rem}
    .btn-dl.svg{background:#7c3aed}
  `]
})
export class BarcodeGeneratorComponent {
  content = '123456789012'; barcodeType = 'CODE128'; displayValue = true;
  lineColor = '#000000'; bgColor = '#ffffff'; height = 100; width = 2;
  barcodeError = signal('');
  @ViewChild('barcodeEl') barcodeEl!: ElementRef;

  ngAfterViewInit() { this.loadLib(); }
  loadLib() {
    if (typeof (window as any).JsBarcode !== 'undefined') { this.generate(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js';
    s.onload = () => this.generate();
    document.head.appendChild(s);
  }
  generate() {
    if (!this.barcodeEl || typeof (window as any).JsBarcode === 'undefined') return;
    try {
      this.barcodeError.set('');
      (window as any).JsBarcode(this.barcodeEl.nativeElement, this.content, {
        format: this.barcodeType, lineColor: this.lineColor, background: this.bgColor,
        width: this.width, height: this.height, displayValue: this.displayValue,
        font: 'monospace', fontSize: 14
      });
    } catch(e) { this.barcodeError.set('Invalid content for ' + this.barcodeType + ' format: ' + (e as any).message); }
  }
  download(fmt: 'png'|'svg') {
    const svg = this.barcodeEl?.nativeElement;
    if (!svg) return;
    if (fmt === 'svg') {
      const blob = new Blob([svg.outerHTML], {type:'image/svg+xml'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'barcode.svg'; a.click();
    } else {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => { canvas.width=img.width; canvas.height=img.height; canvas.getContext('2d')!.drawImage(img,0,0); const a=document.createElement('a');a.href=canvas.toDataURL();a.download='barcode.png';a.click(); };
      img.src = 'data:image/svg+xml;base64,' + btoa(svg.outerHTML);
    }
  }
}

// ─── timestamp-converter.component.ts ───────────────────────────────────────
@Component({
  selector: 'app-timestamp-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <!-- Live Clock -->
      <div class="live-clock">
        <div class="lc-label">Current Unix Timestamp</div>
        <div class="lc-ts">{{nowTs()}}</div>
        <div class="lc-date">{{nowDate()}}</div>
        <button class="btn-use" (click)="useNow()">Use Current Time</button>
      </div>

      <div class="two-panels">
        <!-- Unix → Human -->
        <div class="panel">
          <div class="panel-title">Unix Timestamp → Human Date</div>
          <div class="inp-row">
            <input [(ngModel)]="tsInput" (ngModelChange)="convertTs()" class="inp mono" placeholder="e.g. 1700000000" />
            <select [(ngModel)]="tsUnit" (ngModelChange)="convertTs()" class="sel-sm">
              <option value="s">Seconds</option>
              <option value="ms">Milliseconds</option>
            </select>
          </div>
          <div class="result-grid" *ngIf="tsResult()">
            <div class="res-row" *ngFor="let r of tsResult()"><span class="rl">{{r.label}}</span><span class="rv mono">{{r.val}}</span><button class="copy-btn" (click)="copy(r.val)">📋</button></div>
          </div>
        </div>

        <!-- Human → Unix -->
        <div class="panel">
          <div class="panel-title">Human Date → Unix Timestamp</div>
          <input type="datetime-local" [(ngModel)]="dateInput" (ngModelChange)="convertDate()" class="inp" />
          <div class="tz-row">
            <label class="tz-label">Timezone</label>
            <select [(ngModel)]="timezone" (ngModelChange)="convertDate()" class="sel">
              <option value="local">Local ({{localTz()}})</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Kolkata">IST (India)</option>
              <option value="America/New_York">EST (New York)</option>
              <option value="America/Los_Angeles">PST (Los Angeles)</option>
              <option value="Europe/London">GMT (London)</option>
              <option value="Asia/Tokyo">JST (Tokyo)</option>
              <option value="Asia/Dubai">GST (Dubai)</option>
            </select>
          </div>
          <div class="result-grid" *ngIf="dateResult()">
            <div class="res-row" *ngFor="let r of dateResult()"><span class="rl">{{r.label}}</span><span class="rv mono">{{r.val}}</span><button class="copy-btn" (click)="copy(r.val)">📋</button></div>
          </div>
        </div>
      </div>

      <!-- Quick Reference -->
      <div class="ref-section">
        <div class="ref-title">⚡ Quick Reference</div>
        <div class="ref-grid">
          <div class="ref-item" *ngFor="let r of quickRefs()">
            <span class="ref-label">{{r.label}}</span>
            <span class="ref-val mono" (click)="tsInput=r.ts.toString();tsUnit='s';convertTs()" style="cursor:pointer">{{r.ts}}</span>
            <span class="ref-date">{{r.date}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .live-clock{background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:14px;padding:1.25rem 1.5rem;margin-bottom:1.25rem;color:white;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap}
    .lc-label{font-size:.72rem;font-weight:700;text-transform:uppercase;opacity:.7}
    .lc-ts{font-size:2rem;font-weight:800;font-family:monospace;letter-spacing:.05em}
    .lc-date{font-size:.8rem;opacity:.8;flex:1}
    .btn-use{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;padding:.45rem 1rem;border-radius:8px;cursor:pointer;font-weight:600;font-size:.8rem}
    .two-panels{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem}
    @media(max-width:680px){.two-panels{grid-template-columns:1fr}}
    .panel{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1rem}
    .panel-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#374151;margin-bottom:.75rem}
    .inp-row{display:flex;gap:.5rem;margin-bottom:.75rem}
    .inp{width:100%;padding:.45rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.88rem;box-sizing:border-box;outline:none}
    .mono{font-family:monospace}
    .sel{width:100%;padding:.4rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem}
    .sel-sm{padding:.4rem .5rem;border:1px solid #d1d5db;border-radius:7px;font-size:.82rem;flex-shrink:0}
    .tz-row{display:flex;align-items:center;gap:.5rem;margin:.5rem 0}
    .tz-label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;white-space:nowrap}
    .result-grid{display:flex;flex-direction:column;gap:.35rem;margin-top:.6rem}
    .res-row{display:flex;align-items:center;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:7px;padding:.35rem .65rem}
    .rl{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase;min-width:80px}
    .rv{font-size:.78rem;font-weight:600;flex:1;word-break:break-all}
    .copy-btn{background:none;border:none;cursor:pointer;font-size:.75rem;padding:.1rem .3rem;opacity:.6}
    .ref-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1rem}
    .ref-title{font-size:.78rem;font-weight:800;text-transform:uppercase;color:#374151;margin-bottom:.75rem}
    .ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem}
    .ref-item{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .75rem;display:flex;flex-direction:column;gap:.15rem}
    .ref-label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .ref-val{font-size:.8rem;font-weight:700;color:#2563eb}
    .ref-date{font-size:.68rem;color:#6b7280}
  `]
})
export class TimestampConverterComponent implements OnInit, OnDestroy {
  tsInput = ''; tsUnit = 's'; dateInput = ''; timezone = 'local';
  nowTs = signal(0); nowDate = signal('');
  tsResult = signal<{label:string,val:string}[]|null>(null);
  dateResult = signal<{label:string,val:string}[]|null>(null);
  quickRefs = signal<{label:string,ts:number,date:string}[]>([]);
  private timer: any;
  localTz(){return Intl.DateTimeFormat().resolvedOptions().timeZone;}

  ngOnInit(){
    this.tick();
    this.timer=setInterval(()=>this.tick(),1000);
    this.dateInput=new Date().toISOString().slice(0,16);
    this.convertDate();
    this.buildRefs();
  }
  ngOnDestroy(){clearInterval(this.timer);}

  tick(){
    const now=new Date();
    this.nowTs.set(Math.floor(now.getTime()/1000));
    this.nowDate.set(now.toLocaleString());
  }
  useNow(){this.tsInput=String(this.nowTs());this.tsUnit='s';this.convertTs();}

  convertTs(){
    if(!this.tsInput)return;
    let ms=parseFloat(this.tsInput);
    if(this.tsUnit==='s')ms*=1000;
    const d=new Date(ms);
    if(isNaN(d.getTime())){this.tsResult.set([{label:'Error',val:'Invalid timestamp'}]);return;}
    this.tsResult.set([
      {label:'Local',val:d.toLocaleString()},
      {label:'UTC',val:d.toUTCString()},
      {label:'ISO 8601',val:d.toISOString()},
      {label:'Unix (s)',val:String(Math.floor(ms/1000))},
      {label:'Unix (ms)',val:String(Math.floor(ms))},
      {label:'Date',val:d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})},
      {label:'Time',val:d.toLocaleTimeString()},
      {label:'Relative',val:this.relative(ms)},
    ]);
  }

  convertDate(){
    if(!this.dateInput)return;
    const d=new Date(this.dateInput);
    if(isNaN(d.getTime()))return;
    const ms=d.getTime();
    this.dateResult.set([
      {label:'Unix (s)',val:String(Math.floor(ms/1000))},
      {label:'Unix (ms)',val:String(ms)},
      {label:'ISO 8601',val:d.toISOString()},
      {label:'UTC',val:d.toUTCString()},
      {label:'Local',val:d.toLocaleString()},
    ]);
  }

  buildRefs(){
    const now=Date.now();
    this.quickRefs.set([
      {label:'Now',ts:Math.floor(now/1000),date:new Date(now).toLocaleString()},
      {label:'Today Midnight',ts:Math.floor(new Date().setHours(0,0,0,0)/1000),date:'Start of today'},
      {label:'Unix Epoch',ts:0,date:'Jan 1, 1970 00:00:00 UTC'},
      {label:'Y2K',ts:946684800,date:'Jan 1, 2000 00:00:00 UTC'},
      {label:'Y2K38',ts:2147483647,date:'Jan 19, 2038 03:14:07 UTC'},
      {label:'+1 Year',ts:Math.floor((now+365*86400000)/1000),date:new Date(now+365*86400000).toLocaleDateString()},
    ]);
  }

  relative(ms:number):string{
    const diff=Date.now()-ms;const abs=Math.abs(diff);const sign=diff>0?'ago':'from now';
    if(abs<60000)return `${Math.floor(abs/1000)}s ${sign}`;
    if(abs<3600000)return `${Math.floor(abs/60000)}m ${sign}`;
    if(abs<86400000)return `${Math.floor(abs/3600000)}h ${sign}`;
    if(abs<2592000000)return `${Math.floor(abs/86400000)}d ${sign}`;
    return `${Math.floor(abs/2592000000)}mo ${sign}`;
  }
  copy(val:string){navigator.clipboard.writeText(val);}
}


// ─── roman-numeral-converter.component.ts ───────────────────────────────────
@Component({
  selector: 'app-roman-numeral-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="mode-tabs">
        <button [class.active]="mode()==='to-roman'" (click)="mode.set('to-roman');convert()">Number → Roman</button>
        <button [class.active]="mode()==='to-number'" (click)="mode.set('to-number');convert()">Roman → Number</button>
      </div>

      <!-- Number to Roman -->
      <div class="conv-section" *ngIf="mode()==='to-roman'">
        <div class="field-group">
          <label>Arabic Number (1 – 3,999,999)</label>
          <div class="inp-row">
            <input type="number" [(ngModel)]="arabicInput" (ngModelChange)="convert()" class="inp big" min="1" max="3999999" placeholder="e.g. 2024" />
            <button class="btn-rnd" (click)="randomArabic()">🎲 Random</button>
          </div>
        </div>
        <div class="result-box" *ngIf="romanResult()">
          <div class="rb-label">Roman Numeral</div>
          <div class="rb-value roman-font">{{romanResult()}}</div>
          <button class="copy-btn" (click)="copy(romanResult())">📋 Copy</button>
        </div>
        <div class="breakdown" *ngIf="breakdown().length">
          <div class="bd-title">Breakdown</div>
          <div class="bd-row" *ngFor="let b of breakdown()">
            <span class="bd-arabic">{{b.arabic}}</span><span class="bd-arrow">→</span><span class="bd-roman">{{b.roman}}</span>
          </div>
        </div>
      </div>

      <!-- Roman to Number -->
      <div class="conv-section" *ngIf="mode()==='to-number'">
        <div class="field-group">
          <label>Roman Numeral</label>
          <div class="inp-row">
            <input [(ngModel)]="romanInput" (ngModelChange)="convert()" class="inp big mono" placeholder="e.g. MMXXIV" (input)="romanInput=$any($event.target).value.toUpperCase()" />
            <button class="btn-rnd" (click)="randomRoman()">🎲 Random</button>
          </div>
          <div class="error-msg" *ngIf="romanError()">{{romanError()}}</div>
        </div>
        <div class="result-box" *ngIf="numberResult() > 0">
          <div class="rb-label">Arabic Number</div>
          <div class="rb-value">{{numberResult().toLocaleString()}}</div>
          <button class="copy-btn" (click)="copy(numberResult().toString())">📋 Copy</button>
        </div>
      </div>

      <!-- Reference Table -->
      <div class="ref-table">
        <div class="rt-title">Roman Numeral Reference</div>
        <div class="rt-grid">
          <div class="rt-item" *ngFor="let r of romanRef"><span class="rt-r">{{r.r}}</span><span class="rt-a">{{r.a}}</span></div>
        </div>
      </div>

      <!-- Year Table -->
      <div class="year-table">
        <div class="rt-title">Current & Recent Years</div>
        <div class="year-grid">
          <div class="year-item" *ngFor="let y of years" (click)="arabicInput=y;mode.set('to-roman');convert()">
            <span class="yi-year">{{y}}</span><span class="yi-roman">{{toRoman(y)}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .mode-tabs{display:flex;gap:.4rem;margin-bottom:1rem;background:#f3f4f6;border-radius:8px;padding:.3rem}
    .mode-tabs button{flex:1;padding:.4rem;border:none;background:none;border-radius:6px;font-size:.82rem;font-weight:600;cursor:pointer;color:#6b7280}
    .mode-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .conv-section{margin-bottom:1.25rem}
    .field-group{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.85rem}
    .field-group label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .inp-row{display:flex;gap:.6rem}
    .inp{flex:1;padding:.5rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:1rem;outline:none}
    .inp.big{font-size:1.1rem;font-weight:700}.mono{font-family:monospace}
    .btn-rnd{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:.5rem .85rem;cursor:pointer;font-size:.82rem;font-weight:600}
    .error-msg{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:6px;padding:.5rem .85rem;font-size:.82rem}
    .result-box{background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:12px;padding:1.25rem 1.5rem;color:white;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;margin-bottom:.85rem}
    .rb-label{font-size:.72rem;font-weight:700;text-transform:uppercase;opacity:.7}
    .rb-value{font-size:2rem;font-weight:800;letter-spacing:.05em;flex:1}
    .roman-font{font-family:'Times New Roman',serif}
    .copy-btn{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:white;padding:.4rem .85rem;border-radius:7px;cursor:pointer;font-size:.78rem;font-weight:700}
    .breakdown{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem}
    .bd-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.5rem}
    .bd-row{display:flex;align-items:center;gap:.75rem;padding:.25rem 0;border-bottom:1px solid #f3f4f6;font-size:.83rem}
    .bd-arabic{min-width:60px;font-weight:700;text-align:right;color:#374151}
    .bd-arrow{color:#9ca3af}
    .bd-roman{font-family:'Times New Roman',serif;font-size:1rem;font-weight:700;color:#2563eb}
    .ref-table,.year-table{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem}
    .rt-title{font-size:.72rem;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:.6rem}
    .rt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.4rem}
    .rt-item{display:flex;align-items:center;gap:.4rem;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .6rem}
    .rt-r{font-family:'Times New Roman',serif;font-weight:700;color:#2563eb;min-width:30px}
    .rt-a{font-size:.78rem;color:#6b7280}
    .year-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.4rem}
    .year-item{display:flex;justify-content:space-between;background:white;border:1px solid #e5e7eb;border-radius:6px;padding:.35rem .65rem;cursor:pointer;transition:all .15s}
    .year-item:hover{border-color:#2563eb;background:#eff6ff}
    .yi-year{font-size:.8rem;font-weight:700}.yi-roman{font-size:.78rem;font-family:'Times New Roman',serif;color:#6b7280}
  `]
})
export class RomanNumeralConverterComponent {
  mode=signal<'to-roman'|'to-number'>('to-roman');
  arabicInput=2024;romanInput='MMXXIV';
  romanResult=signal('');numberResult=signal(0);romanError=signal('');
  breakdown=signal<{arabic:number,roman:string}[]>([]);
  romanRef=[{r:'I',a:1},{r:'IV',a:4},{r:'V',a:5},{r:'IX',a:9},{r:'X',a:10},{r:'XL',a:40},{r:'L',a:50},{r:'XC',a:90},{r:'C',a:100},{r:'CD',a:400},{r:'D',a:500},{r:'CM',a:900},{r:'M',a:1000},{r:'(V)',a:5000},{r:'(X)',a:10000},{r:'(L)',a:50000},{r:'(C)',a:100000},{r:'(D)',a:500000},{r:'(M)',a:1000000}];
  years=[2030,2029,2028,2027,2026,2025,2024,2023,2022,2021,2020,2019,2018,2000,1999,1776,1066];

  private vals={M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1} as const;

  convert(){
    if(this.mode()==='to-roman'){
      const n=Number(this.arabicInput);
      if(!n||n<1||n>3999999){this.romanResult.set('');this.breakdown.set([]);return;}
      this.romanResult.set(this.toRoman(n));
      this.breakdown.set(this.getBreakdown(n));
    } else {
      if(!this.romanInput){this.numberResult.set(0);this.romanError.set('');return;}
      try{
        const result=this.fromRoman(this.romanInput);
        this.numberResult.set(result);this.romanError.set('');
      }catch(e:any){this.numberResult.set(0);this.romanError.set(e.message);}
    }
  }

  toRoman(n:number):string{
    if(n>=1000000){const m=Math.floor(n/1000000);return '(M)'.repeat(m)+this.toRoman(n%1000000);}
    let res='';
    for(const[k,v] of Object.entries(this.vals)){while(n>=v){res+=k;n-=v;}}
    return res;
  }

  getBreakdown(n:number):{arabic:number,roman:string}[]{
    const bd:{arabic:number,roman:string}[]=[];
    for(const[k,v] of Object.entries(this.vals)){while(n>=v){bd.push({arabic:v,roman:k});n-=v;}}
    return bd;
  }

  fromRoman(s:string):number{
    const map:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    let result=0;
    for(let i=0;i<s.length;i++){
      const curr=map[s[i]];
      const next=map[s[i+1]];
      if(!curr)throw new Error(`Invalid character: ${s[i]}`);
      if(next&&curr<next){result+=next-curr;i++;}else result+=curr;
    }
    return result;
  }

  randomArabic(){this.arabicInput=Math.floor(Math.random()*3999)+1;this.convert();}
  randomRoman(){const samples=['XIV','XLII','MMXXIV','MCMXCIX','DCCCXLVII','MDCCLXXVI'];this.romanInput=samples[Math.floor(Math.random()*samples.length)];this.convert();}
  copy(v:string){navigator.clipboard.writeText(v);}
}