import { Component } from "@angular/core";

@Component({
  standalone: true,
  selector: "app-privacy-policy",
  host: { class: "block flex-1 min-h-0 overflow-y-auto" },
  template: `
    <div class="com-patrykmalinowski-pomidor-privacy-policy p-5">
      <h1>Privacy Policy</h1>
      <p>Last updated: 6th February 2026</p>
      <h2>1. Overview</h2>
      <p>
        This service is designed to minimize the collection of personal data. We
        do not require users to provide names, email addresses, or other
        directly identifying information to create an account.
      </p>
      <p>
        However, we do process limited technical data to operate and protect the
        service.
      </p>
      <h2>2. Data We Process</h2>
      <h3>a. Account Information</h3>
      <p>Username (chosen by the user)</p>
      <p>Password (stored in securely hashed form)</p>
      <h3>b. Technical Data</h3>
      <p>IP address (processed and stored in hashed form)</p>
      <h2>3. How We Use Data</h2>
      <p>We use the above data for the following purposes:</p>
      <ul>
        <li>To provide and maintain user accounts</li>
        <li>
          To prevent abuse of the service (i.e. limiting the number of accounts
          per user and preventing users from mass creating accounts)
        </li>
        <li>To ensure the security and stability of the platform</li>
      </ul>
      <h2>4. Legal Basis</h2>
      <p>
        We process this data under our legitimate interests, specifically to:
      </p>
      <ul>
        <li>Prevent misuse of the service</li>
        <li>Maintain system security and integrity</li>
      </ul>
      <p>
        These interests are balanced against your rights and freedoms, and we
        only process the minimum data necessary.
      </p>
      <h2>5. Data Retention</h2>
      <p>
        Hashed IP data is retained and then automatically deleted after 7 days
        of inactivity from that IP.
      </p>
      <p>Account data is retained for as long as the account remains active.</p>
      <h2>6. Data Sharing</h2>
      <p>
        We do not sell or share your data with third parties, except where
        required by law.
      </p>
      <h2>7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your data, including:
      </p>
      <ul>
        <li>Hashing of sensitive data</li>
        <li>Secure communication over HTTPS</li>
        <li>Restricted access to stored data</li>
      </ul>
      <h2>8. Your Rights</h2>
      <p>
        Under the General Data Protection Regulation, you have rights including:
      </p>
      <ul>
        <li>The right to access your data</li>
        <li>The right to request deletion of your data</li>
        <li>The right to object to certain processing</li>
      </ul>
      <p>
        Because this service does not collect directly identifying information,
        we may not be able to associate requests with specific users unless
        sufficient information is provided.
      </p>
      <h2>9. Contact</h2>
      <p>If you have questions about this policy or your data, contact:</p>
      <p>Patryk Malinowski (pmalinowski116&#64;gmail.com)</p>
      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Updates will be posted on
        this page with a revised “Last updated” date.
      </p>
      <a href="/">Back to Home</a>
    </div>
  `,
})
export class PrivacyPolicy {}
