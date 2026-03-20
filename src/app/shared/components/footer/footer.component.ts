import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a routerLink="/" class="footer-logo">
              <img src="favicon.ico" alt="UtilityMega" class="foot-ico" />
              Utility<strong>Mega</strong>
            </a>
            <p>100+ free online tools for everyone. No login, no cost, no limits. Built for speed and privacy.</p>
            <div class="footer-social">
              <a href="#" aria-label="Twitter/X">𝕏</a>
              <a href="#" aria-label="YouTube">▶</a>
              <a href="#" aria-label="Telegram">✈</a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Top Tools</h4>
            <a routerLink="/calculators/sip-calculator">SIP Calculator</a>
            <a routerLink="/calculators/emi-calculator">EMI Calculator</a>
            <a routerLink="/developer-tools/json-formatter">JSON Formatter</a>
            <a routerLink="/security-tools/password-generator">Password Generator</a>
            <a routerLink="/utility-tools/qr-code-generator">QR Code Generator</a>
          </div>

          <div class="footer-col">
            <h4>Categories</h4>
            <a routerLink="/calculators">🧮 Calculators</a>
            <a routerLink="/image-tools">🖼️ Image Tools</a>
            <a routerLink="/developer-tools">💻 Developer Tools</a>
            <a routerLink="/seo-tools">📈 SEO Tools</a>
            <a routerLink="/farmers-tools">🌾 Farmers Tools</a>
          </div>

          <div class="footer-col">
            <h4>Company</h4>
            <a routerLink="/about">About Us</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/terms">Terms of Use</a>
            <a routerLink="/sitemap">Sitemap</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© {{ year }} UtilityMega — Free Tools, Forever.</span>
          <div class="foot-badges">
            <span class="fbadge">🆓 Always Free</span>
            <span class="fbadge">🔒 No Login</span>
            <span class="fbadge">⚡ Instant Results</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer { background: #0d1526; color: #64748b; margin-top: 4rem; border-top: 1px solid #1e293b; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.25rem; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2.5rem; padding: 3rem 0 2rem; }
    .footer-brand p { font-size: .85rem; line-height: 1.7; margin-top: .75rem; color: #475569; }
    .footer-logo { display: flex; align-items: center; gap: .5rem; text-decoration: none; color: #94a3b8; font-size: 1.1rem; font-weight: 800; }
    .footer-logo strong { color: #fbbf24; }
    .foot-ico { width: 22px; height: 22px; border-radius: 5px; }
    .footer-social { display: flex; gap: .6rem; margin-top: 1rem; }
    .footer-social a { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #1e293b; border-radius: 8px; color: #64748b; text-decoration: none; font-size: .9rem; transition: all .15s; border: 1px solid #253556; }
    .footer-social a:hover { background: #2563eb; color: #fff; border-color: #2563eb; }
    .footer-col { display: flex; flex-direction: column; gap: .5rem; }
    .footer-col h4 { color: #e2e8f0; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .35rem; }
    .footer-col a { color: #475569; text-decoration: none; font-size: .85rem; transition: color .15s; }
    .footer-col a:hover { color: #60a5fa; }
    .footer-bottom { border-top: 1px solid #1e293b; padding: 1.25rem 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; font-size: .82rem; }
    .foot-badges { display: flex; gap: .5rem; flex-wrap: wrap; }
    .fbadge { font-size: .72rem; padding: .2rem .55rem; background: #1e293b; border-radius: 99px; color: #64748b; border: 1px solid #253556; }
    @media(max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } .footer-brand { grid-column: 1/-1; } }
    @media(max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } .footer-bottom { flex-direction: column; align-items: flex-start; } }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
