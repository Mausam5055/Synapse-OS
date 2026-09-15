import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'orchestrator-agent',
    slug: 'orchestrator-agent',
    title: 'Sanjeevni-OS Orchestrator',
    subtitle: 'The Central Brain of the Health Platform',
    tagline: 'Understands intent, plans multi-step tasks, and delegates',
    location: 'Core Infrastructure',
    status: 'Available',
    statusText: 'Core Service · Active',
    units: '1 Master Agent',
    specs: [
      { label: 'Framework', value: 'LangGraph & CrewAI' },
      { label: 'LLM Brain', value: 'Google Gemini 3.5 Flash' },
      { label: 'Memory', value: 'ChromaDB + Supabase' },
      { label: 'Channels', value: 'Voice, Web, WhatsApp, SMS' },
      { label: 'Role', value: 'Multi-agent coordination' },
      { label: 'Features', value: 'Session management, Context bridging' },
    ],
    heroImage: '/images/medical/orchestrator_ops_center.jpg',
    thumbnailImage: '/images/medical/orchestrator_director_review.jpg',
    galleryImages: [
      '/images/medical/orchestrator_ops_center.jpg',
      '/images/medical/orchestrator_director_review.jpg',
    ],
    description:
      'The Orchestrator Agent (Sanjeevni-OS) is the central brain of the platform. Powered by Google Gemini 3.5 Flash, it normalizes every channel\'s message format, understands user intent, plans complex multi-step tasks, and delegates them to the appropriate specialized agents without losing context.',
    chapters: [
      {
        number: '01',
        subtitle: 'The Workflow',
        title: 'Seamless Delegation',
        description:
          'When a user asks to "check my last scan and log today\'s meals", the Orchestrator plans this as a sequence across the Medical Scan and Nutrition agents.',
        images: ['/images/medical/orchestrator_ops_center.jpg', '/images/medical/orchestrator_director_review.jpg'],
        features: ['Intent Classification', 'Task Planning', 'Result Merging'],
      },
      {
        number: '02',
        subtitle: 'Omnichannel Memory',
        title: 'Continuous Context',
        description:
          'Because all agents share the same vector store and relational DB, a task started on WhatsApp can be seamlessly picked up in the web dashboard or by voice.',
        images: ['/images/medical/orchestrator_ops_center.jpg'],
        features: ['Shared Vector DB', 'Event Bus integration', 'Multi-device tracking'],
      },
    ],
  },
  {
    id: 'medical-scan-agent',
    slug: 'medical-scan-agent',
    title: 'Medical Scan Agent',
    subtitle: 'Clinical Intelligence for Documents and Scans',
    tagline: 'Translates complex reports into plain language',
    location: 'Clinical Cluster',
    status: 'Available',
    statusText: 'Clinical Service · Active',
    units: 'Vision & OCR Module',
    specs: [
      { label: 'Vision Model', value: 'LLaVA / Gemini Vision' },
      { label: 'OCR Model', value: 'Microsoft TrOCR' },
      { label: 'Input', value: 'Handwritten prescriptions, X-rays, MRIs' },
      { label: 'Output', value: 'Plain language summaries & Structured data' },
      { label: 'Integration', value: 'Writes directly to Blockchain Records' },
    ],
    heroImage: '/images/medical/scan_radiologist_diagnostic.jpg',
    thumbnailImage: '/images/medical/scan_ct_suite.jpg',
    galleryImages: [
      '/images/medical/scan_radiologist_diagnostic.jpg',
      '/images/medical/scan_ct_suite.jpg',
    ],
    description:
      'The Medical Scan Agent uses advanced Vision LLMs and OCR to read handwritten prescriptions, lab reports, and X-ray/MRI images, summarizing them in plain language for the patient and storing structured data for other agents.',
    chapters: [
      {
        number: '01',
        subtitle: 'The Processing',
        title: 'Instant Extraction',
        description:
          'Upload a photo of a blood test, and the agent parses the PDF, flags out-of-range values, and explains them simply without medical jargon.',
        features: ['Handwritten OCR', 'Medical terminology parsing', 'Anomaly flagging'],
      },
      {
        number: '02',
        subtitle: 'Integration',
        title: 'Connected to the Swarm',
        description:
          'Once a scan is processed, it publishes an event. The Blockchain Records agent can then hash this record, and the 3D Visualization agent can highlight the affected organs.',
        features: ['Event-driven architecture', 'Blockchain hashing', 'Visual syncing'],
      },
    ],
  },
  {
    id: 'symptom-triage-agent',
    slug: 'symptom-triage-agent',
    title: 'Symptom Triage Agent',
    subtitle: 'Structured Q&A and Emergency Routing',
    tagline: 'Intelligent triage before you see a doctor',
    location: 'Clinical Cluster',
    status: 'Upcoming',
    statusText: 'Beta Service · In Testing',
    specs: [
      { label: 'Core Tech', value: 'Hybrid Decision Tree + LLM' },
      { label: 'Action', value: 'Routes to ER, GP, or Home Care' },
      { label: 'Context', value: 'Reads user medical history' },
      { label: 'Council Mode', value: 'Supports dual-agent verification' },
    ],
    heroImage: '/images/medical/agent_swarm_doctors.jpg',
    thumbnailImage: '/images/medical/triage_er_intake.jpg',
    galleryImages: [
      '/images/medical/agent_swarm_doctors.jpg',
      '/images/medical/triage_er_intake.jpg',
    ],
    description:
      'The Symptom Triage Agent engages the user in a structured Q&A when they report feeling unwell. It cross-references their history and current symptoms to suggest whether they need immediate emergency care, a GP visit, or simple rest.',
    chapters: [
      {
        number: '01',
        subtitle: 'Safety First',
        title: 'Council Mode Verification',
        description:
          'For serious symptoms, the query is silently run through two independently-prompted agents (e.g., a cautious persona and a guideline-based persona) to ensure a safe, balanced recommendation.',
        features: ['Multi-agent debate', 'Emergency escalation', 'Explainable AI outputs'],
      },
    ],
  },
  {
    id: 'blockchain-records-agent',
    slug: 'blockchain-records-agent',
    title: 'Blockchain Records Agent',
    subtitle: 'Tamper-proof Health Verification',
    tagline: 'Your data, verified on-chain',
    location: 'Trust Cluster',
    status: 'Sold Out',
    statusText: 'WIP · Architecture Phase',
    specs: [
      { label: 'Network', value: 'Polygon Amoy Testnet' },
      { label: 'Storage', value: 'IPFS via web3.storage' },
      { label: 'Smart Contracts', value: 'OpenZeppelin ERC-721' },
    ],
    heroImage: '/images/medical/blockchain_nodes_network.jpg',
    thumbnailImage: '/images/medical/blockchain_crypto_vault.jpg',
    galleryImages: ['/images/medical/blockchain_nodes_network.jpg', '/images/medical/blockchain_crypto_vault.jpg'],
    description:
      'Writes and reads tamper-proof health records. When an agent creates a new record or processes a prescription, this agent hashes the data to the Polygon blockchain, ensuring it cannot be secretly altered.',
    chapters: [],
  },
  {
    id: 'interactive-body-visualizer',
    slug: 'vibrant',
    title: 'Interactive 3D Body Visualizer',
    subtitle: 'Real-Time Anatomical & Organ Intelligence Engine',
    tagline: 'Interactive 3D shaders, multi-organ breakdown, and spatial biological models',
    location: 'Visualization Cluster',
    status: 'Available',
    statusText: 'Interactive 3D · Live',
    units: 'Interactive WebGL 3D Model',
    specs: [
      { label: 'Graphics Engine', value: 'Three.js & WebGL Shaders' },
      { label: 'Decompression', value: 'Google Draco WASM' },
      { label: 'Organs Supported', value: 'Brain, Heart, Liver, Gut, Hormones, DNA, Cells' },
      { label: 'Lighting', value: 'Studio GainMap HDR Environment' },
      { label: 'Rendering', value: 'Iridescent Pearlescent Materials' },
      { label: 'Audio', value: 'Spatial Ambient Sound FX' },
    ],
    heroImage: '/images/medical/gallery_icu_barasat.jpg',
    thumbnailImage: '/images/medical/closing_hospital_building.jpg',
    galleryImages: [
      '/images/medical/gallery_icu_barasat.jpg',
      '/images/medical/closing_hospital_building.jpg',
    ],
    description:
      'The Interactive 3D Body & Organ Visualizer renders ultra-high-definition biological models in real-time WebGL. Users can rotate, zoom, switch male/female anatomies, and inspect deep organ health clusters—from neurology and cardiovascular systems to gut microbiomes and cellular longevity.',
    chapters: [
      {
        number: '01',
        subtitle: 'Multi-Organ Exploration',
        title: 'Real-Time 3D Camera Focus',
        description:
          'Seamlessly transition the 3D viewport between brain, heart, digestive tract, endocrine system, and cellular DNA with custom dissolution shaders.',
        features: ['Draco-compressed geometry', 'Physically based matcaps', 'Real-time organ hotspots'],
      },
      {
        number: '02',
        subtitle: 'Agent Integration',
        title: 'Visualizing Health Swarm Data',
        description:
          'Directly integrates with the Medical Scan Agent and Symptom Triage Agent to highlight affected body areas and provide spatial health clarity.',
        features: ['Bi-directional state bridging', 'Interactive tooltips & QR reports', 'Spatial sound feedback'],
      },
    ],
  },
  {
    id: 'outbreak-predictive-agent',
    slug: 'outbreak-predictive-agent',
    title: 'Outbreak Predictive Agent',
    subtitle: 'Public Health Forecasting',
    tagline: 'Live heatmaps and risk scoring',
    location: 'Public Health Cluster',
    status: 'Sold Out',
    statusText: 'WIP · Data Ingestion',
    specs: [
      { label: 'Data Source', value: 'WHO GHO API & disease.sh' },
      { label: 'Model', value: 'Time-series forecasting (ARIMA/TimeGPT)' },
      { label: 'Output', value: 'Geo-heatmaps and alerts' },
    ],
    heroImage: '/images/medical/outbreak_surveillance_warroom.jpg',
    thumbnailImage: '/images/medical/outbreak_field_team.jpg',
    galleryImages: ['/images/medical/outbreak_surveillance_warroom.jpg', '/images/medical/outbreak_field_team.jpg'],
    description:
      'Performs time-series forecasting on public health data to generate regional heatmaps and localized outbreak risk scores, proactively alerting the Orchestrator if a user is in a high-risk zone.',
    chapters: [],
  },
  {
    id: 'synapseos-assistant',
    slug: 'synapseos-assistant',
    title: 'Sanjeevni AI Assistant',
    subtitle: 'Global Voice & Text Automation Layer',
    tagline: 'Talk to Sanjeevni for hands-free health task automation',
    location: 'Interaction Cluster',
    status: 'Available',
    statusText: 'Vapi.ai Voice SDK · Active',
    units: 'Voice Autopilot',
    specs: [
      { label: 'Voice Engine', value: 'Vapi.ai WebRTC SDK' },
      { label: 'Text NLP', value: 'Google Gemini 3.5 Flash' },
      { label: 'TTS Voice', value: '11Labs Custom AI' },
      { label: 'Automation', value: 'Multi-step agent routing' },
    ],
    heroImage: '/images/medical/records_abha_tablet.jpg',
    thumbnailImage: '/images/medical/agent_swarm_doctors.jpg',
    galleryImages: [],
    description: 'Sanjeevni AI Assistant is a voice and text conversational autopilot integrated directly into the OS. Utilizing Google Gemini 3.5 Flash and Vapi.ai, it handles hands-free patient intake, query routing, and schedules multi-agent tasks seamlessly.',
    chapters: [],
  },
  {
    id: 'nutrition-fitness-assistant',
    slug: 'nutrition-fitness-assistant',
    title: 'Nutrition & Fitness Assistant',
    subtitle: 'Personalized Dietary & Workout Planner',
    tagline: 'Tracks nutrition, designs meal plans, and suggests fitness routines',
    location: 'Clinical & Wellness Cluster',
    status: 'Available',
    statusText: 'Interactive Dashboard · Live',
    units: 'Dietary & Fitness Suite',
    specs: [
      { label: 'Macro Engine', value: 'NextJS API Route' },
      { label: 'Food Analyzer', value: 'AI Semantic Parsing' },
      { label: 'Workouts', value: 'Curated Exercise Videos' },
      { label: 'Blog', value: 'Wellness Articles' },
    ],
    heroImage: '/images/medical/orchestrator_ops_center.jpg',
    thumbnailImage: '/images/medical/scan_radiologist_diagnostic.jpg',
    galleryImages: [],
    description: 'The Nutrition & Fitness Assistant analyzes user meals, calculates daily caloric and macro breakdowns (Protein, Carbs, Fats), and designs fully personalized diet and workout schedules complete with embedded instruction videos and general wellness blogs.',
    chapters: [],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(
    (p) =>
      p.slug.toLowerCase() === slug.toLowerCase() ||
      p.id.toLowerCase() === slug.toLowerCase() ||
      p.slug.replace('-', '').toLowerCase() === slug.replace('-', '').toLowerCase()
  );
}
