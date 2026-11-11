import React from 'react';
import {
  Server,
  Database,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import StatusPill from '../components/common/StatusPill.jsx';
import useHealthCheck from '../hooks/useHealthCheck.js';
import { formatUptime, formatIsoDate } from '../utils/formatters.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const OverviewPage = () => {
  const { data, loading, error, lastChecked, refetch } = useHealthCheck(true);

  const getDbStatusBadge = () => {
    if (!data?.database) {
      return <StatusPill status="neutral" label="Unknown" />;
    }
    const { status, connected } = data.database;
    if (connected) {
      return <StatusPill status="success" label="Connected (Mongoose)" pulse />;
    }
    if (status === 'not_configured') {
      return <StatusPill status="neutral" label="Not Configured (Phase 0 Standby)" />;
    }
    return <StatusPill status="warning" label={`Standby: ${status}`} />;
  };

  const checklistItems = [
    {
      title: 'Monorepo Architecture',
      desc: 'Separated client/ and server/ with root orchestrator scripts',
      done: true
    },
    {
      title: 'Vite + React Frontend',
      desc: 'React 18, React Router, Tailwind CSS with editorial design tokens',
      done: true
    },
    {
      title: 'Node.js Express Backend',
      desc: 'Pure ES modules, Helmet security headers, gzip compression, CORS',
      done: true
    },
    {
      title: 'Mongoose Connection Engine',
      desc: 'Resilient connection state tracking with safe local bootstrap',
      done: true
    },
    {
      title: 'Centralized API & Interceptors',
      desc: 'Axios instance with standardized error handling and status envelopes',
      done: true
    },
    {
      title: 'Phase 1 & 2 Architectural Skeletons',
      desc: 'Modular controllers, models, routes, services, and validators ready',
      done: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero statement */}
      <div className="border-b border-surface-border pb-6">
        <span className="text-xs font-mono uppercase tracking-wider text-accent-600 font-semibold">
          System Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-900 tracking-tight mt-1">
          PRANPAN System Foundation
        </h1>
        <p className="text-sm text-navy-500 mt-2 max-w-2xl font-sans">
          Production-oriented MERN foundation for AI-assisted document workflows. Phase 0 verifies
          environment contracts, inter-service connectivity, and design tokens prior to business
          logic implementation.
        </p>
      </div>

      {/* Backend Live Telemetry Card */}
      <Card
        title="Live Backend Connectivity"
        subtitle={`Target Endpoint: ${API_ENDPOINTS.BASE}${API_ENDPOINTS.HEALTH}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            isLoading={loading}
            icon={RefreshCw}
          >
            Re-test Connectivity
          </Button>
        }
        footer={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>Last checked: {formatIsoDate(lastChecked)}</span>
            <span className="font-mono text-[11px] text-navy-400">
              Response format: JSON Envelope
            </span>
          </div>
        }
      >
        {error ? (
          <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Backend Unreachable</p>
              <p className="text-xs text-rose-700 mt-0.5">{error.message}</p>
              <p className="text-xs text-rose-600 mt-2 font-mono">
                Verify server is running on {API_ENDPOINTS.BASE}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Status */}
            <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy-500 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-accent-600" />
                  API Service
                </span>
                <StatusPill
                  status={data?.status === 'ok' ? 'success' : 'warning'}
                  label={data?.status === 'ok' ? 'Operational' : 'Initializing'}
                  pulse={data?.status === 'ok'}
                />
              </div>
              <p className="text-lg font-serif font-bold text-navy-900 mt-2">
                {data?.service || 'pranpan-api'}
              </p>
              <p className="text-[11px] text-navy-400 font-mono mt-1">
                v{data?.version || '0.1.0'} &bull; {data?.environment || 'development'}
              </p>
            </div>

            {/* Database Status */}
            <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-navy-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-accent-600" />
                  MongoDB Layer
                </span>
              </div>
              <div className="mt-2.5">{getDbStatusBadge()}</div>
              <p className="text-[11px] text-navy-400 mt-2">Mongoose connection pool</p>
            </div>

            {/* Uptime */}
            <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
              <span className="text-xs font-medium text-navy-500">Service Uptime</span>
              <p className="text-lg font-mono font-bold text-navy-900 mt-2">
                {formatUptime(data?.uptimeSeconds)}
              </p>
              <p className="text-[11px] text-navy-400 mt-1">Process runtime</p>
            </div>

            {/* Cross-Origin Setting */}
            <div className="p-4 rounded-md bg-warm-50 border border-warm-200">
              <span className="text-xs font-medium text-navy-500">CORS Policy</span>
              <p className="text-sm font-mono text-navy-800 mt-2 truncate">Restricted Origin</p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Strict domain whitelisting
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Two Column Layout: Verification Checklist & Design System Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Foundation Checklist */}
        <Card title="Architectural Checklist" subtitle="Phase 0 Core Deliverables">
          <ul className="space-y-3.5">
            {checklistItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-navy-900">{item.title}</h4>
                  <p className="text-xs text-navy-500 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Design System Foundations */}
        <Card
          title="PRANPAN Design System Tokens"
          subtitle="Editorial-minimal identity token specifications"
        >
          <div className="space-y-4">
            {/* Color Swatches */}
            <div>
              <span className="text-xs font-medium text-navy-500 block mb-2">
                Core Palette Swatches
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="space-y-1">
                  <div className="h-10 rounded bg-navy-900 border border-navy-950 flex items-center justify-center text-white">
                    #0B1524
                  </div>
                  <span className="text-navy-600 block">Deep Navy</span>
                </div>
                <div className="space-y-1">
                  <div className="h-10 rounded bg-accent-600 flex items-center justify-center text-white">
                    #2253AC
                  </div>
                  <span className="text-navy-600 block">Accent Blue</span>
                </div>
                <div className="space-y-1">
                  <div className="h-10 rounded bg-surface-canvas border border-surface-border flex items-center justify-center text-navy-800">
                    #F8F6F1
                  </div>
                  <span className="text-navy-600 block">Warm Canvas</span>
                </div>
                <div className="space-y-1">
                  <div className="h-10 rounded bg-surface-subtle border border-surface-border flex items-center justify-center text-navy-800">
                    #F2EFE8
                  </div>
                  <span className="text-navy-600 block">Subtle Gray</span>
                </div>
              </div>
            </div>

            {/* Typography Tokens */}
            <div className="pt-2 border-t border-surface-border">
              <span className="text-xs font-medium text-navy-500 block mb-1">
                Typography Foundations
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-navy-800">
                    Inter &mdash; Primary Sans UI & Meta
                  </span>
                  <span className="font-mono text-[10px] text-navy-400">font-sans</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-navy-800 text-sm">
                    Newsreader &mdash; Editorial Headings & Reader
                  </span>
                  <span className="font-mono text-[10px] text-navy-400">font-serif</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-navy-800 text-[11px]">
                    JetBrains Mono &mdash; Tokens, Hashes & Metadata
                  </span>
                  <span className="font-mono text-[10px] text-navy-400">font-mono</span>
                </div>
              </div>
            </div>

            {/* Next Phase Notice */}
            <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-navy-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent-600" />
                Phase 1 Next: Complete UI/UX Development
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPage;
