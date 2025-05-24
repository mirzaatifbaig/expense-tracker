import React, { useState } from "react";
import {
  Bell,
  Shield,
  Volume2,
  Wifi,
  Battery,
  Moon,
  Sun,
  Globe,
  User,
  Lock,
  Eye,
  Camera,
  Mic,
  Smartphone,
  Monitor,
  Zap,
  Cloud,
  Download,
  Trash2,
  Key,
  CreditCard,
  Mail,
  MessageSquare,
} from "lucide-react";
const SettingsComponent = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSave: false,
    privacy: true,
    location: false,
    camera: true,
    microphone: false,
    zinctooth: true,
    wifi: true,
    autoUpdate: true,
    backupCloud: false,
    twoFactor: true,
    faceId: true,
    analytics: false,
    marketing: false,
    newsletter: true,
    soundEffects: true,
    hapticFeedback: false,
    autoSync: true,
    lowPowerMode: false,
  });
  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const ToggleSwitch = ({ enabled, onToggle, color = "zinc" }) => {
    const colorClasses = {
      zinc: enabled
        ? "bg-gradient-to-r from-zinc-400 to-zinc-600 shadow-lg shadow-zinc-500/30"
        : "bg-zinc-600 hover:bg-zinc-500",
    };
    return (
      <div
        className={`relative inline-flex h-7 w-12 cursor-pointer rounded-full transition-all duration-300 ${colorClasses[color] || colorClasses.zinc}`}
        onClick={onToggle}
      >
        <div
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
            enabled ? "translate-x-6" : "translate-x-1"
          } mt-1`}
        />
      </div>
    );
  };
  const SettingCard = ({
    icon: Icon,
    title,
    description,
    setting,
    color = "zinc",
    children,
  }) => {
    const cardColorClasses = {
      zinc: "hover:shadow-zinc-500/10",
    };
    const iconColorClasses = {
      zinc: "from-zinc-500/20 to-zinc-600/20 group-hover:from-zinc-500/30 group-hover:to-zinc-600/30",
    };
    const iconTextColors = {
      zinc: "text-zinc-400",
    };
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-500 hover:shadow-2xl ${cardColorClasses[color] || cardColorClasses.zinc} hover:-translate-y-1`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-zinc-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br transition-all duration-300 ${iconColorClasses[color]?.split(" text-")[0] || iconColorClasses.zinc.split(" text-")[0]}`}
              >
                <Icon
                  className={`h-6 w-6 ${iconColorClasses[color]?.split(" text-")[1] ? "text-" + iconColorClasses[color].split(" text-")[1] : "text-white"}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  {description}
                </p>
              </div>
            </div>
            {setting && (
              <ToggleSwitch
                enabled={settings[setting]}
                onToggle={() => toggleSetting(setting)}
                color={color}
              />
            )}
          </div>
          {children}
        </div>
      </div>
    );
  };
  const SliderSetting = ({ label, value, color = "zinc" }) => {
    const sliderColorClasses = {
      zinc: "from-zinc-400 to-zinc-600 shadow-zinc-500/30",
    };
    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm text-zinc-300 mb-2">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`absolute h-full bg-gradient-to-r rounded-full transition-all duration-500 shadow-lg ${sliderColorClasses[color] || sliderColorClasses.zinc}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950/20 to-zinc-950/20 p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-zinc-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-zinc-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-64 h-64 bg-zinc-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>{" "}
      <div className="relative max-w-6xl mx-auto">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SettingCard
            icon={settings.darkMode ? Moon : Sun}
            title="Display & Appearance"
            description="Customize your visual experience"
            setting="darkMode"
            color="zinc"
          >
            <SliderSetting label="Brightness" value={75} color="zinc" />
            <SliderSetting label="Contrast" value={60} color="zinc" />
          </SettingCard>{" "}
          <SettingCard
            icon={Bell}
            title="Notifications"
            description="Manage your alerts and sounds"
            setting="notifications"
            color="zinc"
          >
            <SliderSetting label="Volume" value={80} color="zinc" />
            <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-zinc-800/50">
              <span className="text-sm text-zinc-300">Sound Effects</span>
              <ToggleSwitch
                enabled={settings.soundEffects}
                onToggle={() => toggleSetting("soundEffects")}
                color="zinc"
              />
            </div>
          </SettingCard>{" "}
          <SettingCard
            icon={Shield}
            title="Privacy & Security"
            description="Keep your data safe and secure"
            setting="privacy"
            color="zinc"
          >
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Two-Factor Auth</span>
                </div>
                <ToggleSwitch
                  enabled={settings.twoFactor}
                  onToggle={() => toggleSetting("twoFactor")}
                  color="zinc"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Eye className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Face ID</span>
                </div>
                <ToggleSwitch
                  enabled={settings.faceId}
                  onToggle={() => toggleSetting("faceId")}
                  color="zinc"
                />
              </div>
            </div>
          </SettingCard>{" "}
          <SettingCard
            icon={Wifi}
            title="Device & Connectivity"
            description="Manage your connections"
            setting="wifi"
            color="zinc"
          >
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">zinctooth</span>
                </div>
                <ToggleSwitch
                  enabled={settings.zinctooth}
                  onToggle={() => toggleSetting("zinctooth")}
                  color="zinc"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Battery className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Low Power Mode</span>
                </div>
                <ToggleSwitch
                  enabled={settings.lowPowerMode}
                  onToggle={() => toggleSetting("lowPowerMode")}
                  color="zinc"
                />
              </div>
            </div>
          </SettingCard>{" "}
          <SettingCard
            icon={Camera}
            title="Media & Permissions"
            description="Control app permissions"
            setting="camera"
            color="zinc"
          >
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Mic className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Microphone</span>
                </div>
                <ToggleSwitch
                  enabled={settings.microphone}
                  onToggle={() => toggleSetting("microphone")}
                  color="zinc"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">
                    Location Services
                  </span>
                </div>
                <ToggleSwitch
                  enabled={settings.location}
                  onToggle={() => toggleSetting("location")}
                  color="zinc"
                />
              </div>
            </div>
          </SettingCard>{" "}
          <SettingCard
            icon={Zap}
            title="System & Updates"
            description="Keep your system optimized"
            setting="autoUpdate"
            color="zinc"
          >
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Cloud className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Cloud Backup</span>
                </div>
                <ToggleSwitch
                  enabled={settings.backupCloud}
                  onToggle={() => toggleSetting("backupCloud")}
                  color="zinc"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Auto Sync</span>
                </div>
                <ToggleSwitch
                  enabled={settings.autoSync}
                  onToggle={() => toggleSetting("autoSync")}
                  color="zinc"
                />
              </div>
            </div>
          </SettingCard>
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/50 backdrop-blur-xl border border-zinc-500/30 hover:border-zinc-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-500/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-zinc-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Mail className="h-8 w-8 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Email Marketing
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">
                  Promotional emails
                </span>
                <ToggleSwitch
                  enabled={settings.marketing}
                  onToggle={() => toggleSetting("marketing")}
                  color="zinc"
                />
              </div>
            </div>
          </div>{" "}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/50 backdrop-blur-xl border border-zinc-500/30 hover:border-zinc-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-500/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-zinc-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Newsletter
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Weekly updates</span>
                <ToggleSwitch
                  enabled={settings.newsletter}
                  onToggle={() => toggleSetting("newsletter")}
                  color="zinc"
                />
              </div>
            </div>
          </div>{" "}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/50 backdrop-blur-xl border border-zinc-500/30 hover:border-zinc-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-500/20 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 to-zinc-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <User className="h-8 w-8 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Analytics
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">Usage tracking</span>
                <ToggleSwitch
                  enabled={settings.analytics}
                  onToggle={() => toggleSetting("analytics")}
                  color="zinc"
                />
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-xl border border-zinc-700/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Monitor className="h-6 w-6 text-zinc-400 mr-3" />
            Advanced Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Clear Cache</h3>
              <p className="text-xs text-zinc-400">Free up storage space</p>
            </div>{" "}
            <div className="text-center p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500/20 to-sky-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Key className="h-6 w-6  text-sky-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">API Keys</h3>
              <p className="text-xs text-zinc-400">Manage integrations</p>
            </div>{" "}
            <div className="text-center p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Billing</h3>
              <p className="text-xs text-zinc-400">Payment settings</p>
            </div>{" "}
            <div className="text-center p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Volume2 className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Audio</h3>
              <p className="text-xs text-zinc-400">Sound preferences</p>
            </div>
          </div>
        </div>{" "}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 backdrop-blur-xl border border-zinc-700/50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-zinc-400 rounded-full animate-pulse" />
              <span className="text-sm text-zinc-300">
                System Status: Online
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Battery className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-300">Battery: 87%</span>
            </div>
          </div>
          <div className="text-sm text-zinc-400">Last sync: 2 minutes ago</div>
        </div>
      </div>
    </div>
  );
};
export default SettingsComponent;
