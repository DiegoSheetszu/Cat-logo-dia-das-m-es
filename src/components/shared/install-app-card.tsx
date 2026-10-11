"use client";

import { Download, Share, Smartphone } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeInstalled(callback: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    displayMode.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function getInstalledSnapshot() {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
}

export function InstallAppCard() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const installed = useSyncExternalStore(subscribeInstalled, getInstalledSnapshot, () => false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) {
      setShowHelp((value) => !value);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    void choice;
    setPromptEvent(null);
  }

  return (
    <section className="install-app-card">
      <span className="install-app-icon"><Smartphone size={21} aria-hidden="true" /></span>
      <div className="install-app-copy">
        <strong>{installed ? "App instalado" : "Acesse pelo celular"}</strong>
        <p>{installed ? "O sistema já está na tela inicial deste aparelho." : "Instale o sistema na tela inicial para abrir como um app."}</p>
        {!installed && <button className="install-app-button" onClick={install} type="button"><Download size={16} aria-hidden="true" />{promptEvent ? "Instalar aplicativo" : "Como instalar"}</button>}
        {showHelp && !installed && <div className="install-app-help">{typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent) ? <><Share size={15} aria-hidden="true" /> No Safari, toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.</> : <>No Chrome, abra o menu <strong>⋮</strong> e escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</>}</div>}
      </div>
    </section>
  );
}
