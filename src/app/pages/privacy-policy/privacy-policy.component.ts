import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  template: `
    <div class="page-wrap">

      <section class="policy-hero">
        <div class="container">
          <div class="hero-label">Legal</div>
          <h1>Privacy Policy</h1>
          <p class="updated">Last updated: January 1, 2025</p>
          <p class="hero-sub">Your privacy matters to us. Here's exactly what we do (and don't do) with your data.</p>
        </div>
      </section>

      <div class="section">
        <div class="container policy-layout">

          <!-- TOC -->
          <nav class="toc">
            <div class="toc-title">Contents</div>
            <a href="#overview" class="toc-link">1. Overview</a>
            <a href="#data-collected" class="toc-link">2. Data We Collect</a>
            <a href="#browser-processing" class="toc-link">3. Browser-Based Processing</a>
            <a href="#cookies" class="toc-link">4. Cookies & Analytics</a>
            <a href="#third-party" class="toc-link">5. Third-Party Services</a>
            <a href="#advertising" class="toc-link">6. Advertising</a>
            <a href="#data-security" class="toc-link">7. Data Security</a>
            <a href="#children" class="toc-link">8. Children's Privacy</a>
            <a href="#your-rights" class="toc-link">9. Your Rights</a>
            <a href="#changes" class="toc-link">10. Policy Changes</a>
            <a href="#contact-privacy" class="toc-link">11. Contact</a>
          </nav>

          <!-- Content -->
          <article class="policy-content">

            <div class="highlight-box" id="overview">
              <div class="highlight-icon">🔒</div>
              <div>
                <strong>The short version:</strong> UtilityMega processes everything in your browser. We don't upload your files, we don't store your text, and we don't sell your data. Ever.
              </div>
            </div>

            <h2 id="data-collected">2. Data We Collect</h2>
            <p>UtilityMega collects minimal data to operate the website effectively. We may collect:</p>
            <ul>
              <li><strong>Usage data:</strong> Pages visited, time spent on pages, and general navigation patterns (via anonymized analytics).</li>
              <li><strong>Device information:</strong> Browser type, operating system, and screen resolution for compatibility optimization.</li>
              <li><strong>IP address:</strong> Used for geographic analytics and security purposes. Not linked to personal identity.</li>
            </ul>
            <p>We do <strong>not</strong> collect: names, email addresses (unless you contact us voluntarily), files you process with our tools, text you enter into our tools, or any personally identifiable information without explicit consent.</p>

            <h2 id="browser-processing">3. Browser-Based Processing</h2>
            <p>All tool functionality on UtilityMega runs entirely within your browser using JavaScript, WebAssembly, and browser APIs (Canvas API, Web Crypto API, FFmpeg.wasm, etc.).</p>
            <p>This means:</p>
            <ul>
              <li>Files you compress, resize, or convert are never uploaded to our servers.</li>
              <li>Text you enter into formatters, converters, or calculators is never transmitted anywhere.</li>
              <li>Passwords you generate exist only in your browser's memory and are discarded when you close the tab.</li>
              <li>Images you process remain on your device throughout the entire process.</li>
            </ul>
            <div class="info-box">
              <strong>Technical note:</strong> You can verify this by opening your browser's Network tab (DevTools → Network) while using any tool. You will see no file upload requests to our servers.
            </div>

            <h2 id="cookies">4. Cookies & Analytics</h2>
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Analytics:</strong> Anonymized usage statistics to understand which tools are popular and how to improve the site.</li>
              <li><strong>Preferences:</strong> Remembering your theme preference (light/dark mode) and other UI settings.</li>
              <li><strong>Performance:</strong> Caching static assets for faster page loads.</li>
            </ul>
            <p>We do not use cookies to track you across other websites or to build advertising profiles.</p>

            <h2 id="third-party">5. Third-Party Services</h2>
            <p>UtilityMega may use the following third-party services, each with their own privacy policies:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Anonymized website traffic analysis. IP anonymization is enabled.</li>
              <li><strong>Google Fonts / CDN libraries:</strong> Loading web fonts and JavaScript libraries. These may log requests.</li>
              <li><strong>Google AdSense:</strong> Serving contextual advertisements. See Section 6 for details.</li>
            </ul>

            <h2 id="advertising">6. Advertising</h2>
            <p>UtilityMega displays advertisements served by Google AdSense to support free tool development. Google may use cookies to serve ads based on your prior visits to this and other websites.</p>
            <p>You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google's Ad Settings</a>.</p>

            <h2 id="data-security">7. Data Security</h2>
            <p>We implement appropriate technical measures to protect the limited data we do collect:</p>
            <ul>
              <li>All connections to UtilityMega are encrypted via HTTPS/TLS.</li>
              <li>We do not store sensitive data on our servers.</li>
              <li>Access to any collected analytics data is restricted to authorized personnel.</li>
            </ul>

            <h2 id="children">8. Children's Privacy</h2>
            <p>UtilityMega does not knowingly collect personal information from children under 13 years of age. Our tools are general-purpose utilities suitable for all ages, but we do not specifically target children. If you believe a child has provided us personal information, please contact us and we will delete it promptly.</p>

            <h2 id="your-rights">9. Your Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul>
              <li>The right to access any personal data we hold about you.</li>
              <li>The right to request deletion of your data.</li>
              <li>The right to opt out of analytics tracking (use browser's Do Not Track setting or an ad blocker).</li>
              <li>GDPR rights for EU residents and CCPA rights for California residents.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:info@utilitymega.com">{{'info@utilitymega.com'}}</a>.</p>

            <h2 id="changes">10. Policy Changes</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of UtilityMega after changes constitutes acceptance of the updated policy.</p>

            <h2 id="contact-privacy">11. Contact</h2>
            <p>For any privacy-related questions or requests, contact us at:</p>
            <div class="contact-box">
              <strong>UtilityMega</strong><br>
              Email: <a href="mailto:info@utilitymega.com">{{'info@utilitymega.com'}}</a>
            </div>

          </article>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { min-height: 60vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; }

    .policy-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%); color: white; padding: 4rem 1.25rem 3rem; }
    .hero-label { display: inline-block; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #93c5fd; background: rgba(147,197,253,.1); border: 1px solid rgba(147,197,253,.2); border-radius: 99px; padding: .3rem .9rem; margin-bottom: 1.25rem; }
    .policy-hero h1 { font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 900; margin-bottom: .5rem; }
    .updated { font-size: .8rem; opacity: .6; margin-bottom: .5rem; }
    .hero-sub { opacity: .8; font-size: 1rem; }

    .section { padding: 3rem 1.25rem 4rem; }

    .policy-layout { display: grid; grid-template-columns: 220px 1fr; gap: 3rem; align-items: start; }

    /* TOC */
    .toc { position: sticky; top: 80px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; }
    .toc-title { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; margin-bottom: .75rem; }
    .toc-link { display: block; color: #4b5563; text-decoration: none; font-size: .8rem; padding: .3rem 0; border-bottom: 1px solid #f3f4f6; transition: color .12s; }
    .toc-link:last-child { border-bottom: none; }
    .toc-link:hover { color: #2563eb; }

    /* Article */
    .policy-content h2 { font-size: 1.2rem; font-weight: 800; margin: 2rem 0 .75rem; padding-top: .5rem; border-top: 1px solid #f3f4f6; }
    .policy-content h2:first-of-type { margin-top: 1.5rem; }
    .policy-content p { color: #374151; font-size: .9rem; line-height: 1.8; margin-bottom: .9rem; }
    .policy-content ul { padding-left: 1.25rem; margin-bottom: .9rem; }
    .policy-content li { color: #374151; font-size: .9rem; line-height: 1.8; margin-bottom: .3rem; }
    .policy-content a { color: #2563eb; }

    .highlight-box { display: flex; gap: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 1.25rem; margin-bottom: 1.75rem; font-size: .875rem; line-height: 1.7; color: #1e40af; }
    .highlight-icon { font-size: 1.5rem; flex-shrink: 0; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.25rem; font-size: .825rem; color: #166534; margin: 1rem 0; line-height: 1.65; }
    .contact-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem 1.25rem; font-size: .875rem; line-height: 1.8; margin-top: .75rem; }

    @media (max-width: 768px) {
      .policy-layout { grid-template-columns: 1fr; }
      .toc { position: static; }
    }
  `]
})
export class PrivacyPolicyComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.updateMeta({
      title: 'Privacy Policy — UtilityMega',
      description: 'UtilityMega Privacy Policy. We process everything in your browser — no file uploads, no data storage, no tracking. 100% private.',
      url: 'https://utilitymega.com/privacy-policy'
    });
  }
}
