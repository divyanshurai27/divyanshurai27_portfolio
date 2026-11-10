// Central place for every personal detail on the site.
// Header, hero, metadata, Open Graph, contact and footer all read from here.

export const site = {
  // Set this to your deployed domain (e.g. "https://divyanshurai.dev").
  // Canonical + Open Graph URL tags are only emitted once it is filled in.
  websiteUrl: "https://divyanshu-rai-portfolio.vercel.app",
  lang: "en",
  storageKey: "divyanshu-rai-portfolio:motion",
  themeStorageKey: "divyanshu-rai-portfolio:theme",

  identity: {
    fullName: "Divyanshu Rai",
    firstName: "Divyanshu",
    lastName: "Rai",
    initials: "DR",
    profession: "Full-Stack Developer",
    roleLine2: "React · Node.js · LLM & RAG systems",
    location: "Bengaluru, India",
    status: "QA Intern at Pickcel",
    greeting: "hey, I'm",
    headline: "I build full-stack products — then I try to break them.",
    intro:
      "Full-stack developer building React frontends, REST backends and retrieval-augmented LLM apps. Currently testing a production digital-signage SaaS as a QA Intern at Pickcel.",
    about: [
      "I'm a full-stack developer based in Bengaluru with solid fundamentals in Java, OOP, SQL and data structures — 250+ DSA problems solved across LeetCode and other platforms.",
      "As a Software Engineering Intern at Vaultofcodes I shipped 15+ REST API endpoints and 25+ peer-reviewed pull requests on two-week Agile sprints. On my own I've built an air-quality forecasting and respiratory-alert system, a hybrid-retrieval RAG system, an event-driven microservices backend and a MERN bookstore.",
      "Today I'm a QA Intern at Pickcel, testing a production web CMS and Android builds across browsers, devices and networks, and tracing failures through the UI, API and device layers.",
    ],
    portrait: "assets/portrait.webp", // pixel-art portrait (transparent); leave empty for the typographic hero
    resume: "", // e.g. "assets/resume.pdf" — download button appears when set
  },

  contact: {
    email: "raidivyanshu133@gmail.com",
    phone: "", // kept private by default
    whatsapp: "", // international digits only, e.g. "919876543210"; empty = hidden
    // Web3Forms access key (free at https://web3forms.com — it's emailed to you).
    // With a key, the contact form delivers straight to your inbox; without one it
    // falls back to opening the visitor's email app. The key is safe to publish.
    formAccessKey: "",
    linkedin: "https://linkedin.com/in/divyanshurai27",
    github: "https://github.com/divyanshurai27",
    leetcode: "https://leetcode.com/u/divyanshurai_27",
  },

  metrics: [
    { value: "15+", label: "REST endpoints shipped" },
    { value: "25+", label: "Peer-reviewed pull requests" },
    { value: "250+", label: "DSA problems solved" },
  ],

  process: [
    {
      title: "Build",
      text: "React frontends and Node.js / Express REST APIs, modelled in MongoDB or PostgreSQL.",
    },
    {
      title: "Verify",
      text: "Postman suites, Pytest unit and integration tests, GitHub Actions CI and Ragas evaluation gates.",
    },
    {
      title: "Debug",
      text: "Chrome DevTools, ADB and Lighthouse to trace failures across UI, API and device layers.",
    },
  ],

  skills: [
    { group: "Languages", items: ["Java", "JavaScript", "TypeScript", "Python", "SQL", "HTML5", "CSS3", "C"] },
    {
      group: "Frontend",
      items: ["React.js (Hooks, Context API)", "Next.js", "Tailwind CSS", "ShadCN UI", "Material UI", "Responsive Design"],
    },
    {
      group: "Backend",
      items: ["Node.js", "Express.js", "FastAPI", "RESTful API Design", "JWT Authentication", "Microservices", "RabbitMQ", "Middleware"],
    },
    {
      group: "Databases & Cloud",
      items: ["PostgreSQL", "MongoDB (Mongoose)", "ChromaDB", "Firebase", "AWS EC2", "Docker", "Docker Compose"],
    },
    {
      group: "AI & ML",
      items: ["OpenAI & Groq APIs", "Prompt Engineering", "RAG Pipelines", "LangChain", "Embeddings", "Ragas", "LightGBM", "SHAP"],
    },
    {
      group: "Tools & Practices",
      items: ["Git", "GitHub Actions (CI/CD)", "Pytest", "Postman", "Chrome DevTools", "Code Review", "Agile/Scrum"],
    },
    {
      group: "Core CS",
      items: ["Data Structures & Algorithms", "DBMS", "Operating Systems", "Computer Networks", "OOP"],
    },
  ],

  marquee: ["React", "Node.js", "Express", "FastAPI", "MongoDB", "PostgreSQL", "RabbitMQ", "LangChain", "RAG", "LightGBM", "Docker", "Java", "TypeScript", "AWS EC2"],

  // Hidden on the site (sections.education is false); set it to true to show these.
  education: [
    {
      school: "Yogiraj Public School, Kota (CBSE)",
      degree: "Class XII",
      period: "2022",
      detail: "69.2%",
    },
    {
      school: "Seth M.R. Jaipuria School, Varanasi (CBSE)",
      degree: "Class X",
      period: "2020",
      detail: "86.2%",
    },
  ],

  achievements: [
    {
      title: "Team Lead — Smart India Hackathon",
      text: "Directed a 6-member team through the internal and national rounds.",
      period: "2024 – 2025",
    },
    {
      title: "Backend Lead — ChipToCrop Hackathon",
      text: "Shipped the REST API and data layer for an agri-tech platform in 36 hours.",
      period: "2024 – 2025",
    },
    {
      title: "Top 12 of 990 — Innovation Tech 2024",
      text: "Top 1.2% finish; 5+ hackathons overall with 2 Top-5 finishes.",
      period: "2024 – 2026",
    },
    {
      title: "250+ DSA problems solved",
      text: "Across LeetCode and other competitive-programming platforms.",
      period: "2024 – present",
    },
    {
      title: "Python for Data Science, AI & Development",
      text: "IBM via Coursera — certification.",
      period: "Sept 2025",
    },
  ],

  // Dark is the default theme; `light` is used when the visitor toggles it on.
  appearance: {
    background: "#090909",
    text: "#f2efeb",
    accent: "#e32b3c",
    muted: "#a09c9a",
    light: {
      background: "#f4f1ec",
      text: "#151312",
      accent: "#d0202f",
      muted: "#5d5856",
    },
  },

  // Visitor stats — production builds only, off until filled in.
  analytics: {
    goatcounter: "dr7", // your GoatCounter code, e.g. "divyanshurai" for divyanshurai.goatcounter.com
    vercel: false, // true once the site is on Vercel with Web Analytics enabled
  },

  sections: {
    experience: true,
    education: false,
    achievements: true,
    contactForm: true,
  },
};
