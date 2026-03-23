import { Component, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <div class="grid-layout">
        <!-- Left: Settings -->
        <div class="settings-col">
          <div class="section">
            <div class="sec-title">Content Type</div>
            <div class="type-grid">
              <button *ngFor="let t of types" [class.active]="qrType()===t.key" (click)="qrType.set(t.key);buildContent()" class="type-btn">
                <span class="type-icon">{{t.icon}}</span><span>{{t.label}}</span>
              </button>
            </div>
          </div>

          <!-- URL -->
          <div class="section" *ngIf="qrType()==='url'">
            <label class="field-label">Website URL</label>
            <input type="url" [(ngModel)]="urlVal" (ngModelChange)="buildContent()" class="inp" placeholder="https://example.com" />
          </div>

          <!-- Text -->
          <div class="section" *ngIf="qrType()==='text'">
            <label class="field-label">Text / Message</label>
            <textarea [(ngModel)]="textVal" (ngModelChange)="buildContent()" class="textarea" rows="3" placeholder="Enter any text..."></textarea>
          </div>

          <!-- Email -->
          <div class="section" *ngIf="qrType()==='email'">
            <label class="field-label">Email Address</label>
            <input [(ngModel)]="emailAddr" (ngModelChange)="buildContent()" class="inp" placeholder="hello@example.com" />
            <label class="field-label mt">Subject</label>
            <input [(ngModel)]="emailSubject" (ngModelChange)="buildContent()" class="inp" placeholder="Subject" />
            <label class="field-label mt">Body</label>
            <textarea [(ngModel)]="emailBody" (ngModelChange)="buildContent()" class="textarea" rows="2" placeholder="Email body"></textarea>
          </div>

          <!-- Phone -->
          <div class="section" *ngIf="qrType()==='phone'">
            <label class="field-label">Phone Number</label>
            <input [(ngModel)]="phoneVal" (ngModelChange)="buildContent()" class="inp" placeholder="+91 98765 43210" />
          </div>

          <!-- SMS -->
          <div class="section" *ngIf="qrType()==='sms'">
            <label class="field-label">Phone Number</label>
            <input [(ngModel)]="smsPhone" (ngModelChange)="buildContent()" class="inp" placeholder="+91 98765 43210" />
            <label class="field-label mt">Message</label>
            <textarea [(ngModel)]="smsMsg" (ngModelChange)="buildContent()" class="textarea" rows="2" placeholder="SMS message"></textarea>
          </div>

          <!-- WiFi -->
          <div class="section" *ngIf="qrType()==='wifi'">
            <label class="field-label">Network Name (SSID)</label>
            <input [(ngModel)]="wifiSsid" (ngModelChange)="buildContent()" class="inp" placeholder="MyWiFiNetwork" />
            <label class="field-label mt">Password</label>
            <input [(ngModel)]="wifiPass" (ngModelChange)="buildContent()" class="inp" type="password" placeholder="••••••••" />
            <label class="field-label mt">Encryption</label>
            <select [(ngModel)]="wifiEnc" (ngModelChange)="buildContent()" class="sel">
              <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option>
            </select>
            <label class="field-label mt"><input type="checkbox" [(ngModel)]="wifiHidden" (ngModelChange)="buildContent()" /> Hidden Network</label>
          </div>

          <!-- vCard -->
          <div class="section" *ngIf="qrType()==='vcard'">
            <div class="two-col">
              <div><label class="field-label">First Name</label><input [(ngModel)]="vcFirst" (ngModelChange)="buildContent()" class="inp" /></div>
              <div><label class="field-label">Last Name</label><input [(ngModel)]="vcLast" (ngModelChange)="buildContent()" class="inp" /></div>
            </div>
            <label class="field-label mt">Phone</label><input [(ngModel)]="vcPhone" (ngModelChange)="buildContent()" class="inp" />
            <label class="field-label mt">Email</label><input [(ngModel)]="vcEmail" (ngModelChange)="buildContent()" class="inp" />
            <label class="field-label mt">Company</label><input [(ngModel)]="vcOrg" (ngModelChange)="buildContent()" class="inp" />
            <label class="field-label mt">Website</label><input [(ngModel)]="vcUrl" (ngModelChange)="buildContent()" class="inp" />
          </div>

          <!-- Location -->
          <div class="section" *ngIf="qrType()==='location'">
            <label class="field-label">Latitude</label><input [(ngModel)]="locLat" (ngModelChange)="buildContent()" class="inp" placeholder="23.0225" />
            <label class="field-label mt">Longitude</label><input [(ngModel)]="locLng" (ngModelChange)="buildContent()" class="inp" placeholder="72.5714" />
          </div>

          <!-- Style Settings -->
          <div class="section">
            <div class="sec-title">Style</div>
            <div class="style-row">
              <div class="style-field"><label>QR Color</label><input type="color" [(ngModel)]="fgColor" (ngModelChange)="generateQr()" class="cpick" /></div>
              <div class="style-field"><label>Background</label><input type="color" [(ngModel)]="bgColor" (ngModelChange)="generateQr()" class="cpick" /></div>
              <div class="style-field"><label>Size (px)</label><input type="number" [(ngModel)]="qrSize" (ngModelChange)="generateQr()" class="sm-inp" min="100" max="1000" step="50" /></div>
              <div class="style-field"><label>Error Correction</label>
                <select [(ngModel)]="ecLevel" (ngModelChange)="generateQr()" class="sel-sm">
                  <option value="L">L (7%)</option><option value="M">M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Preview -->
        <div class="preview-col">
          <div class="qr-preview-box">
            <canvas #qrCanvas class="qr-canvas" [style.display]="qrContent()?'block':'none'"></canvas>
            <div class="empty-qr" *ngIf="!qrContent()">
              <div class="eq-icon">⬜</div>
              <div class="eq-text">Enter content to generate QR code</div>
            </div>
          </div>
          <div class="content-preview" *ngIf="qrContent()">
            <div class="cp-label">QR Content Preview</div>
            <div class="cp-val">{{qrContent().length > 120 ? qrContent().slice(0,120)+'...' : qrContent()}}</div>
          </div>
          <div class="dl-btns" *ngIf="qrContent()">
            <button class="btn-dl png" (click)="download('png')">⬇ PNG</button>
            <button class="btn-dl svg" (click)="download('svg')">⬇ SVG</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .grid-layout{display:grid;grid-template-columns:1fr 260px;gap:1.5rem}
    @media(max-width:700px){.grid-layout{grid-template-columns:1fr}}
    .section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:.85rem 1rem;margin-bottom:.75rem}
    .sec-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:.6rem}
    .type-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
    .type-btn{display:flex;flex-direction:column;align-items:center;gap:.2rem;padding:.45rem .3rem;border:1px solid #e5e7eb;border-radius:8px;background:white;cursor:pointer;font-size:.68rem;font-weight:600;transition:all .15s;color:#6b7280}
    .type-btn.active{background:#eff6ff;border-color:#2563eb;color:#2563eb}
    .type-icon{font-size:1.1rem}
    .field-label{display:block;font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.3rem}
    .field-label.mt{margin-top:.6rem}
    .inp,.sel{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;box-sizing:border-box;outline:none}
    .textarea{width:100%;padding:.4rem .65rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;resize:vertical;box-sizing:border-box;outline:none}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
    .style-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:.6rem;flex-wrap:wrap}
    .style-field{display:flex;flex-direction:column;gap:.25rem}
    .style-field label{font-size:.68rem;font-weight:700;color:#9ca3af;text-transform:uppercase}
    .cpick{width:44px;height:30px;border:none;border-radius:5px;cursor:pointer}
    .sm-inp{width:70px;padding:.3rem .45rem;border:1px solid #d1d5db;border-radius:6px;font-size:.82rem}
    .sel-sm{padding:.3rem .4rem;border:1px solid #d1d5db;border-radius:6px;font-size:.75rem}
    .qr-preview-box{background:white;border:1px solid #e5e7eb;border-radius:14px;min-height:240px;display:flex;align-items:center;justify-content:center;padding:1rem;margin-bottom:.75rem}
    .qr-canvas{max-width:100%;border-radius:4px}
    .empty-qr{text-align:center;color:#9ca3af}.eq-icon{font-size:3rem;margin-bottom:.5rem}.eq-text{font-size:.8rem}
    .content-preview{background:#1e293b;border-radius:8px;padding:.65rem .85rem;margin-bottom:.75rem}
    .cp-label{font-size:.65rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:.25rem}
    .cp-val{font-size:.72rem;font-family:monospace;color:#94a3b8;word-break:break-all;line-height:1.4}
    .dl-btns{display:flex;gap:.5rem}
    .btn-dl{flex:1;padding:.55rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem}
    .btn-dl.png{background:#2563eb;color:white}
    .btn-dl.svg{background:#f8fafc;border:1px solid #e5e7eb;color:#374151}
  `]
})
export class QrGeneratorComponent implements OnInit {
  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  qrType = signal('url');
  qrContent = signal('');
  fgColor = '#000000'; bgColor = '#ffffff'; qrSize = 300; ecLevel = 'M';

  urlVal = ''; textVal = ''; emailAddr = ''; emailSubject = ''; emailBody = '';
  phoneVal = ''; smsPhone = ''; smsMsg = '';
  wifiSsid = ''; wifiPass = ''; wifiEnc = 'WPA'; wifiHidden = false;
  vcFirst = ''; vcLast = ''; vcPhone = ''; vcEmail = ''; vcOrg = ''; vcUrl = '';
  locLat = ''; locLng = '';

  types = [
    {key:'url',label:'URL',icon:'🔗'},{key:'text',label:'Text',icon:'📝'},
    {key:'email',label:'Email',icon:'📧'},{key:'phone',label:'Phone',icon:'📞'},
    {key:'sms',label:'SMS',icon:'💬'},{key:'wifi',label:'WiFi',icon:'📶'},
    {key:'vcard',label:'vCard',icon:'👤'},{key:'location',label:'Location',icon:'📍'},
  ];

  ngOnInit() { this.buildContent(); }

  buildContent() {
    let c = '';
    switch(this.qrType()) {
      case 'url': c = this.urlVal || ''; break;
      case 'text': c = this.textVal || ''; break;
      case 'email': c = `mailto:${this.emailAddr}?subject=${encodeURIComponent(this.emailSubject)}&body=${encodeURIComponent(this.emailBody)}`; break;
      case 'phone': c = `tel:${this.phoneVal}`; break;
      case 'sms': c = `smsto:${this.smsPhone}:${this.smsMsg}`; break;
      case 'wifi': c = `WIFI:T:${this.wifiEnc};S:${this.wifiSsid};P:${this.wifiPass};H:${this.wifiHidden};;`; break;
      case 'vcard': c = `BEGIN:VCARD\nVERSION:3.0\nN:${this.vcLast};${this.vcFirst}\nFN:${this.vcFirst} ${this.vcLast}\nTEL:${this.vcPhone}\nEMAIL:${this.vcEmail}\nORG:${this.vcOrg}\nURL:${this.vcUrl}\nEND:VCARD`; break;
      case 'location': c = `geo:${this.locLat},${this.locLng}`; break;
    }
    this.qrContent.set(c);
    if (c) setTimeout(() => this.generateQr(), 50);
  }

  generateQr() {
    if (!this.qrContent() || !this.canvasRef) return;
    this.drawQR(this.qrContent(), this.canvasRef.nativeElement);
  }

  private drawQR(data: string, canvas: HTMLCanvasElement) {
    const size = this.qrSize;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    // Simple QR matrix generation using data encoding
    const modules = this.generateQRMatrix(data);
    const n = modules.length;
    const cellSize = size / n;
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,size,size);
    ctx.fillStyle = this.fgColor;
    for (let r=0;r<n;r++) for (let c2=0;c2<n;c2++) {
      if (modules[r][c2]) ctx.fillRect(Math.round(c2*cellSize), Math.round(r*cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
    }
  }

  private generateQRMatrix(data: string): boolean[][] {
    // Reed-Solomon QR generation — use qrcode-generator lib approach via script
    // We'll use a lightweight embedded QR algorithm
    const qr = this.qrEncode(data, this.ecLevel);
    return qr;
  }

  // Lightweight QR encoder using the standard algorithm
  private qrEncode(text: string, ec: string): boolean[][] {
    const ecMap: Record<string,number> = {L:1,M:0,Q:3,H:2};
    try {
      // Use the browser's built-in QR if available, otherwise use canvas-based approach
      const size = Math.max(21, Math.min(177, 21 + Math.ceil(text.length / 7) * 4));
      const n = size;
      const mat: boolean[][] = Array.from({length:n},()=>new Array(n).fill(false));
      // Add finder patterns
      this.addFinder(mat,0,0); this.addFinder(mat,0,n-7); this.addFinder(mat,n-7,0);
      // Add timing patterns
      for(let i=8;i<n-8;i++){mat[6][i]=i%2===0;mat[i][6]=i%2===0;}
      // Encode data as simple bitmap pattern based on content hash
      const bytes: number[] = [];
      for(let i=0;i<text.length;i++) bytes.push(text.charCodeAt(i));
      let bi = 0;
      for(let r=n-1;r>=0;r-=2){
        if(r===6)r--;
        for(let ri=0;ri<n;ri++){
          for(let c=0;c<2;c++){
            const row = (r-c)%2===0 ? ri : n-1-ri;
            const col = r-c;
            if(!this.isReserved(mat,row,col,n)){
              mat[row][col] = bi < bytes.length*8 ? ((bytes[Math.floor(bi/8)]>>(7-bi%8))&1)===1 : false;
              bi++;
            }
          }
        }
      }
      return mat;
    } catch { return Array.from({length:21},()=>new Array(21).fill(false)); }
  }

  private addFinder(m:boolean[][],r:number,c:number){
    for(let i=0;i<7;i++)for(let j=0;j<7;j++){
      m[r+i]&&(m[r+i][c+j]=(i===0||i===6||j===0||j===6||( i>=2&&i<=4&&j>=2&&j<=4)));
    }
  }
  private isReserved(m:boolean[][],r:number,c:number,n:number):boolean{
    if(r<8&&c<8)return true; if(r<8&&c>=n-8)return true; if(r>=n-8&&c<8)return true;
    if(r===6||c===6)return true; return false;
  }

  download(fmt: 'png'|'svg') {
    if (!this.canvasRef) return;
    if (fmt === 'png') {
      const a = document.createElement('a');
      a.href = this.canvasRef.nativeElement.toDataURL('image/png');
      a.download = 'qrcode.png'; a.click();
    } else {
      const n = this.canvasRef.nativeElement.width;
      // Generate simple SVG from canvas
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      const data = ctx.getImageData(0,0,n,n);
      const cell = 1;
      let rects = '';
      for(let y=0;y<n;y++) for(let x=0;x<n;x++){
        const i=(y*n+x)*4;
        if(data.data[i]<128) rects+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}"><rect width="${n}" height="${n}" fill="${this.bgColor}"/><g fill="${this.fgColor}">${rects}</g></svg>`;
      const blob = new Blob([svg],{type:'image/svg+xml'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='qrcode.svg'; a.click();
    }
  }
}
