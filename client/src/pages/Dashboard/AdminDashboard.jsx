import React from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_CARDS = [
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage users, roles, permissions and account statuses.',
    icon: 'manage_accounts',
    path: '/admin/users',
    color: 'blue'
  },
  {
    id: 'campuses',
    title: 'Campus Management',
    description: 'Configure institutional nodes, logos and regional settings.',
    icon: 'corporate_fare',
    path: '/admin/campuses',
    color: 'green'
  },
  {
    id: 'societies',
    title: 'Society Approvals',
    description: 'Review and approve new society registration requests.',
    icon: 'verified',
    path: '/admin/societies/approvals',
    color: 'purple'
  },
  {
    id: 'mentors',
    title: 'Mentor Verification',
    description: 'Verify mentor applications and professional credentials.',
    icon: 'local_police',
    path: '/admin/mentors/verifications',
    color: 'orange'
  },
  {
    id: 'analytics',
    title: 'Platform Analytics',
    description: 'Deep dive into user growth, engagement and event metrics.',
    icon: 'insights',
    path: '/admin/analytics',
    color: 'indigo'
  },
  {
    id: 'content',
    title: 'Content Moderation',
    description: 'Monitor discussions, events and report handling.',
    icon: 'gavel',
    path: '/admin/moderation',
    color: 'red'
  },
  {
    id: 'system',
    title: 'System Health',
    description: 'Check server status, API latency and database performance.',
    icon: 'dns',
    path: '/admin/system',
    color: 'cyan'
  },
  {
    id: 'logs',
    title: 'Audit Logs',
    description: 'View administrative action history and security logs.',
    icon: 'list_alt',
    path: '/admin/logs',
    color: 'gray'
  },
  {
    id: 'reports',
    title: 'Data Export',
    description: 'Generate and download CSV/PDF platform reports.',
    icon: 'file_download',
    path: '/admin/reports',
    color: 'emerald'
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Central Admin Control</h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Welcome to the CampusNexus Master Interface. Monitor, manage, and scale your institutional ecosystem from one central hub.
          </p>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADMIN_CARDS.map((card) => (
            <div 
              key={card.id}
              onClick={() => navigate(card.path)}
              className="group bg-[#161b22] border border-[#30363d] rounded-2xl p-6 hover:border-[#58a6ff]/50 hover:bg-[#1c2128] transition-all cursor-pointer shadow-xl shadow-black/20"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-opacity-10 
                ${card.color === 'blue' ? 'bg-blue-500 text-blue-400' : ''}
                ${card.color === 'green' ? 'bg-green-500 text-green-400' : ''}
                ${card.color === 'purple' ? 'bg-purple-500 text-purple-400' : ''}
                ${card.color === 'orange' ? 'bg-orange-500 text-orange-400' : ''}
                ${card.color === 'indigo' ? 'bg-indigo-500 text-indigo-400' : ''}
                ${card.color === 'red' ? 'bg-red-500 text-red-400' : ''}
                ${card.color === 'cyan' ? 'bg-cyan-500 text-cyan-400' : ''}
                ${card.color === 'gray' ? 'bg-gray-500 text-gray-400' : ''}
                ${card.color === 'emerald' ? 'bg-emerald-500 text-emerald-400' : ''}
              `}>
                <span className="material-symbols-outlined text-3xl">{card.icon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#58a6ff] transition-colors">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{card.description}</p>
              
              <div className="flex items-center text-[#58a6ff] text-sm font-semibold">
                Access Panel
                <span className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status Ticker */}
        <div className="mt-12 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 py-1 px-3 bg-[#238636]/10 text-[#238636] rounded-full text-xs font-bold border border-[#238636]/20">
                 <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse"></span>
                 System Online
              </span>
              <span className="text-gray-500 text-xs font-mono">Last Snapshot: {new Date().toLocaleTimeString()}</span>
           </div>
           <div className="hidden md:block text-xs text-gray-500">
              v1.0.4-PROD | Secure Session Enabled
           </div>
        </div>
      </div>
    </div>
  );
}
