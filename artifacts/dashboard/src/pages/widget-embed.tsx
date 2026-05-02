import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Code2, Copy, CheckCircle, ExternalLink, Globe, Smartphone } from "lucide-react";

export default function WidgetEmbed() {
  const { tenant } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);

  const origin = window.location.origin;
  const widgetUrl = `${origin}/api/widget.js?tenant=${tenant?.id}`;

  const scriptTag = `<script src="${widgetUrl}" async></script>`;
  const iframeTag = `<iframe src="${origin}/?tenant=${tenant?.id}&embedded=1" width="100%" height="700" frameborder="0" allow="camera"></iframe>`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-foreground">Widget Embed</h1>
        <p className="text-muted-foreground mt-1">Add your AI elevator matcher to any website in seconds.</p>
      </div>

      <div className="space-y-6">
        {/* Tenant ID info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Your Tenant ID</p>
            <code className="text-primary font-mono text-lg font-bold">{tenant?.id}</code>
            <p className="text-xs text-muted-foreground mt-1">This uniquely identifies your account in the widget.</p>
          </div>
        </div>

        {/* Option 1: Script tag */}
        <EmbedOption
          icon={<Code2 className="w-5 h-5 text-primary" />}
          title="Option 1: Floating Button (Recommended)"
          description="Adds a beautiful floating 'Find My Elevator' button to the bottom-right of your website. Opens in a modal overlay."
          code={scriptTag}
          onCopy={() => copy(scriptTag, "script")}
          copied={copied === "script"}
        />

        {/* Option 2: iFrame */}
        <EmbedOption
          icon={<Smartphone className="w-5 h-5 text-primary" />}
          title="Option 2: Inline iFrame"
          description="Embed the full tool directly into your page — great for a dedicated landing section."
          code={iframeTag}
          onCopy={() => copy(iframeTag, "iframe")}
          copied={copied === "iframe"}
        />

        {/* Direct link */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-2">Direct Link</h3>
          <p className="text-sm text-muted-foreground mb-3">Share this URL directly — it loads your branded version of the tool.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-secondary/50 border border-border rounded-lg px-3 py-2 text-primary font-mono overflow-hidden text-ellipsis whitespace-nowrap">
              {origin}/?tenant={tenant?.id}
            </code>
            <button onClick={() => copy(`${origin}/?tenant=${tenant?.id}`, "link")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
              {copied === "link" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied === "link" ? "Copied!" : "Copy"}
            </button>
            <a href={`/?tenant=${tenant?.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>

        {/* Usage note */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-3">Plan & Usage</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary capitalize">{tenant?.plan}</p>
              <p className="text-xs text-muted-foreground mt-1">Current Plan</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{tenant?.usageLimit}</p>
              <p className="text-xs text-muted-foreground mt-1">Monthly Analyses</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">✓</p>
              <p className="text-xs text-muted-foreground mt-1">WhatsApp CTA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedOption({ icon, title, description, code, onCopy, copied }: {
  icon: React.ReactNode; title: string; description: string;
  code: string; onCopy: () => void; copied: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="relative">
        <pre className="bg-secondary/50 border border-border rounded-lg p-4 text-xs text-primary font-mono overflow-x-auto whitespace-pre-wrap break-all">{code}</pre>
        <button
          onClick={onCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
