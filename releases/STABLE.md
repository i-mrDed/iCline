# iCline — Stable release pointer

> อัปเดตเมื่อปล่อย Stable แต่ละครั้ง

| ฟิลด์ | ค่า |
|-------|-----|
| **Stable version** | `0.1.17` |
| **Released** | 2026-06-22 (stores) · GitHub Release 2026-06-23 |
| **GitHub** | https://github.com/i-mrDedchai/iCline/releases/tag/v0.1.17 |
| **Marketplace** | https://marketplace.visualstudio.com/items?itemName=i-mrdedchai.iCline |
| **Open VSX** | https://open-vsx.org/extension/i-mrdedchai/iCline |
| **Extension ID** | `i-mrdedchai.iCline` |

## วิธีรู้ว่าเวอร์ชันนี้ “พร้อมใช้งานสาธารณะ”

1. มีไฟล์นี้ (`releases/STABLE.md`) ชี้เวอร์ชันล่าสุด
2. GitHub Release `v0.1.17` **ไม่มี**ป้าย Pre-release และมี VSIX แนบ
3. Marketplace + Open VSX แสดง `0.1.17`
4. `node scripts/release-parity.mjs verify --version 0.1.17` ผ่านทุกช่องทาง
5. มีบันทึกอนุมัติใน `releases/approvals/` (ถ้าข้าม smoke checklist)

## สรุปการเปลี่ยนแปลงหลัก (0.1.17)

- แก้ Marketplace icon ให้มองเห็นชัดบนหน้า store
- แก้ README screenshots บน VS Marketplace และ Open VSX
- ลบแถว store/distribution ออกจาก comparison table

## สรุปรอบก่อน (0.1.16)

- Welcome home Phase 1, Quick Start editor, History export/import
- iCline branding ในแชท, VS Marketplace + Open VSX verified publisher