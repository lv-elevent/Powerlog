"use client";

import { CheckCircle2, Download, Info, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  if (isInstalled) {
    return <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={19} />已安装到主屏幕</div>;
  }

  return <div>
    <button type="button" onClick={() => void install()} className="primary-button w-full"><Download size={18} />安装到主屏幕</button>
    {showInstructions && <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      <div className="flex items-center gap-2 font-semibold text-slate-800"><Info size={17} className="text-blue-600" />当前浏览器需要手动安装</div>
      {isIos ? <p className="mt-2">请使用 Safari 打开本页面，点击底部分享按钮，再选择“添加到主屏幕”。</p> : <p className="mt-2">请使用 Chrome 打开本页面，点击右上角菜单，再选择“添加到主屏幕”或“安装应用”。</p>}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Smartphone size={15} />不要在微信等内置浏览器中安装</div>
    </div>}
  </div>;
}
