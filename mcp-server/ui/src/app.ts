import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
} from '@modelcontextprotocol/ext-apps';

interface Member {
  id: string;
  name: string;
  title: string;
  agent_type: string;
  default_tier: 'flash_lite' | 'flash' | 'pro' | 'inherit';
  mode: string;
  color: string;
  specialty: string;
  enabled: boolean;
}

interface Preset {
  id: string;
  name: string;
  subtitle: string;
  member_ids: string[];
  flow: string;
}

interface TeamState {
  version: string;
  members: Member[];
  presets: Preset[];
}

const DEFAULT_VERBS: Record<string, string> = {
  an: 'điều phối',
  minh: 'thiết kế kiến trúc',
  tin: 'quét codebase & log',
  long: 'xử lý backend',
  linh: 'thiết kế UI responsive',
  khanh: 'kiểm thử & build',
  hung: 'review & bảo mật',
};

let state: TeamState = { version: '2.0.0', members: [], presets: [] };
let activePresetId = 'fullstack';
let selectedMemberIds = new Set<string>(['an', 'minh', 'long', 'linh', 'khanh', 'hung']);
let canSendMessage = false;
let canUpdateContext = false;

const presetGrid = document.getElementById('presetGrid')!;
const memberGrid = document.getElementById('memberGrid')!;
const bannerPreview = document.getElementById('bannerPreview')!;
const selectedSummary = document.getElementById('selectedSummary')!;
const tierSummary = document.getElementById('tierSummary')!;
const taskInput = document.getElementById('taskInput') as HTMLTextAreaElement;
const btnCopy = document.getElementById('btnCopy')!;
const btnAttach = document.getElementById('btnAttach')!;
const btnSend = document.getElementById('btnSend')!;
const btnReset = document.getElementById('btnReset')!;
const toastEl = document.getElementById('toast')!;

function showToast(msg: string): void {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 2600);
}

function getChosenMembers(): Member[] {
  return state.members.filter((m) => selectedMemberIds.has(m.id) && m.enabled);
}

function buildBanner(): string {
  const chosen = getChosenMembers();
  if (chosen.length === 0) return '> 🤖 **Đội hình AI:** Chưa chọn thành viên nào';
  const parts = chosen.map(
    (m) => `\`${m.name} · ${m.title}\` (\`${m.default_tier}\`) ${DEFAULT_VERBS[m.id] || 'thực thi'}`
  );
  return `> 🤖 **Đội hình AI:** ${parts.join(' · ')}`;
}

function buildDispatchPrompt(): string {
  const chosen = getChosenMembers();
  const names = chosen.map((m) => `${m.name} (${m.title} - ${m.default_tier})`).join(', ');
  const task = taskInput.value.trim();
  const header = `Triệu tập đội ngũ AI: ${names}.`;
  return task ? `${header}\nYêu cầu: ${task}` : header;
}

function render(): void {
  // Presets
  presetGrid.innerHTML = '';
  for (const preset of state.presets) {
    const btn = document.createElement('button');
    btn.className = `preset-card ${activePresetId === preset.id ? 'active' : ''}`;
    btn.innerHTML = `<div class="preset-name">${preset.name}</div><div class="preset-sub">${preset.subtitle}</div>`;
    btn.onclick = () => {
      activePresetId = preset.id;
      selectedMemberIds = new Set(preset.member_ids);
      render();
    };
    presetGrid.appendChild(btn);
  }

  // Members
  memberGrid.innerHTML = '';
  for (const m of state.members) {
    const inSquad = selectedMemberIds.has(m.id) && m.enabled;
    const card = document.createElement('div');
    card.className = `member-card ${inSquad ? 'in-squad' : ''} ${!m.enabled ? 'disabled' : ''}`;
    card.style.setProperty('--member-color', m.color || '#3b82f6');

    const initials = m.name.slice(0, 2).toUpperCase();
    const modeLabel =
      m.mode === 'read-only' ? 'Chỉ đọc' : m.mode === 'coordinator' ? 'Điều phối' : 'Đọc/Ghi';

    card.innerHTML = `
      <div class="member-top">
        <div class="member-id" data-toggle="${m.id}">
          <div class="avatar">${initials}</div>
          <div>
            <div class="member-name">${m.name} · ${m.title}</div>
            <div class="member-title">${m.agent_type}</div>
          </div>
        </div>
        <span class="mode-chip">${modeLabel}</span>
      </div>
      <div class="member-spec">${m.specialty}</div>
      <div class="member-controls">
        <label class="squad-check">
          <input type="checkbox" data-check="${m.id}" ${inSquad ? 'checked' : ''} ${!m.enabled ? 'disabled' : ''} />
          <span>Vào nhóm</span>
        </label>
        <select class="tier-select tier-${m.default_tier}" data-tier="${m.id}" aria-label="Model tier for ${m.name}">
          <option value="pro" ${m.default_tier === 'pro' ? 'selected' : ''}>pro</option>
          <option value="flash" ${m.default_tier === 'flash' ? 'selected' : ''}>flash</option>
          <option value="flash_lite" ${m.default_tier === 'flash_lite' ? 'selected' : ''}>flash_lite</option>
          <option value="inherit" ${m.default_tier === 'inherit' ? 'selected' : ''}>inherit</option>
        </select>
      </div>
    `;

    const checkbox = card.querySelector(`input[data-check="${m.id}"]`) as HTMLInputElement;
    const toggleSquad = () => {
      if (!m.enabled) return;
      activePresetId = 'custom';
      if (selectedMemberIds.has(m.id)) {
        selectedMemberIds.delete(m.id);
      } else {
        selectedMemberIds.add(m.id);
      }
      render();
    };
    checkbox.onchange = toggleSquad;
    card.querySelector(`[data-toggle="${m.id}"]`)?.addEventListener('click', toggleSquad);

    const select = card.querySelector(`select[data-tier="${m.id}"]`) as HTMLSelectElement;
    select.onchange = async () => {
      const nextTier = select.value as Member['default_tier'];
      m.default_tier = nextTier;
      render();
      try {
        await app.callServerTool({
          name: 'app_update_member',
          arguments: { member_id: m.id, default_tier: nextTier },
        });
        showToast(`Đã lưu tầng ${nextTier} cho ${m.name}`);
      } catch {
        showToast(`Đã đổi tầng tạm thời cho ${m.name}`);
      }
    };

    memberGrid.appendChild(card);
  }

  const chosen = getChosenMembers();
  selectedSummary.textContent = `${chosen.length} / ${state.members.length} thành viên`;
  const counts = chosen.reduce<Record<string, number>>((acc, m) => {
    acc[m.default_tier] = (acc[m.default_tier] || 0) + 1;
    return acc;
  }, {});
  tierSummary.textContent = Object.entries(counts)
    .map(([tier, c]) => `${tier}: ${c}`)
    .join(' · ');
  bannerPreview.textContent = buildBanner();
}

