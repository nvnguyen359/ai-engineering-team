"""File: mcp-server/server.py | Purpose: FastMCP server for AI Engineering Team providing MCP App UI (ui://ai-team/dashboard.html), squad planning tools, and persistent config sync."""
from __future__ import annotations

import argparse
import copy
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from mcp.server.fastmcp import FastMCP
from mcp.types import CallToolResult, TextContent

APP_URI = "ui://ai-team/dashboard.html"

DEFAULT_MEMBERS: List[Dict[str, Any]] = [
    {
        "id": "an",
        "name": "An",
        "title": "Tech Lead",
        "agent_type": "coordinator",
        "default_tier": "inherit",
        "mode": "coordinator",
        "color": "#0ea5e9",
        "specialty": "Điều phối, phân rã yêu cầu, chọn tổ hợp nhóm & tổng hợp kết quả",
        "enabled": True,
    },
    {
        "id": "minh",
        "name": "Minh",
        "title": "Architect",
        "agent_type": "team-architect",
        "default_tier": "pro",
        "mode": "read-only",
        "color": "#8b5cf6",
        "specialty": "Thiết kế kiến trúc, hợp đồng API, đánh giá trade-offs & kế hoạch triển khai",
        "enabled": True,
    },
    {
        "id": "tin",
        "name": "Tin",
        "title": "Scout",
        "agent_type": "team-scout",
        "default_tier": "flash_lite",
        "mode": "read-only",
        "color": "#14b8a6",
        "specialty": "Quét codebase rộng, đọc log dài, khoanh vùng file & dòng siêu nhanh",
        "enabled": True,
    },
    {
        "id": "long",
        "name": "Long",
        "title": "Backend",
        "agent_type": "team-backend",
        "default_tier": "pro",
        "mode": "read-write",
        "color": "#3b82f6",
        "specialty": "API, Database, Worker, Concurrency, Media/System, tối ưu hiệu năng",
        "enabled": True,
    },
    {
        "id": "linh",
        "name": "Linh",
        "title": "Frontend",
        "agent_type": "team-frontend",
        "default_tier": "flash",
        "mode": "read-write",
        "color": "#ec4899",
        "specialty": "UX/UI hiện đại, Responsive Desktop & Mobile, Component DRY, i18n",
        "enabled": True,
    },
    {
        "id": "khanh",
        "name": "Khanh",
        "title": "QA",
        "agent_type": "team-qa",
        "default_tier": "flash",
        "mode": "read-write",
        "color": "#10b981",
        "specialty": "Automated test, kiểm tra build/compile, vệ sinh thư mục test, chống hồi quy",
        "enabled": True,
    },
    {
        "id": "hung",
        "name": "Hung",
        "title": "Reviewer",
        "agent_type": "team-reviewer",
        "default_tier": "pro",
        "mode": "read-only",
        "color": "#f59e0b",
        "specialty": "Review diff độc lập, soi race condition, memory leak, bảo mật & SOLID",
        "enabled": True,
    },
]

DEFAULT_PRESETS: List[Dict[str, Any]] = [
    {
        "id": "fullstack",
        "name": "Feature Fullstack",
        "subtitle": "Tính năng mới cả Backend & Frontend",
        "keywords": ["tính năng", "feature", "fullstack", "api", "mới", "trang", "tạo mới", "module"],
        "member_ids": ["an", "minh", "long", "linh", "khanh", "hung"],
        "flow": "Minh thiết kế -> Long & Linh code song song -> Khanh test -> Hung review",
    },
    {
        "id": "bughunt",
        "name": "Deep Bug Hunt",
        "subtitle": "Truy gốc lỗi khó, crash, leak, log dài",
        "keywords": ["lỗi", "bug", "fix", "crash", "treo", "leak", "log", "sai", "đứng", "timeout"],
        "member_ids": ["an", "tin", "long", "khanh"],
        "flow": "Tin quét log & khoanh vùng -> Long vá gốc lỗi -> Khanh viết regression test",
    },
    {
        "id": "uiux",
        "name": "UI/UX Polish",
        "subtitle": "Thiết kế UI, responsive Desktop & Mobile",
        "keywords": ["ui", "ux", "giao diện", "css", "mobile", "desktop", "popup", "card", "responsive", "sidebar"],
        "member_ids": ["an", "linh", "hung"],
        "flow": "Linh thiết kế component DRY + responsive + build -> Hung soát i18n & chất lượng",
    },
    {
        "id": "audit",
        "name": "Audit & Refactor",
        "subtitle": "Rà soát diện rộng, dọn rác, tối ưu hệ thống",
        "keywords": ["dọn", "clean", "refactor", "audit", "tối ưu", "rà soát", "chuẩn hóa", "rác"],
        "member_ids": ["an", "tin", "minh", "khanh", "hung"],
        "flow": "Tin kiểm kê phạm vi -> Minh chia lô -> Thực thi -> Khanh & Hung tổng duyệt",
    },
    {
        "id": "release",
        "name": "Release & QA Gate",
        "subtitle": "Kiểm định toàn bộ trước khi Merge / Build",
        "keywords": ["release", "build", "merge", "deploy", "kiểm thử", "test", "review", "bảo mật"],
        "member_ids": ["an", "khanh", "hung"],
        "flow": "Khanh chạy full test & build gate -> Hung review diff & bảo mật",
    },
]

