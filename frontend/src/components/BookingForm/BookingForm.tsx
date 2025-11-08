import React, { useState } from 'react';
// (Import useLocation ถ้าคุณยังใช้ pre-select)
import { useNavigate, useLocation } from 'react-router-dom';
import { DormData, RoomTypeData } from '../types/types'; 
import './BookingForm.css';

interface BookingFormProps {
  dorm: DormData;
}

const BookingForm: React.FC<BookingFormProps> = ({ dorm }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const preselectedId = location.state?.preselectedRoomTypeId;

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(preselectedId?.toString() || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // vvvv FIX: แก้ไขฟังก์ชันนี้ vvvv
  const handleConfirm = () => {
    // 1. ตรวจสอบข้อมูล
    if (!selectedRoomTypeId || !startDate || !endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // (TODO: ในอนาคต เราจะบันทึกข้อมูลนี้ลง Context หรือ State ที่ใหญ่กว่า)
    console.log('ข้อมูลการจองที่เลือก:', {
      selectedRoomTypeId,
      startDate,
      endDate
    });

    // 2. นำทางกลับไปหน้าก่อนหน้า (คือ DormDetailPage หรือ RoomDetailPage)
    navigate(-1); 
  };
  // ^^^^ สิ้นสุด FIX ^^^^

  return (
    <div className="booking-form-card">
      <h2 className="booking-form-title">กรุณากรอกรายละเอียดที่ต้องการจอง</h2>
      <p className="booking-form-subtitle">
        เนื่องจากหอพักไม่สามารถระบุหมายเลขห้องพักได้ ผู้ใช้จำเป็นต้องเลือกประเภทห้องพัก...
      </p>

      <form className="booking-form">
        {/* 1. ประเภทห้องพัก */}
        <div className="form-group">
          <label htmlFor="room-type">*ประเภทห้องพัก:</label>
          <select
            id="room-type"
            value={selectedRoomTypeId}
            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
          >
            <option value="" disabled>เลือกประเภทห้องพัก</option>
            {dorm.room_types && dorm.room_types.length > 0 ? (
              dorm.room_types.map((rt: RoomTypeData) => ( 
                <option key={rt.room_type_id} value={rt.room_type_id}>
                  {rt.room_type_name} (ราคา {rt.rent_per_month} บาท)
                </option>
              ))
            ) : (
              <option disabled>ไม่พบประเภทห้องพัก</option>
            )}
          </select>
        </div>

        {/* 2. วันที่ */}
        <div className="form-group">
          <label htmlFor="start-date">*วันที่ต้องการจอง:</label>
          <div className="date-range-picker">
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} 
            />
            <span>ถึง</span>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]} 
            />
          </div>
        </div>
      </form>

      {/* 3. ปุ่ม */}
      <div className="booking-form-actions">
        <button className="btn-confirm" onClick={handleConfirm}>
          ยืนยันการจอง
        </button>
      </div>
    </div>
  );
};

export default BookingForm;