// ---------------------------------------------------------------------------
// All site content lives here. Edit this file, refresh, done.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Varakorn',
  alias: 'Kazumi',
  role: 'Full Stack AI Engineer',
  roleSecond: 'Content Creator',
  tagline: 'I build AI agents, automation pipelines, and content that travels.',
  location: 'Subang Jaya · Selangor · Malaysia',
  email: 'varakornm0403@gmail.com',
  phone: '011 1126 7609',
  whatsapp: 'https://wa.me/601111267609',
  whatsappHire: 'https://wa.me/601111267609?text=Nice%20Website.%20I%20want%20to%20know%20more.',
  agency: 'Orion Automation',
  agencyUrl: 'https://www.orionautomation.xyz/',
  resume: '/Varakorn_Resume_2026.pdf',
  languages: ['English', 'Malay', 'Chinese', 'Thai (spoken)'],
};

/* What I bring, told in three categories instead of a flat number row. */
export const valueCategories = [
  {
    no: '01',
    title: 'Content Creator',
    kicker: 'the reach',
    stat: { value: 38, suffix: 'M+', label: 'views across social platforms' },
    story:
      'Two years in front of the camera for HYGR. 261+ videos, hooks rewritten ten times over, audiences won second by second. I know how attention works because I earned it the slow way.',
    chips: ['261+ videos shipped', 'Hooks & pacing', 'Short form', 'Brand campaigns'],
  },
  {
    no: '02',
    title: 'Natural Talent',
    kicker: 'the voice',
    stat: { value: 4, suffix: '', label: 'languages, one conversation away' },
    story:
      'English, Malay, Chinese and Thai. I pitch, joke and close in whichever one the room speaks. No translator, no script. A sales floor in any state of Malaysia feels like home ground.',
    chips: ['English', 'Malay', 'Chinese', 'Thai'],
  },
  {
    no: '03',
    title: 'Coding',
    kicker: 'the craft',
    stat: { value: 4, suffix: '+', label: 'AI systems built and shipped' },
    story:
      'Tendervise AI, autonomous agents, automation pipelines. Python and FastAPI on the back, React on the front, Langchain in between. The newest craft on this page and the one I sharpen every day.',
    chips: ['Python', 'FastAPI', 'React', 'Langchain'],
  },
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
      'AI system for the construction tender process. It parses tender documents, extracts requirements, and scores them with an ESG evaluating agent, targeting a 50% efficiency gain in tender response time.',
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
    kicker: 'Personal preventive care app',
    description:
      'A personalized AI doctor focused on daily health tracking. Long term data analysis surfaces potential risks before they become critical.',
    stack: ['Python', 'FastAPI', 'React', 'WebSockets'],
  },
];

export const services = [
  {
    title: 'AI Agents & RAG',
    body: 'Tool calling agents, retrieval pipelines, embeddings, prompt architecture. Langchain, Gemini API, VectorDB. Agents that actually ship to production.',
  },
  {
    title: 'Business Automation',
    body: 'BPA and workflow automation for real businesses. The quiet systems that post, parse, track, and reply while you sleep. FastAPI backends, n8n flows.',
  },
  {
    title: 'Content & Growth',
    body: '38M+ views taught me how attention works. Content strategy plus SEO, AEO and GEO. Engineering and distribution under one roof.',
  },
];

export const timeline = [
  {
    year: '2022',
    period: 'Sep 2022 to Jan 2024',
    chip: 'the origin',
    title: 'College Community Pasir Salak',
    role: 'Information Technology',
    story:
      'Where it all begins. A practical IT foundation: web development with HTML, CSS and PHP, game development in Unity and Unreal Engine, mobile apps, IoT experiments. I learned that I liked building things more than studying them.',
  },
  {
    year: '2024',
    period: 'Jan 2024 to Aug 2025',
    chip: 'the airwaves',
    title: 'HYGR',
    role: 'Content Creator',
    story:
      'I joined a local brand and learned the algorithm by feeding it. 261+ videos for HYGR’s Natural Deodorant and Tinted Lip Balm lines, 38 million views across every platform, booth sales in all 13 states of Malaysia. I learned voice, pacing, editing, and how to sell face to face.',
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
    period: 'Jan 2026 to Mar 2026',
    chip: 'the leap',
    title: 'Gamuda AI Academy',
    role: 'Full Stack AI Engineer · Project Team Lead',
    photo: '/photos/gamuda-graduation.jpg',
    photoCaption: 'Graduation speech · Gamuda AI Academy, KL Campus, March 2026',
    story:
      'Selected for an intensive AI engineering program. As team lead I built Tendervise AI, a tender analysis agent for the construction industry, and presented our prototype to YB Chang Lih Kang, Minister of Science, Technology and Innovation. Python, FastAPI, React, Langchain, agentic workflows: the full stack, for real this time.',
  },
  {
    year: 'NOW',
    period: '2026 to present',
    chip: 'the founding',
    title: 'Orion Automation',
    role: 'Founder · Engineer',
    story:
      'My own SSM registered automation studio in Subang Jaya. Custom web solutions, business process automation, chatbots, and SEO, AEO and GEO for businesses that want their busywork to disappear. A hybrid talent: communication trained on the sales floor, systems built like an engineer.',
  },
];

