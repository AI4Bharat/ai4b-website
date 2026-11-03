import React from "react";
import styles from "./privacy-policy.module.css";

export const metadata = {
  title: "Privacy Policy - IndicSwipe Keyboard | AI4Bharat",
  description:
    "Privacy Policy for the IndicSwipe Keyboard mobile application developed by AI4Bharat, IIT Madras.",
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>Official Policy</span>
          <span className={styles.badgeMeta}>AI4Bharat • IIT Madras</span>
        </div>
        <h1 className={styles.title}>
          <span className={styles.titleOrange}>Privacy Policy for</span>{" "}
          <span className={styles.titleRed}>IndicSwipe</span>
        </h1>
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <strong>Effective Date:</strong> November 3, 2026
          </div>
          <div className={styles.metaItem}>
            <strong>Application:</strong> IndicSwipe Keyboard (Android &amp; iOS)
          </div>
          <div className={styles.metaItem}>
            <strong>Developer:</strong> AI4Bharat Research Lab, IIT Madras
          </div>
        </div>
      </header>

      <div className={styles.leadText}>
        <p>
          This Privacy Policy explains how the <strong>IndicSwipe</strong>{" "}
          keyboard app (&ldquo;IndicSwipe&rdquo; or &ldquo;the App&rdquo;)
          handles information when you use it. The App is developed by{" "}
          <strong>AI4Bharat</strong>, a research initiative at the Indian
          Institute of Technology Madras (IIT Madras) that builds open-source
          language technology for Indian languages. In this policy,
          &ldquo;AI4Bharat&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
          &ldquo;our&rdquo; refer to AI4Bharat.
        </p>
        <p>
          IndicSwipe is free. It has no user accounts, shows no advertising, and
          we do not sell, rent or trade any information.
        </p>
      </div>

      {/* Key Highlights Card */}
      <div className={styles.highlightCard}>
        <div className={styles.highlightHeader}>
          <span className={styles.highlightIcon}>🛡️</span>
          <h3>Privacy Commitments at a Glance</h3>
        </div>
        <div className={styles.highlightGrid}>
          <div className={styles.highlightItem}>
            <div className={styles.highlightItemTitle}>
              📱 100% On-Device by Default
            </div>
            <p>
              Keystrokes, swipe paths, suggestions, and personal dictionaries are
              processed entirely on your phone. Nothing leaves your device.
            </p>
          </div>
          <div className={styles.highlightItem}>
            <div className={styles.highlightItemTitle}>
              🚫 Zero Trackers &amp; No Ads
            </div>
            <p>
              No user accounts, no analytics SDKs, no advertising IDs (AD_ID),
              and no sharing or selling of data to brokers or advertisers.
            </p>
          </div>
          <div className={styles.highlightItem}>
            <div className={styles.highlightItemTitle}>
              ☁️ Real-Time Ephemeral Cloud
            </div>
            <p>
              Optional cloud translation and voice typing process requests in
              real-time without storing your text or recordings on our servers.
            </p>
          </div>
          <div className={styles.highlightItem}>
            <div className={styles.highlightItemTitle}>
              🔬 Opt-In Research Program
            </div>
            <p>
              &ldquo;Help improve IndicSwipe&rdquo; is completely voluntary, off
              by default, pseudonymous, and you can delete your data at any time.
            </p>
          </div>
        </div>
      </div>

      <nav className={styles.toc} aria-label="Table of Contents">
        <p className={styles.tocTitle}>Table of Contents</p>
        <ol>
          <li>
            <a href="#summary">Summary</a>
          </li>
          <li>
            <a href="#on-device">Information that stays on your device</a>
          </li>
          <li>
            <a href="#online-features">Features that use our servers</a>
          </li>
          <li>
            <a href="#help-improve">
              &ldquo;Help improve IndicSwipe&rdquo; (optional)
            </a>
          </li>
          <li>
            <a href="#retention">Data retention</a>
          </li>
          <li>
            <a href="#your-rights">Your choices and rights</a>
          </li>
          <li>
            <a href="#sharing">Sharing</a>
          </li>
          <li>
            <a href="#security">Security</a>
          </li>
          <li>
            <a href="#permissions">App permissions</a>
          </li>
          <li>
            <a href="#children">Children</a>
          </li>
          <li>
            <a href="#changes">Changes to this policy</a>
          </li>
          <li>
            <a href="#contact">Contact us</a>
          </li>
        </ol>
      </nav>

      <section className={styles.section}>
        <h2 id="summary">
          <span className={styles.num}>1.</span> Summary
        </h2>
        <ul>
          <li>
            <strong>Typing stays on your phone.</strong> Keystrokes, swipe
            decoding, word suggestions and transliteration are processed on your
            device.
          </li>
          <li>
            <strong>Two features are online.</strong> Translation and voice
            typing in Indian languages send your text or voice to our servers to
            produce a result. They are not stored.
          </li>
          <li>
            <strong>Sharing data for research is optional.</strong> The
            &ldquo;Help improve IndicSwipe&rdquo; programme is off by default.
            It collects data only after you confirm you are 18 or older, accept
            an in-app notice and turn on one or more categories. You can view,
            stop and delete your contributions at any time.
          </li>
          <li>
            <strong>No tracking.</strong> The App contains no advertising or
            third-party analytics software and does not use the Android
            Advertising ID.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="on-device">
          <span className={styles.num}>2.</span> Information that stays on your
          device
        </h2>
        <p>
          The following is processed and stored only on your device. It is not
          sent to us unless you take part in the programme described in section
          4.
        </p>
        <ul>
          <li>
            <strong>Typing and swiping:</strong> what you type, your swipe
            gestures, word suggestions, next-word predictions and
            transliteration.
          </li>
          <li>
            <strong>Personal dictionary:</strong> words you add to the keyboard.
          </li>
          <li>
            <strong>Clipboard history:</strong> text and images you copy. By
            default, unpinned items are removed after one hour. You can turn
            clipboard history off in the App&rsquo;s settings.
          </li>
          <li>
            <strong>Recent screenshots (optional):</strong> if you turn on
            &ldquo;Show recent screenshots in clipboard&rdquo;, the keyboard
            looks for screenshots taken in the last five minutes so you can
            paste them. Screenshots are never uploaded.
          </li>
          <li>
            <strong>Keyboard background:</strong> an image you choose with
            Android&rsquo;s photo picker stays on your device.
          </li>
          <li>
            <strong>Settings:</strong> your languages, theme and other
            preferences.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="online-features">
          <span className={styles.num}>3.</span> Features that use our servers
        </h2>
        <ul>
          <li>
            <strong>Translation.</strong> When you use the translate feature,
            the text you enter and the selected languages are sent to our
            server, which passes them to AI4Bharat&rsquo;s translation service
            and returns the translation.
          </li>
          <li>
            <strong>Voice typing in Indian languages.</strong> When you tap the
            microphone, your voice is recorded and sent to our server, which
            passes it to AI4Bharat&rsquo;s speech recognition service and
            returns the text. Recording stops when you stop speaking or tap the
            microphone again.
          </li>
        </ul>
        <p>
          The text and recordings of these requests are used only to produce
          your result. <strong>They are not stored</strong> by our server or by
          the translation and speech services, unless you have turned on the
          matching category (&ldquo;Translations&rdquo; or &ldquo;Voice
          recordings&rdquo;) of the programme in section 4.
        </p>
        <ul>
          <li>
            <strong>Voice typing in English</strong> uses your device&rsquo;s
            own speech recognition service (for example, Google&rsquo;s), not
            our servers. That service&rsquo;s privacy policy applies.
          </li>
          <li>
            <strong>Language packs</strong> are downloaded from
            AI4Bharat&rsquo;s storage or Google Play when you choose a language.
            Downloading does not send anything you type.
          </li>
        </ul>
        <p>
          <strong>Security and abuse prevention.</strong> On first use, the App
          creates a random cryptographic key on your device, held in the Android
          Keystore, and registers it with our server so that we can limit how
          many requests each device makes. Like any internet service, our server
          sees your IP address when the App connects. Server logs record request
          details such as the time and IP address, not the content of what you
          type, say or translate.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="help-improve">
          <span className={styles.num}>4.</span> &ldquo;Help improve
          IndicSwipe&rdquo; (optional)
        </h2>
        <p>
          You can choose to share data that helps us improve IndicSwipe for
          Indian languages. Participation is entirely voluntary.
        </p>

        <h3>4.1 Consent and control</h3>
        <ul>
          <li>All categories are off by default.</li>
          <li>
            Nothing is collected until you confirm you are 18 or older, read the
            in-app notice and turn the programme on.
          </li>
          <li>
            Each category has its own switch. Voice recordings are never turned
            on automatically.
          </li>
          <li>
            Turning a category off stops collection and deletes anything from
            that category still waiting on your device.
          </li>
        </ul>

        <h3>4.2 What is collected</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Record</th>
                <th>What is collected</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={4}>Swipe &amp; word data</td>
                <td>
                  <strong>Swipe</strong>
                </td>
                <td>
                  The path of your swipe, the word you meant (in English
                  letters), whether you kept it, which suggestion you picked,
                  and the keyboard&rsquo;s wrong guess if you corrected it.
                </td>
                <td>
                  After the word is settled. At most three swipes of the same
                  word a day.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Transliteration</strong>
                </td>
                <td>
                  The word you typed in English letters, the spellings offered
                  in your language (up to eight), the spelling you chose, and
                  whether you kept the English word.
                </td>
                <td>
                  Whenever you choose a different spelling, and for about one in
                  twenty other words.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Typing correction</strong>
                </td>
                <td>
                  An English word you typed key by key, the word it became, and
                  where you tapped on each key.
                </td>
                <td>
                  Only when the keyboard corrected the word, you picked a
                  correction, or you fixed a typo. Ordinary typed words are
                  never collected.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Next word</strong>
                </td>
                <td>
                  The previous word, the prediction you tapped, and the
                  predictions offered (up to eight).
                </td>
                <td>Only when you tap a next-word prediction.</td>
              </tr>
              <tr>
                <td>Translations</td>
                <td>
                  <strong>Translation</strong>
                </td>
                <td>
                  The text you translated, the translation, the two languages,
                  and any edits you made to the translation. This can be a full
                  sentence of up to 600 characters.
                </td>
                <td>
                  When the translation is used in your text, or when it is sent.
                  At most 50 per language pair a day.
                </td>
              </tr>
              <tr>
                <td>Voice recordings</td>
                <td>
                  <strong>Voice</strong>
                </td>
                <td>
                  The recording (0.25 to 30 seconds), the recognized text, and
                  any corrections you made. Indian languages only; English
                  speech is never collected.
                </td>
                <td>
                  When the recognized text is settled. If you delete the text,
                  nothing is collected and the recording is deleted. At most 100
                  a day.
                </td>
              </tr>
              <tr>
                <td>Usage &amp; speed stats</td>
                <td>
                  <strong>Daily counts</strong>
                </td>
                <td>
                  Counts such as how often the keyboard was opened, words swiped
                  or tapped, use of translation, voice typing and emoji, and how
                  quickly swipes were recognized. No text.
                </td>
                <td>Once a day, for the previous day.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Each record also includes: a random contributor ID; the language and
          script; the input mode; the keyboard layout, size and mode (floating
          or one-handed); the screen size; the App version and platform; a broad
          type of app (chat, social, browser, email, notes, search or other);
          the date; and a label describing the outcome (for example, kept,
          picked or corrected). It never includes the name of the app you were
          typing in, or the time of day.
        </p>

        <h3>4.3 How records are created</h3>
        <p>
          IndicSwipe does not record a stream of keystrokes. After a word or
          sentence is entered, the keyboard waits until it is settled (for
          example, after a few more words, a short time, or when the keyboard
          closes) and then records only the outcome: whether you kept it, picked
          a suggestion, corrected it or deleted it. Records are individual words
          or word pairs; only translations and voice text can be sentences.
          Before upload, records are shuffled so the order in which you typed
          cannot be reconstructed.
        </p>

        <h3>4.4 What is never collected</h3>
        <div className={styles.calloutRose}>
          <div className={styles.calloutRoseHeader}>
            <span>🚫</span> Strict Exclusions &amp; Data Safeguards
          </div>
          <ul>
            <li>
              Anything typed in password, PIN, number, phone, date, email, web
              address, person name or postal address fields; incognito fields;
              fields that turn off suggestions; or the App&rsquo;s own screens.
            </li>
            <li>
              Anything typed in banking, payment, investment, insurance, health,
              government ID or password manager apps.
            </li>
            <li>
              Words containing digits, &ldquo;@&rdquo; or web addresses;
              translations or voice text containing four or more digits, email
              addresses, links or @handles; and words on our block lists.
            </li>
            <li>Emoji, sentences from ordinary typing, and English speech.</li>
            <li>
              Your name, account details, phone number, contacts or location.
              The App does not have access to them.
            </li>
          </ul>
        </div>

        <h3>4.5 How it is sent and stored</h3>
        <p>
          Records wait on your device until the day ends. They are uploaded
          about once a day, only on Wi-Fi (or another unmetered network) while
          your device is charging. The queue on your device is limited in size;
          if it fills up, the oldest days are removed first.
        </p>
        <p>
          Our server checks each upload again and stores accepted records and
          voice recordings in AI4Bharat&rsquo;s private, access-controlled
          storage with a cloud provider in India. Records are organised by type,
          language, date and contributor ID. Our server does not keep its own
          copy of the content, except that, to limit swipes of the same word, it
          notes which words were swiped from a device on a given day and deletes
          that note after three days.
        </p>

        <div className={styles.calloutAmber}>
          <div className={styles.calloutAmberHeader}>
            <span>🔑</span> Pseudonymous, Not Anonymous
          </div>
          <p>
            Your contributions are linked to a random contributor ID, not to your
            name, account or phone number. Your device&rsquo;s key is kept
            separately from the contributed data and is used only to apply
            limits and to carry out deletion requests. Your IP address is not
            stored with the data.
          </p>
        </div>

        <h3>4.6 How it is used</h3>
        <p>
          Contributed data is used only to research, train and evaluate
          IndicSwipe&rsquo;s language models, such as its swipe,
          transliteration, suggestion, translation and speech recognition
          models. Before data is used for training, words used by only a few
          people are excluded, listed names of people, places and organisations
          are removed from sentences, and a sample is reviewed by AI4Bharat
          staff.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="retention">
          <span className={styles.num}>5.</span> Data retention
        </h2>
        <ul>
          <li>
            <strong>Contributed data</strong> is kept for as long as it is
            needed to improve IndicSwipe&rsquo;s models, or until you delete it.
          </li>
          <li>
            <strong>Our server&rsquo;s records</strong> are kept for limited
            periods: request counts for 24 hours; daily counters and per-word
            swipe notes for three days; and the information used to detect
            duplicates and to locate a contributor&rsquo;s data for deletion for
            up to two years. Backups of this information are kept for a limited
            time.
          </li>
          <li>
            <strong>Translation and voice requests</strong> that are not part of
            the programme are not retained.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="your-rights">
          <span className={styles.num}>6.</span> Your choices and rights
        </h2>
        <p>
          In the App, under <em>Help improve IndicSwipe</em>, you can:
        </p>
        <ul>
          <li>
            <strong>View your data:</strong> see the records waiting on your
            device before they are uploaded.
          </li>
          <li>
            <strong>Turn categories off:</strong> stop collection at any time.
            Records still waiting on your device for that category are deleted.
          </li>
          <li>
            <strong>Reset your contributor ID:</strong> start with a new random
            ID, so that new contributions are not linked to earlier ones.
          </li>
          <li>
            <strong>Delete your data:</strong> &ldquo;Delete my data&rdquo;
            immediately deletes everything waiting on your device and asks our
            server to delete everything uploaded under your current and earlier
            contributor IDs, including voice recordings. The request is sent
            with the next upload (on Wi-Fi while charging), and deletion is
            completed within 30 days. We keep a record of the deleted ID so that
            its data is not used in future training.
          </li>
        </ul>
        <p>
          You can also stop all collection by turning the programme off.
          Withdrawing consent does not affect data processed before you withdrew
          it, except as described above.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="sharing">
          <span className={styles.num}>7.</span> Sharing
        </h2>
        <p>
          We do not sell, rent or trade your information, and we do not share it
          with advertisers or data brokers. We use service providers to host our
          servers and storage; they process data only on our behalf. We may
          disclose information if required by law.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="security">
          <span className={styles.num}>8.</span> Security
        </h2>
        <p>
          All connections between the App and our servers are encrypted (HTTPS).
          Contributed data is stored in private storage that only authorised
          AI4Bharat personnel can access. No method of transmission or storage
          is completely secure, but we take reasonable measures to protect the
          information we hold.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="permissions">
          <span className={styles.num}>9.</span> App permissions
        </h2>
        <ul>
          <li>
            <strong>Internet and network state:</strong> to download language
            packs, for translation and voice typing, and, if you take part, to
            upload contributed data on Wi-Fi.
          </li>
          <li>
            <strong>Microphone:</strong> only while you use voice typing. You
            are asked the first time you tap the microphone.
          </li>
          <li>
            <strong>Photos and images (optional):</strong> only if you turn on
            recent screenshots in the clipboard. Screenshots are never uploaded.
          </li>
          <li>
            <strong>Vibration:</strong> for haptic feedback on key presses, if
            enabled.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 id="children">
          <span className={styles.num}>10.</span> Children
        </h2>
        <p>
          The &ldquo;Help improve IndicSwipe&rdquo; programme is only for people
          aged 18 or older. The App does not knowingly collect personal
          information from children. If you believe a child has contributed
          data, contact us and we will help remove it.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="changes">
          <span className={styles.num}>11.</span> Changes to this policy
        </h2>
        <p>
          We may update this policy from time to time. We will post changes on
          this page and update the effective date. If we change what the
          &ldquo;Help improve IndicSwipe&rdquo; programme collects, the App will
          ask for your consent again before collecting it.
        </p>
      </section>

      <section className={styles.section}>
        <h2 id="contact">
          <span className={styles.num}>12.</span> Contact us
        </h2>
        <p>
          If you have questions about this policy or your data, please contact
          our research team:
        </p>

        <div className={styles.contactCard}>
          <h3>AI4Bharat Research Lab</h3>
          <div className={styles.contactLinks}>
            <a
              href="mailto:support@ai4bharat.org"
              className={styles.contactEmailPill}
            >
              ✉️ support@ai4bharat.org
            </a>
            <a
              href="mailto:sriharikrishna07@gmail.com"
              className={styles.contactEmailPill}
            >
              ✉️ sriharikrishna07@gmail.com
            </a>
          </div>
          <p className={styles.addressText}>
            Indian Institute of Technology Madras (IIT Madras), Chennai, Tamil
            Nadu, India
          </p>
        </div>

        <a href="#summary" className={styles.backToTop}>
          ↑ Back to top
        </a>
      </section>
    </div>
  );
}
