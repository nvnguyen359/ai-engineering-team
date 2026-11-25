/** File: ide-extension/extension.js | Purpose: Antigravity IDE / VS Code Activity Bar Sidebar extension for AI Engineering Team synchronized with ~/.gemini/config/plugins/ai-engineering-team/. */
const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PLUGIN_DIR = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'ai-engineering-team');
const CONFIG_PATH = path.join(PLUGIN_DIR, 'team-config.json');
const MCP_CONFIG_PATH = path.join(PLUGIN_DIR, 'mcp_config.json');

const DEFAULT_STATE = {
  version: '2.1.0',
  members: [
    { id: 'an', name: 'An', title: 'Tech Lead', agent_type: 'coordinator', default_tier: 'inherit', mode: 'coordinator', color: '#0ea5e9', specialty: 'Điều phối, tổng hợp tranh biện ADR/RFC & chốt quyết định', books: ['Pragmatic Programmer', 'SE at Google'], cross_skills: 'Cân bằng KISS/YAGNI & rủi ro', enabled: true },
    { id: 'minh', name: 'Minh', title: 'Architect', agent_type: 'team-architect', default_tier: 'pro', mode: 'read-only', color: '#8b5cf6', specialty: 'Kiến trúc nền móng, Clean Architecture & Trade-off ADR', books: ['Clean Architecture', 'DDIA', 'Hard Parts', 'DDD'], cross_skills: 'Phản biện Coupling & Parity', enabled: true },
    { id: 'tin', name: 'Tin', title: 'Scout', agent_type: 'team-scout', default_tier: 'flash_lite', mode: 'read-only', color: '#14b8a6', specialty: 'Map-First Discovery, đọc log dài & blast-radius xuyên tầng', books: ['Debugging (9 Rules)', 'Pragmatic Programmer'], cross_skills: 'Phản biện bằng file:line thật', enabled: true },
    { id: 'long', name: 'Long', title: 'Backend', agent_type: 'team-backend', default_tier: 'pro', mode: 'read-write', color: '#3b82f6', specialty: 'API, DB/Migration, Concurrency, SRE & Dual-Target (.exe/Cloud)', books: ['DDIA', 'Release It!', 'Google SRE', 'Systems Performance'], cross_skills: 'Phản biện hiệu năng & resilience', enabled: true },
    { id: 'linh', name: 'Linh', title: 'Frontend', agent_type: 'team-frontend', default_tier: 'flash', mode: 'read-write', color: '#ec4899', specialty: 'UX/UI Material 3, Responsive Desktop/Mobile, DRY & i18n', books: ['Design of Everyday Things', 'Refactoring UI', 'Patterns.dev'], cross_skills: 'Phản biện API contract & UX', enabled: true },
    { id: 'khanh', name: 'Khanh', title: 'QA', agent_type: 'team-qa', default_tier: 'flash', mode: 'read-write', color: '#10b981', specialty: 'Test Happy/Edge/Error, Automation, Build Gate & Zero-Trash', books: ['Unit Testing (Khorikov)', 'Legacy Code (Feathers)'], cross_skills: 'Shift-Left phản biện Testability', enabled: true },
    { id: 'hung', name: 'Hung', title: 'Reviewer', agent_type: 'team-reviewer', default_tier: 'pro', mode: 'read-only', color: '#f59e0b', specialty: 'Review diff 6 tầng, Red-Team kiến trúc & bảo mật OWASP/STRIDE', books: ['OWASP Top 10', 'Threat Modeling (STRIDE)', 'SE at Google'], cross_skills: 'Red-Team bảo mật & concurrency', enabled: true }
  ],
  presets: [
    { id: 'debate', name: 'Architecture Debate', subtitle: 'Khởi tạo nền móng & tranh biện RFC', member_ids: ['an', 'minh', 'long', 'linh', 'khanh', 'hung'], flow: 'Minh đề xuất -> Team phản biện -> An chốt ADR' },
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
        const defaultsById = Object.fromEntries(DEFAULT_STATE.members.map((m) => [m.id, m]));
        let changed = parsed.version !== '2.1.0';
        for (const m of parsed.members) {
          const d = defaultsById[m.id];
          if (d) {
            if (!m.books) { m.books = [...d.books]; changed = true; }
            if (!m.cross_skills) { m.cross_skills = d.cross_skills; changed = true; }
          }
        }
        const existingPresetIds = new Set((parsed.presets || []).map((p) => p.id));
        for (const dp of DEFAULT_STATE.presets) {
          if (!existingPresetIds.has(dp.id)) {
            parsed.presets = [dp, ...(parsed.presets || [])];
            changed = true;
          }
        }
        if (changed) {
          parsed.version = '2.1.0';
          saveTeamState(parsed);
        }
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
