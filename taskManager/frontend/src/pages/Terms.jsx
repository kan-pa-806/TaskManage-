export default function Terms() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Terms of Service</h1>
      <p className="text-xs text-gray-500 mb-8">Last updated: September 2026</p>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By using Task Manager, you agree to these terms of service. If you do not agree,
            you should not use this application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Use of the Application</h2>
          <p className="text-sm leading-relaxed">
            Task Manager is provided as a tool for personal and professional task management.
            You may use this application to create, manage, and track your tasks. You are
            responsible for the content you enter into the application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. User Responsibilities</h2>
          <p className="text-sm leading-relaxed">
            You agree not to enter any unlawful, harmful, or objectionable content as task data.
            You are solely responsible for the tasks and content you create within this application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Data and Availability</h2>
          <p className="text-sm leading-relaxed">
            While we aim to keep the application running reliably, we do not guarantee uptime or
            that your data will be preserved indefinitely. We recommend keeping your own backups of
            critical information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed">
            Task Manager is provided "as is" without warranties of any kind. We are not liable
            for any loss of data, business interruption, or any other damages arising from use of
            this application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Modifications</h2>
          <p className="text-sm leading-relaxed">
            These terms may be updated at any time. Continued use of the application after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Contact</h2>
          <p className="text-sm leading-relaxed">
            For questions about these terms, please refer to the application repository or the
            contact information in the README.
          </p>
        </section>
      </div>
    </main>
  );
}
