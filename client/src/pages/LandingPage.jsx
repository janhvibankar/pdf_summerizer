import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ListOrdered,
  Download,
  ShieldCheck,
  Layers
} from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import { APP_NAME } from '../utils/constants.js';

export const LandingPage = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'Executive Summarization',
      desc: 'Condense 50+ page technical manuals, annual filings, or research papers into concise 3-minute executive briefs.'
    },
    {
      icon: ListOrdered,
      title: 'Key Points & Takeaways',
      desc: 'Automatically surface critical data points, quantitative conclusions, and action items formatted for quick review.'
    },
    {
      icon: MessageSquare,
      title: 'Document-Grounded Chat',
      desc: 'Ask direct questions about methodology, statistics, or conclusions and receive cited answers from document text.'
    },
    {
      icon: Layers,
      title: 'Section-by-Section Analysis',
      desc: 'Navigate document breakdowns with page-range mapping and hierarchical topic structuring.'
    },
    {
      icon: Download,
      title: 'Exportable Markdown & Reports',
      desc: 'Export synthesized findings directly to clean Markdown or text summaries for your notes and team memos.'
    },
    {
      icon: ShieldCheck,
      title: 'Editorial Design & Privacy',
      desc: 'Crafted with high-contrast typography, restrained styling, and strict client-side data boundaries.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload Any PDF Document',
      desc: 'Drag and drop your report, whitepaper, or academic paper. Up to 15 MB with client-side verification.'
    },
    {
      num: '02',
      title: 'Select Synthesis Target',
      desc: 'Choose between an Executive Brief, Deep Analytical Breakdown, or Action Items depending on your workflow.'
    },
    {
      num: '03',
      title: 'Extract Insights & Converse',
      desc: 'Review structured takeaways, search sections, ask questions, and export reports in seconds.'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-canvas text-navy-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="h-16 border-b border-surface-border bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-navy-900 group">
            <div className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center shadow-subtle group-hover:bg-navy-800 transition-colors">
              <BookOpen className="w-4 h-4 text-warm-100" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-navy-600">
            <a href="#features" className="hover:text-navy-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-navy-900 transition-colors">
              How it works
            </a>
            <a href="#preview" className="hover:text-navy-900 transition-colors">
              Workspace
            </a>
            <Link to="/diagnostics" className="hover:text-navy-900 transition-colors">
              System Health
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Open App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-warm-100 border border-warm-200 text-xs font-mono text-navy-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-accent-600" />
          <span>Intelligent Editorial Document Workspace</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-navy-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Distill complex documents into clarity in seconds.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-navy-600 max-w-2xl mx-auto leading-relaxed font-sans">
          Pranpan synthesizes lengthy research papers, financial reports, and technical manuals so
          you can extract decision-ready insights, explore sections, and query conclusions without
          reading fatigue.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/app">
            <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              Start Summarizing Now
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Capabilities
            </Button>
          </a>
        </div>

        {/* Product Interface Preview Showcase */}
        <div
          id="preview"
          className="mt-14 max-w-5xl mx-auto rounded-card border border-surface-border bg-white shadow-editorial overflow-hidden text-left"
        >
          {/* Mock Window Titlebar */}
          <div className="px-4 py-3 bg-warm-50 border-b border-surface-border flex items-center justify-between text-xs text-navy-500">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warm-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-warm-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-warm-300" />
              </div>
              <span className="font-mono text-[11px] text-navy-600 ml-2">
                PRANPAN Workspace &mdash; Global_Energy_Transition_2026.pdf
              </span>
            </div>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
              Verified Preview
            </span>
          </div>

          {/* Mock Workspace Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-border min-h-[340px]">
            {/* Left Preview: Source Document */}
            <div className="p-6 bg-warm-50/50 space-y-3 font-serif">
              <div className="text-[10px] font-mono text-navy-400 uppercase tracking-wider">
                Source Document Preview &bull; Page 1 of 38
              </div>
              <h3 className="text-base font-bold text-navy-900 leading-snug">
                Global Renewable Energy Transition Strategy 2026–2030
              </h3>
              <p className="text-xs text-navy-600 leading-relaxed font-sans text-justify">
                This strategic blueprint outlines the multi-phase decarbonization roadmap for OECD
                nations between 2026 and 2030. It evaluates grid modernization capital expenditure,
                offshore wind scaling in Northern Europe, and next-generation sodium-ion battery
                deployment...
              </p>
              <div className="p-3 rounded bg-white border border-surface-border text-xs text-navy-700 font-sans">
                <strong className="text-navy-900 block font-semibold mb-1">
                  Table 2.1: Levelized Cost of Energy ($/MWh)
                </strong>
                Onshore Wind: $28/MWh | Fixed Offshore: $44/MWh | Solar + Storage: $22/MWh
              </div>
            </div>

            {/* Right Preview: Generated Synthesis */}
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-accent-700">
                  AI Synthesis & Takeaways
                </span>
                <span className="text-[10px] font-mono text-navy-400">Reading Time: 3 mins</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded border border-warm-200 bg-warm-50 text-xs">
                  <h4 className="font-semibold text-navy-900 text-xs">
                    1. Capital Expenditure Reallocation
                  </h4>
                  <p className="text-navy-600 text-[11px] mt-0.5 font-sans leading-relaxed">
                    Over $620B in institutional capital is shifting from legacy gas turbines to
                    distributed solar-storage hybrid plants.
                  </p>
                </div>
                <div className="p-3 rounded border border-warm-200 bg-warm-50 text-xs">
                  <h4 className="font-semibold text-navy-900 text-xs">
                    2. Transmission Queue Delay Vector
                  </h4>
                  <p className="text-navy-600 text-[11px] mt-0.5 font-sans leading-relaxed">
                    Average interconnection approval remains the primary bottleneck at 4.8 years
                    across Western European grids.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-navy-500 font-mono">
                <span>Model: Gemini 1.5 Flash</span>
                <Link to="/app" className="text-accent-600 font-semibold hover:underline">
                  Explore full workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-surface-border bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-700 font-semibold">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-navy-900 tracking-tight mt-1.5">
              Engineered for rigorous document comprehension
            </h2>
            <p className="text-xs sm:text-sm text-navy-500 mt-2 font-sans">
              Every feature is built around the reader&apos;s need for accuracy, speed, and clean
              information hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="!p-6 space-y-3 hover:border-navy-300 transition-colors">
                <div className="w-9 h-9 rounded bg-warm-100 border border-warm-200 text-navy-900 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="text-base font-serif font-bold text-navy-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs text-navy-600 font-sans leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 border-t border-surface-border bg-surface-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-700 font-semibold">
              Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-navy-900 tracking-tight mt-1.5">
              Three steps from file to clarity
            </h2>
            <p className="text-xs sm:text-sm text-navy-500 mt-2 font-sans">
              Streamlined workflow designed for analysts, researchers, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-card bg-white border border-surface-border shadow-card"
              >
                <span className="text-2xl font-serif font-bold text-navy-300 font-mono">
                  {step.num}
                </span>
                <h3 className="text-base font-serif font-bold text-navy-900 mt-2">{step.title}</h3>
                <p className="text-xs text-navy-600 mt-2 font-sans leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Call to Action */}
      <section className="py-20 border-t border-surface-border bg-white text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-navy-900 tracking-tight">
            Ready to accelerate your reading workflow?
          </h2>
          <p className="text-xs sm:text-sm text-navy-600 font-sans max-w-xl mx-auto leading-relaxed">
            Experience the editorial document workspace. Explore sample reports or stage your own
            PDF documents locally.
          </p>
          <div className="pt-2">
            <Link to="/app">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Launch Application Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-warm-50 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500">
          <div className="flex items-center gap-2 font-serif font-bold text-navy-900">
            <div className="w-5 h-5 rounded bg-navy-900 text-white flex items-center justify-center text-[10px]">
              P
            </div>
            <span>{APP_NAME}</span>
            <span className="font-sans font-normal text-navy-400 ml-2">
              &mdash; Editorial Document Assistant
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-navy-500">
            <Link to="/app" className="hover:text-navy-900">
              Workspace
            </Link>
            <Link to="/app/library" className="hover:text-navy-900">
              Library
            </Link>
            <Link to="/diagnostics" className="hover:text-navy-900">
              Diagnostics
            </Link>
            <Link to="/login" className="hover:text-navy-900">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
