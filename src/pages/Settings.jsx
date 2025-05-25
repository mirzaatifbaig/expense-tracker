import {useEffect, useState} from "react";
import {
  Battery, Bell, Camera, Cloud, CreditCard, Download, Eye, Globe, Key, Lock,
  Mail, MessageSquare, Mic, Monitor, Moon, Shield, Smartphone, Sun, Trash2,
  User, Volume2, Wifi, Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: true, notifications: true, privacy: true, wifi: true,
    camera: true, autoUpdate: true, twoFactor: true, faceId: true,
    soundEffects: true, autoSync: true, marketing: false, newsletter: true,
    analytics: false, bluetooth: true, location: false, microphone: false,
    backupCloud: false, lowPowerMode: false
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const Toggle = ({ enabled, onToggle }) => (
      <div
          className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
              enabled ? 'bg-zinc-500' : 'bg-zinc-700'
          }`}
          onClick={onToggle}
      >
        <div className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
        } mt-1`} />
      </div>
  );

  const Card = ({ icon: Icon, title, desc, setting, children, className = "" }) => (
      <div className={`rounded-xl bg-zinc-900/90 border border-zinc-700/50 p-5 hover:border-zinc-600/50 transition-all ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-zinc-800/50">
              <Icon className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">{title}</h3>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          </div>
          {setting && <Toggle enabled={settings[setting]} onToggle={() => toggle(setting)} />}
        </div>
        {children}
      </div>
  );

  const SubSetting = ({ icon: Icon, label, setting }) => (
      <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-300">{label}</span>
        </div>
        <Toggle enabled={settings[setting]} onToggle={() => toggle(setting)} />
      </div>
  );

  const Slider = ({ label, value }) => (
      <div className="mt-3">
        <div className="flex justify-between text-sm text-zinc-400 mb-1">
          <span>{label}</span><span>{value}%</span>
        </div>
        <div className="h-2 bg-zinc-700 rounded-full">
          <div className="h-full bg-zinc-500 rounded-full transition-all" style={{ width: `${value}%` }} />
        </div>
      </div>
  );

  const SkeletonCard = ({ hasSubItems = false }) => (
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-9 h-9 rounded-lg bg-zinc-800" />
            <div>
              <Skeleton className="h-4 w-24 mb-2 bg-zinc-800" />
              <Skeleton className="h-3 w-32 bg-zinc-800" />
            </div>
          </div>
          <Skeleton className="w-11 h-6 rounded-full bg-zinc-800" />
        </div>
        {hasSubItems && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 mb-2 bg-zinc-800" />
              <Skeleton className="h-2 w-full mb-4 bg-zinc-800" />
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 bg-zinc-700" />
                  <Skeleton className="h-3 w-16 bg-zinc-700" />
                </div>
                <Skeleton className="w-8 h-4 rounded-full bg-zinc-700" />
              </div>
            </div>
        )}
      </div>
  );

  const SkeletonQuickCard = () => (
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-5 h-5 bg-zinc-800" />
          <Skeleton className="h-4 w-20 bg-zinc-800" />
        </div>
        <Skeleton className="w-11 h-6 rounded-full bg-zinc-800" />
      </div>
  );

  const SkeletonActionCard = () => (
      <div className="text-center p-4 rounded-lg bg-zinc-800/50">
        <Skeleton className="w-10 h-10 rounded-lg mx-auto mb-2 bg-zinc-700" />
        <Skeleton className="h-3 w-16 mx-auto mb-1 bg-zinc-700" />
        <Skeleton className="h-2 w-20 mx-auto bg-zinc-700" />
      </div>
  );

  const ActionCard = ({ icon: Icon, title, desc, color }) => (
      <div className="text-center p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-all hover:scale-105">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
          <Icon className="h-5 w-5" />
        </div>
        <h4 className="font-medium text-white text-sm">{title}</h4>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
  );

  if (isLoading) {
    return (
        <div className="min-h-screen bg-zinc-950 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Main Settings Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SkeletonCard hasSubItems />
              <SkeletonCard hasSubItems />
              <SkeletonCard hasSubItems />
              <SkeletonCard hasSubItems />
              <SkeletonCard hasSubItems />
              <SkeletonCard hasSubItems />
            </div>

            {/* Quick Settings Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <SkeletonQuickCard />
              <SkeletonQuickCard />
              <SkeletonQuickCard />
            </div>

            {/* Actions Skeleton */}
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-700/30 p-6 mb-6">
              <div className="flex items-center mb-4">
                <Skeleton className="w-5 h-5 mr-2 bg-zinc-800" />
                <Skeleton className="h-5 w-32 bg-zinc-800" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SkeletonActionCard />
                <SkeletonActionCard />
                <SkeletonActionCard />
                <SkeletonActionCard />
              </div>
            </div>

            {/* Status Skeleton */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-2 h-2 rounded-full bg-zinc-800" />
                  <Skeleton className="h-3 w-12 bg-zinc-800" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="w-4 h-4 bg-zinc-800" />
                  <Skeleton className="h-3 w-8 bg-zinc-800" />
                </div>
              </div>
              <Skeleton className="h-3 w-24 bg-zinc-800" />
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card
                icon={settings.darkMode ? Moon : Sun}
                title="Display"
                desc="Visual preferences"
                setting="darkMode"
            >
              <Slider label="Brightness" value={75} />
              <Slider label="Contrast" value={60} />
            </Card>

            <Card icon={Bell} title="Notifications" desc="Alerts and sounds" setting="notifications">
              <Slider label="Volume" value={80} />
              <div className="mt-3">
                <SubSetting icon={Volume2} label="Sound Effects" setting="soundEffects" />
              </div>
            </Card>

            <Card icon={Shield} title="Security" desc="Privacy and protection" setting="privacy">
              <div className="space-y-2">
                <SubSetting icon={Lock} label="Two-Factor Auth" setting="twoFactor" />
                <SubSetting icon={Eye} label="Face ID" setting="faceId" />
              </div>
            </Card>

            <Card icon={Wifi} title="Connectivity" desc="Network settings" setting="wifi">
              <div className="space-y-2">
                <SubSetting icon={Smartphone} label="Bluetooth" setting="bluetooth" />
                <SubSetting icon={Battery} label="Low Power Mode" setting="lowPowerMode" />
              </div>
            </Card>

            <Card icon={Camera} title="Permissions" desc="App access control" setting="camera">
              <div className="space-y-2">
                <SubSetting icon={Mic} label="Microphone" setting="microphone" />
                <SubSetting icon={Globe} label="Location" setting="location" />
              </div>
            </Card>

            <Card icon={Zap} title="System" desc="Updates and sync" setting="autoUpdate">
              <div className="space-y-2">
                <SubSetting icon={Cloud} label="Cloud Backup" setting="backupCloud" />
                <SubSetting icon={Download} label="Auto Sync" setting="autoSync" />
              </div>
            </Card>
          </div>

          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Mail, title: "Marketing", setting: "marketing" },
              { icon: MessageSquare, title: "Newsletter", setting: "newsletter" },
              { icon: User, title: "Analytics", setting: "analytics" }
            ].map(({ icon: Icon, title, setting }) => (
                <div key={title} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-zinc-400" />
                    <span className="text-white font-medium">{title}</span>
                  </div>
                  <Toggle enabled={settings[setting]} onToggle={() => toggle(setting)} />
                </div>
            ))}
          </div>

          {/* Actions */}
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-700/30 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Monitor className="h-5 w-5 text-zinc-400 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionCard icon={Trash2} title="Clear Cache" desc="Free storage" color="from-red-500/20 to-red-600/20 text-red-400" />
              <ActionCard icon={Key} title="API Keys" desc="Integrations" color="from-blue-500/20 to-blue-600/20 text-blue-400" />
              <ActionCard icon={CreditCard} title="Billing" desc="Payments" color="from-green-500/20 to-green-600/20 text-green-400" />
              <ActionCard icon={Volume2} title="Audio" desc="Sound settings" color="from-purple-500/20 to-purple-600/20 text-purple-400" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
            <div className="flex items-center space-x-4 text-sm text-zinc-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Battery className="h-4 w-4" />
                <span>87%</span>
              </div>
            </div>
            <span className="text-sm text-zinc-500">Last sync: 2m ago</span>
          </div>
        </div>
      </div>
  );
};

export default SettingsComponent;