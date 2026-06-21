# iCline — Stable release pointer

> อัปเดตเมื่อปล่อย Stable แต่ละครั้ง

| ฟิลด์ | ค่า |
|-------|-----|
| **Stable version** | `0.1.14` |
| **Released** | 2026-06-21 |
| **GitHub** | https://github.com/i-mrDedchai/iCline/releases/tag/v0.1.14 |
| **Marketplace** | https://marketplace.visualstudio.com/items?itemName=i-mrdedchai.iCline |
| **Extension ID** | `i-mrdedchai.iCline` |
| **Handoff doc** | [MAINTAINER-HANDOFF.md](./MAINTAINER-HANDOFF.md) |

## วิธีรู้ว่าเวอร์ชันนี้ “พร้อมใช้งานสาธารณะ”

1. มีไฟล์นี้ (`releases/STABLE.md`) ชี้เวอร์ชันล่าสุด
2. GitHub Release `v0.1.14` **ไม่มี**ป้าย Pre-release
3. Marketplace แสดง `0.1.14` (หรือสูงกว่า)
4. หน้า repo README แสดงเวอร์ชันตรงกับ `package.json`
5. มีบันทึกอนุมัติใน `releases/approvals/` (ถ้าข้าม smoke checklist)

## สรุปการเปลี่ยนแปลงหลัก (0.1.14)

- แก้ Marketplace / VS Code **Details** — README เต็มรูปแบบ + รูป preview
- แก้ **Webview ServiceWorker** บน Windows (defer load + Reload Window)
- แก้ **GitHub README** ไม่อัปเดตเมื่อ release ใช้ `-SkipPush`

## สรุปรอบก่อน (0.1.13)

- Chat quick Provider & Model picker
- Dev build numbering (`0.1.13-dev.N`)
- Settings → About, README previews, Marketplace SEO