VALID_TIERS = {"flash_lite", "flash", "pro", "inherit"}


def _resolve_paths() -> tuple[Path, Path, Path]:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--plugin-root", default="")
    parser.add_argument("--data-dir", default="")
    args, _ = parser.parse_known_args()

    server_dir = Path(__file__).resolve().parent
    plugin_root = Path(args.plugin_root).resolve() if args.plugin_root else server_dir.parent
    data_dir = Path(args.data_dir).resolve() if args.data_dir else (Path.home() / ".gemini" / "config" / "plugins" / "ai-engineering-team")
    data_dir.mkdir(parents=True, exist_ok=True)
    # Shared state file readable by both MCP server and Antigravity IDE Sidebar Extension
    shared_config_path = Path.home() / ".gemini" / "config" / "plugins" / "ai-engineering-team" / "team-config.json"
    if not shared_config_path.parent.exists():
        shared_config_path = data_dir / "team-config.json"
    return plugin_root, data_dir, shared_config_path


PLUGIN_ROOT, DATA_DIR, CONFIG_PATH = _resolve_paths()


def load_state() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            if isinstance(raw, dict) and isinstance(raw.get("members"), list):
                return raw
        except Exception:
            pass
    state = {
        "version": "2.0.0",
        "members": copy.deepcopy(DEFAULT_MEMBERS),
        "presets": copy.deepcopy(DEFAULT_PRESETS),
        "recent_dispatches": [],
    }
    save_state(state)
    return state


def save_state(state: Dict[str, Any]) -> None:
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def build_status_banner(members: List[Dict[str, Any]], tasks_map: Optional[Dict[str, str]] = None) -> str:
    parts: List[str] = []
    for m in members:
        if not m.get("enabled", True):
            continue
        role_task = (tasks_map or {}).get(m["id"]) or _default_short_verb(m["id"])
        parts.append(f"`{m['name']} · {m['title']}` (`{m['default_tier']}`) {role_task}")
    return "> 🤖 **Đội hình AI:** " + " · ".join(parts)


def _default_short_verb(member_id: str) -> str:
    return {
        "an": "điều phối",
        "minh": "thiết kế kiến trúc",
        "tin": "quét codebase & log",
        "long": "xử lý backend",
        "linh": "thiết kế UI responsive",
        "khanh": "kiểm thử & build",
        "hung": "review & bảo mật",
    }.get(member_id, "thực thi")


def recommend_preset(task_text: str, presets: List[Dict[str, Any]]) -> Dict[str, Any]:
    lower = (task_text or "").lower()
    best = presets[0]
    best_score = -1
    for preset in presets:
        score = sum(1 for kw in preset.get("keywords", []) if kw in lower)
        if score > best_score:
            best_score = score
            best = preset
    return best


def read_dashboard_html() -> str:
    env_override = os.environ.get("AI_TEAM_APP_HTML", "").strip()
    candidates = []
    if env_override:
        candidates.append(Path(env_override))
    candidates.append(PLUGIN_ROOT / "mcp-server" / "dist" / "dashboard.html")
    candidates.append(Path(__file__).resolve().parent / "dist" / "dashboard.html")
    for candidate in candidates:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    return "<!doctype html><html><body><h3>AI Team Dashboard HTML not built yet.</h3></body></html>"


mcp = FastMCP("ai-team-mcp")

PANE_META = {
    "ui": {"resourceUri": APP_URI},
    "com.google.antigravity/ui": {
        "entrypoints": [
            {"type": "aux_pane", "title": "AI Team"},
            {"type": "global", "title": "AI Team"},
        ]
    },
}

INLINE_META = {
    "ui": {"resourceUri": APP_URI},
}

APP_ONLY_META = {
    "ui": {"visibility": ["app"]},
}


@mcp.resource(
    APP_URI,
    name="AI Team Dashboard",
    description="Interactive visual dashboard for AI Engineering Team roster, model tiers, and squad composition.",
    mime_type="text/html;profile=mcp-app",
    meta={"ui": {"prefersBorder": False}},
)
def dashboard_html_resource() -> str:
    return read_dashboard_html()


