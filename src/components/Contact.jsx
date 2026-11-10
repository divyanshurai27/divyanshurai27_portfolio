import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, Send } from "lucide-react";
import { site } from "../config/site.js";
import { Reveal } from "../motion.jsx";
import { socialLinks } from "./social.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY = { name: "", email: "", message: "" };

function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);
  const accessKey = site.contact.formAccessKey;

  const update = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const openMailApp = (subject, body) => {
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Please tell me your name.";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "Please enter a valid email address.";
    if (values.message.trim().length < 10) next.message = "A message of at least 10 characters, please.";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus({ type: "", text: "" });
      return;
    }

    const name = values.name.trim();
    const email = values.email.trim();
    const message = values.message.trim();
    const subject = `Portfolio enquiry from ${name}`;

    if (!accessKey) {
      openMailApp(subject, `${message}\n\n— ${name} (${email})`);
      setStatus({
        type: "info",
        text: `Your email app should now open with this message ready to send. If it didn't, write to ${site.contact.email} directly.`,
      });
      return;
    }

    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject,
          from_name: `${site.identity.fullName} — portfolio`,
          name,
          email,
          message,
          botcheck: e.currentTarget.elements.botcheck?.checked || false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`);
      setValues(EMPTY);
      setStatus({ type: "success", text: "Thanks — your message has been sent. I'll get back to you soon." });
    } catch {
      setStatus({
        type: "error",
        text: `Sorry, the message couldn't be sent. Please email me directly at ${site.contact.email}.`,
      });
    } finally {
      setSending(false);
    }
  };

  const field = (name, label, props = {}) => {
    const Tag = props.multiline ? "textarea" : "input";
    const { multiline, ...rest } = props;
    return (
      <div className={`field${errors[name] ? " field--error" : ""}`}>
        <label htmlFor={`cf-${name}`}>{label}</label>
        <Tag
          id={`cf-${name}`}
          name={name}
          value={values[name]}
          onChange={update(name)}
          aria-invalid={errors[name] ? "true" : undefined}
          aria-describedby={errors[name] ? `cf-${name}-error` : undefined}
          {...rest}
        />
        {errors[name] && (
          <p className="field__error" id={`cf-${name}-error`}>
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      {field("name", "Your name", { type: "text", autoComplete: "name" })}
      {field("email", "Your email", { type: "email", autoComplete: "email" })}
      {field("message", "Message", { multiline: true, rows: 5 })}
      {/* Honeypot: hidden from people, often filled in by spam bots. */}
      <input type="checkbox" name="botcheck" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn btn--primary" disabled={sending}>
        {sending ? "Sending…" : accessKey ? "Send message" : "Compose email"}
        {!sending && (accessKey ? <Send size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />)}
      </button>
      <p className="contact-form__note">
        {accessKey ? "Goes straight to my inbox." : "Opens in your email app — nothing is sent from this page."}
      </p>
      <p className={`contact-form__status${status.type ? ` contact-form__status--${status.type}` : ""}`} role="status">
        {status.text}
      </p>
    </form>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const { email } = site.contact;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <Reveal className="section__head">
          <p className="section__kicker">
            <span>05</span> Contact
          </p>
          <h2 id="contact-title" className="contact__title">
            Let's build
            <br />
            something <em>real.</em>
          </h2>
        </Reveal>

        <div className="contact__grid">
          <Reveal className="contact__info">
            <p className="contact__lead">
              Internships, SDE roles, hackathon teams or a project you'd like a hand with — my inbox is open.
            </p>
            <div className="contact__email">
              <a href={`mailto:${email}`}>
                <Mail size={20} aria-hidden="true" />
                {email}
              </a>
              <button type="button" className="icon-button" onClick={copy} aria-label={copied ? "Email copied" : "Copy email address"}>
                {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              </button>
              <span className="sr-only" role="status">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </div>
            <ul className="socials">
              {socialLinks().map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon size={18} aria-hidden="true" />
                    {label}
                    <ArrowUpRight size={14} aria-hidden="true" className="socials__arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          {site.sections.contactForm && (
            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
