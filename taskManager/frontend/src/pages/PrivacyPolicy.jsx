export default function PrivacyPolicy() {
  return (
    <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-8">Last updated: September 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            Task Manager collects only the information you directly provide when using the application.
            This includes task titles, descriptions, status values, and priority levels that you create
            and store through the application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed">
            The task data you enter is stored in a MongoDB database for the sole purpose of providing
            the Task Manager functionality. We do not use your task data for advertising, analytics
            beyond basic server logs, or any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Data Storage</h2>
          <p className="text-sm leading-relaxed">
            Task data is stored using MongoDB Atlas. Data is stored as long as your tasks exist in
            the application. You may delete any task at any time through the application interface.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
          <p className="text-sm leading-relaxed">
            This application uses MongoDB Atlas for database storage. Usage of MongoDB Atlas is
            subject to MongoDB's own privacy policy and terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Cookies</h2>
          <p className="text-sm leading-relaxed">
            This application does not use cookies or any client-side tracking mechanisms at this time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Changes to This Policy</h2>
          <p className="text-sm leading-relaxed">
            This privacy policy may be updated periodically. Changes will be reflected on this page
            with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Contact</h2>
          <p className="text-sm leading-relaxed">
            If you have any questions about this privacy policy, please reach out through the
            application repository or the contact information listed in the README.
          </p>
        </section>
      </div>
    </main>
  );
}
