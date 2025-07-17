import { FC, useState } from 'react'
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export const Settings: FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [notificationSettings, setNotificationSettings] = useState({
    workflowSuccess: true,
    workflowError: true,
    weeklyReport: true,
    securityAlerts: true
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon },
    { id: 'general', name: 'General', icon: CogIcon },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">Update your account profile information and email address.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  defaultValue="Acme Corp"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Choose how you want to be notified about workflow activities.</p>
            </div>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">
                      {key === 'workflowSuccess' && 'Workflow Success'}
                      {key === 'workflowError' && 'Workflow Errors'}
                      {key === 'weeklyReport' && 'Weekly Reports'}
                      {key === 'securityAlerts' && 'Security Alerts'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {key === 'workflowSuccess' && 'Get notified when workflows run successfully'}
                      {key === 'workflowError' && 'Get notified when workflows encounter errors'}
                      {key === 'weeklyReport' && 'Receive weekly workflow performance reports'}
                      {key === 'securityAlerts' && 'Get notified about security-related events'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary">Save Preferences</button>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500">Manage your account security and password settings.</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-700">Two-factor authentication is not enabled</span>
                  </div>
                  <button className="btn btn-primary">Enable 2FA</button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary">Update Security</button>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
              <p className="text-sm text-gray-500">Manage your API keys for integrations and external access.</p>
            </div>
            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Production API Key</h4>
                    <p className="text-sm text-gray-500">Used for production workflows</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                      awb_prod_••••••••••••••••••••••••••••••••
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <button className="btn btn-secondary">Regenerate</button>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Development API Key</h4>
                    <p className="text-sm text-gray-500">Used for testing and development</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                      awb_dev_••••••••••••••••••••••••••••••••
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <button className="btn btn-secondary">Regenerate</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary">Generate New Key</button>
            </div>
          </div>
        )

      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-500">Configure general application settings and preferences.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Timeout (seconds)</label>
                <input
                  type="number"
                  defaultValue="30"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Workflow Retry Attempts</label>
                <input
                  type="number"
                  defaultValue="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable debug logging
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary">Save Settings</button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}