export const experience = [
  {
    org: 'Orion Automation',
    role: 'Founder / Engineer',
    period: '2026 to present',
    place: 'Subang Jaya, Selangor',
    points: [
      'SSM registered sole proprietorship offering custom automation, website workflows, and chatbots.',
      'Business process automation (BPA) that gives clients their hours back.',
      'SEO, AEO and GEO: search built for humans, answer engines, and generative engines.',
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
    period: 'Jan 2026 to Mar 2026',
    place: 'Kuala Lumpur',
    points: [
      'Led the Tendervise AI capstone: tender document analysis with ESG scoring agents, targeting a 50% efficiency gain.',
      'Presented the team prototype to YB Chang Lih Kang, Minister of Science, Technology and Innovation.',
      'Advanced Python, agentic workflows, and system integration, daily and intensively.',
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
    period: 'Jan 2024 to Aug 2025',
    place: 'Malaysia · all 13 states',
    points: [
      'Produced viral video content for the Natural Deodorant and Tinted Lip Balm lines: 38M+ views across 261+ videos.',
      'Supported offline booth sales directly. Sales floor and camera, same day.',
      'Drove to every state in Malaysia for brand campaigns on the ground.',
    ],
    card: {
      no: '001',
      type: 'CREATOR',
      accent: 'red',
      art: 'camera',
      flavor: 'Wild form. Feeds the algorithm and sells face to face in 13 states.',
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
  {
    group: 'Natural Talent',
    items: ['English', 'Malay', 'Chinese', 'Thai (spoken)', 'Leadership', 'Sales', 'Critical thinking', 'Adaptability'],
  },
];

export const goals = [
  {
    index: '01',
    title: 'Scale Orion Automation',
    body: 'From a one person SSM registered studio into the automation partner Malaysian SMEs call first. Small team, sharp craft, systems that pay for themselves.',
  },
  {
    index: '02',
    title: 'Ship agents that matter',
    body: 'Production AI agents that quietly erase thousands of hours of busywork. BPA as a craft, not a buzzword. Tendervise was the first; it won’t be the last.',
  },
  {
    index: '03',
    title: 'Keep one foot in the frame',
    body: '38 million views was chapter one, not a past life. Content stays in the toolkit. An engineer who can reach people is rarer than either alone.',
  },
  {
    index: '04',
    title: 'Master the agentic stack',
    body: 'RAG, multi agent orchestration, evals, the whole discipline. Deep enough that "it works" becomes "it works every time".',
  },
];

/* Blog shelves. Order here is the order of the tabs on the blog page. */
export const postCategories = [
  {
    id: 'blog',
    label: 'My Blog',
    kicker: 'Field notes',
    blurb: 'Opinions and post mortems. What actually happened, and what it taught me.',
  },
  {
    id: 'journey',
    label: 'My Journey',
    kicker: 'Chapters',
    blurb: 'The story in order. Classroom, camera, terminal, company.',
  },
  {
    id: 'learning',
    label: 'My Learning',
    kicker: 'Study log',
    blurb: 'Notes I write while a thing is still hard. Half tutorial, half diary.',
  },
];

/* A post may carry a featured image:
     cover:     '/photos/blog/thing.jpg'   file under /public, wide crops work best
     coverAlt:  'what the photo shows'     also printed as the caption in the reader
     coverPos:  '50% 26%'                  optional, moves the crop (object-position)
   Leave them off and the card draws a printed plate from the shelf instead. */
export const posts = [
  /* ---------------------------------------------------------------- my blog */
  {
    slug: 'what-38-million-views-taught-me',
    category: 'blog',
    date: '2026-03-28',
    dateLabel: 'Mar 28, 2026',
    title: 'What 38 million views taught me about attention',
    excerpt:
      'Two years, 261 videos, every state in Malaysia. The algorithm is not magic. It is feedback. Here is what actually moved the needle.',
    tags: ['content', 'growth'],
    minutes: 5,
    body: `
      <p>Between January 2024 and August 2025 I made 261+ videos for HYGR, natural deodorant and tinted lip balm. Not the most glamorous subject in the world. Those videos crossed 38 million views combined.</p>
      <p>People imagine virality as lightning. It isn't. It's plumbing.</p>
      <h3>The first two seconds are the whole video</h3>
      <p>Nobody decides to watch your video. They decide not to scroll past it. Those are different decisions, made at different speeds. I rewrote hooks five, six, ten times. The body of the video often survived untouched while the first two seconds went through more drafts than my resume.</p>
      <h3>Volume is a strategy, not a symptom</h3>
      <p>261 videos means 261 experiments. Maybe twenty of them did the heavy lifting on that 38M number. You cannot predict which twenty. Anyone who says they can is selling a course. The honest play is shipping enough shots that the distribution works in your favor, then studying the winners until the patterns stop being invisible.</p>
      <h3>Offline taught me more than analytics did</h3>
      <p>HYGR also put me on booth sales, physically driving to all 13 states of Malaysia. Watching a stranger's face while you pitch them deodorant teaches you things a retention graph never will. Where they lean in. Where their eyes drift. The internet is just that face, multiplied and sped up.</p>
      <p>I became an AI engineer afterwards, and people assume I left all this behind. The opposite. Every agent I build, every automation pipeline, still ends at a human deciding whether to keep paying attention. I just automate everything before that moment now.</p>
    `,
  },
  {
    slug: 'from-ring-light-to-terminal',
    category: 'blog',
    date: '2026-04-15',
    dateLabel: 'Apr 15, 2026',
    title: 'From ring light to terminal: why I switched to AI engineering',
    excerpt:
      'I had a good thing going as a creator. I traded it for Python errors at 2am, and it was the most rational decision I ever made.',
    tags: ['career', 'ai'],
    minutes: 4,
    body: `
      <p>In late 2025 I had a working formula: shoot, edit, post, repeat. 38M views of proof that I understood distribution. The reasonable move was to keep going.</p>
      <p>Instead I enrolled in a Python bootcamp in December 2025, then went all in at Gamuda AI Academy in January 2026. Here's the actual reasoning, minus the romance.</p>
      <h3>Creators rent. Engineers own.</h3>
      <p>Every view I generated lived on someone else's platform, subject to someone else's algorithm changes. The content treadmill never stops, and the moment you step off, the views stop too. Software is different. A system you build keeps working when you sleep. I wanted assets, not just output.</p>
      <h3>The overlap is the moat</h3>
      <p>There are better pure engineers than me. There are better pure creators than me. But the intersection, someone who can build an AI agent <em>and</em> explain it in four languages <em>and</em> sell it at a booth in Kelantan, gets very thin in the middle of that Venn diagram. My resume calls it a "hybrid talent". It is really just refusing to throw away half my experience.</p>
      <h3>AI made the timing urgent</h3>
      <p>I watched AI start writing captions, editing clips, generating voiceovers. The content skill curve was flattening from below. Meanwhile the skill of <em>directing</em> AI, building agents and designing pipelines, was compounding from above. You want to be on the compounding side.</p>
      <p>Three months at Gamuda later, I'd led a capstone team, built Tendervise AI, and presented to a government minister. The ring light is still on my desk. It just points at a whiteboard now.</p>
    `,
  },
  {
    slug: 'building-tendervise-ai',
    category: 'blog',
    date: '2026-05-09',
    dateLabel: 'May 9, 2026',
    title: 'Building Tendervise AI: eight weeks, one team, one minister',
    excerpt:
      'Our Gamuda AI Academy capstone: an agent that reads construction tenders and scores them by ESG criteria. What I learned leading the build.',
    tags: ['ai', 'engineering', 'leadership'],
    minutes: 6,
    body: `
      <p>Construction tenders are enormous documents, hundreds of pages of requirements, criteria, and compliance language. A response can take a team days. At Gamuda AI Academy, my capstone team set out to compress that to hours. A 50% efficiency gain was the target we wrote on the wall.</p>
      <h3>The architecture, briefly</h3>
      <p>Tendervise AI ingests tender documents, runs structured extraction over the requirements, and then an agent evaluates each tender with ESG scoring: environmental, social and governance criteria turned into something measurable. FastAPI on the back, RAG over the document corpus, Langchain orchestrating the agent steps, Postgres holding the structured results.</p>
      <p>The hard part was never the LLM call. It was everything around it: chunking documents so retrieval doesn't miss the one clause that matters, structuring extraction output so Pydantic can validate it, making the agent's scoring <em>explainable</em> so a human reviewer trusts it.</p>
      <h3>What team lead actually meant</h3>
      <p>I expected to spend the program getting better at Python. I did, but the role that changed me was team lead. Splitting the work so four people aren't blocking each other. Deciding what gets cut when the demo is in five days. Translating between a teammate's technical concern and a stakeholder's business question. My HYGR sales instincts turned out to be load bearing. Leading a build is mostly communication with a compiler attached.</p>
      <h3>The minister demo</h3>
      <p>We presented the prototype to YB Chang Lih Kang, Malaysia's Minister of Science, Technology and Innovation. You learn a particular skill preparing for that: compressing eight weeks of engineering into three minutes that someone outside engineering finds obviously valuable. No retrieval augmented anything in the pitch. Just "tenders take days, this takes hours, here's the proof".</p>
      <p>That demo is the whole job, honestly. Build something real, then make its value legible in three minutes. Everything I do at Orion Automation now runs on that same loop.</p>
    `,
  },
  {
    slug: 'why-malaysian-smes-need-automation',
    category: 'blog',
    date: '2026-06-02',
    dateLabel: 'Jun 2, 2026',
    title: 'The quiet case for automation in Malaysian small business',
    excerpt:
      'Most SMEs don’t need "AI transformation". They need the same six hours back every week. That’s the gap Orion Automation lives in.',
    tags: ['automation', 'business'],
    minutes: 4,
    body: `
      <p>When I registered Orion Automation in Subang Jaya, I had a theory: the businesses that need automation most are the ones least likely to buy "AI transformation".</p>
      <p>A kedai owner doesn't want a digital strategy deck. They want to stop manually copying WhatsApp orders into a spreadsheet at 11pm.</p>
      <h3>The busywork audit</h3>
      <p>Every engagement starts the same way: find the tasks that are (1) repeated, (2) rule based, and (3) resented. Posting schedules. Invoice chasing. Answering the same eight customer questions. Moving data from one app to another app that should have been talking to each other all along.</p>
      <p>None of this is glamorous. All of it compounds. Six hours a week is 300+ hours a year. For a small team, that's a part time employee made of wasted clicks.</p>
      <h3>Why now, specifically</h3>
      <p>Two things changed. First, LLMs made the messy middle automatable: the unstructured stuff (emails, documents, chat messages) that old school automation choked on. An agent can read an enquiry, classify it, draft the reply, and log it. Second, tools like FastAPI, n8n, and managed databases collapsed the build cost. What needed a software house in 2020 needs one engineer who knows the stack in 2026.</p>
      <h3>The HYGR proof</h3>
      <p>I lived this before I sold it. Behind those 38M views was an automation pipeline for scheduling, analytics, and campaign tracking, built so the creative work didn't drown in admin. The magic on camera was subsidized by the boring systems behind it. That's the trade I now make for clients: keep the human moments human, automate everything else.</p>
      <p>SEO used to mean pleasing Google. Now there's AEO and GEO: becoming the source that answer engines and generative engines cite. The businesses that get quietly systematized this decade will look like luck to everyone else. It won't be luck.</p>
    `,
  },
  {
    slug: 'four-languages-one-booth',
    category: 'blog',
    date: '2025-07-18',
    dateLabel: 'Jul 18, 2025',
    title: 'Four languages, one booth, thirteen states',
    excerpt:
      'Selling deodorant face to face in English, Malay, Chinese and Thai. The best communication training I never signed up for.',
    tags: ['sales', 'content'],
    minutes: 4,
    body: `
      <p>Somewhere between filming videos for HYGR, I ended up at booths in all 13 states of Malaysia. Shopping malls, night markets, weekend expos. A folding table, a stack of product, and whoever walked past.</p>
      <p>I speak English, Malay and Chinese, plus enough Thai to hold a conversation. At a booth in Malaysia you use all of them before lunch.</p>
      <h3>You cannot hide behind an edit</h3>
      <p>On camera, a bad take costs you thirty seconds. At a booth, a bad opening line costs you the customer, and they walk away while you are still talking. There is no second cut. You learn to read the first half second of someone's body language and adjust the sentence you are already saying.</p>
      <p>That skill has no name on a resume. It shows up as pace. It shows up as knowing when to stop explaining.</p>
      <h3>Language is not translation, it is register</h3>
      <p>The same pitch in Malay and in Chinese is not the same pitch translated. Different jokes land. Different objections come first. In Chinese the question was usually about ingredients. In Malay it was usually about whether it works in this heat. Switching languages meant switching the whole order of the pitch, not just the words.</p>
      <p>I do this now in client meetings for Orion Automation, and it barely feels different. A business owner who wants to stop copying WhatsApp orders into a spreadsheet is a customer at a booth. The product is just harder to hold.</p>
      <h3>Thirteen states is a lot of driving</h3>
      <p>It is also thirteen versions of the same country. What sells in Johor is not what sells in Kelantan, and the difference is not something you would ever learn from a dashboard. Malaysia is small enough to drive across and varied enough that you should.</p>
      <p>I would not trade those weekends for a better analytics stack. The analytics tell you what happened. The booth tells you why.</p>
    `,
  },
  {
    slug: 'what-261-videos-did-to-my-taste',
    category: 'blog',
    date: '2025-11-02',
    dateLabel: 'Nov 2, 2025',
    title: 'What 261 videos did to my taste',
    excerpt:
      'Make enough of anything and your standards mutate. Some of that is growth. Some of it is damage. Here is both.',
    tags: ['content', 'craft'],
    minutes: 4,
    body: `
      <p>261 videos is not a milestone, it is a habit that got out of hand. Somewhere past a hundred, the work stopped being something I did and became something I could see. That change is worth describing, because nobody warns you about the bad half.</p>
      <h3>The good half: you stop guessing</h3>
      <p>Early on I would finish an edit and genuinely not know if it was good. By video two hundred I could tell in the first pass, usually within the first two seconds of the rough cut. Not because I got smarter, but because I had watched enough of my own failures to recognise the shape of one. Taste is just compressed feedback.</p>
      <p>It also made me fast. The decisions that used to take an evening, which take to keep, where to cut, whether the hook earns the payoff, collapsed into seconds. Speed is not a shortcut. It is what expertise feels like from the inside.</p>
      <h3>The bad half: you start optimising the wrong thing</h3>
      <p>The other thing that happens is you begin to see everything as retention. I caught myself watching films and mentally noting where a normal person would scroll. I caught myself flattening ideas because the interesting version needed four seconds of setup and four seconds is expensive.</p>
      <p>That is the damage. When the only feedback loop you have is a metric, the metric slowly becomes your taste instead of informing it. I did not notice until I tried to write something long and found I had no patience for my own sentences.</p>
      <h3>The fix was changing medium</h3>
      <p>Learning to code helped more than any advice about balance. Software has a different feedback loop. It either works or it does not, and nobody scrolls past a function. Sitting with a bug for three hours rebuilt an attention span that two years of short form had quietly filed down.</p>
      <p>I still make things for people who might scroll. I just no longer let that be the only judge in the room.</p>
    `,
  },

  /* ------------------------------------------------------------- my journey */
  {
    slug: 'where-it-started-pasir-salak',
    category: 'journey',
    date: '2022-09-12',
    dateLabel: 'Sep 12, 2022',
    title: 'Chapter one: a small IT college in Pasir Salak',
    excerpt:
      'HTML, PHP, Unity, a few IoT boards, and the discovery that I liked building things more than studying them.',
    tags: ['college', 'beginnings'],
    minutes: 4,
    body: `
      <p>College Community Pasir Salak, September 2022. Information Technology. If you are picturing a glass campus with a startup incubator, adjust downward considerably.</p>
      <p>What it did have was a syllabus wide enough to touch everything: web development with HTML, CSS and PHP, game development in Unity and Unreal, mobile apps, a semester of IoT where we wired sensors to boards and argued about why nothing lit up.</p>
      <h3>Breadth beat depth, and that was lucky</h3>
      <p>Nothing we learned went deep. In hindsight that was the point. I got to touch a game engine, a web stack, a mobile toolchain and a microcontroller inside two years, which is four chances to find the thing that makes you lose track of time. For me it was always the moment something I typed showed up on a screen and did what I said.</p>
      <p>I was a mediocre student in the parts that required memorising and a much better one in the parts that required building. That gap told me something I did not act on for another three years.</p>
      <h3>The habit that survived</h3>
      <p>The specific technologies aged badly. PHP is not in my stack. I have not opened Unreal since. What survived was the reflex: when I do not understand something, I build a small version of it. That reflex is doing all the work in my career right now, and it started in a computer lab in Perak with a project deadline I was going to miss.</p>
      <p>I left in January 2024 without a clear plan, which is how the next chapter ended up being a camera instead of a keyboard.</p>
    `,
  },
  {
    slug: 'the-hygr-years',
    category: 'journey',
    date: '2024-02-04',
    dateLabel: 'Feb 4, 2024',
    title: 'Chapter two: nineteen months inside the algorithm',
    excerpt:
      'I joined HYGR as a content creator and learned distribution by feeding it every single day for a year and a half.',
    tags: ['hygr', 'content'],
    minutes: 5,
    body: `
      <p>January 2024. I joined HYGR, a Malaysian brand making natural deodorant and tinted lip balm, as their content creator. The job description was short. The job was not.</p>
      <p>Script, shoot, edit, post, read the numbers, repeat. Two product lines, every platform, no crew. By the time I left in August 2025 the counter said 261 videos and 38 million views.</p>
      <h3>Learning the algorithm by feeding it</h3>
      <p>You cannot read your way into understanding distribution. I tried. Every article says the same six things and none of them tell you why your video died at 40% retention on a Tuesday. The only teacher is volume with attention: ship, watch where people leave, change one thing, ship again.</p>
      <p>After a few hundred cycles you stop thinking about the algorithm as a thing to beat and start thinking about it as a very fast, very honest audience research tool. It is not mysterious. It is just brutally literal about what people actually watched.</p>
      <h3>The part nobody sees</h3>
      <p>Behind the videos was a pile of unglamorous infrastructure I built because the alternative was drowning: posting schedules, a tracker for which hook variant went where, campaign notes, performance logs. None of it was impressive engineering. All of it was the reason the creative work stayed possible.</p>
      <p>That is the seed of everything I do now. I was already automating my job before I knew that automation was a job.</p>
      <h3>Then they put me on a booth</h3>
      <p>HYGR also sent me to sell in person, across all 13 states. Standing in front of a stranger with a product in your hand is the highest resolution feedback that exists. It permanently changed how I write, how I pitch, and how I open a client call.</p>
      <p>I left in August 2025 with a skill set that looked, on paper, like a creator. Four months later I was writing Python at 2am.</p>
    `,
  },
  {
    slug: 'the-december-i-chose-python',
    category: 'journey',
    date: '2025-12-14',
    dateLabel: 'Dec 14, 2025',
    title: 'Chapter three: the December I chose Python',
    excerpt:
      'A bootcamp, a lot of syntax errors, and the first time a script of mine did something I would otherwise have had to do myself.',
    tags: ['python', 'pivot'],
    minutes: 4,
    body: `
      <p>December 2025. No job, some savings, and a decision I had been circling for a year. I enrolled in an intensive Python bootcamp covering fundamentals and AI agent integration.</p>
      <p>It was humbling in a very specific way. I was good at something. Now I was bad at something, on purpose, at 24, having recently been the person in the room who knew what he was doing.</p>
      <h3>The first two weeks are pure friction</h3>
      <p>Indentation errors. Variables that were strings when I needed numbers. Loops that ran once or forever and never the amount I wanted. There is no way to be clever through this part. You just sit in it until the friction drops.</p>
      <p>What kept me going was a trick I stole from content: ship daily. Not learn daily, ship daily. Every night something had to run, however small. A dozen lines that renamed files counts. The habit mattered more than the difficulty.</p>
      <h3>The moment it clicked</h3>
      <p>Halfway through the course I wrote a script that pulled numbers I used to copy by hand and dropped them into a sheet, formatted. It took me an evening. It saved me maybe twenty minutes a week. The maths is terrible and the feeling was enormous.</p>
      <p>That was the whole pivot, in one small script. Content is output that stops when you stop. Software is an asset that keeps working while you sleep. I had spent two years renting attention on someone else's platform. I wanted to own something.</p>
      <h3>Then agents</h3>
      <p>The last stretch of the bootcamp covered AI agent integration, and that is where the two halves of me met. An agent is a system that reads unstructured human mess and does something sensible with it. I had spent two years studying unstructured human mess for a living.</p>
      <p>Three weeks later I was accepted into Gamuda AI Academy.</p>
    `,
  },
  {
    slug: 'eight-weeks-at-gamuda',
    category: 'journey',
    date: '2026-03-20',
    dateLabel: 'Mar 20, 2026',
    title: 'Chapter four: Gamuda AI Academy, and a demo to a minister',
    excerpt:
      'Three months of full stack AI engineering, a capstone team to lead, and three minutes to explain it all to someone from outside the industry.',
    tags: ['gamuda', 'ai', 'leadership'],
    minutes: 5,
    cover: '/photos/gamuda-graduation.jpg',
    coverAlt: 'Giving the graduation speech at Gamuda AI Academy, KL campus',
    coverPos: '50% 26%',
    body: `
      <p>January to March 2026, Gamuda AI Academy, KL campus. Selected into an intensive full stack AI engineering program: Python, FastAPI, React, Langchain, RAG, agentic workflows, the whole pipeline from data to interface.</p>
      <p>I arrived as the guy with the unusual resume. Everyone else had a computer science degree or a dev job. I had 38 million views and a bootcamp certificate.</p>
      <h3>Being behind is a temporary condition</h3>
      <p>For the first fortnight I was the slowest person in most rooms and I decided that was information, not identity. I asked the questions that made me look inexperienced, took notes like a student, and spent evenings closing gaps that other people had closed in university.</p>
      <p>By week five the gap was mostly gone in the areas that mattered, and I had something they mostly did not: I could stand in front of people and make a thing sound worth caring about.</p>
      <h3>Team lead was the real curriculum</h3>
      <p>I was made project team lead for the capstone. We built Tendervise AI, an agent that reads construction tender documents and scores them against ESG criteria, targeting a 50% cut in response time.</p>
      <p>Leading it taught me more than the syllabus. Splitting work so four people are not blocked on each other. Deciding what gets cut when the demo is in five days. Sitting between a teammate's technical worry and a stakeholder's business question and translating both directions. My booth years turned out to be load bearing engineering skills.</p>
      <h3>Three minutes with YB Chang Lih Kang</h3>
      <p>We presented the prototype to Malaysia's Minister of Science, Technology and Innovation. Eight weeks of work, three minutes of attention, an audience with zero interest in our retrieval strategy.</p>
      <p>So we said: tenders take days, this takes hours, here is the proof. I gave the graduation speech that March. Both of those moments were the same skill, and it was not a skill I learned at the academy.</p>
    `,
  },
  {
    slug: 'the-day-orion-became-real',
    category: 'journey',
    date: '2026-04-06',
    dateLabel: 'Apr 6, 2026',
    title: 'Chapter five: registering Orion Automation',
    excerpt:
      'An SSM registration, a desk in Subang Jaya, and the decision to sell time back to businesses instead of selling my own.',
    tags: ['orion', 'business'],
    minutes: 4,
    body: `
      <p>After Gamuda the sensible move was a junior AI engineer role somewhere with a good ceiling. I registered a company instead.</p>
      <p>Orion Automation, SSM registered, based in Subang Jaya. Custom web solutions, business process automation, chatbots, and SEO, AEO and GEO for businesses that want their busywork to disappear.</p>
      <h3>Why not a job, honestly</h3>
      <p>Not because I am allergic to employment. Because the thing I am actually good at is the combination, and a job would have paid me for one half of it. Companies hire engineers to engineer and creators to create. Very few roles want the person who can build the agent, write the landing page, film the explainer and close the client.</p>
      <p>That combination is worth more assembled than split. So I assembled it.</p>
      <h3>The first clients set the shape</h3>
      <p>Nobody asked me for AI transformation. They asked me to stop a spreadsheet from eating their Tuesday nights. Orders copied by hand from WhatsApp. The same eight customer questions answered every day. Invoices chased manually.</p>
      <p>So that became the offer: find the tasks that are repeated, rule based and resented, and make them go away. Unglamorous, measurable, and easy to say yes to.</p>
      <h3>What now looks like</h3>
      <p>A studio of one that does not feel like one, because the two halves of my background cover for each other. The engineering makes the promise real. The creator years make it legible. Subang Jaya is the address, the internet is the market, and this site is the shop window.</p>
      <p>The story is still going. That is what the rest of this blog is for.</p>
    `,
  },

  /* ------------------------------------------------------------ my learning */
  {
    slug: 'my-first-script-that-mattered',
    category: 'learning',
    date: '2025-12-27',
    dateLabel: 'Dec 27, 2025',
    title: 'My first script that actually mattered',
    excerpt:
      'Forty lines of Python, twenty minutes saved a week, and the moment automation stopped being a concept.',
    tags: ['python', 'automation'],
    minutes: 3,
    body: `
      <p>Everyone's first useful script is embarrassing. Mine renamed and sorted a folder of video exports that I had been dragging around by hand for a year.</p>
      <p>Forty lines. <code>os</code>, <code>pathlib</code>, a regex I copied and did not fully understand, and a dry run flag I added after it renamed forty files wrong on the first try.</p>
      <h3>What I actually learned</h3>
      <p>Three things, in order of how much they surprised me.</p>
      <p>First, that a dry run flag is not a nice extra, it is the difference between an experiment and a disaster. I now write the print version of anything destructive before I write the doing version.</p>
      <p>Second, that the hard part is never the logic, it is the edge cases. Files with no extension. A file already named the target name. A folder that does not exist yet. The logic took twenty minutes and the edge cases took the rest of the evening.</p>
      <p>Third, that <code>if __name__ == "__main__":</code> makes sense the moment you import your own file for the first time and watch it run itself. No explanation had landed until then.</p>
      <h3>The economics are a trap and it does not matter</h3>
      <p>An evening of work to save twenty minutes a week pays back in about ten weeks. That was never the point. The point was that I now believed the loop existed: notice a repeated task, describe it precisely, hand it to a machine.</p>
      <p>Everything I have built since is that same loop with more layers on top.</p>
    `,
  },
  {
    slug: 'learning-rag-the-hard-way',
    category: 'learning',
    date: '2026-02-11',
    dateLabel: 'Feb 11, 2026',
    title: 'Learning RAG the hard way: chunking is the whole game',
    excerpt:
      'My retrieval kept missing the one clause that mattered. The model was fine. My chunks were not.',
    tags: ['rag', 'ai'],
    minutes: 5,
    body: `
      <p>The tutorial version of retrieval augmented generation takes about fifteen minutes. Load documents, split them, embed them, search, stuff the results into a prompt. It works immediately on a clean PDF and falls apart the moment you point it at a real one.</p>
      <p>On Tendervise AI the documents were construction tenders. Hundreds of pages of requirements, tables, appendices and legal language. The first version confidently missed things that were plainly in the document.</p>
      <h3>Fixed size chunks cut through meaning</h3>
      <p>My first splitter cut every 1000 characters. That happily slices a requirement in half, so the condition ends up in chunk 14 and the threshold it refers to ends up in chunk 15. Retrieval finds one of them. The model answers from half a rule and sounds certain about it.</p>
      <p>Splitting on structure instead of length fixed most of it: section headings first, then paragraphs, with an overlap so a chunk carries the tail of the one before it. Slower to write, much better recall.</p>
      <h3>A chunk without context is an orphan</h3>
      <p>The second fix was prefixing each chunk with where it came from. A bare paragraph saying "the threshold shall not exceed 15%" is nearly useless on its own. The same paragraph with its document title and section path attached is retrievable and quotable.</p>
      <p>Retrieval is a search problem before it is a model problem. If a human could not find the answer with the same query, the embedding will not save you.</p>
      <h3>Test with the questions people actually ask</h3>
      <p>My biggest mistake was evaluating retrieval with queries I invented, which unsurprisingly resembled my chunks. Real questions are vaguer, use different vocabulary, and often ask about two things at once. I built a small set of real questions with known correct sources and measured whether the right chunk came back at all. That number, not vibes, drove every change after.</p>
      <p>The lesson generalises. When an LLM system is wrong, look at what you fed it before you blame it.</p>
    `,
  },
  {
    slug: 'pydantic-taught-me-to-be-strict',
    category: 'learning',
    date: '2026-03-06',
    dateLabel: 'Mar 6, 2026',
    title: 'Pydantic taught me to be strict with a model that wants to ramble',
    excerpt:
      'Structured output turned my flakiest LLM step into the most boring part of the pipeline, which is exactly what you want.',
    tags: ['python', 'engineering'],
    minutes: 4,
    body: `
      <p>Early on, my extraction step asked the model for JSON, then I parsed it. Most of the time it worked. The rest of the time it wrapped the JSON in a code fence, or added a friendly sentence before it, or invented a field, or returned a number as a string.</p>
      <p>I wrote defensive parsing code. Then I wrote defensive code for the defensive code. Then someone showed me schemas.</p>
      <h3>Describe the shape, not the request</h3>
      <p>Defining a Pydantic model and having the output validated against it changes the failure mode completely. Instead of receiving something almost right and discovering it three functions later, you fail immediately, at the boundary, with a message that says exactly which field is wrong.</p>
      <p>Validation at the edge is not an LLM idea, it is just good engineering that LLMs make impossible to skip. Every unreliable input in a system deserves the same treatment.</p>
      <h3>Field descriptions are prompt engineering</h3>
      <p>The part I did not expect: the descriptions you attach to each field do real work. A field described as "score from 0 to 100" behaves differently from one described as "ESG score, 0 to 100, where 100 means full compliance with the stated criteria". The schema is not just a contract with your code, it is instructions to the model.</p>
      <p>I now spend more time writing field descriptions than writing prompts.</p>
      <h3>Optional means optional, so say so</h3>
      <p>Making a field required when the source document genuinely does not contain it forces the model to invent something. Every hallucination I traced in that pipeline came back to a schema that demanded an answer where none existed. Let fields be optional and let the model say nothing. A blank is honest. A guess is a bug you will find much later.</p>
    `,
  },
  {
    slug: 'fastapi-notes-from-a-first-backend',
    category: 'learning',
    date: '2026-04-24',
    dateLabel: 'Apr 24, 2026',
    title: 'FastAPI notes from my first real backend',
    excerpt:
      'Async, dependencies, background tasks, and the day I learned why a slow LLM call should never block a request.',
    tags: ['fastapi', 'backend'],
    minutes: 4,
    body: `
      <p>FastAPI is friendly enough that you can ship something working before you understand what you shipped. These are the things I only understood after they hurt.</p>
      <h3>Async is not free speed</h3>
      <p>I made every route <code>async def</code> because the docs used it, then called a blocking library inside one and wondered why the whole server stalled under two users. An async route that blocks blocks everything, because it holds the event loop hostage.</p>
      <p>The rule I settled on: if the work inside is genuinely awaitable, use async. If it is a blocking library, either use a plain <code>def</code> route and let the threadpool handle it, or push it off the request entirely.</p>
      <h3>Never make a user wait for a model</h3>
      <p>An LLM call that takes twelve seconds is not an HTTP response, it is a job. My first version had the browser waiting, the proxy timing out, and the user refreshing, which fired the whole expensive pipeline again.</p>
      <p>Accept the request, return an id immediately, do the work in a background task, let the client poll or stream. This is the single change that made the system feel like a product instead of a demo.</p>
      <h3>Dependencies are where the tidiness lives</h3>
      <p>The dependency injection system looked like ceremony until I had auth, a database session and a settings object needed in a dozen places. Declaring them as dependencies instead of importing globals made the routes readable and, more importantly, made them testable by substitution.</p>
      <h3>The docs page is a feature, use it</h3>
      <p>The automatic interactive docs are not just convenient. They are a forcing function: if a route looks confusing there, it is confusing. I started reading my own generated docs as a design review, and half my naming improved for free.</p>
    `,
  },
  {
    slug: 'evals-before-features',
    category: 'learning',
    date: '2026-05-18',
    dateLabel: 'May 18, 2026',
    title: 'Evals before features, or you are just guessing',
    excerpt:
      'Without a way to measure, every prompt change is a vibe. I lost two days to a "fix" that made things worse.',
    tags: ['ai', 'evals'],
    minutes: 4,
    body: `
      <p>Here is a failure I now recognise instantly. You tweak a prompt, try three examples by hand, decide it is better, and ship. A week later something unrelated is broken and you have no idea when it broke, because you never measured anything.</p>
      <p>I did this for a solid two days. The "improvement" fixed the three cases I was staring at and quietly degraded a category I had stopped checking.</p>
      <h3>A small set beats no set by an enormous margin</h3>
      <p>You do not need an evaluation framework to start. Twenty examples in a file with the input and what a good answer contains is enough to catch the change that makes things worse. The bar is not rigour, it is having any number at all that moves when you change something.</p>
      <p>I built mine out of real failures. Every time something went wrong in testing, that case went into the file. The set grows in exactly the places the system is weak.</p>
      <h3>Measure the step, not just the output</h3>
      <p>In a multi step pipeline, a bad final answer tells you almost nothing. Was the retrieval wrong, the extraction wrong, or the reasoning wrong? Scoring each stage separately turned debugging from archaeology into reading a report. Retrieval at 60% is a concrete thing to fix. "The agent is bad" is not.</p>
      <h3>The uncomfortable part</h3>
      <p>Evals tell you when your clever idea did nothing. That is genuinely annoying and it is the entire value. Half the prompt engineering I was proud of made no measurable difference, and knowing that saved me from carrying it around forever.</p>
      <p>It works, versus it works every time, is the whole distance between a demo and a product. Evals are how you walk it.</p>
    `,
  },
  {
    slug: 'teaching-myself-threejs',
    category: 'learning',
    date: '2026-06-11',
    dateLabel: 'Jun 11, 2026',
    title: 'Teaching myself three.js by building the site you are reading',
    excerpt:
      'Scene, camera, renderer, and then three weeks of learning that the hard part is lighting, not geometry.',
    tags: ['threejs', 'frontend'],
    minutes: 4,
    body: `
      <p>This portfolio has a 3D desk on the home page, a spinning globe, a lamp that turns the whole site to night mode. I built it to learn three.js, and picking a real thing to make taught me faster than any course would have.</p>
      <h3>The first cube is easy and misleading</h3>
      <p>Scene, camera, renderer, mesh, render loop. Twenty minutes to a spinning cube, and it gives you a completely false sense of progress. Nothing about a cube prepares you for a scene that needs to look intentional.</p>
      <p>The difficulty is not geometry. It is everything around it: where the light comes from, what the material does with it, how the camera frames a composition, and how it all reads on a phone.</p>
      <h3>Lighting is the design</h3>
      <p>My early scenes looked like plastic toys. Same models, but flat. What fixed them was treating lights like a photographer would: one key light doing most of the work, a fill to stop the shadows going black, and a rim to separate objects from the background.</p>
      <p>Once the lamp on the desk became the night mode switch, this got literal. Turning the page dark meant dimming the rig and boosting one bulb, and the mood change did more work than any CSS I wrote.</p>
      <h3>Performance is a mobile problem</h3>
      <p>Everything ran beautifully on my laptop and turned a mid range phone into a heater. Capping the pixel ratio, keeping the polygon count honest, disabling the whole scene when someone prefers reduced motion, and pausing the render loop when the tab is hidden. That list is most of the optimisation I needed.</p>
      <p>Also: if the 3D fails to load, the site must still be a site. Every scene here is decoration over working HTML, and that was a decision made early, not a rescue later.</p>
      <h3>Build a thing, not a tutorial</h3>
      <p>I learned more from wanting a specific desk to look a specific way than I ever did following along with someone else's cube. Pick the thing you actually want to exist, then learn only what stands between you and it.</p>
    `,
  },
  {
    slug: 'seo-then-aeo-then-geo',
    category: 'learning',
    date: '2026-07-09',
    dateLabel: 'Jul 9, 2026',
    title: 'SEO, then AEO, then GEO: what actually changed',
    excerpt:
      'Search stopped being a list of links and became an answer. Three letters changed and so did the whole job.',
    tags: ['seo', 'growth'],
    minutes: 4,
    body: `
      <p>I came to this from the content side, so I learned SEO as a creator: keywords, titles, thumbnails, watch time. Learning it properly for client work meant discovering that the discipline had quietly forked underneath me.</p>
      <h3>Three acronyms, one shift</h3>
      <p>SEO is optimising to rank in a list of links. AEO, answer engine optimisation, is optimising to be the source an answer box quotes. GEO, generative engine optimisation, is optimising to be what a language model cites when someone asks it a question.</p>
      <p>The difference matters because the win condition changed. Ranking third on a results page still got you traffic. Being the third best source for an answer that only quotes one gets you nothing.</p>
      <h3>What actually works, as far as I can tell</h3>
      <p>Be quotable. Answer the question in a single clean sentence near the top, then support it. Answer engines lift passages, not pages, so a passage that stands alone travels further than a beautifully structured argument that needs three paragraphs of run up.</p>
      <p>Be structured. Real headings that match real questions. Schema markup where it applies. Facts stated plainly with numbers attached, because a specific claim is easier to cite than a vague one.</p>
      <p>Be attributable. Say who you are and why you would know. Models and humans both weight sources, and an anonymous page of good advice loses to a named person with a track record.</p>
      <h3>The part that did not change</h3>
      <p>All of the above collapses into: write the genuinely useful thing, and make it easy to lift. That was already the advice ten years ago. The mechanism changed, the incentive did not.</p>
      <p>For clients I now treat it as one job with three surfaces. You are not choosing between ranking, being quoted and being cited. You are trying to be the obvious source, and the three surfaces all reward that.</p>
    `,
  },
];

export const nav = [
  { href: '/home', label: 'Home' },
  { href: '/journey', label: 'Journey' },
  { href: '/experience', label: 'Experience' },
  { href: '/blog', label: 'Blog' },
];
