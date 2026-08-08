import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { id: "introduction",           title: "1. Introduction & Who We Are" },
  { id: "data-collected",         title: "2. What Data We Collect" },
  { id: "how-we-use",             title: "3. How We Use Your Data" },
  { id: "legal-basis",            title: "4. Legal Basis for Processing" },
  { id: "data-sharing",           title: "5. Data Sharing & Third Parties" },
  { id: "international-transfers", title: "6. International Transfers" },
  { id: "data-retention",         title: "7. Data Retention" },
  { id: "your-rights",            title: "8. Your Rights" },
  { id: "data-security",          title: "9. Data Security" },
  { id: "cookies",                title: "10. Cookies" },
  { id: "childrens-data",         title: "11. Children's Data" },
  { id: "changes",                title: "12. Changes to This Policy" },
  { id: "contact",                title: "13. Contact & DPO Details" },
];

export default function PrivacyPage() {
  return (
    <main style={{ background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">

          {/* Header */}
          <div className="mb-12">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(13, 148, 136,0.1)", color: "#0d9488", border: "1px solid rgba(13, 148, 136,0.25)" }}
            >
              Legal
            </span>
            <h1 className="lp-serif text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
              Privacy Policy
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Last updated: June 2026 &nbsp;&middot;&nbsp; Cura Ltd, registered in England &amp; Wales
            </p>
          </div>

          {/* Table of Contents */}
          <div
            className="rounded-2xl p-6 mb-12"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
              Contents
            </h2>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="space-y-14">

            <div id="introduction">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. Introduction &amp; Who We Are</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>Cura Ltd (&ldquo;Cura&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a company registered in England and Wales. We operate the Cura care home management platform (the &ldquo;Service&rdquo;), which is provided to care home operators, care groups, and related organisations (our &ldquo;Customers&rdquo;) to help them manage resident care, staff, compliance, and operations.</p>
                <p>This Privacy Policy explains how we collect, use, store, disclose, and otherwise process personal data in connection with our website at curacareplatform.co.uk and the Cura platform. It applies to visitors to our website, prospective customers, Customer personnel (including care staff, managers, and administrators), and any other individuals whose personal data we process as a data controller.</p>
                <p>Where Cura processes personal data about care home residents on behalf of a Customer, we act as a data processor and the Customer is the data controller. In those circumstances, our processing activities are governed by a separate Data Processing Agreement (&ldquo;DPA&rdquo;) entered into with that Customer, and the Customer&rsquo;s own privacy notice applies to residents and their families.</p>
                <p>We are committed to protecting personal data and complying with the UK General Data Protection Regulation (&ldquo;UK GDPR&rdquo;) and the Data Protection Act 2018 (&ldquo;DPA 2018&rdquo;), as well as the Privacy and Electronic Communications Regulations 2003 (&ldquo;PECR&rdquo;).</p>
              </div>
            </div>

            <div id="data-collected">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>2. What Data We Collect</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Account and contact data:</span> When a Customer registers for or uses the Service, we collect names, job titles, work email addresses, telephone numbers, and employer details of the individuals who set up or administer the account.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Usage data:</span> We automatically collect information about how the Service is accessed and used, including IP addresses, browser type and version, operating system, referring URLs, pages viewed, features used, timestamps, and session duration.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Communications data:</span> If you contact us by email, telephone, live chat, or via our contact form, we record the content of those communications along with your contact details.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Marketing data:</span> Where you have opted in, we hold your name, email address, and marketing preferences in order to send newsletters, product updates, and event invitations.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Payment and billing data:</span> Billing information is collected and processed by our third-party payment processor, Stripe. Cura does not store full payment card numbers. We retain records of subscription tier, payment amounts, and invoicing history.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Health and care data (as data processor):</span> The Cura platform enables Customers to record and manage sensitive personal data about care home residents, including health information, medication records, care plans, and incident reports. This constitutes special category data under Article 9 UK GDPR. Cura processes this data strictly on the documented instructions of the Customer as data controller. If you are a resident or family member of a resident, please contact the care home directly.</p>
                <p><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Staff data held on behalf of Customers:</span> Customers may use the Cura platform to store employee records, including names, contact details, employment history, DBS certificate numbers, training records, and performance information. Cura processes this data as processor on behalf of the Customer.</p>
              </div>
            </div>

            <div id="how-we-use">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>3. How We Use Your Data</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We use personal data we control for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Providing, operating, and improving the Cura platform and our website</li>
                  <li>Creating and managing Customer accounts and user access</li>
                  <li>Processing payments, issuing invoices, and managing subscriptions</li>
                  <li>Responding to enquiries, support tickets, and complaints</li>
                  <li>Sending transactional communications such as password resets and service notifications</li>
                  <li>Sending marketing communications where you have consented or where we have a legitimate interest</li>
                  <li>Conducting product research and usability testing (only with explicit consent)</li>
                  <li>Monitoring platform security, detecting fraud, and investigating misuse</li>
                  <li>Complying with our legal and regulatory obligations</li>
                  <li>Aggregating anonymised data for product analytics and development</li>
                </ul>
              </div>
            </div>

            <div id="legal-basis">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>4. Legal Basis for Processing</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>Under Article 6 UK GDPR, we rely on the following lawful bases:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Contract (Article 6(1)(b)):</span> Processing necessary to perform our contract with Customers, including account management, delivering the Service, and processing payments.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Legitimate interests (Article 6(1)(f)):</span> Processing for our legitimate business interests, such as improving the platform, fraud prevention, and platform security.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Consent (Article 6(1)(a)):</span> Processing based on your freely given, specific, informed, and unambiguous consent — for example, opt-in marketing communications.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Legal obligation (Article 6(1)(c)):</span> Processing required to comply with our legal obligations, such as retaining financial records.</li>
                </ul>
                <p>Where we process special category data (health and care data about residents) on behalf of Customers as data processor, the Customer is responsible for establishing an Article 9 condition.</p>
              </div>
            </div>

            <div id="data-sharing">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>5. Data Sharing &amp; Third Parties</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We do not sell personal data. We may share personal data with the following categories of recipients:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Service providers and sub-processors:</span> Third parties who process data on our behalf under binding data processing agreements, including cloud hosting (Amazon Web Services), email delivery (SendGrid), payment processing (Stripe), and analytics.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Professional advisers:</span> Solicitors, accountants, auditors, and insurers who are bound by professional or contractual confidentiality obligations.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Regulatory and law enforcement bodies:</span> The ICO, CQC, HMRC, police, or courts where we are required or permitted to do so by law.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Business transferees:</span> In the event of a merger or acquisition, subject to the same privacy protections.</li>
                </ul>
              </div>
            </div>

            <div id="international-transfers">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>6. International Transfers</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>Cura stores and processes all Customer data on servers located in the United Kingdom and the European Economic Area. We do not routinely transfer this data outside those territories.</p>
                <p>Some of our third-party sub-processors may process data in the United States or other third countries. Where such transfers occur, we ensure appropriate safeguards are in place, including UK International Data Transfer Agreements (&ldquo;IDTAs&rdquo;) and EU Standard Contractual Clauses (&ldquo;SCCs&rdquo;) with the UK Addendum where applicable.</p>
              </div>
            </div>

            <div id="data-retention">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>7. Data Retention</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We retain personal data only for as long as is necessary for the purposes for which it was collected:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Account and Customer data:</span> Retained for the duration of the contract and for 7 years thereafter to comply with financial record-keeping obligations.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Resident and care records (held as processor):</span> Upon contract termination, Cura will provide the Customer with an export of their data and securely delete it within 90 days.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Server and access logs:</span> Retained for up to 12 months for security and debugging purposes.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Marketing communications data:</span> Retained until you unsubscribe or withdraw consent.</li>
                </ul>
              </div>
            </div>

            <div id="your-rights">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>8. Your Rights</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>Under UK GDPR, you have the following rights in respect of personal data we hold about you as a data controller:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right of access (Article 15):</span> Request a copy of the personal data we hold about you.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to rectification (Article 16):</span> Ask us to correct inaccurate or incomplete personal data.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to erasure (Article 17):</span> Ask us to delete your personal data where there is no compelling reason to continue processing it.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to restriction (Article 18):</span> Ask us to restrict processing in certain circumstances.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to data portability (Article 20):</span> Request your data in a structured, machine-readable format where applicable.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to object (Article 21):</span> Object to processing based on legitimate interests or for direct marketing purposes.</li>
                  <li><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Right to withdraw consent:</span> Withdraw consent at any time without affecting the lawfulness of prior processing.</li>
                </ul>
                <p>To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:dpo@curacareplatform.co.uk" className="underline underline-offset-2" style={{ color: "#0d9488" }}>dpo@curacareplatform.co.uk</a>. We will respond within one calendar month.</p>
                <p>You also have the right to lodge a complaint with the Information Commissioner&rsquo;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "#0d9488" }}>ico.org.uk</a> or by calling 0303 123 1113.</p>
              </div>
            </div>

            <div id="data-security">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>9. Data Security</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We implement and maintain appropriate technical and organisational security measures to protect personal data. Our security measures include:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Encryption of data in transit using TLS 1.2 or higher</li>
                  <li>Encryption of data at rest using AES-256</li>
                  <li>Role-based access controls and the principle of least privilege</li>
                  <li>Multi-factor authentication for administrative access</li>
                  <li>Regular penetration testing and vulnerability scanning</li>
                  <li>Comprehensive audit logging of all data access events</li>
                  <li>Formal incident response and data breach notification procedures</li>
                </ul>
              </div>
            </div>

            <div id="cookies">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>10. Cookies</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We use strictly necessary cookies to operate the Service (such as session authentication cookies), functional cookies to remember your preferences, and analytics cookies to understand how our website is used. We do not use advertising or tracking cookies for third-party marketing purposes.</p>
                <p>You can manage your cookie preferences at any time via the cookie banner on our website, or by adjusting your browser settings. Our full Cookie Policy is available at <a href="/cookies" className="underline underline-offset-2" style={{ color: "#0d9488" }}>/cookies</a>.</p>
              </div>
            </div>

            <div id="childrens-data">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>11. Children&rsquo;s Data</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>The Cura platform is designed for use by businesses and their adult employees and is not directed at individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have inadvertently done so, we will delete that information promptly.</p>
              </div>
            </div>

            <div id="changes">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>12. Changes to This Policy</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was most recently revised.</p>
                <p>Where changes are material, we will notify Customers by email or by posting a prominent notice within the Cura platform at least 30 days before the changes take effect.</p>
              </div>
            </div>

            <div id="contact">
              <h2 className="lp-serif text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>13. Contact &amp; DPO Details</h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <p>If you have any questions, concerns, or requests relating to this Privacy Policy, please contact:</p>
                <div
                  className="rounded-xl p-6 mt-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Data Protection Officer — Cura Ltd</p>
                  <p className="mt-2">
                    Email:{" "}
                    <a href="mailto:dpo@curacareplatform.co.uk" className="underline underline-offset-2" style={{ color: "#0d9488" }}>
                      dpo@curacareplatform.co.uk
                    </a>
                  </p>
                  <p className="mt-3">
                    ICO:{" "}
                    <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "#0d9488" }}>
                      ico.org.uk
                    </a>{" "}
                    &nbsp;&middot;&nbsp; 0303 123 1113
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
