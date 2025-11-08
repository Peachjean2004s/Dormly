import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RoomDetailPage.css'; // (เราจะสร้างไฟล์ CSS นี้)
import OwnerInfoCard from '../components/OwnerInfoCard/OwnerInfoCard'; // (Import Component ใหม่)

// (Type สำหรับข้อมูลที่ API ส่งมา)
interface RoomDetailData {
  room_id: number;
  room_name: string;
  status: string;
  room_type_name: string;
  rent_per_month: number;
  rent_per_day: number;
  deposit_amount: number;
  max_occupancy: number;
  // (เพิ่ม field อื่นๆ จาก DB ตามต้องการ)

  // ข้อมูล Dorm ที่ Join มา
  dorm_name: string;
  tel: string;
  line_id: string;
  avg_score: number;
  
  // ข้อมูล Owner ที่ Join มา
  owner: {
    f_name: string;
    l_name: string;
    profile_path: string;
  };
}

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>(); // (ดึง roomId จาก URL)
  
  const [roomData, setRoomData] = useState<RoomDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
        if (!response.ok) throw new Error('Failed to fetch room data');
        
        const result = await response.json();
        if (result.success && result.data) {
          setRoomData(result.data);
        } else {
          throw new Error(result.message || 'Room not found');
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  if (isLoading) {
    return <div className="loading-container">Loading Room Details...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  if (!roomData) {
    return <div className="error-message">Room data not available.</div>;
  }

  // (สร้าง object สำหรับส่งให้ OwnerInfoCard)
  const ownerDataForCard = {
    ...roomData.owner,
    tel: roomData.tel,
    line_id: roomData.line_id,
    avg_score: roomData.avg_score,
    review_count: 0, // (API นี้ยังไม่ได้ดึง Review count มา, ใส่ 0 ไว้ก่อน)
  };

  return (
    <div className="room-detail-page">
      {/* (Sidebar ซ้ายมาจาก Layout หลัก) */}
      
      {/* === ส่วนหัว === */}
      <h2 className="room-detail-header">
        {roomData.dorm_name} - {roomData.room_name}
      </h2>

      <div className="room-detail-layout">
        {/* === 1. ส่วนเนื้อหาหลัก (ซ้าย) === */}
        <main className="room-main-content">
          {/* Gallery */}
          <section className="room-gallery">
            <div className="room-main-image">[Image Placeholder]</div>
            <div className="room-thumbnail-grid">
              <div className="room-thumbnail">[Image]</div>
              <div className="room-thumbnail">[Image]</div>
              <div className="room-thumbnail-more">ดูรูปภาพเพิ่มเติม</div>
            </div>
          </section>

          {/* Info Boxes */}
          <div className="room-info-grid">
            <div className="info-box">
              <h4>ข้อมูลในห้อง</h4>
              <ul>
                <li>ขนาดห้อง: 24 ตร.ม.</li>
                <li>ประเภทผู้เข้าพัก: {roomData.max_occupancy} คน</li>
                {/* (เพิ่มข้อมูลอื่นๆ จาก roomData) */}
              </ul>
            </div>
            <div className="info-box">
              <h4>สิ่งอำนวยความสะดวก</h4>
              <ul>
                <li>ทีวี</li>
                <li>แอร์</li>
                <li>เครื่องทำน้ำอุ่น</li>
                {/* (ข้อมูลนี้ต้องดึงมาจาก API เพิ่ม) */}
              </ul>
            </div>
          </div>
        </main>

        {/* === 2. ส่วน Sidebar (ขวา) === */}
        <aside className="room-sidebar">
          {/* Price Card */}
          <div className="price-card">
            <h3>{roomData.room_name}</h3>
            <div className="price-item">
              <span>รายเดือน:</span>
              <strong>{roomData.rent_per_month} บาท/เดือน</strong>
            </div>
            <div className="price-item">
              <span>รายวัน:</span>
              <strong>{roomData.rent_per_day} บาท/วัน</strong>
            </div>
            <div className="price-item">
              <span>เงินประกัน:</span>
              <strong>{roomData.deposit_amount} บาท</strong>
            </div>
            <div className="price-item">
              <span>จ่ายล่วงหน้า:</span>
              <strong>1 เดือน</strong>
            </div>
            <div className="price-item">
              <span>ค่าไฟ:</span>
              <strong>5 บาท/ยูนิต</strong>
            </div>
            <div className="price-item">
              <span>ค่าน้ำ:</span>
              <strong>10 บาท/ยูนิต</strong>
            </div>
          </div>

          {/* Owner Card (ใช้ Component) */}
          <OwnerInfoCard ownerData={ownerDataForCard} />
          
          {/* Buttons */}
          <button className="edit-dorm-btn">แก้ไขรายละเอียดหอพัก</button>
          <button className="book-room-btn">จองห้องพัก</button>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;