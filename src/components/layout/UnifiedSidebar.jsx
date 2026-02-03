import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Unified Sidebar Component with role-based sections
 * Supports Student, Mentor, Society Head, and Admin roles
 */
const UnifiedSidebar = ({ role = 'student', notificationCount = 0, societies = [], onNavigate, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    manageMembers: false,
    eventRegistrations: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const commonNavItems = [
    { icon: 'calendar_month', label: 'Events', onClick: () => onNavigate?.('events') },
    { icon: 'notifications', label: 'Notifications', badge: notificationCount, onClick: () => onNavigate?.('notifications') },
    { icon: 'groups', label: 'Mentors', onClick: () => onNavigate?.('mentors') },
    { icon: 'diversity_3', label: 'Societies', onClick: () => onNavigate?.('societies') },
  ];

  const getRoleSection = () => {
    switch (role) {
      case 'society':
        return {
          title: 'Society HQ',
          items: [
            {
              icon: 'dashboard',
              label: 'Dashboard',
              isActive: true,
              hasSubmenu: true,
              subItems: [
                { icon: 'article', label: 'Content Management' },
              ],
            },
            {
              icon: 'group',
              label: 'Manage Members',
              hasSubmenu: true,
              subItems: societies.map(soc => ({ label: soc.name })),
            },
            {
              icon: 'how_to_reg',
              label: 'Event Registrations',
              hasSubmenu: true,
              subItems: societies.map(soc => ({ label: soc.name })),
            },
          ],
        };
      case 'mentor':
        return {
          title: 'Mentor Hub',
          items: [
            { icon: 'dashboard', label: 'Dashboard' },
            { icon: 'school', label: 'My Sessions' },
            { icon: 'people', label: 'My Mentees' },
            { icon: 'analytics', label: 'Analytics' },
          ],
        };
      case 'student':
        return {
          title: 'Student',
          items: [
            { icon: 'dashboard', label: 'Dashboard' },
            { icon: 'book', label: 'Study Groups' },
            { icon: 'description', label: 'Notes' },
            { icon: 'person', label: 'Profile' },
          ],
        };
      default:
        return null;
    }
  };

  const roleSection = getRoleSection();

  return (
    <aside className={`w-64 bg-[#0d1117] flex flex-col justify-between p-4 text-[#c9d1d9] ${className}`}>
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pt-2">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            data-alt="CampusConnect logo placeholder"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByHDKs6VLKKg0tivmOOz9TQ-8vono2ty3KY16w06RsABgFGlPaZBbajp_j7DnJ8M2TWVe9YUs_ziqa5E1inc09THc6UAqVQpNASwI1BAPi-du_2FupZ21f-RAAHcnZdVlgytCuoAILhOCB7Op93usaVvDKvYhPdJDKDxMdnVNYB7gSi_c6jZuNe67pgvBT9L6vc4htdTQ6s4lXm7w6g3jooaDixQvdx8VJwcO2ZUQ0ILQly30bWli-W6oMNM_8tzX6_8haj1KXJUk")',
            }}
          ></div>
          <h1 className="text-white text-lg font-semibold">CampusConnect</h1>
        </div>

        {/* Common Navigation */}
        <nav className="flex flex-col gap-2">
          {commonNavItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-[#21262d] transition-colors text-left w-full"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-[#8b949e]">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#238636] rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Role-specific Section */}
      <div className="flex-grow">
        <hr className="border-t border-[#21262d] my-4" />
        {roleSection && (
          <div className="flex flex-col gap-1">
            <h2 className="px-3 text-xs font-semibold uppercase text-[#8b949e] tracking-wider mb-1">
              {roleSection.title}
            </h2>
            {roleSection.items.map((item, index) => (
              <div key={index} className="flex flex-col">
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSection(item.label.toLowerCase().replace(/\s+/g, ''))}
                      className={`flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg hover:bg-[#21262d] transition-colors text-left w-full ${
                        item.isActive ? 'bg-[#238636]/30 border-l-2 border-[#238636]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`material-symbols-outlined text-lg ${
                            item.isActive ? 'text-[#238636]' : 'text-[#8b949e]'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            item.isActive ? 'text-white' : 'text-[#c9d1d9]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-base text-[#8b949e]">
                        {expandedSections[item.label.toLowerCase().replace(/\s+/g, '')]
                          ? 'expand_less'
                          : 'expand_more'}
                      </span>
                    </button>
                    {expandedSections[item.label.toLowerCase().replace(/\s+/g, '')] && (
                      <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
                        {item.subItems?.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={() => onNavigate?.(subItem.label.toLowerCase().replace(/\s+/g, ''))}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[#21262d] transition-colors text-[#8b949e] hover:text-[#c9d1d9] text-left w-full"
                          >
                            {subItem.icon && (
                              <span className="material-symbols-outlined text-lg text-[#8b949e]">
                                {subItem.icon}
                              </span>
                            )}
                            {!subItem.icon && <span>-</span>}
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate?.(item.label.toLowerCase().replace(/\s+/g, ''))}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-[#21262d] transition-colors text-left w-full ${
                      item.isActive ? 'bg-[#238636]/30 border-l-2 border-[#238636]' : ''
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${
                        item.isActive ? 'text-[#238636]' : 'text-[#8b949e]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        item.isActive ? 'text-white' : 'text-[#c9d1d9]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-1">
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onNavigate?.('settings')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#21262d] transition-colors text-left w-full"
          >
            <span className="material-symbols-outlined text-xl text-[#8b949e]">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => onNavigate?.('logout')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#21262d] transition-colors text-left w-full"
          >
            <span className="material-symbols-outlined text-xl text-[#8b949e]">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

UnifiedSidebar.propTypes = {
  role: PropTypes.oneOf(['student', 'mentor', 'society', 'admin']),
  notificationCount: PropTypes.number,
  societies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  onNavigate: PropTypes.func,
  className: PropTypes.string,
};

export default UnifiedSidebar;
