import { Component, signal, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var QRCode: any;

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-wrap">
      <!-- Type Tabs -->
      <div class="type-tabs">
        <button *ngFor="let t of types" [class.active]="qrType()===t.key" (click)="qrType.set(t.key);buildContent()">{{t.icon}} {{t.label}}</button>
      </div>

      <!-- Input Fields -->
      <div class="input-section">
        <!-- URL -->
        <div *ngIf="qrType()==='url'" class="field-group">
          <label>Website URL</label>
          <input [(ngModel)]="url" (ngModelChange)="buildContent()" placeholder="https://example.com" class="main-input" />
        </div>
        <!-- Text -->
        <div *ngIf="qrType()==='text'" class="field-group">
          <label>Text Message</label>
          <textarea [(ngModel)]="text" (ngModelChange)="buildContent()" placeholder="Enter any text..." rows="3" class="main-textarea"></textarea>
        </div>
        <!-- Email -->
        <div *ngIf="qrType()==='email'" class="fields-row">
          <div class="field-group"><label>Email Address</label><input [(ngModel)]="email" (ngModelChange)="buildContent()" placeholder="email@example.com" class="main-input" /></div>
          <div class="field-group"><label>Subject</label><input [(ngModel)]="emailSubject" (ngModelChange)="buildContent()" placeholder="Email subject" class="main-input" /></div>
          <div class="field-group"><label>Body</label><textarea [(ngModel)]="emailBody" (ngModelChange)="buildContent()" placeholder="Email body..." rows="2" class="main-textarea"></textarea></div>
        </div>
        <!-- Phone -->
        <div *ngIf="qrType()==='phone'" class="field-group">
          <label>Phone Number</label>
          <input [(ngModel)]="phone" (ngModelChange)="buildContent()" placeholder="+91 9876543210" class="main-input" />
        </div>
        <!-- SMS -->
        <div *ngIf="qrType()==='sms'" class="fields-row">
          <div class="field-group"><label>Phone Number</label><input [(ngModel)]="smsPhone" (ngModelChange)="buildContent()" placeholder="+91 9876543210" class="main-input" /></div>
          <div class="field-group"><label>Message</label><textarea [(ngModel)]="smsMessage" (ngModelChange)="buildContent()" placeholder="SMS text..." rows="2" class="main-textarea"></textarea></div>
        </div>
        <!-- WiFi -->
        <div *ngIf="qrType()==='wifi'" class="fields-row">
          <div class="field-group"><label>Network Name (SSID)</label><input [(ngModel)]="wifiSSID" (ngModelChange)="buildContent()" placeholder="MyWiFi" class="main-input" /></div>
          <div class="field-group"><label>Password</label><input [(ngModel)]="wifiPass" (ngModelChange)="buildContent()" placeholder="Password" class="main-input" /></div>
          <div class="field-group"><label>Security</label>
            <select [(ngModel)]="wifiSec" (ngModelChange)="buildContent()" class="sel">
              <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None (Open)</option>
            </select>
          </div>
          <div class="field-group"><label><input type="checkbox" [(ngModel)]="wifiHidden" (ngModelChange)="buildContent()" /> Hidden Network</label></div>
        </div>
        <!-- vCard -->
        <div *ngIf="qrType()==='vcard'" class="fields-row">
          <div class="field-group"><label>Full Name</label><input [(ngModel)]="vcName" (ngModelChange)="buildContent()" placeholder="John Doe" class="main-input" /></div>
          <div class="field-group"><label>Phone</label><input [(ngModel)]="vcPhone" (ngModelChange)="buildContent()" placeholder="+91 9876543210" class="main-input" /></div>
          <div class="field-group"><label>Email</label><input [(ngModel)]="vcEmail" (ngModelChange)="buildContent()" placeholder="john@example.com" class="main-input" /></div>
          <div class="field-group"><label>Company</label><input [(ngModel)]="vcOrg" (ngModelChange)="buildContent()" placeholder="Company Name" class="main-input" /></div>
          <div class="field-group"><label>Website</label><input [(ngModel)]="vcUrl" (ngModelChange)="buildContent()" placeholder="https://example.com" class="main-input" /></div>
          <div class="field-group"><label>Address</label><input [(ngModel)]="vcAddr" (ngModelChange)="buildContent()" placeholder="123 Main St, City" class="main-input" /></div>
        </div>
        <!-- Location -->
        <div *ngIf="qrType()==='location'" class="fields-row">
          <div class="field-group"><label>Latitude</label><input [(ngModel)]="lat" (ngModelChange)="buildContent()" placeholder="28.6139" class="main-input" /></div>
          <div class="field-group"><label>Longitude</label><input [(ngModel)]="lng" (ngModelChange)="buildContent()" placeholder="77.2090" class="main-input" /></div>
        </div>
      </div>

      <!-- Customization + Preview -->
      <div class="bottom-grid">
        <div class="customize-panel">
          <div class="panel-title">Customization</div>
          <div class="custom-fields">
            <div class="cf"><label>Foreground</label><input type="color" [(ngModel)]="fgColor" (ngModelChange)="generate()" class="cpick" /></div>
            <div class="cf"><label>Background</label><input type="color" [(ngModel)]="bgColor" (ngModelChange)="generate()" class="cpick" /></div>
            <div class="cf"><label>Size (px)</label>
              <select [(ngModel)]="size" (ngModelChange)="generate()" class="sel">
                <option value="200">200×200</option><option value="300">300×300</option><option value="400">400×400</option><option value="600">600×600</option>
              </select>
            </div>
            <div class="cf"><label>Error Correction</label>
              <select [(ngModel)]="errorLevel" (ngModelChange)="generate()" class="sel">
                <option value="L">L – 7%</option><option value="M">M – 15%</option><option value="Q">Q – 25%</option><option value="H">H – 30%</option>
              </select>
            </div>
          </div>
          <div class="char-count">Content: {{qrContent().length}} chars</div>
        </div>

        <div class="preview-panel">
          <div class="preview-title">QR Code Preview</div>
          <div class="qr-wrap">
            <div #qrContainer class="qr-container"></div>
            <div class="empty-qr" *ngIf="!qrContent()">Enter content above to generate QR code</div>
          </div>
          <div class="dl-buttons" *ngIf="qrContent()">
            <button class="btn-dl png" (click)="download('png')">⬇ PNG</button>
            <button class="btn-dl svg" (click)="download('svg')">⬇ SVG</button>
            <button class="btn-copy" (click)="copyContent()">📋 Copy Text</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wrap{padding:1.25rem}
    .type-tabs{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1.25rem;background:#f3f4f6;border-radius:10px;padding:.35rem}
    .type-tabs button{padding:.4rem .75rem;border:none;background:none;border-radius:7px;font-size:.78rem;font-weight:600;cursor:pointer;color:#6b7280;transition:all .15s;white-space:nowrap}
    .type-tabs button.active{background:white;color:#2563eb;box-shadow:0 1px 4px rgba(0,0,0,.1)}
    .input-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem;margin-bottom:1.25rem}
    .field-group{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.75rem}
    .field-group:last-child{margin-bottom:0}
    .fields-row{display:flex;flex-direction:column}
    .field-group label{font-size:.72rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em}
    .main-input{padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.9rem;outline:none;width:100%;box-sizing:border-box;transition:border-color .15s}
    .main-input:focus{border-color:#2563eb}
    .main-textarea{padding:.55rem .75rem;border:1px solid #d1d5db;border-radius:8px;font-size:.875rem;outline:none;width:100%;box-sizing:border-box;resize:vertical;font-family:inherit}
    .main-textarea:focus{border-color:#2563eb}
    .sel{padding:.45rem .6rem;border:1px solid #d1d5db;border-radius:7px;font-size:.85rem;background:white;outline:none}
    .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
    @media(max-width:680px){.bottom-grid{grid-template-columns:1fr}}
    .customize-panel,.preview-panel{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:1.25rem}
    .panel-title,.preview-title{font-size:.85rem;font-weight:800;margin-bottom:1rem;color:#111827}
    .custom-fields{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    .cf{display:flex;flex-direction:column;gap:.3rem}
    .cf label{font-size:.7rem;font-weight:700;color:#6b7280;text-transform:uppercase}
    .cpick{width:56px;height:36px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;padding:2px}
    .char-count{font-size:.72rem;color:#9ca3af;margin-top:.75rem}
    .qr-wrap{display:flex;justify-content:center;align-items:center;min-height:160px;margin-bottom:1rem}
    .qr-container canvas,.qr-container img{border-radius:8px;border:1px solid #e5e7eb}
    .empty-qr{font-size:.82rem;color:#9ca3af;text-align:center;padding:2rem}
    .dl-buttons{display:flex;gap:.5rem;flex-wrap:wrap}
    .btn-dl{padding:.5rem 1rem;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem;flex:1}
    .btn-dl.png{background:#2563eb;color:white}
    .btn-dl.svg{background:#7c3aed;color:white}
    .btn-copy{padding:.5rem 1rem;border:1px solid #e5e7eb;border-radius:8px;background:white;font-weight:700;cursor:pointer;font-size:.82rem}
  `]
})
export class QrGeneratorComponent implements OnInit {
  @ViewChild('qrContainer') qrContainer!: ElementRef;

  types = [
    {key:'url',label:'URL',icon:'🔗'},{key:'text',label:'Text',icon:'📝'},
    {key:'email',label:'Email',icon:'✉️'},{key:'phone',label:'Phone',icon:'📞'},
    {key:'sms',label:'SMS',icon:'💬'},{key:'wifi',label:'WiFi',icon:'📶'},
    {key:'vcard',label:'vCard',icon:'👤'},{key:'location',label:'Location',icon:'📍'},
  ];
  qrType = signal('url');
  qrContent = signal('');

  url = 'https://utilitymega.com';
  text = ''; email = ''; emailSubject = ''; emailBody = '';
  phone = ''; smsPhone = ''; smsMessage = '';
  wifiSSID = ''; wifiPass = ''; wifiSec = 'WPA'; wifiHidden = false;
  vcName = ''; vcPhone = ''; vcEmail = ''; vcOrg = ''; vcUrl = ''; vcAddr = '';
  lat = ''; lng = '';

  fgColor = '#000000'; bgColor = '#ffffff';
  size = '300'; errorLevel = 'M';
  private qrInstance: any = null;

  ngOnInit() {
    this.loadQRLib().then(() => { this.buildContent(); });
  }

  loadQRLib(): Promise<void> {
    return new Promise(resolve => {
      if (typeof QRCode !== 'undefined') { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  buildContent() {
    let content = '';
    switch (this.qrType()) {
      case 'url': content = this.url; break;
      case 'text': content = this.text; break;
      case 'email': content = `mailto:${this.email}?subject=${encodeURIComponent(this.emailSubject)}&body=${encodeURIComponent(this.emailBody)}`; break;
      case 'phone': content = `tel:${this.phone}`; break;
      case 'sms': content = `sms:${this.smsPhone}?body=${encodeURIComponent(this.smsMessage)}`; break;
      case 'wifi': content = `WIFI:T:${this.wifiSec};S:${this.wifiSSID};P:${this.wifiPass};H:${this.wifiHidden};;`; break;
      case 'vcard': content = `BEGIN:VCARD\nVERSION:3.0\nFN:${this.vcName}\nORG:${this.vcOrg}\nTEL:${this.vcPhone}\nEMAIL:${this.vcEmail}\nURL:${this.vcUrl}\nADR:;;${this.vcAddr};;;;\nEND:VCARD`; break;
      case 'location': content = `geo:${this.lat},${this.lng}`; break;
    }
    this.qrContent.set(content);
    setTimeout(() => this.generate(), 50);
  }

  generate() {
    if (!this.qrContent() || !this.qrContainer) return;
    const container = this.qrContainer.nativeElement;
    container.innerHTML = '';
    try {
      this.qrInstance = new QRCode(container, {
        text: this.qrContent(),
        width: parseInt(this.size),
        height: parseInt(this.size),
        colorDark: this.fgColor,
        colorLight: this.bgColor,
        correctLevel: (QRCode.CorrectLevel as any)[this.errorLevel] ?? QRCode.CorrectLevel.M
      });
    } catch(e) { container.innerHTML = '<div style="color:#dc2626;font-size:.8rem;padding:1rem">Content too large for QR code. Reduce text.</div>'; }
  }

  download(format: 'png'|'svg') {
    const canvas = this.qrContainer?.nativeElement?.querySelector('canvas');
    if (!canvas) return;
    if (format === 'png') {
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png');
      a.download = 'qrcode.png'; a.click();
    } else {
      const size = parseInt(this.size);
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image href="${canvas.toDataURL()}" width="${size}" height="${size}"/></svg>`;
      const blob = new Blob([svgContent], {type:'image/svg+xml'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'qrcode.svg'; a.click();
    }
  }

  copyContent() { navigator.clipboard.writeText(this.qrContent()); }
}
