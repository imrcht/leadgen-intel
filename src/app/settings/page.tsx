'use client';

import AppShell from '@/components/layout/AppShell';
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  CreditCard,
  Shield,
  Database,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-100">Settings</h1>
            <p className="text-sm text-surface-400">
              Configure your Lead Generation platform
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Keys */}
          <section className="glass rounded-2xl p-6 animate-slide-up">
            <h2 className="text-base font-semibold text-surface-200 flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-primary-400" />
              API Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1.5 block">
                  Google Places API Key
                </label>
                <input
                  type="password"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-200 placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                />
                <p className="text-xs text-surface-500 mt-1.5">
                  Required for live business discovery. Without it, the platform
                  runs in demo mode with sample data.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-warm-500/5 border border-warm-500/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warm-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-surface-400">
                    <p className="text-warm-400 font-medium mb-1">
                      Demo Mode Active
                    </p>
                    <p>
                      No Google API key configured. All searches will return
                      realistic demo data. Add your API key to enable live
                      business discovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Plan Info */}
          <section
            className="glass rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <h2 className="text-base font-semibold text-surface-200 flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-primary-400" />
              Billing & Plan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  name: 'Starter',
                  price: '$29',
                  searches: '100',
                  active: true,
                },
                {
                  name: 'Growth',
                  price: '$99',
                  searches: '1,000',
                  active: false,
                },
                {
                  name: 'Agency',
                  price: '$299',
                  searches: 'Unlimited',
                  active: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 rounded-xl border transition-all ${
                    plan.active
                      ? 'border-primary-500/30 bg-primary-500/5'
                      : 'border-surface-700/30 bg-surface-800/20 opacity-60'
                  }`}
                >
                  <p className="text-sm font-semibold text-surface-200">
                    {plan.name}
                  </p>
                  <p className="text-2xl font-bold text-surface-100 mt-1">
                    {plan.price}
                    <span className="text-xs text-surface-500 font-normal">
                      /mo
                    </span>
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {plan.searches} searches/month
                  </p>
                  {plan.active && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-500/20 text-primary-400">
                      Current Plan
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Compliance */}
          <section
            className="glass rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-base font-semibold text-surface-200 flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-accent-500" />
              Compliance & Privacy
            </h2>
            <div className="space-y-3 text-sm text-surface-400">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <p>Only publicly available information is collected</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <p>No CAPTCHA bypass or authentication hacking</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <p>Rate limiting enforced on all data sources</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <p>All data adapters are replaceable and configurable</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                <p>Respects robots.txt and applicable data regulations</p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400'
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
