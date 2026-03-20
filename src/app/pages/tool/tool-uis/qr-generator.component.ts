import { Component, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-ui">
      <div class="qr-layout">
        <!-- Left: inputs -->
        <div class="qr-inputs">
          <div class="type-tabs">
            <button *ngFor="let t of types" class="type-tab" [class.active]="qrType===t.key" (click)="setType(t.key)">
              {{ t.icon }} {{ t.label }}
            </button>
          </div>

          <!-- URL -->
          <div *ngIf="qrType==='url'" class="field">
            <label>Website URL</label>
            <input type="url" [(ngModel)]="urlVal" (input)="generate()" placeholder="https://utilitymega.com" />
          </div>

          <!-- Text -->
          <div *ngIf="qrType==='text'" class="field">
            <label>Text / Message</label>
            <textarea [(ngModel)]="textVal" (input)="generate()" rows="3" placeholder="Enter any text..."></textarea>
          </div>

          <!-- Email -->
          <div *ngIf="qrType==='email'" class="field-group">
            <div class="field"><label>Email Address</label><input type="email" [(ngModel)]="emailTo" (input)="generate()" placeholder="hello@example.com" /></div>
            <div class="field"><label>Subject</label><input type="text" [(ngModel)]="emailSubj" (input)="generate()" placeholder="Subject" /></div>
          </div>

          <!-- Phone -->
          <div *ngIf="qrType==='phone'" class="field">
            <label>Phone Number</label>
            <input type="tel" [(ngModel)]="phone" (input)="generate()" placeholder="+91 98765 43210" />
          </div>

          <!-- WiFi -->
          <div *ngIf="qrType==='wifi'" class="field-group">
            <div class="field"><label>Network Name (SSID)</label><input [(ngModel)]="wifiSSID" (input)="generate()" placeholder="My WiFi" /></div>
            <div class="field"><label>Password</label><input type="password" [(ngModel)]="wifiPass" (input)="generate()" placeholder="password" /></div>
            <div class="field"><label>Security</label>
              <select [(ngModel)]="wifiSec" (change)="generate()">
                <option>WPA</option><option>WEP</option><option>nopass</option>
              </select>
            </div>
          </div>

          <div class="customize">
            <div class="field-row">
              <div class="field"><label>Foreground Color</label><input type="color" [(ngModel)]="fgColor" (input)="generate()" /></div>
              <div class="field"><label>Background Color</label><input type="color" [(ngModel)]="bgColor" (input)="generate()" value="#ffffff" /></div>
              <div class="field"><label>Size (px)</label>
                <select [(ngModel)]="size" (change)="generate()">
                  <option value="200">200px</option><option value="300">300px</option>
                  <option value="400">400px</option><option value="512">512px</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: preview -->
        <div class="qr-preview">
          <div class="qr-canvas-wrap">
            <canvas #qrCanvas></canvas>
            <div class="qr-placeholder" *ngIf="!hasData()">
              <span>📱</span>
              <p>Enter data to generate QR</p>
            </div>
          </div>
          <div class="qr-actions" *ngIf="hasData()">
            <button class="dl-btn" (click)="download('png')">⬇️ Download PNG</button>
            <button class="dl-btn secondary" (click)="download('svg')">⬇️ Download SVG</button>
            <button class="dl-btn secondary" (click)="copyDataUrl()">{{ copied() ? '✓ Copied!' : '📋 Copy Image' }}</button>
          </div>
          <div class="qr-data-preview" *ngIf="qrData()">
            <span class="qd-label">Encoded Data:</span>
            <span class="qd-val">{{ qrData().substring(0, 60) }}{{ qrData().length > 60 ? '...' : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-ui { padding: 1.25rem; }
    .qr-layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; }
    .type-tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
    .type-tab { padding: .4rem .8rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card-bg); color: var(--text-muted); font-size: .8rem; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; }
    .type-tab.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .field { display: flex; flex-direction: column; gap: .3rem; margin-bottom: .85rem; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--text-muted); }
    .field input, .field textarea, .field select { padding: .55rem .75rem; border: 1.5px solid var(--border); border-radius: 8px; font-size: .88rem; background: var(--input-bg); color: var(--text); outline: none; font-family: inherit; width: 100%; box-sizing: border-box; }
    .field input[type=color] { height: 40px; padding: .2rem; cursor: pointer; }
    .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--primary); }
    .field-group { display: flex; flex-direction: column; }
    .field-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
    .customize { margin-top: .5rem; }
    .qr-preview { display: flex; flex-direction: column; gap: .75rem; align-items: center; }
    .qr-canvas-wrap { width: 220px; height: 220px; border-radius: 12px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; }
    .qr-canvas-wrap canvas { max-width: 100%; max-height: 100%; }
    .qr-placeholder { text-align: center; color: var(--text-muted); }
    .qr-placeholder span { font-size: 2.5rem; }
    .qr-placeholder p { font-size: .8rem; margin-top: .5rem; }
    .qr-actions { display: flex; flex-direction: column; gap: .4rem; width: 100%; }
    .dl-btn { padding: .6rem 1rem; border-radius: 9px; border: none; background: var(--primary); color: #fff; font-size: .83rem; font-weight: 700; cursor: pointer; text-align: center; font-family: inherit; transition: opacity .15s; }
    .dl-btn:hover { opacity: .88; }
    .dl-btn.secondary { background: var(--bg-alt); color: var(--text); border: 1.5px solid var(--border); }
    .qr-data-preview { width: 100%; padding: .5rem .6rem; background: var(--bg-alt); border-radius: 8px; font-size: .72rem; word-break: break-all; }
    .qd-label { font-weight: 700; color: var(--text-muted); display: block; margin-bottom: .2rem; }
    .qd-val { color: var(--text); }
    @media(max-width: 700px) { .qr-layout { grid-template-columns: 1fr; } .qr-preview { order: -1; } .field-row { grid-template-columns: 1fr; } }
  `]
})
export class QrGeneratorComponent implements AfterViewInit {
  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  types = [
    { key: 'url', icon: '🔗', label: 'URL' },
    { key: 'text', icon: '📝', label: 'Text' },
    { key: 'email', icon: '📧', label: 'Email' },
    { key: 'phone', icon: '📞', label: 'Phone' },
    { key: 'wifi', icon: '📶', label: 'WiFi' },
  ];

  qrType = 'url';
  urlVal = 'https://utilitymega.com';
  textVal = '';
  emailTo = ''; emailSubj = '';
  phone = '';
  wifiSSID = ''; wifiPass = ''; wifiSec = 'WPA';
  fgColor = '#000000';
  bgColor = '#ffffff';
  size = '300';
  copied = signal(false);
  qrData = signal('');

  ngAfterViewInit() { this.generate(); }

  setType(t: string) { this.qrType = t; this.generate(); }

  getData(): string {
    switch (this.qrType) {
      case 'url': return this.urlVal || '';
      case 'text': return this.textVal || '';
      case 'email': return `mailto:${this.emailTo}?subject=${encodeURIComponent(this.emailSubj)}`;
      case 'phone': return `tel:${this.phone}`;
      case 'wifi': return `WIFI:T:${this.wifiSec};S:${this.wifiSSID};P:${this.wifiPass};;`;
      default: return '';
    }
  }

  hasData() { return !!this.qrData(); }

  generate() {
    const data = this.getData();
    this.qrData.set(data);
    if (!data || !this.canvasRef) return;
    this.drawQR(data);
  }

  drawQR(data: string) {
    const canvas = this.canvasRef.nativeElement;
    const s = Number(this.size);
    canvas.width = s; canvas.height = s;
    const ctx = canvas.getContext('2d')!;

    // Simple QR-like pattern using a hash of the data
    // For production, use a real QR library (qrcode.js, qrcode-generator)
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, s, s);

    // We'll create an SVG-based QR using the qrcode endpoint simulation
    const img = new Image();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encodeURIComponent(data)}&color=${this.fgColor.replace('#', '')}&bgcolor=${this.bgColor.replace('#', '')}`;
    img.crossOrigin = 'anonymous';
    img.onload = () => { ctx.drawImage(img, 0, 0, s, s); };
    img.onerror = () => { this.drawFallbackQR(ctx, data, s); };
    img.src = qrUrl;
  }

  drawFallbackQR(ctx: CanvasRenderingContext2D, data: string, s: number) {
    // Simple pattern as fallback
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = this.fgColor;
    // Draw finder patterns
    [[0, 0], [s - 7 * (s / 25), 0], [0, s - 7 * (s / 25)]].forEach(([x, y]) => {
      const b = s / 25;
      ctx.fillRect(x, y, 7 * b, 7 * b);
      ctx.fillStyle = this.bgColor;
      ctx.fillRect(x + b, y + b, 5 * b, 5 * b);
      ctx.fillStyle = this.fgColor;
      ctx.fillRect(x + 2 * b, y + 2 * b, 3 * b, 3 * b);
    });
    ctx.font = `${s * 0.06}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', s / 2, s / 2);
    ctx.font = `${s * 0.04}px monospace`;
    ctx.fillText('(Offline mode)', s / 2, s / 2 + s * 0.08);
  }

  download(format: string) {
    const canvas = this.canvasRef.nativeElement;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qrcode-utilitymega.${format}`;
    a.click();
  }

  copyDataUrl() {
    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob(blob => {
      if (!blob) return;
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }).catch(() => {
        const url = canvas.toDataURL();
        navigator.clipboard.writeText(url);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    });
  }
}
