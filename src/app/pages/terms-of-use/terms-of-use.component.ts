import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  template: `
    <div class="page-wrap">

      <section class="policy-hero">
        <div class="container">
          <div class="hero-label">Legal</div>
          <h1>Terms of Use</h1>
          <p class="updated">Last updated: January 1, 2025</p>
          <p class="hero-sub">By using UtilityMega, you agree to these terms. They're written in plain English — no legalese.</p>
        </div>
      </section>

      <div class="section">
        <div class="container policy-layout">

          <!-- TOC -->
          <nav class="toc">
            <div class="toc-title">Contents</div>
            <a href="#acceptance" class="toc-link">1. Acceptance</a>
            <a href="#description" class="toc-link">2. Service Description</a>
            <a href="#permitted-use" class="toc-link">3. Permitted Use</a>
            <a href="#prohibited-use" class="toc-link">4. Prohibited Use</a>
            <a href="#ip" class="toc-link">5. Intellectual Property</a>
            <a href="#disclaimer" class="toc-link">6. Disclaimer</a>
            <a href="#liability" class="toc-link">7. Limitation of Liability</a>
            <a href="#third-party-links" class="toc-link">8. Third-Party Links</a>
            <a href="#changes" class="toc-link">9. Changes to Service</a>
            <a href="#governing" class="toc-link">10. Governing Law</a>
            <a href="#contact-terms" class="toc-link">11. Contact</a>
          </nav>

          <!-- Content -->
          <article class="policy-content">

            <div class="highlight-box">
              <div class="highlight-icon">📋</div>
              <div>
                <strong>Summary:</strong> Use our tools for lawful purposes, don't try to abuse the service, and understand that tools are provided "as is" without guarantees. That's the core of it.
              </div>
            </div>

            <h2 id="acceptance">1. Acceptance of Terms</h2>
            <p>By accessing or using UtilityMega ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.</p>
            <p>These terms apply to all visitors, users, and others who access or use UtilityMega, including all tools, pages, and features available at utilitymega.com.</p>

            <h2 id="description">2. Service Description</h2>
            <p>UtilityMega provides a collection of free online utility tools including, but not limited to:</p>
            <ul>
              <li>Financial calculators (SIP, EMI, compound interest)</li>
              <li>Image processing tools (compress, resize, convert)</li>
              <li>Video processing tools (compress, convert)</li>
              <li>Developer utilities (JSON formatter, Base64 encoder)</li>
              <li>Text tools (word counter, case converter)</li>
              <li>Security tools (password generator, hash generator)</li>
              <li>SEO tools (meta tag generator, keyword density checker)</li>
              <li>Unit converters and other utility tools</li>
            </ul>
            <p>All tools are provided free of charge. No account registration is required to use any tool.</p>

            <h2 id="permitted-use">3. Permitted Use</h2>
            <p>You may use UtilityMega for any lawful personal, educational, or commercial purpose, including:</p>
            <ul>
              <li>Processing your own files and data</li>
              <li>Using tool results for personal or business projects</li>
              <li>Sharing links to specific tools with others</li>
              <li>Referencing UtilityMega in educational or professional contexts</li>
            </ul>

            <h2 id="prohibited-use">4. Prohibited Use</h2>
            <p>You agree not to use UtilityMega to:</p>
            <ul>
              <li>Engage in any unlawful activity or violate applicable laws</li>
              <li>Attempt to reverse engineer, hack, or compromise the website's security</li>
              <li>Use automated bots or scrapers to access the Service at scale without permission</li>
              <li>Attempt to introduce malware, viruses, or other harmful code</li>
              <li>Misrepresent the source of any content processed using our tools</li>
              <li>Use the Service in any way that could damage, disable, or impair it</li>
            </ul>

            <h2 id="ip">5. Intellectual Property</h2>
            <p><strong>Our content:</strong> The UtilityMega website design, source code, logos, and original content are owned by UtilityMega and protected by applicable intellectual property laws.</p>
            <p><strong>Your content:</strong> You retain full ownership of any files, text, or data you process using our tools. We make no claim to any content you create or transform using UtilityMega tools.</p>
            <p><strong>Open-source components:</strong> Some tools use open-source libraries (e.g., FFmpeg.wasm). These are subject to their respective open-source licenses.</p>

            <h2 id="disclaimer">6. Disclaimer of Warranties</h2>
            <p>UtilityMega is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:</p>
            <ul>
              <li>The Service will be uninterrupted, error-free, or free of viruses</li>
              <li>Tool results will be accurate for every input or use case</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
            <div class="warning-box">
              <strong>Important for financial tools:</strong> SIP calculators, EMI calculators, and other financial tools provide estimates for planning purposes only. They are not financial advice. Always consult a qualified financial advisor before making investment or borrowing decisions.
            </div>

            <h2 id="liability">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, UtilityMega shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Service — including but not limited to loss of data, loss of profits, or business interruption.</p>
            <p>Our total liability for any claim arising from your use of the Service shall not exceed the amount you paid to use it (which is zero, as the Service is free).</p>

            <h2 id="third-party-links">8. Third-Party Links</h2>
            <p>UtilityMega may contain links to third-party websites. These links are provided for convenience only. We have no control over third-party content and accept no responsibility for it. Visiting third-party sites is at your own risk.</p>

            <h2 id="changes">9. Changes to Service</h2>
            <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. We may add new tools, remove existing tools, or change tool functionality. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.</p>

            <h2 id="governing">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in India.</p>

            <h2 id="contact-terms">11. Contact</h2>
            <p>If you have any questions about these Terms of Use, please contact us at:</p>
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

    .toc { position: sticky; top: 80px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; }
    .toc-title { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6b7280; margin-bottom: .75rem; }
    .toc-link { display: block; color: #4b5563; text-decoration: none; font-size: .8rem; padding: .3rem 0; border-bottom: 1px solid #f3f4f6; transition: color .12s; }
    .toc-link:last-child { border-bottom: none; }
    .toc-link:hover { color: #2563eb; }

    .policy-content h2 { font-size: 1.2rem; font-weight: 800; margin: 2rem 0 .75rem; padding-top: .5rem; border-top: 1px solid #f3f4f6; }
    .policy-content h2:first-of-type { margin-top: 1.5rem; }
    .policy-content p { color: #374151; font-size: .9rem; line-height: 1.8; margin-bottom: .9rem; }
    .policy-content ul { padding-left: 1.25rem; margin-bottom: .9rem; }
    .policy-content li { color: #374151; font-size: .9rem; line-height: 1.8; margin-bottom: .3rem; }
    .policy-content a { color: #2563eb; }

    .highlight-box { display: flex; gap: 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 1.25rem; margin-bottom: 1.75rem; font-size: .875rem; line-height: 1.7; color: #1e40af; }
    .highlight-icon { font-size: 1.5rem; flex-shrink: 0; }
    .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem 1.25rem; font-size: .825rem; color: #92400e; margin: 1rem 0; line-height: 1.65; }
    .contact-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem 1.25rem; font-size: .875rem; line-height: 1.8; margin-top: .75rem; }

    @media (max-width: 768px) {
      .policy-layout { grid-template-columns: 1fr; }
      .toc { position: static; }
    }
  `]
})
export class TermsOfUseComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.updateMeta({
      title: 'Terms of Use — UtilityMega',
      description: 'UtilityMega Terms of Use. Free to use for lawful purposes. Tools provided as-is. Read our full terms before using the service.',
      url: 'https://utilitymega.com/terms-of-use'
    });
  }
}
