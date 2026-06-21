# iCline — Stable release pointer

> อัปเดตเมื่อปล่อย Stable แต่ละครั้ง

| ฟิลด์ | ค่า |
|-------|-----|
| **Stable version** | `0.1.12` |
| **Released** | 2026-06-21 |
| **GitHub** | https://github.com/i-mrDedchai/iCline/releases/tag/v0.1.12 |
| **Marketplace** | https://marketplace.visualstudio.com/items?itemName=i-mrdedchai.iCline |
| **Extension ID** | `i-mrdedchai.iCline` |

## วิธีรู้ว่าเวอร์ชันนี้ “พร้อมใช้งานสาธารณะ”

1. มีไฟล์นี้ (`releases/STABLE.md`) ชี้เวอร์ชันล่าสุด
2. GitHub Release `v0.1.12` **ไม่มี**ป้าย Pre-release
3. Marketplace แสดง `0.1.12`
4. มีบันทึกอนุมัติใน `releases/approvals/` (ถ้าข้าม smoke checklist)

## สรุปการเปลี่ยนแปลงหลัก (0.1.12 รวม 0.1.11)

- แก้ xAI/Grok `attempt_completion` / Responses API streaming
- แก้ webview production HTML (แชท/ตั้งค่าเปิดได้)
- Release gates: Dev / Beta / Stable