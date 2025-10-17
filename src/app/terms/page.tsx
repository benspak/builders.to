import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - LaunchKit",
  description: "LaunchKit Terms of Service - Legal terms and conditions for using our services.",
};

export default function TermsOfService() {
  return (
    <main className="bg-dark-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-dark-card rounded-lg shadow-sm border border-gray-700 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-gray-300 mb-8">Last updated: January 27, 2025</p>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 mb-4">
                Welcome to LaunchKit. These Terms of Service ("Terms") govern your use of our website located at <a href="https://launchkit.to" className="text-spotify-green hover:text-green-400">launchkit.to</a> and our services (collectively, the "Service") operated by LaunchKit ("us," "we," or "our").
              </p>
              <p className="text-gray-300 mb-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 mb-4">
                LaunchKit provides MVP development services, business formation assistance, and startup consulting services. We help entrepreneurs and founders build and launch their minimum viable products (MVPs) within 21 days for a flat rate of $5,000.
              </p>
              <p className="text-gray-300 mb-4">
                Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>MVP development and technical implementation</li>
                <li>Business formation and legal structure setup</li>
                <li>Investor-ready documentation and pitch materials</li>
                <li>Marketing and user acquisition strategies</li>
                <li>Technical consulting and guidance</li>
                <li>Project management and delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts and Responsibilities</h2>
              <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
              <p className="text-gray-300 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">3.2 User Responsibilities</h3>
              <p className="text-gray-300 mb-4">
                You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Not use the Service for any unlawful or prohibited purpose</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Service Terms and Conditions</h2>
              <h3 className="text-xl font-semibold text-white mb-3">4.1 MVP Development Service</h3>
              <p className="text-gray-300 mb-4">
                Our MVP development service includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>21-day development timeline from project start</li>
                <li>Flat rate pricing of $5,000 USD</li>
                <li>Core functionality development as specified in project scope</li>
                <li>Basic testing and quality assurance</li>
                <li>Deployment and launch assistance</li>
                <li>One round of revisions within 7 days of delivery</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">4.2 Project Scope and Limitations</h3>
              <p className="text-gray-300 mb-4">
                The MVP service includes development of core features as agreed upon in the project scope. Additional features, extensive design work, or significant scope changes may incur additional costs and timeline extensions.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">4.3 Payment Terms</h3>
              <p className="text-gray-300 mb-4">
                Payment terms are as follows:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>50% payment required to begin project ($2,500)</li>
                <li>50% payment due upon project completion ($2,500)</li>
                <li>All payments are non-refundable except as specified in our refund policy</li>
                <li>Late payments may result in project delays</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold text-white mb-3">5.1 Client Ownership</h3>
              <p className="text-gray-300 mb-4">
                Upon full payment, you will own all rights, title, and interest in the custom-developed code, designs, and deliverables created specifically for your project, excluding any pre-existing intellectual property owned by LaunchKit or third parties.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">5.2 LaunchKit Intellectual Property</h3>
              <p className="text-gray-300 mb-4">
                LaunchKit retains ownership of all pre-existing intellectual property, including but not limited to frameworks, libraries, methodologies, and general knowledge used in providing services.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">5.3 Third-Party Components</h3>
              <p className="text-gray-300 mb-4">
                Any third-party components, libraries, or services used in your project remain subject to their respective licenses and terms of use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Confidentiality and Non-Disclosure</h2>
              <p className="text-gray-300 mb-4">
                We understand the sensitive nature of startup ideas and business information. We agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>Keep all client information confidential</li>
                <li>Not disclose client ideas or business information to third parties</li>
                <li>Use client information only for the purpose of providing services</li>
                <li>Implement reasonable security measures to protect confidential information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-300 mb-4">
                To the maximum extent permitted by law, LaunchKit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p className="text-gray-300 mb-4">
                Our total liability to you for any damages arising from or related to these Terms or the Service shall not exceed the amount you paid us for the specific service giving rise to the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimers and Warranties</h2>
              <p className="text-gray-300 mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="text-gray-300 mb-4">
                We do not warrant that the Service will be uninterrupted, secure, or free of errors, viruses, or other harmful components.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Indemnification</h2>
              <p className="text-gray-300 mb-4">
                You agree to defend, indemnify, and hold harmless LaunchKit and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) resulting from or arising out of:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                <li>Any claim that your content caused damage to a third party</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
              <p className="text-gray-300 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-300 mb-4">
                If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the Terms which by their nature should survive termination shall survive termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Refund Policy</h2>
              <p className="text-gray-300 mb-4">
                Our refund policy is as follows:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                <li>No refunds are provided once development work has begun</li>
                <li>If we fail to deliver the agreed-upon MVP within the 21-day timeline due to our fault, you may be eligible for a partial refund</li>
                <li>Refund requests must be made in writing within 30 days of project completion</li>
                <li>Any refunds are at our sole discretion and will be processed within 30 days of approval</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-300 mb-4">
                These Terms shall be interpreted and governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>
              <p className="text-gray-300 mb-4">
                Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
              <p className="text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-300 mb-4">
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Severability</h2>
              <p className="text-gray-300 mb-4">
                If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">15. Entire Agreement</h2>
              <p className="text-gray-300 mb-4">
                These Terms constitute the sole and entire agreement between you and LaunchKit regarding the Service and supersede all prior and contemporaneous understandings, agreements, representations, and warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 mb-2"><strong>Email:</strong> <a href="mailto:legal@launchkit.to" className="text-spotify-green hover:text-green-400">legal@launchkit.to</a></p>
                <p className="text-gray-300 mb-2"><strong>Website:</strong> <a href="https://launchkit.to" className="text-spotify-green hover:text-green-400">https://launchkit.to</a></p>
                <p className="text-gray-300"><strong>Contact Form:</strong> <a href="/contact" className="text-spotify-green hover:text-green-400">Contact Us</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
