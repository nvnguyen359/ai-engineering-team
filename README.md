# AI Engineering Team & Smart Router (`v2.0.0`)

Gói tích hợp toàn diện cho **Google Antigravity** và **Antigravity IDE** — dùng chung cho **mọi dự án trên máy**:
- **6 Subagent chuyên biệt có tên riêng** (`Minh`, `Tin`, `Long`, `Linh`, `Khanh`, `Hung`) + Tech Lead (`An`).
- **Tự động phân bổ tầng AI** (`flash_lite` / `flash` / `pro` / `inherit`) và hiển thị dòng trạng thái phân bổ 1 dòng siêu gọn cho tác vụ phức tạp.
- **MCP Server + MCP App UI (`ui://ai-team/dashboard.html`)**: Mở bảng điều phối trực quan ngay trong chat, thanh phụ (Side Pane `+`) và Sidebar của Antigravity 2.0.
- **Antigravity IDE Sidebar Extension (`.vsix`)**: Gắn trực tiếp icon **AI Team** lên thanh **Activity Bar bên trái** của Antigravity IDE để theo dõi đội ngũ, đổi tầng model và tạo lệnh gọi nhóm trong 1 click.

---

## 1. Danh bạ đội ngũ
| Tên | Chức danh | Agent ID | Tầng mặc định | Quyền | Vai trò |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **An** | Tech Lead | Coordinator | `inherit` | Toàn quyền | Điều phối, phân việc & tổng hợp |
| **Minh** | Architect | `team-architect` | `pro` | Chỉ đọc | Thiết kế kiến trúc, API contract |
| **Tin** | Scout | `team-scout` | `flash_lite` | Chỉ đọc | Quét codebase rộng, đọc log dài |
| **Long** | Backend | `team-backend` | `pro` / `flash` | Đọc/Ghi | API, DB, Worker, Concurrency, Systems |
| **Linh** | Frontend | `team-frontend` | `flash` / `pro` | Đọc/Ghi | UX/UI, Responsive Desktop/Mobile, i18n |
| **Khanh** | QA | `team-qa` | `flash` | Đọc/Ghi | Automated test, build check, dọn rác test |
| **Hung** | Reviewer | `team-reviewer` | `pro` | Chỉ đọc | Review diff độc lập, soi leak & bảo mật |

---

## 2. Cài đặt 1 chạm trên Windows
```powershell
git clone https://github.com/nvnguyen359/ai-engineering-team.git
cd ai-engineering-team
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Sau khi chạy xong:
1. **Plugin & MCP Server** được cài vào `~/.gemini/config/plugins/ai-engineering-team/` (tự áp dụng cho mọi dự án).
2. **Sidebar Extension** được cài vào Antigravity IDE — bấm `Ctrl+Shift+P` → `Developer: Reload Window` để thấy ngay icon **AI Team** trên thanh Sidebar bên trái.

---

## 3. MCP Tools được cung cấp (`ai-team-mcp`)
- `open_team_dashboard`: Mở bảng UI trực quan (hỗ trợ cả `aux_pane` và `global` sidebar).
- `plan_team_dispatch`: Phân tích yêu cầu, gợi ý tổ hợp đội hình + dòng báo `> 🤖 Đội hình AI: ...`.
- `get_team_roster`: Trả về cấu hình đội ngũ & presets hiện tại.
- `app_update_member` / `app_reset_defaults`: Lưu thay đổi tầng model từ UI xuống `team-config.json` dùng chung giữa MCP Server và IDE Sidebar.