@mcp.tool(
    name="open_team_dashboard",
    title="AI Team Dashboard",
    description="Open the visual AI Engineering Team dashboard to view/edit members (An, Minh, Tin, Long, Linh, Khanh, Hung), model tiers, and dispatch squads.",
    meta=PANE_META,
)
def open_team_dashboard(selected_preset: Optional[str] = None, task: Optional[str] = None) -> CallToolResult:
    state = load_state()
    preset = None
    if selected_preset:
        preset = next((p for p in state["presets"] if p["id"] == selected_preset), None)
    if preset is None and task:
        preset = recommend_preset(task, state["presets"])
    if preset is None:
        preset = state["presets"][0]

    active_members = [m for m in state["members"] if m["id"] in preset["member_ids"] and m.get("enabled", True)]
    banner = build_status_banner(active_members)
    structured = {
        "view": "dashboard",
        "state": state,
        "selectedPresetId": preset["id"],
        "task": task or "",
        "banner": banner,
        "configPath": str(CONFIG_PATH),
    }
    summary = (
        f"Đã mở bảng điều phối đội ngũ AI ({len(state['members'])} thành viên, {len(state['presets'])} tổ hợp nhóm).\n"
        f"{banner}"
    )
    return CallToolResult(
        content=[TextContent(type="text", text=summary)],
        structuredContent=structured,
    )


@mcp.tool(
    name="plan_team_dispatch",
    title="Plan AI Squad Dispatch",
    description="Analyze a task description and recommend the best AI squad preset, member roles, model-tier allocation, and formatted 1-line status banner.",
    meta=INLINE_META,
)
def plan_team_dispatch(task: str = "", preset_id: Optional[str] = None, member_ids: Optional[List[str]] = None) -> CallToolResult:
    state = load_state()
    members_by_id = {m["id"]: m for m in state["members"]}

    if member_ids:
        chosen = [members_by_id[mid] for mid in member_ids if mid in members_by_id and members_by_id[mid].get("enabled", True)]
        preset = {
            "id": "custom",
            "name": "Tổ hợp tùy chỉnh",
            "subtitle": "Đội hình chọn tay theo yêu cầu",
            "member_ids": [m["id"] for m in chosen],
            "flow": " -> ".join(f"{m['name']} ({m['default_tier']})" for m in chosen),
        }
    else:
        preset = next((p for p in state["presets"] if p["id"] == preset_id), None) if preset_id else recommend_preset(task, state["presets"])
        if preset is None:
            preset = state["presets"][0]
        chosen = [members_by_id[mid] for mid in preset["member_ids"] if mid in members_by_id and members_by_id[mid].get("enabled", True)]

    banner = build_status_banner(chosen)
    if task:
        history = state.get("recent_dispatches", [])
        history.insert(0, {"task": task[:200], "preset": preset["name"], "banner": banner})
        state["recent_dispatches"] = history[:8]
        save_state(state)

    structured = {
        "view": "dispatch",
        "state": state,
        "selectedPresetId": preset["id"],
        "task": task,
        "banner": banner,
        "chosenMembers": chosen,
        "preset": preset,
    }
    return CallToolResult(
        content=[TextContent(type="text", text=f"Tổ hợp đề xuất: **{preset['name']}**\n{banner}\nLuồng: {preset['flow']}")],
        structuredContent=structured,
    )


@mcp.tool(
    name="get_team_roster",
    title="Get AI Team Roster",
    description="Return the current AI Engineering Team roster, default model tiers, and squad presets as JSON.",
)
def get_team_roster() -> Dict[str, Any]:
    return load_state()


@mcp.tool(
    name="app_update_member",
    title="Update AI Team Member",
    description="App-only tool to update a member's model tier, enabled state, or title and persist immediately.",
    meta=APP_ONLY_META,
)
def app_update_member(
    member_id: str,
    default_tier: Optional[str] = None,
    enabled: Optional[bool] = None,
    name: Optional[str] = None,
    title: Optional[str] = None,
) -> Dict[str, Any]:
    state = load_state()
    updated = None
    for m in state["members"]:
        if m["id"] == member_id:
            if default_tier in VALID_TIERS:
                m["default_tier"] = default_tier
            if isinstance(enabled, bool):
                m["enabled"] = enabled
            if name and name.strip():
                m["name"] = name.strip()
            if title and title.strip():
                m["title"] = title.strip()
            updated = m
            break
    if updated is None:
        return {"ok": False, "error": f"Unknown member_id: {member_id}", "state": state}
    save_state(state)
    return {"ok": True, "updated": updated, "state": state}


@mcp.tool(
    name="app_reset_defaults",
    title="Reset Team Defaults",
    description="App-only tool to restore default AI Engineering Team roster and presets.",
    meta=APP_ONLY_META,
)
def app_reset_defaults() -> Dict[str, Any]:
    state = {
        "version": "2.0.0",
        "members": copy.deepcopy(DEFAULT_MEMBERS),
        "presets": copy.deepcopy(DEFAULT_PRESETS),
        "recent_dispatches": [],
    }
    save_state(state)
    return {"ok": True, "state": state}


if __name__ == "__main__":
    mcp.run(transport="stdio")
