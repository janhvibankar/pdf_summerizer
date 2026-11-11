/**
 * PRANPAN Demo Document Dataset
 * Realistic document samples for Phase 1 UI/UX interactivity
 */

export const MOCK_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Global Renewable Energy Transition Strategy 2026–2030',
    fileName: 'Renewable_Energy_Transition_Strategy_2026.pdf',
    fileSize: '4.2 MB',
    pageCount: 38,
    category: 'Research',
    uploadedAt: '2026-11-10T10:30:00Z',
    status: 'completed',
    readingTime: '5 min summary (vs 95 min full)',
    executiveSummary:
      'This strategic blueprint outlines the multi-phase decarbonization roadmap for OECD nations between 2026 and 2030. It evaluates grid modernization capital expenditure, offshore wind scaling in Northern Europe, and next-generation sodium-ion battery deployment for utility-scale energy storage. The report projects a 42% cost reduction in grid-scale battery systems while highlighting critical transmission infrastructure bottlenecks.',
    keyTakeaways: [
      {
        id: 't-1',
        title: 'Capital Expenditure Reallocation',
        desc: 'Over $620B in institutional capital is shifting from legacy gas turbines to distributed solar-storage hybrid plants.'
      },
      {
        id: 't-2',
        title: 'Transmission Permitting Bottleneck',
        desc: 'Interconnection queue delays remain the primary risk, averaging 4.8 years across major Western grids.'
      },
      {
        id: 't-3',
        title: 'Sodium-Ion Battery Breakthrough',
        desc: 'Commercial availability of sodium-ion chemistries by Q3 2026 offers a 35% lower cost alternative to LFP for stationary storage.'
      },
      {
        id: 't-4',
        title: 'Cross-Border Interconnectors',
        desc: 'High-voltage direct current (HVDC) subsea corridors are prioritized for offshore wind balancing across the North Sea.'
      }
    ],
    sections: [
      {
        title: '1. Executive Mandate & Decarbonization Targets',
        pages: 'pp. 1–6',
        content:
          'Summarizes the legally binding emissions targets ratified under the 2025 Global Climate Accord. Explains the transition metrics required to achieve 65% renewable power generation by 2030.'
      },
      {
        title: '2. Generation Economics & Levelized Cost of Energy',
        pages: 'pp. 7–18',
        content:
          'In-depth comparative analysis of LCOE across onshore wind ($28/MWh), offshore fixed wind ($44/MWh), and utility solar ($22/MWh with storage add-on).'
      },
      {
        title: '3. Grid Modernization & Storage Infrastructures',
        pages: 'pp. 19–30',
        content:
          'Detailed assessment of transmission constraints, synchronous condensers for grid inertia, and software-driven demand response mechanisms.'
      },
      {
        title: '4. Risk Vectors & Policy Recommendations',
        pages: 'pp. 31–38',
        content:
          'Identifies regulatory, supply chain (rare earth and critical minerals), and cybersecurity vulnerabilities in smart grid SCADA infrastructure.'
      }
    ],
    chatHistory: [
      {
        id: 'c-1',
        sender: 'user',
        text: 'What are the main risks identified in the report regarding grid interconnection?',
        timestamp: '10:45 AM'
      },
      {
        id: 'c-2',
        sender: 'ai',
        text: 'Section 4 identifies two primary interconnection risks:\n\n1. **Queue Bottlenecks**: The average permitting and technical study timeline has expanded to 4.8 years, delaying over 310 GW of capacity.\n2. **Network Upgrades Allocation**: Disputes over who pays for deep network upgrades frequently cause developer withdrawals before financial close.',
        timestamp: '10:45 AM'
      }
    ]
  },
  {
    id: 'doc-2',
    title: 'Q3 Enterprise Software Financial Performance & SaaS Metrics',
    fileName: 'Q3_Enterprise_Software_Benchmark_Report.pdf',
    fileSize: '2.8 MB',
    pageCount: 24,
    category: 'Finance',
    uploadedAt: '2026-11-08T14:15:00Z',
    status: 'completed',
    readingTime: '3 min summary (vs 60 min full)',
    executiveSummary:
      'An exhaustive benchmarking analysis of 120 publicly traded enterprise SaaS companies in Q3. The data reveals an ongoing transition from pure subscription models to consumption-plus-base pricing. Net Revenue Retention (NRR) stabilized at a median of 112%, while Rule-of-40 performance was driven predominantly by operating margin improvements rather than hyper-growth customer acquisition.',
    keyTakeaways: [
      {
        id: 't-1',
        title: 'Pricing Architecture Shift',
        desc: '68% of enterprise software vendors introduced usage-based tiers or AI token metering in 2026.'
      },
      {
        id: 't-2',
        title: 'Operating Margin Expansion',
        desc: 'Median free cash flow margin grew from 14% to 21% year-over-year, driven by automated support workflows and R&D efficiencies.'
      },
      {
        id: 't-3',
        title: 'Sales Cycle Expansion',
        desc: 'Average enterprise deal velocity slowed by 14 days, with CFO approval required for 88% of deals over $50k ARR.'
      }
    ],
    sections: [
      {
        title: '1. Macroeconomic Context & Valuations',
        pages: 'pp. 1–5',
        content:
          'Median forward revenue multiples stabilized at 6.8x, reflecting cautious institutional investor sentiment.'
      },
      {
        title: '2. Growth vs Profitability: Rule of 40 Analysis',
        pages: 'pp. 6–14',
        content:
          'Companies achieving Rule-of-40 via high margin (FCF > 25%) commanded a 30% valuation premium over high-growth low-margin peers.'
      },
      {
        title: '3. Customer Acquisition Cost (CAC) and Payback',
        pages: 'pp. 15–24',
        content:
          'Blended CAC payback period elongated to 22 months for mid-market and 17 months for enterprise.'
      }
    ],
    chatHistory: [
      {
        id: 'c-1',
        sender: 'user',
        text: 'What is the median Net Revenue Retention reported?',
        timestamp: '2:30 PM'
      },
      {
        id: 'c-2',
        sender: 'ai',
        text: 'The median Net Revenue Retention (NRR) stabilized at **112%** in Q3, down slightly from 116% in the prior year period.',
        timestamp: '2:30 PM'
      }
    ]
  },
  {
    id: 'doc-3',
    title: 'Constitutional AI & Large Language Model Safety Architecture',
    fileName: 'Constitutional_AI_Alignment_Framework_v3.pdf',
    fileSize: '5.6 MB',
    pageCount: 52,
    category: 'Technical',
    uploadedAt: '2026-11-05T09:20:00Z',
    status: 'completed',
    readingTime: '6 min summary (vs 120 min full)',
    executiveSummary:
      'This research paper formalizes a multi-tier Constitutional AI framework for autonomous agent alignment. It details reinforcement learning from AI feedback (RLAIF), automated red-teaming protocols, and runtime refusal policies that resist adversarial jailbreak prompts while minimizing false refusal rates in high-complexity enterprise tasks.',
    keyTakeaways: [
      {
        id: 't-1',
        title: 'RLAIF Efficiency',
        desc: 'Feedback generated by constitutional critique models matched human labeler agreement by 94.2% while reducing alignment costs by 80%.'
      },
      {
        id: 't-2',
        title: 'False Refusal Rate Reduction',
        desc: 'New semantic boundary classifiers reduced benign false refusals from 8.4% to under 1.1%.'
      },
      {
        id: 't-3',
        title: 'Multi-Turn Jailbreak Resistance',
        desc: 'Stateful context tracking intercepted 99.1% of progressive persuasion and persona-masking exploits.'
      }
    ],
    sections: [
      {
        title: '1. Constitutional Principles Formulation',
        pages: 'pp. 1–10',
        content: 'Definitions of benignity, transparency, privacy preservation, and factual rigor.'
      },
      {
        title: '2. Critique & Revision Architecture',
        pages: 'pp. 11–26',
        content:
          'Two-stage iterative critique pipeline where secondary models rewrite flagged outputs against core guidelines.'
      },
      {
        title: '3. Automated Adversarial Red-Teaming',
        pages: 'pp. 27–42',
        content:
          'Evolutionary algorithm generation of prompt variations to identify edge-case alignment drift.'
      },
      {
        title: '4. Evaluation Benchmarks & Enterprise Verification',
        pages: 'pp. 43–52',
        content:
          'Empirical results across safety benchmarks and real-world legal and medical corpora.'
      }
    ],
    chatHistory: []
  }
];

export const SUMMARY_FORMATS = [
  {
    id: 'executive',
    label: 'Executive Brief',
    description:
      'High-level synthesis, strategic takeaways, and decision-maker impact in under 3 minutes.',
    badge: 'Recommended'
  },
  {
    id: 'detailed',
    label: 'Deep Analytical',
    description:
      'Comprehensive section-by-section breakdown, methodology review, and key quantitative findings.',
    badge: 'In-Depth'
  },
  {
    id: 'bullet_points',
    label: 'Action Items & Takeaways',
    description:
      'Curated bullet points highlighting core facts, dates, commitments, and action items.',
    badge: 'Concise'
  },
  {
    id: 'technical',
    label: 'Technical Evaluation',
    description:
      'Focuses on architectures, data tables, implementation specifics, and risk factors.',
    badge: 'Specialized'
  }
];
