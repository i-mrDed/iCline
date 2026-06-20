<p align="center">
  <img src="apps/vscode/assets/icons/icon.png" width="80" alt="iCline" />
</p>

<h1 align="center">iCline</h1>

<p align="center">
Fork ของ Cline สำหรับ VS Code พร้อม xAI Grok OAuth, ZenMux และ agent harness ที่แข็งแกร่งขึ้น — ติดตั้งคู่กับ Cline official ได้
</p>

<p align="center">
🌐 <strong>ภาษาไทย</strong> (หน้านี้) · <a href="README.md">English</a>
</p>

<!-- icline:version -->
<p align="center">
  <strong>เวอร์ชัน</strong> <code>0.1.7</code> ·
  <a href="https://github.com/i-mrDed/iCline/releases">Releases</a> ·
  Extension ID <code>i-mrDed.iCline</code>
</p>
<!-- /icline:version -->

---

## เริ่มต้นอย่างรวดเร็ว

1. ดาวน์โหลด `.vsix` ล่าสุดจาก [Releases](https://github.com/i-mrDed/iCline/releases)
2. ติดตั้ง: `code --install-extension i-mrDed.iCline-0.1.7.vsix --force`
3. เปิด iCline จาก Activity Bar → Settings → Sign in **xAI · Grok** หรือใส่ API key

เอกสาร extension เต็ม: **[apps/vscode/README.th.md](apps/vscode/README.th.md)** · English: **[apps/vscode/README.md](apps/vscode/README.md)**

## Build จากซอร์ส

```powershell
cd apps/vscode
npm install
npm run package:vsix
code --install-extension dist/i-mrDed.iCline-0.1.7.vsix --force
```

## iCline vs Cline official

| | Cline official | iCline |
|---|---|---|
| Extension ID | `saoudrizwan.claude-dev` | `i-mrDed.iCline` |
| xAI OAuth & subscription models | ❌ | ✅ |
| ZenMux provider | ❌ | ✅ |
| อัปเดตแบบ dual-channel ปลอดภัย | ❌ | ✅ |

ติดตั้งคู่กันได้ — อัปเดตฝั่งหนึ่งจะไม่ลบอีกฝั่ง

## ดึง upstream จาก Cline

```powershell
.\scripts\sync-upstream.ps1
```

## โครงสร้าง repo

Repo นี้เป็น fork ของ [cline/cline](https://github.com/cline/cline) — extension **iCline** อยู่ที่ `apps/vscode/` ส่วนโฟลเดอร์อื่นมาจาก upstream

## การมีส่วนร่วม

อ่าน [CONTRIBUTING.md](CONTRIBUTING.md) — การแก้ `main` โดยตรงทำได้เฉพาะ maintainer คนอื่นส่ง PR ผ่าน fork

## ความปลอดภัย

อ่าน [SECURITY.md](SECURITY.md) — ห้าม commit API key, `.env`, หรือ `~/.grok/auth.json`

## License

[Apache-2.0](LICENSE) — อิงจาก [Cline](https://github.com/cline/cline)