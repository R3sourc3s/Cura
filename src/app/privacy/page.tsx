import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { id: "introduction", title: "1. Introduction & Who We Are" },
  { id: "data-collected", title: "2. What Data We Collect" },
  { id: "how-we-use", title: "3. How We Use Your Data" },
  { id: "legal-basis", title: "4. Legal Basis for Processing" },
  { id: "data-sharing", title: "5. Data Sharing & Third Parties" },
  { id: "international-transfers", title: "6. International Transfers" },
  { id: "data-retention", title: "7. Data Retention" },
  { id: "your-rights", title: "8. Your Rights" },
  { id: "data-security", title: "9. Data Security" },
  { id: "cookies", title: "10. Cookies" },
  { id: "childrens-data", title: "11. Children's Data" },
  { id: "changes", title: "12. Changes to This Policy" },
  { id: "contact", title: "13. Contact & DPO Details" },
];

export default function PrivacyPage() {
  return (
    <main style={{ background: "#050914", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
              }}
            >
              Legal
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-sm">
              Last updated: May 2025 &nbsp;&middot;&nbsp; Cura Ltd, registered in England &amp; Wales
            </p>
          </div>

          {/* Table of Contents */}
          <div
            className="rounded-2xl p-6 mb-12"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
              Contents
            </h2>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="prose-legal space-y-14">

            {/* 1 */}
            <div id="introduction">
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction &amp; Who We Are</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Cura Ltd (&ldquo;Cura&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a company registered in England and Wales. We operate the Cura care home management platform (the &ldquo;Service&rdquo;), which is provided to care home operators, care groups, and related organisations (our &ldquo;Customers&rdquo;) to help them manage resident care, staff, compliance, and operations.
                </p>
                <p>
                  This Privacy Policy explains how we collect, use, store, disclose, and otherwise process personal data in connection with our website at curacareplatform.co.uk and the Cura platform. It applies to visitors to our website, prospective customers, Customer personnel (including care staff, managers, and administrators), and any other individuals whose personal data we process as a data controller.
                </p>
                <p>
                  Where Cura processes personal data about care home residents on behalf of a Customer, we act as a data processor and the Customer is the data controller. In those circumstances, our processing activities are governed by a separate Data Processing Agreement (&ldquo;DPA&rdquo;) entered into with that Customer, and the Customer&rsquo;s own privacy notice applies to residents and their families.
                </p>
                <p>
                  We are committed to protecting personal data and complying with the UK General Data Protection Regulation (&ldquo;UK GDPR&rdquo;) and the Data Protection Act 2018 (&ldquo;DPA 2018&rdquo;), as well as the Privacy and Electronic Communications Regulations 2003 (&ldquo;PECR&rdquo;).
                </p>
              </div>
            </div>

            {/* 2 */}
            <div id="data-collected">
              <h2 className="text-xl font-bold text-white mb-4">2. What Data We Collect</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p><span className="text-white font-semibold">Account and contact data:</span> When a Customer registers for or uses the Service, we collect names, job titles, work email addresses, telephone numbers, and employer details of the individuals who set up or administer the account.</p>
                <p><span className="text-white font-semibold">Usage data:</span> We automatically collect information about how the Service is accessed and used, including IP addresses, browser type and version, operating system, referring URLs, pages viewed, features used, timestamps, and session duration. This data is collected via server logs and analytics tools.</p>
                <p><span className="text-white font-semibold">Communications data:</span> If you contact us by email, telephone, live chat, or via our contact form, we record the content of those communications along with your contact details.</p>
                <p><span className="text-white font-semibold">Marketing data:</span> Where you have opted in, we hold your name, email address, and marketing preferences in order to send newsletters, product updates, and event invitations.</p>
                <p><span className="text-white font-semibold">Payment and billing data:</span> Billing information is collected and processed by our third-party payment processor, Stripe. Cura does not store full payment card numbers. We retain records of subscription tier, payment amounts, and invoicing history.</p>
                <p><span className="text-white font-semibold">Health and care data (as data processor):</span> The Cura platform enables Customers to record and manage sensitive personal data about care home residents, including health information, medication records, care plans, and incident reports. This constitutes special category data under Article 9 UK GDPR. Cura processes this data strictly on the documented instructions of the Customer as data controller. If you are a resident or family member of a resident, please contact the care home directly for information about how your data is used.</p>
                <p><span className="text-white font-semibold">Staff data held on behalf of Customers:</span> Customers may use the Cura platform to store employee records, including names, contact details, employment history, DBS certificate numbers, training records, and performance information. Cura processes this data as processor on behalf of the Customer.</p>
              </div>
            </div>

            {/* 3 */}
            <div id="how-we-use">
              <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Data</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We use personal data we control for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Providing, operating, and improving the Cura platform and our website</li>
                  <li>Creating and managing Customer accounts and user access</li>
                  <li>Processing payments, issuing invoices, and managing subscriptions</li>
                  <li>Responding to enquiries, support tickets, and complaints</li>
                  <li>Sending transactional communications such as password resets and service notifications</li>
                  <li>Sending marketing communications where you have consented or where we have a legitimate interest (with an opt-out available at any time)</li>
                  <li>Conducting product research and usability testing (only with explicit consent)</li>
                  <li>Monitoring platform security, detecting fraud, and investigating misuse</li>
                  <li>Complying with our legal and regulatory obligations</li>
                  <li>Enforcing our Terms of Service and other agreements</li>
                  <li>Aggregating anonymised data for product analytics and development</li>
                </ul>
              </div>
            </div>

            {/* 4 */}
            <div id="legal-basis">
              <h2 className="text-xl font-bold text-white mb-4">4. Legal Basis for Processing</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>Under Article 6 UK GDPR, we rely on the following lawful bases:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="text-white">Contract (Article 6(1)(b)):</span> Processing necessary to perform our contract with Customers, including account management, delivering the Service, and processing payments.</li>
                  <li><span className="text-white">Legitimate interests (Article 6(1)(f)):</span> Processing for our legitimate business interests, such as improving the platform, fraud prevention, platform security, and sending relevant marketing to existing customers, where these interests are not overridden by your rights.</li>
                  <li><span className="text-white">Consent (Article 6(1)(a)):</span> Processing based on your freely given, specific, informed, and unambiguous consent — for example, opt-in marketing communications to non-customers or optional research participation.</li>
                  <li><span className="text-white">Legal obligation (Article 6(1)(c)):</span> Processing required to comply with our legal obligations, such as retaining financial records under the Companies Act 2006 or responding to lawful requests from public authorities.</li>
                </ul>
                <p>Where we process special category data (namely health and care data about residents) on behalf of Customers as data processor, the Customer is responsible for establishing an Article 9 condition. Cura&rsquo;s DPA requires Customers to confirm the applicable Article 9 basis, typically Article 9(2)(h) (health or social care purposes) or Article 9(2)(a) (explicit consent).</p>
                <p>Where we process special category data in our capacity as controller — for example, information about our own employees — we rely on Article 9(2)(b) (employment obligations) and Schedule 1, Part 1 of the DPA 2018.</p>
              </div>
            </div>

            {/* 5 */}
            <div id="data-sharing">
              <h2 className="text-xl font-bold text-white mb-4">5. Data Sharing &amp; Third Parties</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We do not sell personal data. We may share personal data with the following categories of recipients:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="text-white">Service providers and sub-processors:</span> Third parties who process data on our behalf under binding data processing agreements, including cloud hosting (Amazon Web Services), email delivery (SendGrid), payment processing (Stripe), analytics (Google Analytics), and customer support tooling.</li>
                  <li><span className="text-white">Professional advisers:</span> Solicitors, accountants, auditors, and insurers who are bound by professional or contractual confidentiality obligations.</li>
                  <li><span className="text-white">Regulatory and law enforcement bodies:</span> The Information Commissioner&rsquo;s Office (&ldquo;ICO&rdquo;), Care Quality Commission (&ldquo;CQC&rdquo;), HMRC, police, or courts where we are required or permitted to do so by law.</li>
                  <li><span className="text-white">Business transferees:</span> In the event of a merger, acquisition, or sale of all or substantially all of our business assets, personal data may be transferred to the acquirer, subject to the same privacy protections.</li>
                </ul>
                <p>We require all third parties to treat personal data in accordance with applicable law and to implement appropriate technical and organisational security measures.</p>
              </div>
            </div>

            {/* 6 */}
            <div id="international-transfers">
              <h2 className="text-xl font-bold text-white mb-4">6. International Transfers</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>Cura stores and processes all Customer data, including resident and staff data, on servers located in the United Kingdom and the European Economic Area. We do not routinely transfer this data outside those territories.</p>
                <p>Some of our third-party sub-processors may process data in the United States or other third countries. Where such transfers occur, we ensure appropriate safeguards are in place, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>UK International Data Transfer Agreements (&ldquo;IDTAs&rdquo;) based on the UK Secretary of State&rsquo;s approved form</li>
                  <li>EU Standard Contractual Clauses (&ldquo;SCCs&rdquo;) with the UK Addendum where applicable</li>
                  <li>Adequacy decisions made by the UK Secretary of State</li>
                </ul>
                <p>You may request a copy of the relevant transfer mechanisms by contacting our Data Protection Officer at the address below.</p>
              </div>
            </div>

            {/* 7 */}
            <div id="data-retention">
              <h2 className="text-xl font-bold text-white mb-4">7. Data Retention</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We retain personal data only for as long as is necessary for the purposes for which it was collected, and in accordance with our legal obligations. Our standard retention periods are:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="text-white">Account and Customer data:</span> Retained for the duration of the contract and for 7 years thereafter to comply with financial record-keeping obligations under the Companies Act 2006 and HMRC requirements.</li>
                  <li><span className="text-white">Resident and care records (held as processor):</span> Retained in accordance with the Customer&rsquo;s data retention policy and the NHS Records Management Code of Practice 2021. Upon contract termination, Cura will provide the Customer with an export of their data and securely delete it within 90 days, unless required by law to retain it longer.</li>
                  <li><span className="text-white">Staff records (held as processor):</span> Retained in accordance with the Customer&rsquo;s HR policies. Minimum retention periods specified in employment law apply.</li>
                  <li><span className="text-white">Server and access logs:</span> Retained for up to 12 months for security and debugging purposes.</li>
                  <li><span className="text-white">Marketing communications data:</span> Retained until you unsubscribe or withdraw consent, at which point we will suppress rather than delete your email address to honour your opt-out.</li>
                </ul>
                <p>When data is no longer required, it is securely deleted or anonymised in accordance with our data disposal procedures.</p>
              </div>
            </div>

            {/* 8 */}
            <div id="your-rights">
              <h2 className="text-xl font-bold text-white mb-4">8. Your Rights</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>Under UK GDPR, you have the following rights in respect of personal data we hold about you as a data controller:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="text-white">Right of access (Article 15):</span> You may request a copy of the personal data we hold about you and information about how we use it.</li>
                  <li><span className="text-white">Right to rectification (Article 16):</span> You may ask us to correct inaccurate or incomplete personal data.</li>
                  <li><span className="text-white">Right to erasure (Article 17):</span> You may ask us to delete your personal data where there is no compelling reason for us to continue processing it, subject to our legal obligations.</li>
                  <li><span className="text-white">Right to restriction (Article 18):</span> You may ask us to restrict processing of your personal data in certain circumstances, for example while the accuracy of data is contested.</li>
                  <li><span className="text-white">Right to data portability (Article 20):</span> Where processing is based on consent or contract and carried out by automated means, you may request your data in a structured, commonly used, machine-readable format.</li>
                  <li><span className="text-white">Right to object (Article 21):</span> You have the right to object to processing based on legitimate interests or for direct marketing purposes.</li>
                  <li><span className="text-white">Rights related to automated decision-making (Article 22):</span> You have the right not to be subject to decisions made solely by automated means where those decisions produce significant effects, unless certain exceptions apply.</li>
                  <li><span className="text-white">Right to withdraw consent:</span> Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of prior processing.</li>
                </ul>
                <p>To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:dpo@curacareplatform.co.uk" className="text-purple-400 hover:text-purple-300">dpo@curacareplatform.co.uk</a>. We will respond within one calendar month. We may ask you to verify your identity before processing your request.</p>
                <p>If you are a resident or family member of a resident and wish to exercise your rights in respect of data held on the Cura platform, please contact the relevant care home directly, as they are the data controller for that data. We will assist Customers in responding to such requests as required by our DPA.</p>
                <p>You also have the right to lodge a complaint with the Information Commissioner&rsquo;s Office (&ldquo;ICO&rdquo;) at ico.org.uk or by calling 0303 123 1113.</p>
              </div>
            </div>

            {/* 9 */}
            <div id="data-security">
              <h2 className="text-xl font-bold text-white mb-4">9. Data Security</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We implement and maintain appropriate technical and organisational security measures to protect personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access. Our security measures include:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Encryption of data in transit using TLS 1.2 or higher</li>
                  <li>Encryption of data at rest using AES-256</li>
                  <li>Role-based access controls and the principle of least privilege</li>
                  <li>Multi-factor authentication for administrative access</li>
                  <li>Regular penetration testing and vulnerability scanning</li>
                  <li>Automated intrusion detection and alerting</li>
                  <li>Comprehensive audit logging of all data access events</li>
                  <li>Regular security training for all Cura personnel</li>
                  <li>Formal incident response and data breach notification procedures</li>
                </ul>
                <p>Notwithstanding these measures, no method of transmission over the internet or electronic storage is completely secure. If you have reason to believe that your interaction with us is no longer secure, please notify us immediately.</p>
              </div>
            </div>

            {/* 10 */}
            <div id="cookies">
              <h2 className="text-xl font-bold text-white mb-4">10. Cookies</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We use cookies and similar tracking technologies on our website and platform. Our full Cookie Policy is available at <a href="/cookies" className="text-purple-400 hover:text-purple-300">curacareplatform.co.uk/cookies</a>.</p>
                <p>In summary, we use strictly necessary cookies to operate the Service (such as session authentication cookies), functional cookies to remember your preferences, and analytics cookies (Google Analytics 4) to understand how our website is used. We do not use advertising or tracking cookies for third-party marketing purposes.</p>
                <p>You can manage your cookie preferences at any time via the cookie preference centre accessible from the footer of our website, or by adjusting your browser settings. Please note that disabling certain cookies may affect the functionality of the Service.</p>
              </div>
            </div>

            {/* 11 */}
            <div id="childrens-data">
              <h2 className="text-xl font-bold text-white mb-4">11. Children&rsquo;s Data</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>The Cura platform is designed for use by businesses and their adult employees, and is not directed at or intended for use by individuals under the age of 18. We do not knowingly collect personal data from children.</p>
                <p>If we become aware that we have inadvertently collected personal data from a child under 18 without appropriate consent, we will take steps to delete that information promptly.</p>
                <p>Customers who use Cura to provide care services to young persons are responsible for ensuring that their use of the platform complies with applicable laws concerning the processing of children&rsquo;s data, including obtaining any necessary parental consent.</p>
              </div>
            </div>

            {/* 12 */}
            <div id="changes">
              <h2 className="text-xl font-bold text-white mb-4">12. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>We may update this Privacy Policy from time to time to reflect changes in our data processing practices, legal requirements, or the features of our Service. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was most recently revised.</p>
                <p>Where changes are material, we will notify Customers by email or by posting a prominent notice within the Cura platform at least 30 days before the changes take effect. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised policy.</p>
                <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
              </div>
            </div>

            {/* 13 */}
            <div id="contact">
              <h2 className="text-xl font-bold text-white mb-4">13. Contact &amp; DPO Details</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>If you have any questions, concerns, or requests relating to this Privacy Policy or our data processing activities, please contact:</p>
                <div
                  className="rounded-xl p-6 mt-4"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  <p className="text-white font-semibold mb-1">Data Protection Officer</p>
                  <p>Cura Ltd</p>
                  <p>Registered in England &amp; Wales</p>
                  <p className="mt-2">
                    Email:{" "}
                    <a
                      href="mailto:dpo@curacareplatform.co.uk"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      dpo@curacareplatform.co.uk
                    </a>
                  </p>
                  <p className="mt-3 text-sm">
                    You also have the right to make a complaint to the Information Commissioner&rsquo;s Office (ICO):{" "}
                    <a
                      href="https://ico.org.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
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
