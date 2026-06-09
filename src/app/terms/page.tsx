import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "service-description", title: "2. Service Description" },
  { id: "account-registration", title: "3. Account Registration & Security" },
  { id: "subscription-payment", title: "4. Subscription & Payment Terms" },
  { id: "acceptable-use", title: "5. Acceptable Use Policy" },
  { id: "intellectual-property", title: "6. Intellectual Property" },
  { id: "data-processing", title: "7. Data Processing" },
  { id: "confidentiality", title: "8. Confidentiality" },
  { id: "warranties", title: "9. Warranties & Disclaimers" },
  { id: "liability", title: "10. Limitation of Liability" },
  { id: "indemnification", title: "11. Indemnification" },
  { id: "termination", title: "12. Term & Termination" },
  { id: "governing-law", title: "13. Governing Law" },
  { id: "dispute-resolution", title: "14. Dispute Resolution" },
  { id: "general", title: "15. General Provisions" },
];

export default function TermsPage() {
  return (
    <main style={{ background: "#faf7f0", minHeight: "100vh" }}>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: "rgba(45,90,61,0.1)", border: "1px solid rgba(45,90,61,0.25)", color: "#2d5a3d" }}>
              Legal
            </div>
            <h1 className="lp-serif text-4xl lg:text-5xl font-extrabold mb-4 leading-tight" style={{ color: "#1c1a14" }}>
              Terms of Service
            </h1>
            <p className="text-sm" style={{ color: "#7a7468" }}>
              Last updated: May 2025 &nbsp;&middot;&nbsp; Cura Ltd, registered in England &amp; Wales
            </p>
            <p className="text-sm mt-2" style={{ color: "#7a7468" }}>
              Please read these Terms of Service carefully before accessing or using the Cura platform. By clicking &ldquo;I agree&rdquo;, by signing an Order Form, or by otherwise accessing the Service, you agree to be bound by these Terms.
            </p>
          </div>

          <div className="lp-card rounded-2xl p-6 mb-12">
            <h2 className="font-semibold text-sm uppercase tracking-widest mb-4" style={{ color: "#2d5a3d" }}>
              Contents
            </h2>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm underline-offset-2 hover:underline" style={{ color: "#7a7468" }}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-14" style={{ color: "#7a7468" }}>

            <div id="acceptance">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>1. Acceptance of Terms</h2>
              <div className="space-y-4 leading-relaxed">
                <p>These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of the Cura care management platform, associated mobile applications, APIs, and related services (collectively, the &ldquo;Service&rdquo;) provided by Cura Ltd, a company registered in England and Wales (&ldquo;Cura&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).</p>
                <p>These Terms form a legally binding agreement between Cura and the legal entity or individual (&ldquo;Customer&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) that has signed an Order Form or otherwise accepted these Terms. If you are accepting these Terms on behalf of an organisation, you represent and warrant that you have authority to bind that organisation.</p>
                <p>We may update these Terms from time to time. We will give you at least 30 days&rsquo; prior written notice of any material changes. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.</p>
              </div>
            </div>

            <div id="service-description">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>2. Service Description</h2>
              <div className="space-y-4 leading-relaxed">
                <p>Cura provides a cloud-based software-as-a-service (&ldquo;SaaS&rdquo;) platform designed for use by care homes, residential care providers, and domiciliary care operators operating primarily in the United Kingdom. The Service includes modules for care planning, medication administration, staff management, compliance, incident reporting, and related operational functions, as described in the applicable Order Form and our documentation at <a href="/docs" style={{ color: "#2d5a3d" }}>curacareplatform.co.uk/docs</a>.</p>
                <p>The Service is provided on a subscription basis. The specific features, usage limits, and service level commitments applicable to your subscription are set out in the Order Form and, where applicable, a Service Level Agreement (&ldquo;SLA&rdquo;).</p>
                <p>Cura reserves the right to modify, enhance, or discontinue features of the Service at any time, provided that we do not materially diminish the core functionality during a paid subscription period without providing a commensurate reduction in fees or an opportunity to terminate the subscription.</p>
              </div>
            </div>

            <div id="account-registration">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>3. Account Registration &amp; Security</h2>
              <div className="space-y-4 leading-relaxed">
                <p>To access the Service, you must register for an account and provide accurate, current, and complete information as prompted during registration. You agree to keep this information up to date.</p>
                <p>You are responsible for maintaining the confidentiality of your account credentials, including passwords and multi-factor authentication codes. You must not share your credentials with any person who is not an authorised user within your organisation. You are responsible for all activity that occurs under your account.</p>
                <p>You must notify us immediately at <a href="mailto:security@curacareplatform.co.uk" style={{ color: "#2d5a3d" }}>security@curacareplatform.co.uk</a> if you suspect unauthorised access to or use of your account.</p>
                <p>Each user account is personal and may not be shared. You may add authorised users up to the limit specified in your Order Form. Additional user seats may be purchased at the then-current per-seat rate.</p>
                <p>Cura may suspend or terminate accounts where we have reason to believe that credentials have been compromised or that the account is being used in a manner inconsistent with these Terms.</p>
              </div>
            </div>

            <div id="subscription-payment">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>4. Subscription &amp; Payment Terms</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Fees:</span> Subscription fees are as set out in your Order Form. All fees are stated exclusive of VAT, which will be added at the applicable rate where required by law.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Billing cycle:</span> Subscriptions are billed monthly or annually in advance, as selected at the time of purchase. Annual subscriptions are not refundable on a pro-rata basis except where required by law or as expressly stated herein.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Payment:</span> You authorise Cura to charge the payment method on file for all amounts due. If a payment fails, we will notify you and may suspend access to the Service after a grace period of 7 days. Overdue amounts accrue interest at 8% above the Bank of England base rate per annum pursuant to the Late Payment of Commercial Debts (Interest) Act 1998.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Price changes:</span> Cura may adjust subscription pricing on no less than 60 days&rsquo; written notice prior to the start of the next renewal term. If you do not wish to accept the new pricing, you may cancel your subscription before the renewal date.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Free trials:</span> If Cura offers a free trial, access to the Service during the trial is governed by these Terms. At the end of the trial period, you must either subscribe or your access will terminate. No data is guaranteed to be retained following a trial unless you subscribe.</p>
              </div>
            </div>

            <div id="acceptable-use">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>5. Acceptable Use Policy</h2>
              <div className="space-y-4 leading-relaxed">
                <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Violate any applicable law, regulation, or professional regulatory obligation (including CQC Fundamental Standards)</li>
                  <li>Process personal data in a manner that is unlawful under UK GDPR or the DPA 2018</li>
                  <li>Upload or transmit any malware, viruses, or malicious code</li>
                  <li>Attempt to gain unauthorised access to any part of the Service, its related systems, or other Customer accounts</li>
                  <li>Circumvent or test the vulnerability of any security controls</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                  <li>Use automated scripts, bots, or scrapers to interact with the Service without our prior written consent</li>
                  <li>Resell, sublicense, or make the Service available to third parties except as permitted by these Terms</li>
                  <li>Use the Service in a way that degrades its performance or availability for other customers</li>
                  <li>Remove or obscure any intellectual property notices in the Service</li>
                </ul>
                <p>Cura reserves the right to investigate and take appropriate action in response to breaches of this Acceptable Use Policy, including suspending or terminating access to the Service.</p>
              </div>
            </div>

            <div id="intellectual-property">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>6. Intellectual Property</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Cura&rsquo;s IP:</span> The Service, including its software, user interfaces, features, functionality, documentation, and all related intellectual property rights, is and remains the exclusive property of Cura and its licensors. These Terms do not transfer any ownership rights in the Service to you.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Licence to use:</span> Subject to your compliance with these Terms and payment of applicable fees, Cura grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Service during the subscription term solely for your internal business purposes in connection with the management of care homes and related services.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Customer Data:</span> You retain all ownership rights in the data you input into the Service (&ldquo;Customer Data&rdquo;). You grant Cura a limited, non-exclusive licence to access, process, and use Customer Data solely for the purpose of providing and improving the Service, in accordance with our Data Processing Agreement.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Feedback:</span> If you provide Cura with suggestions, ideas, or feedback about the Service, you grant Cura an irrevocable, royalty-free licence to use, reproduce, and incorporate that feedback into the Service without restriction or compensation to you.</p>
              </div>
            </div>

            <div id="data-processing">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>7. Data Processing</h2>
              <div className="space-y-4 leading-relaxed">
                <p>Where Cura processes personal data on behalf of the Customer in connection with the Service, such processing is governed by the Cura Data Processing Agreement (&ldquo;DPA&rdquo;), which is incorporated into and forms part of these Terms. The DPA is available upon request and is provided to all Customers prior to commencing a paid subscription.</p>
                <p>The Customer acknowledges that it is the data controller in respect of personal data of care home residents and staff processed via the Service. Cura acts as data processor in respect of such data. The Customer is responsible for ensuring that it has a valid lawful basis for processing personal data via the Service, and that data subjects have been provided with appropriate privacy information.</p>
                <p>Cura acts as an independent data controller in respect of data it collects about the Customer&rsquo;s personnel in connection with account management, support, and billing. Such processing is described in our Privacy Policy at <a href="/privacy" style={{ color: "#2d5a3d" }}>curacareplatform.co.uk/privacy</a>.</p>
              </div>
            </div>

            <div id="confidentiality">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>8. Confidentiality</h2>
              <div className="space-y-4 leading-relaxed">
                <p>Each party (&ldquo;Receiving Party&rdquo;) agrees to keep confidential all non-public information of the other party (&ldquo;Disclosing Party&rdquo;) that is designated as confidential or that reasonably should be understood to be confidential given its nature and the circumstances of disclosure (&ldquo;Confidential Information&rdquo;).</p>
                <p>Confidential Information includes, but is not limited to: business plans and strategies, financial information, technical specifications, source code, Customer Data, resident records, staff records, and pricing terms. The existence and content of any Order Form and these Terms are Confidential Information of both parties.</p>
                <p>The Receiving Party agrees not to disclose Confidential Information to any third party without the Disclosing Party&rsquo;s prior written consent, except to employees, contractors, and advisers who have a need to know and who are bound by confidentiality obligations no less protective than those set out here. The Receiving Party will use the Disclosing Party&rsquo;s Confidential Information solely for the purpose of exercising its rights and performing its obligations under these Terms.</p>
                <p>Confidentiality obligations do not apply to information that: (a) is or becomes publicly available without breach of these Terms; (b) was already known to the Receiving Party without restriction; (c) is independently developed by the Receiving Party without use of Confidential Information; or (d) is required to be disclosed by law or by a court or regulatory authority of competent jurisdiction, provided the Receiving Party gives the Disclosing Party prompt prior written notice and cooperates with any attempt to obtain a protective order.</p>
              </div>
            </div>

            <div id="warranties">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>9. Warranties &amp; Disclaimers</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Cura&rsquo;s warranties:</span> Cura warrants that: (a) it has the right to enter into these Terms and grant the licences described herein; (b) the Service will perform materially in accordance with the applicable documentation; and (c) Cura will implement and maintain commercially reasonable security measures to protect Customer Data.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Customer&rsquo;s warranties:</span> The Customer warrants that: (a) it has the authority to enter into these Terms; (b) its use of the Service will comply with all applicable laws and regulations, including CQC Fundamental Standards, the Health and Social Care Act 2008, and UK GDPR; and (c) it holds all necessary consents and permissions to process the data it inputs into the Service.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Disclaimers:</span> THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; TO THE FULLEST EXTENT PERMITTED BY LAW. CURA MAKES NO WARRANTY THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. THE SERVICE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, CLINICAL JUDGEMENT, OR COMPLIANCE ASSESSMENT BY A QUALIFIED PRACTITIONER. CURA DOES NOT WARRANT THAT THE SERVICE WILL MEET THE REQUIREMENTS OF ANY SPECIFIC REGULATORY INSPECTION.</p>
              </div>
            </div>

            <div id="liability">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>10. Limitation of Liability</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Exclusion of consequential loss:</span> To the fullest extent permitted by law, neither party will be liable to the other for any indirect, incidental, special, consequential, or punitive damages, including loss of profit, loss of revenue, loss of data, loss of goodwill, or business interruption, arising out of or related to these Terms, however caused and under any theory of liability, even if advised of the possibility of such damages.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Cap on liability:</span> Subject to the exceptions below, each party&rsquo;s total aggregate liability to the other arising out of or related to these Terms (whether in contract, tort including negligence, breach of statutory duty, or otherwise) will not exceed the total fees paid or payable by the Customer to Cura in the 12 months immediately preceding the event giving rise to the claim.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Exceptions:</span> Nothing in these Terms limits or excludes liability for: (a) death or personal injury caused by negligence; (b) fraud or fraudulent misrepresentation; (c) any liability that cannot be excluded or limited by law (including under the Consumer Rights Act 2015 to the extent applicable); or (d) the Customer&rsquo;s payment obligations.</p>
              </div>
            </div>

            <div id="indemnification">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>11. Indemnification</h2>
              <div className="space-y-4 leading-relaxed">
                <p>The Customer agrees to indemnify, defend, and hold harmless Cura and its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to: (a) the Customer&rsquo;s breach of these Terms; (b) the Customer&rsquo;s use of the Service in a manner not authorised by these Terms or applicable documentation; (c) the Customer&rsquo;s violation of any applicable law or regulation; or (d) any claim that Customer Data infringes a third party&rsquo;s intellectual property rights.</p>
                <p>Cura agrees to indemnify, defend, and hold harmless the Customer from and against any third-party claims alleging that the Service, as provided by Cura and used in accordance with these Terms, infringes any United Kingdom patent, copyright, trade mark, or trade secret. This indemnity does not apply to claims arising from: (a) modifications to the Service made by the Customer; (b) use of the Service in combination with third-party products not approved by Cura; or (c) use of a version of the Service that Cura has notified is superseded by a non-infringing version.</p>
              </div>
            </div>

            <div id="termination">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>12. Term &amp; Termination</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Term:</span> These Terms commence on the date you first access the Service or sign an Order Form and continue for the subscription term set out in the Order Form. Subscriptions renew automatically for successive periods equal to the initial term unless either party provides written notice of non-renewal at least 30 days before the end of the then-current term.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Termination for breach:</span> Either party may terminate these Terms immediately on written notice if the other party: (a) materially breaches these Terms and fails to remedy that breach within 30 days of receiving written notice; (b) becomes insolvent, enters administration, or is wound up; or (c) commits an act of fraud or wilful misconduct.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Termination for convenience:</span> Either party may terminate these Terms for any reason on 30 days&rsquo; written notice, provided that the Customer will not be entitled to a refund of any prepaid fees unless required by law.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Effect of termination:</span> On termination: (a) all licences granted under these Terms cease; (b) the Customer must cease all use of the Service; (c) Cura will provide the Customer with an export of Customer Data in a standard format within 30 days of termination; and (d) Cura will delete or anonymise Customer Data within 90 days of termination, subject to any legal retention obligations. Clauses that by their nature should survive termination (including confidentiality, liability, and governing law) will do so.</p>
              </div>
            </div>

            <div id="governing-law">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>13. Governing Law</h2>
              <div className="space-y-4 leading-relaxed">
                <p>These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes or claims) are governed by and construed in accordance with the laws of England and Wales.</p>
                <p>Subject to Clause 14 (Dispute Resolution), both parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales to settle any dispute or claim arising out of or in connection with these Terms.</p>
              </div>
            </div>

            <div id="dispute-resolution">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>14. Dispute Resolution</h2>
              <div className="space-y-4 leading-relaxed">
                <p>The parties agree to attempt to resolve any dispute arising out of these Terms in good faith through the following escalation procedure before commencing formal legal proceedings (except where a party seeks urgent injunctive or other interim relief):</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-semibold" style={{ color: "#1c1a14" }}>Step 1 — Direct negotiation:</span> Either party may give written notice of the dispute. The parties will attempt to resolve the dispute through good-faith discussions within 15 business days of the notice.</li>
                  <li><span className="font-semibold" style={{ color: "#1c1a14" }}>Step 2 — Senior escalation:</span> If the dispute is not resolved under Step 1, each party will nominate a senior representative to meet (in person or virtually) within a further 15 business days to attempt resolution.</li>
                  <li><span className="font-semibold" style={{ color: "#1c1a14" }}>Step 3 — Mediation:</span> If the dispute remains unresolved after Step 2, either party may propose referral to a mediator agreed between the parties or, failing agreement, appointed by the Centre for Effective Dispute Resolution (CEDR).</li>
                  <li><span className="font-semibold" style={{ color: "#1c1a14" }}>Step 4 — Litigation:</span> If mediation fails or is not agreed within 30 days of the proposal, either party may commence proceedings in the courts of England and Wales.</li>
                </ul>
              </div>
            </div>

            <div id="general">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#1c1a14" }}>15. General Provisions</h2>
              <div className="space-y-4 leading-relaxed">
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Entire agreement:</span> These Terms, together with the Order Form, DPA, and any applicable SLA, constitute the entire agreement between the parties with respect to the Service and supersede all prior agreements, representations, and understandings relating to the same subject matter.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Severability:</span> If any provision of these Terms is found to be invalid or unenforceable, that provision will be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions will continue in full force.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Waiver:</span> No failure or delay by either party in exercising any right or remedy will constitute a waiver of that right or remedy. Waivers must be in writing to be effective.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Assignment:</span> The Customer may not assign or transfer any of its rights or obligations under these Terms without Cura&rsquo;s prior written consent. Cura may assign these Terms to an affiliate or in connection with a merger, acquisition, or sale of substantially all of its assets on notice to the Customer.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Force majeure:</span> Neither party will be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including natural disasters, acts of government, labour disputes, or internet infrastructure failures, provided that the affected party gives prompt notice and uses reasonable efforts to mitigate the impact.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Notices:</span> Notices under these Terms must be in writing and sent to the addresses specified in the Order Form, or to <a href="mailto:legal@curacareplatform.co.uk" style={{ color: "#2d5a3d" }}>legal@curacareplatform.co.uk</a> for Cura. Notices sent by email are effective on the business day following transmission.</p>
                <p><span className="font-semibold" style={{ color: "#1c1a14" }}>Third parties:</span> These Terms do not create any rights enforceable by third parties under the Contracts (Rights of Third Parties) Act 1999, except that Cura&rsquo;s affiliated companies may enforce provisions of these Terms that are expressed to benefit them.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
