import React, { useState } from 'react';

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FlowIntent
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-slate-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#integrations" className="text-slate-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Integrations</a>
                <a href="#pricing" className="text-slate-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Pricing</a>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Automate Your Workflows with
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}AI-Powered Intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Create powerful automation workflows using natural language. No coding required. 
              Connect 60+ apps and let AI handle the complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">
                  Get Started Free
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Automate
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From simple tasks to complex workflows, FlowIntent handles it all with AI-powered intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-indigo-600 text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Natural Language</h3>
              <p className="text-slate-600">
                Describe your workflow in plain English and let AI create it automatically
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">60+ Integrations</h3>
              <p className="text-slate-600">
                Connect with Slack, GitHub, Notion, Google Workspace, and more
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Enterprise Security</h3>
              <p className="text-slate-600">
                SOC 2, GDPR, and HIPAA compliant with zero-trust architecture
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How FlowIntent Works
            </h2>
            <p className="text-xl text-slate-600">
              Three simple steps to automate your workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Describe Your Workflow</h3>
              <p className="text-slate-600">
                Use natural language to describe what you want to automate
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Creates It</h3>
              <p className="text-slate-600">
                Our AI builds the complete workflow with optimal integrations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Deploy & Monitor</h3>
              <p className="text-slate-600">
                Activate your workflow and monitor performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Integrations
            </h2>
            <p className="text-xl text-s
