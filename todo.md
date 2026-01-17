# Thai Smart - Project TODO

## Phase 1: Frontend Integration
- [x] ปรับปรุง Home.tsx ให้ใช้ tRPC hooks
- [x] เพิ่ม useAuth hook integration
- [x] ลบ localStorage dependencies
- [x] เชื่อมต่อ Dashboard กับ API

## Phase 2: Shop Setup Flow
- [x] สร้างหน้า ShopSetup.tsx
- [x] เพิ่ม form สำหรับตั้งค่าร้านค้า
- [x] เพิ่ม Onboarding flow สำหรับผู้ใช้ใหม่
- [x] Redirect ไปยัง Dashboard หลังจากสร้างร้านค้า

## Phase 3: Dashboard Real Data
- [x] ปรับปรุง Dashboard.tsx ให้ใช้ tRPC
- [x] แสดงยอดขายวันนี้จากฐานข้อมูล
- [x] แสดงลูกค้าค้างชำระ
- [x] แสดงสินค้าขายดี (Top 5)
- [x] เพิ่ม Real-time updates

## Phase 4: Features Implementation
- [ ] ระบบขาย (SalesForm.tsx)
  - [ ] เลือกลูกค้า
  - [ ] เลือกสินค้า
  - [ ] บันทึกการขาย
  - [ ] คำนวณยอดหนี้
- [ ] จัดการลูกค้า (CustomerManagement.tsx)
  - [ ] แสดงรายชื่อลูกค้า
  - [ ] เพิ่ม/แก้ไข/ลบลูกค้า
  - [ ] แสดงยอดหนี้
- [ ] จัดการสินค้า (InventoryManagement.tsx)
  - [ ] แสดงรายชื่อสินค้า
  - [ ] เพิ่ม/แก้ไข/ลบสินค้า
  - [ ] แสดงสต็อก
- [ ] รายงาน (Reports.tsx)
  - [ ] ยอดขายรายวัน
  - [ ] ยอดขายรายเดือน
  - [ ] ยอดหนี้สิน
- [ ] ปิดวัน (CloseDay.tsx)
  - [ ] สรุปยอดขายวันนี้
  - [ ] บันทึกการปิดวัน

## Phase 5: Testing & Deployment
- [ ] Unit tests สำหรับ Frontend components
- [ ] Integration tests
- [ ] Manual testing ทั้งระบบ
- [ ] บันทึก Checkpoint

## Phase 4: SalesForm Implementation
- [ ] สร้าง SalesForm.tsx component
- [ ] เพิ่ม form validation
- [ ] เชื่อมต่อ tRPC API
- [ ] เลือกลูกค้า (Combobox)
- [ ] เลือกสินค้า (Combobox)
- [ ] คำนวณยอดรวมอัตโนมัติ
- [ ] บันทึกการขายลงฐานข้อมูล
- [ ] แสดง success message
