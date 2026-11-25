/** File: ide-extension/extension.js | Purpose: Antigravity IDE / VS Code Activity Bar Sidebar extension for AI Engineering Team synchronized with ~/.gemini/config/plugins/ai-engineering-team/. */
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PLUGIN_DIR = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'ai-engineering-team');
const CONFIG_PATH = path.join(PLUGIN_DIR, 'team-config.json');
const MCP_CONFIG_PATH = path.join(PLUGIN_DIR, 'mcp_config.json');

const DEFAULT_STATE = {
  version: '2.0.0',
  members: [
    { id: 'an', name: 'An', title: 'Tech Lead', agent_type: 'coordinator', default_tier: 'inherit', mode: 'coordinator', color: '#0ea5e9', specialty: 'Điều phối, phân rã yêu cầu & tổng hợp kết quả', enabled: true },
    { id: 'minh', name: 'Minh', title: 'Architect', agent_type: 'team-architect', default_tier: 'pro', mode: 'read-only', color: '#8b5cf6', specialty: 'Thiết kế kiến trúc, hợp đồng API, đánh giá trade-offs', enabled: true },
    { id: 'tin', name: 'Tin', title: 'Scout', agent_type: 'team-scout', default_tier: 'flash_lite', mode: 'read-only', color: '#14b8a6', specialty: 'Quét codebase rộng, đọc log dài, khoanh vùng file & dòng', enabled: true },
    { id: 'long', name: 'Long', title: 'Backend', agent_type: 'team-backend', default_tier: 'pro', mode: 'read-write', color: '#3b82f6', specialty: 'API, Database, Worker, Concurrency, Media/System', enabled: true },
    { id: 'linh', name: 'Linh', title: 'Frontend', agent_type: 'team-frontend', default_tier: 'flash', mode: 'read-write', color: '#ec4899', specialty: 'UX/UI hiện đại, Responsive Desktop & Mobile, Component DRY', enabled: true },
    { id: 'khanh', name: 'Khanh', title: 'QA', agent_type: 'team-qa', default_tier: 'flash', mode: 'read-write', color: '#10b981', specialty: 'Automated test, kiểm tra build, vệ sinh thư mục test', enabled: true },
    { id: 'hung', name: 'Hung', title: 'Reviewer', agent_type: 'team-reviewer', default_tier: 'pro', mode: 'read-only', color: '#f59e0b', specialty: 'Review diff độc lập, soi race condition, leak & bảo mật', enabled: true }
  ],
  presets: [
    { id: 'fullstack', name: 'Feature Fullstack', subtitle: 'Tính năng mới Backend + Frontend', member_ids: ['an', 'minh', 'long', 'linh', 'khanh', 'hung'], flow: 'Minh -> Long + Linh -> Khanh -> Hung' },
    { id: 'bughunt', name: 'Deep Bug Hunt', subtitle: 'Truy gốc lỗi khó, crash, log dài', member_ids: ['an', 'tin', 'long', 'khanh'], flow: 'Tin -> Long -> Khanh' },
    { id: 'uiux', name: 'UI/UX Polish', subtitle: 'Giao diện Desktop & Mobile DRY', member_ids: ['an', 'linh', 'hung'], flow: 'Linh -> Hung' },
    { id: 'audit', name: 'Audit & Refactor', subtitle: 'Rà soát diện rộng, dọn rác, tối ưu', member_ids: ['an', 'tin', 'minh', 'khanh', 'hung'], flow: 'Tin -> Minh -> Khanh + Hung' },
    { id: 'release', name: 'Release QA Gate', subtitle: 'Kiểm định trước Merge / Build', member_ids: ['an', 'khanh', 'hung'], flow: 'Khanh -> Hung' }
  ],
  recent_dispatches: []
};

function loadTeamState() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (parsed && Array.isArray(parsed.members)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to defaults
  }
  saveTeamState(DEFAULT_STATE);
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveTeamState(state) {
  try {
    fs.mkdirSync(PLUGIN_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    vscode.window.showErrorMessage(`AI Team: Không thể lưu cấu hình: ${err.message}`);
  }
}

function getSystemStatus() {
  return {
    pluginInstalled: fs.existsSync(path.join(PLUGIN_DIR, 'plugin.json')),
    mcpReady: fs.existsSync(MCP_CONFIG_PATH),
    pluginDir: PLUGIN_DIR
  };
}

class AiTeamWebviewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this._bindWebview(webviewView.webview, false);
  }

  refresh() {
    if (this._view) {
      this._postState(this._view.webview);
    }
  }

  openFullPanel() {
    const panel = vscode.window.createWebviewPanel(
      'aiTeamFullPanel',
      'AI Engineering Team Dashboard',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    this._bindWebview(panel.webview, true);
  }

  _bindWebview(webview, isWide) {
    const htmlPath = path.join(this._extensionUri.fsPath, 'resources', 'webview.html');
    const html = fs.readFileSync(htmlPath, 'utf8').replace('__IS_WIDE__', String(isWide));
    webview.html = html;

    webview.onDidReceiveMessage(async (msg) => {
      if (!msg || !msg.type) return;

      if (msg.type === 'ready' || msg.type === 'refresh') {
        this._postState(webview);
      } else if (msg.type === 'updateMember') {
        const state = loadTeamState();
        const target = state.members.find((m) => m.id === msg.memberId);
        if (target) {
          if (msg.defaultTier) target.default_tier = msg.defaultTier;
          if (typeof msg.enabled === 'boolean') target.enabled = msg.enabled;
          saveTeamState(state);
        }
        this._postState(webview);
        if (this._view && this._view.webview !== webview) {
          this._postState(this._view.webview);
        }
      } else if (msg.type === 'resetDefaults') {
        const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
        saveTeamState(fresh);
        this._postState(webview);
        vscode.window.showInformationMessage('AI Team: Đã khôi phục cấu hình mặc định.');
      } else if (msg.type === 'copyPrompt') {
        await vscode.env.clipboard.writeText(msg.text || '');
        vscode.window.showInformationMessage('Đã sao chép lệnh gọi đội ngũ AI! Dán vào khung chat Antigravity để chạy.');
      } else if (msg.type === 'openFullPanel') {
        this.openFullPanel();
      } else if (msg.type === 'openPluginFolder') {
        vscode.env.openExternal(vscode.Uri.file(PLUGIN_DIR));
      }
    });
  }

  _postState(webview) {
    webview.postMessage({
      type: 'state',
      state: loadTeamState(),
      status: getSystemStatus()
    });
  }
}

function activate(context) {
  const provider = new AiTeamWebviewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('aiTeamDashboardView', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    }),
    vscode.commands.registerCommand('aiTeam.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('aiTeam.openFullPanel', () => provider.openFullPanel()),
    vscode.commands.registerCommand('aiTeam.openPluginFolder', () => {
      vscode.env.openExternal(vscode.Uri.file(PLUGIN_DIR));
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