function hydrateFromStructured(sc: any): void {
  if (!sc) return;
  if (sc.state && Array.isArray(sc.state.members)) {
    state = sc.state;
  }
  if (sc.selectedPresetId) {
    activePresetId = sc.selectedPresetId;
    const preset = state.presets.find((p) => p.id === activePresetId);
    if (preset) selectedMemberIds = new Set(preset.member_ids);
  }
  if (Array.isArray(sc.chosenMembers) && sc.chosenMembers.length > 0) {
    selectedMemberIds = new Set(sc.chosenMembers.map((m: Member) => m.id));
  }
  if (typeof sc.task === 'string' && sc.task) {
    taskInput.value = sc.task;
  }
  render();
}

const app = new App({ name: 'AI Team Dashboard', version: '2.0.0' }, {});

// Register handlers BEFORE connect() per MCP Apps spec
app.ontoolinput = ({ arguments: args }) => {
  if (args && typeof (args as any).task === 'string') {
    taskInput.value = (args as any).task;
  }
};

app.ontoolresult = (result) => {
  hydrateFromStructured(result?.structuredContent);
};

app.onhostcontextchanged = (ctx) => {
  if (ctx?.theme) applyDocumentTheme(ctx.theme);
  if (ctx?.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
};

btnCopy.onclick = async () => {
  const promptText = buildDispatchPrompt();
  try {
    await navigator.clipboard.writeText(promptText);
    showToast('Đã sao chép lệnh gọi đội ngũ!');
  } catch {
    showToast(promptText);
  }
};

btnAttach.onclick = async () => {
  if (!canUpdateContext) return;
  try {
    await app.updateModelContext({
      content: [{ type: 'text', text: `${buildBanner()}\n${buildDispatchPrompt()}` }],
    });
    showToast('Đã đính kèm đội hình AI vào tin nhắn kế tiếp!');
  } catch {
    showToast('Không thể đính kèm context ở chế độ xem này.');
  }
};

btnSend.onclick = async () => {
  if (!canSendMessage) return;
  try {
    await app.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: buildDispatchPrompt() }],
    });
    showToast('Đã gửi yêu cầu giao việc cho đội hình AI!');
  } catch {
    showToast('Không thể gửi tin nhắn ở chế độ xem này.');
  }
};

btnReset.onclick = async () => {
  try {
    const res = await app.callServerTool({ name: 'app_reset_defaults', arguments: {} });
    const sc = (res as any)?.structuredContent || null;
    if (sc?.state) {
      state = sc.state;
      activePresetId = 'fullstack';
      selectedMemberIds = new Set(state.presets[0]?.member_ids || []);
      render();
      showToast('Đã khôi phục cấu hình đội ngũ mặc định!');
    }
  } catch {
    showToast('Không thể khôi phục mặc định.');
  }
};

async function init(): Promise<void> {
  await app.connect();
  const ctx = app.getHostContext();
  if (ctx?.theme) applyDocumentTheme(ctx.theme);
  if (ctx?.styles?.variables) applyHostStyleVariables(ctx.styles.variables);

  const caps = app.getHostCapabilities() as any;
  canSendMessage = Boolean(caps?.message);
  canUpdateContext = Boolean(caps?.updateModelContext);
  btnSend.classList.toggle('hidden', !canSendMessage);
  btnAttach.classList.toggle('hidden', !canUpdateContext);

  // Fallback fetch if opened directly without ontoolresult payload yet
  if (state.members.length === 0) {
    try {
      const res = await app.callServerTool({ name: 'open_team_dashboard', arguments: {} });
      hydrateFromStructured((res as any)?.structuredContent);
    } catch {
      // Waiting for host ontoolresult
    }
  }
}

init();
