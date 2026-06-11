// ---------------------------------------------------------------------------
// All site content lives here. Edit this file, refresh, done.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Varakorn',
  alias: 'Kazumi',
  role: 'Full Stack AI Engineer',
  roleSecond: 'Content Creator',
  tagline: 'I build AI agents, automation pipelines, and content that travels.',
  location: 'Shah Alam · Selangor · Malaysia',
  email: 'varakornm0403@gmail.com',
  phone: '011-1126-7609',
  whatsapp: 'https://wa.me/601111267609',
  agency: 'Orion Automation',
  agencyUrl: 'https://www.orionautomation.xyz/',
  resume: '/Varakorn_Resume_2026.pdf',
  languages: ['English', 'Malay', 'Chinese', 'Thai (spoken)'],
};

export const stats = [
  { value: 38, suffix: 'M+', label: 'views across social platforms' },
  { value: 261, suffix: '+', label: 'videos shipped for HYGR' },
  { value: 4, suffix: '', label: 'languages spoken' },
  { value: 13, suffix: '', label: 'states toured on booth sales' },
];

export const socials = [
  { id: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/601111267609' },
  { id: 'email', label: 'Email', href: 'mailto:varakornm0403@gmail.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/varakorn-meunukdomn' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/KazumiGIT' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@kazumi_v' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/_kazumi.v_' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com/@kazumi_v' },
  { id: 'agency', label: 'Orion Automation', href: 'https://www.orionautomation.xyz/' },
];

export const projects = [
  {
    index: '01',
    title: 'Tendervise AI',
    kicker: 'Capstone · Team Lead @ Gamuda AI Academy',
    description:
      'AI system for the construction tender process — parses tender documents, extracts requirements, and scores them with an ESG-evaluating agent. Targeting a 50% efficiency gain in tender response time.',
    stack: ['Python', 'FastAPI', 'Langchain', 'RAG', 'Postgres'],
  },
  {
    index: '02',
    title: 'Abang Mystery',
    kicker: 'Autonomous UX agent',
    description:
      'An intelligent agent that autonomously walks a website like a real user, tests the experience, and turns its findings into actionable insight reports for business owners.',
    stack: ['React', 'TypeScript', 'OpenAI', 'FastAPI'],
  },
  {
    index: '03',
    title: 'AI Health Monitor',
    kicker: 'Personal preventive-care app',
    description:
      'A personalized AI doctor focused on daily health tracking. Long-term data analysis surfaces potential risks before they become critical.',
    stack: ['Python', 'FastAPI', 'React', 'WebSockets'],
  },
  {
    index: '04',
    title: 'HYGR Ops Automation',
    kicker: 'Content-ops pipeline',
    description:
      'End-to-end automation behind a 38M-view content machine — posting schedules, analytics pipeline, and campaign tracking that gave back hours every week.',
    stack: ['Python', 'n8n', 'Langchain', 'FastAPI'],
  },
];

export const services = [
  {
    title: 'AI Agents & RAG',
    body: 'Tool-calling agents, retrieval pipelines, embeddings, prompt architecture. Langchain, Gemini API, VectorDB — agents that actually ship to production.',
  },
  {
    title: 'Business Automation',
    body: 'BPA and workflow automation for real businesses — the quiet systems that post, parse, track, and reply while you sleep. FastAPI backends, n8n flows.',
  },
  {
    title: 'Content & Growth',
    body: '38M+ views taught me how attention works. Content strategy, SEO / AEO / GEO — engineering and distribution under one roof.',
  },
];

export const timeline = [
  {
    year: '2022',
    period: 'Sep 2022 — Jan 2024',
    chip: 'the origin',
    title: 'College Community Pasir Salak',
    role: 'Information Technology',
    story:
      'Where it all begins — a practical IT foundation. Web development with HTML, CSS and PHP, game development in Unity and Unreal Engine, mobile apps, IoT experiments. I learned that I liked building things more than studying them.',
  },
  {
    year: '2024',
    period: 'Jan 2024 — Aug 2025',
    chip: 'the airwaves',
    title: 'HYGR',
    role: 'Content Creator',
    story:
      'I joined a local brand and learned the algorithm by feeding it. 261+ videos for HYGR’s Natural Deodorant and Tinted Lip Balm lines — 38 million views across every platform. Booth sales in all 13 states of Malaysia. I learned voice, pacing, editing — and how to sell face to face.',
  },
  {
    year: '2025',
    period: 'Dec 2025',
    chip: 'the training',
    title: 'Python Bootcamp',
    role: 'Certificate of Completion',
    story:
      'The pivot. An intensive bootcamp on Python fundamentals and AI agent integration. Nights of syntax, patterns, and small scripts that automated little corners of my life. The camera started sharing desk space with the terminal.',
  },
  {
    year: '2026',
    period: 'Jan 2026 — Mar 2026',
    chip: 'the leap',
    title: 'Gamuda AI Academy',
    role: 'Full Stack AI Engineer · Project Team Lead',
    photo: '/photos/gamuda-graduation.jpg',
    photoCaption: 'Graduation speech — Gamuda AI Academy, KL Campus, March 2026',
    story:
      'Selected for an intensive AI engineering program. As team lead I built Tendervise AI — a tender-analysis agent for the construction industry — and presented our prototype to YB Chang Lih Kang, Minister of Science, Technology and Innovation. Python, FastAPI, React, Langchain, agentic workflows: the full stack, for real this time.',
  },
  {
    year: 'NOW',
    period: '2026 — present',
    chip: 'the founding',
    title: 'Orion Automation',
    role: 'Founder · Engineer',
    story:
      'My own SSM-registered automation studio in Shah Alam. Custom web solutions, business process automation, chatbots, and SEO / AEO / GEO for businesses that want their busywork to disappear. A hybrid talent — sales-trained communication, engineer-built systems.',
  },
];

export const experience = [
  {
    org: 'Orion Automation',
    role: 'Founder / Engineer',
    period: '2026 — present',
    place: 'Shah Alam, Selangor',
    points: [
      'SSM-registered sole proprietorship — custom automation, website workflows, chatbots.',
      'Business process automation (BPA) that gives clients their hours back.',
      'SEO / AEO / GEO — search built for humans, answer engines, and generative engines.',
    ],
    link: 'https://www.orionautomation.xyz/',
    card: {
      no: '003',
      type: 'FOUNDER',
      accent: 'gold',
      art: 'stars',
      flavor: 'Named after the constellation. Builds systems that work the night shift.',
      stats: [
        { k: 'Established', v: '2026 · SSM' },
        { k: 'Craft', v: 'AI agents & automation' },
        { k: 'Search', v: 'SEO · AEO · GEO' },
      ],
    },
  },
  {
    org: 'Gamuda AI Academy',
    role: 'Full Stack AI Engineer Trainee · Project Team Lead',
    period: 'Jan 2026 — Mar 2026',
    place: 'Kuala Lumpur',
    points: [
      'Led the Tendervise AI capstone — tender document analysis with ESG-scoring agents, targeting a 50% efficiency gain.',
      'Presented the team prototype to YB Chang Lih Kang, Minister of Science, Technology and Innovation.',
      'Advanced Python, agentic workflows, and system integration — daily, intensively.',
    ],
    card: {
      no: '002',
      type: 'ENGINEER',
      accent: 'blue',
      art: 'monitor',
      flavor: 'Evolved from Creator. Learns agentic workflows at an accelerated rate.',
      stats: [
        { k: 'Capstone', v: 'Tendervise AI' },
        { k: 'Target', v: '+50% efficiency' },
        { k: 'Final demo', v: 'Minister of Science' },
      ],
    },
  },
  {
    org: 'HYGR',
    role: 'Content Creator',
    period: 'Jan 2024 — Aug 2025',
    place: 'Malaysia · all 13 states',
    points: [
      'Produced viral video content for the Natural Deodorant & Tinted Lip Balm lines — 38M+ views across 261+ videos.',
      'Supported offline booth sales directly — sales floor and camera, same day.',
      'Drove to every state in Malaysia for on-ground brand campaigns.',
    ],
    card: {
      no: '001',
      type: 'CREATOR',
      accent: 'red',
      art: 'camera',
      flavor: 'Wild form. Feeds the algorithm and sells face-to-face in 13 states.',
      stats: [
        { k: 'Views', v: '38,000,000+' },
        { k: 'Videos', v: '261+' },
        { k: 'States toured', v: '13 / 13' },
      ],
    },
  },
];

export const skills = [
  { group: 'Frontend', items: ['React', 'JavaScript / TypeScript', 'HTML & CSS', 'Three.js'] },
  { group: 'Backend', items: ['Python', 'FastAPI', 'REST APIs', 'Pydantic'] },
  { group: 'AI Integration', items: ['Langchain', 'RAG & VectorDB', 'Gemini API', 'Prompt Engineering', 'Google Cloud'] },
  { group: 'Database', items: ['PostgreSQL', 'MongoDB', 'Supabase', 'Firebase'] },
  { group: 'DevOps', items: ['Git', 'Docker', 'Vercel'] },
  { group: 'Human', items: ['4 languages', 'Leadership', 'Sales', 'Critical thinking', 'Adaptability'] },
];

export const goals = [
  {
    index: '01',
    title: 'Scale Orion Automation',
    body: 'From a one-person SSM-registered studio into the automation partner Malaysian SMEs call first — small team, sharp craft, systems that pay for themselves.',
  },
  {
    index: '02',
    title: 'Ship agents that matter',
    body: 'Production AI agents that quietly erase thousands of hours of busywork — BPA as a craft, not a buzzword. Tendervise was the first; it won’t be the last.',
  },
  {
    index: '03',
    title: 'Keep one foot in the frame',
    body: '38 million views was chapter one, not a past life. Content stays in the toolkit — an engineer who can reach people is rarer than either alone.',
  },
  {
    index: '04',
    title: 'Master the agentic stack',
    body: 'RAG, multi-agent orchestration, evals, the whole discipline — deep enough that "it works" becomes "it works every time."',
  },
];

export const posts = [
  {
    slug: 'what-38-million-views-taught-me',
    date: '2026-03-28',
    dateLabel: 'Mar 28, 2026',
    title: 'What 38 million views taught me about attention',
    excerpt:
      'Two years, 261 videos, every state in Malaysia. The algorithm is not magic — it is feedback. Here is what actually moved the needle.',
    tags: ['content', 'growth'],
    minutes: 5,
    body: `
      <p>Between January 2024 and August 2025 I made 261+ videos for HYGR — natural deodorant and tinted lip balm. Not the most glamorous subject in the world. Those videos crossed 38 million views combined.</p>
      <p>People imagine virality as lightning. It isn't. It's plumbing.</p>
      <h3>The first two seconds are the whole video</h3>
      <p>Nobody decides to watch your video. They decide not to scroll past it. Those are different decisions, made at different speeds. I rewrote hooks five, six, ten times — the body of the video often survived untouched while the first two seconds went through more drafts than my resume.</p>
      <h3>Volume is a strategy, not a symptom</h3>
      <p>261 videos means 261 experiments. Maybe twenty of them did the heavy lifting on that 38M number. You cannot predict which twenty. Anyone who says they can is selling a course. The honest play is shipping enough shots that the distribution works in your favor — then studying the winners until the patterns stop being invisible.</p>
      <h3>Offline taught me more than analytics did</h3>
      <p>HYGR also put me on booth sales — physically driving to all 13 states of Malaysia. Watching a stranger's face while you pitch them deodorant teaches you things a retention graph never will. Where they lean in. Where their eyes drift. The internet is just that face, multiplied and sped up.</p>
      <p>I became an AI engineer afterwards, and people assume I left all this behind. The opposite. Every agent I build, every automation pipeline — it still ends at a human deciding whether to keep paying attention. I just automate everything before that moment now.</p>
    `,
  },
  {
    slug: 'from-ring-light-to-terminal',
    date: '2026-04-15',
    dateLabel: 'Apr 15, 2026',
    title: 'From ring light to terminal: why I switched to AI engineering',
    excerpt:
      'I had a good thing going as a creator. I traded it for Python errors at 2am — and it was the most rational decision I ever made.',
    tags: ['career', 'ai'],
    minutes: 4,
    body: `
      <p>In late 2025 I had a working formula: shoot, edit, post, repeat. 38M views of proof that I understood distribution. The reasonable move was to keep going.</p>
      <p>Instead I enrolled in a Python bootcamp in December 2025, then went all-in at Gamuda AI Academy in January 2026. Here's the actual reasoning, minus the romance.</p>
      <h3>Creators rent. Engineers own.</h3>
      <p>Every view I generated lived on someone else's platform, subject to someone else's algorithm changes. The content treadmill never stops, and the moment you step off, the views stop too. Software is different — a system you build keeps working when you sleep. I wanted assets, not just output.</p>
      <h3>The overlap is the moat</h3>
      <p>There are better pure engineers than me. There are better pure creators than me. But the intersection — someone who can build an AI agent <em>and</em> explain it in four languages <em>and</em> sell it at a booth in Kelantan — that Venn diagram gets very thin in the middle. My resume calls it a "hybrid talent." It's really just refusing to throw away half my experience.</p>
      <h3>AI made the timing non-negotiable</h3>
      <p>I watched AI start writing captions, editing clips, generating voiceovers. The content skill curve was flattening from below. Meanwhile the skill of <em>directing</em> AI — building agents, designing pipelines — was compounding from above. You want to be on the compounding side.</p>
      <p>Three months at Gamuda later, I'd led a capstone team, built Tendervise AI, and presented to a government minister. The ring light is still on my desk. It just points at a whiteboard now.</p>
    `,
  },
  {
    slug: 'building-tendervise-ai',
    date: '2026-05-09',
    dateLabel: 'May 9, 2026',
    title: 'Building Tendervise AI: eight weeks, one team, one minister',
    excerpt:
      'Our Gamuda AI Academy capstone — an agent that reads construction tenders and scores them by ESG criteria. What I learned leading the build.',
    tags: ['ai', 'engineering', 'leadership'],
    minutes: 6,
    body: `
      <p>Construction tenders are enormous documents — hundreds of pages of requirements, criteria, and compliance language. A response can take a team days. At Gamuda AI Academy, my capstone team set out to compress that to hours: a 50% efficiency gain was the target we wrote on the wall.</p>
      <h3>The architecture, briefly</h3>
      <p>Tendervise AI ingests tender documents, runs structured extraction over the requirements, and then an agent evaluates each tender with ESG scoring — environmental, social, governance criteria turned into something measurable. FastAPI on the back, RAG over the document corpus, Langchain orchestrating the agent steps, Postgres holding the structured results.</p>
      <p>The hard part was never the LLM call. It was everything around it: chunking documents so retrieval doesn't miss the one clause that matters, structuring extraction output so Pydantic can validate it, making the agent's scoring <em>explainable</em> so a human reviewer trusts it.</p>
      <h3>What team lead actually meant</h3>
      <p>I expected to spend the program getting better at Python. I did — but the role that changed me was team lead. Splitting the work so four people aren't blocking each other. Deciding what gets cut when the demo is in five days. Translating between a teammate's technical concern and a stakeholder's business question. My HYGR sales instincts turned out to be load-bearing — leading a build is mostly communication with a compiler attached.</p>
      <h3>The minister demo</h3>
      <p>We presented the prototype to YB Chang Lih Kang, Malaysia's Minister of Science, Technology and Innovation. You learn a particular skill preparing for that: compressing eight weeks of engineering into three minutes that a non-engineer finds obviously valuable. No retrieval-augmented anything in the pitch — just "tenders take days, this takes hours, here's the proof."</p>
      <p>That demo is the whole job, honestly. Build something real, then make its value legible in three minutes. Everything I do at Orion Automation now runs on that same loop.</p>
    `,
  },
  {
    slug: 'why-malaysian-smes-need-automation',
    date: '2026-06-02',
    dateLabel: 'Jun 2, 2026',
    title: 'The quiet case for automation in Malaysian small business',
    excerpt:
      'Most SMEs don’t need "AI transformation." They need the same six hours back every week. That’s the gap Orion Automation lives in.',
    tags: ['automation', 'business'],
    minutes: 4,
    body: `
      <p>When I registered Orion Automation in Shah Alam, I had a theory: the businesses that need automation most are the ones least likely to buy "AI transformation."</p>
      <p>A kedai owner doesn't want a digital strategy deck. They want to stop manually copying WhatsApp orders into a spreadsheet at 11pm.</p>
      <h3>The busywork audit</h3>
      <p>Every engagement starts the same way — find the tasks that are (1) repeated, (2) rule-based, and (3) resented. Posting schedules. Invoice chasing. Answering the same eight customer questions. Moving data from one app to another app that should have been talking to each other all along.</p>
      <p>None of this is glamorous. All of it compounds. Six hours a week is 300+ hours a year — for a small team, that's a part-time employee made of wasted clicks.</p>
      <h3>Why now, specifically</h3>
      <p>Two things changed. First, LLMs made the messy middle automatable — the unstructured stuff (emails, documents, chat messages) that old-school automation choked on. An agent can read an enquiry, classify it, draft the reply, and log it. Second, tools like FastAPI, n8n, and managed databases collapsed the build cost. What needed a software house in 2020 needs one engineer who knows the stack in 2026.</p>
      <h3>The HYGR proof</h3>
      <p>I lived this before I sold it. Behind those 38M views was an automation pipeline — scheduling, analytics, campaign tracking — that I built so the creative work didn't drown in admin. The magic on camera was subsidized by the boring systems behind it. That's the trade I now make for clients: keep the human moments human, automate everything else.</p>
      <p>SEO used to mean pleasing Google. Now there's AEO and GEO — being the answer engines and generative engines cite. The businesses that get quietly systematized this decade will look like luck to everyone else. It won't be luck.</p>
    `,
  },
];

export const nav = [
  { href: 'index.html', label: 'Home' },
  { href: 'journey.html', label: 'Journey' },
  { href: 'experience.html', label: 'Experience' },
  { href: 'blog.html', label: 'Blog' },
];
