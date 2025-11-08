import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RoomDetailPage.css'; 
import OwnerInfoCard from '../components/OwnerInfoCard/OwnerInfoCard';

// (Import Types ใหม่)
import { RoomDetailData, DormData, ApiResponse } from '../components/types/types'; 

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>(); 
  const navigate = useNavigate();
  
  const [roomData, setRoomData] = useState<RoomDetailData | null>(null);
  const [dormData, setDormData] = useState<DormData | null>(null); // (State ใหม่สำหรับเก็บ DormData)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch ข้อมูลห้อง (Room) ก่อน
        const roomResponse = await fetch(`http://localhost:3001/api/rooms/${roomId}`);
        if (!roomResponse.ok) throw new Error('Failed to fetch room data');
        
        const roomResult: ApiResponse<RoomDetailData> = await roomResponse.json();
        if (!roomResult.success || !roomResult.data) {
          throw new Error(roomResult.message || 'Room not found');
        }
        setRoomData(roomResult.data);

        // 2. เมื่อได้ dorm_id จากข้อมูลห้อง ให้ Fetch ข้อมูลหอ (Dorm)
        const dormId = roomResult.data.dorm_id;
        const dormResponse = await fetch(`http://localhost:3001/api/dorms/${dormId}`);
        if (!dormResponse.ok) throw new Error('Failed to fetch dorm data');

        const dormResult: ApiResponse<DormData> = await dormResponse.json();
        if (dormResult.success && dormResult.data) {
          setDormData(dormResult.data);
        } else {
          throw new Error(dormResult.message || 'Dorm not found');
        }

      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [roomId]);

  const handleBookNowClick = () => {
    if (!dormData || !roomData) return;

    // (นำทางไปที่หน้า BookingPage ใหม่)
    navigate(`/dorms/${dormData.dorm_id}/book`, { 
      // (ส่ง ID ห้องที่เลือกไปล่วงหน้า)
      state: { preselectedRoomTypeId: roomData.room_type_id } 
    });
  };

  if (isLoading) {
    return <div className="loading-container">Loading Room Details...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  if (!roomData || !dormData) {
    return <div className="error-message">Room data not available.</div>;
  }

  // (สร้าง object สำหรับส่งให้ OwnerInfoCard)
  const ownerDataForCard = {
    ...roomData.owner,
    tel: roomData.tel,
    line_id: roomData.line_id,
    avg_score: roomData.avg_score,
    review_count: dormData.reviews?.length || 0, // (ดึงจำนวนรีวิวจาก dormData)
  };

  return (
    <div className="room-detail-page">
      {/* (Sidebar ซ้ายมาจาก Layout หลัก) */}
      
      <h2 className="room-detail-header">
        {roomData.dorm_name} - {roomData.room_name}
      </h2>

      <div className="room-detail-layout">
        {/* === 1. ส่วนเนื้อหาหลัก (ซ้าย) === */}
        <main className="room-main-content">
          <section className="room-gallery">
            <div className="room-main-image">[Image Placeholder]</div>
            <div className="room-thumbnail-grid">
              <div className="room-thumbnail">[Image]</div>
              <div className="room-thumbnail">[Image]</div>
              <div className="room-thumbnail-more">ดูรูปภาพเพิ่มเติม</div>
            </div>
          </section>

          <div className="room-info-grid">
            <div className="info-box">
              <h4>ข้อมูลในห้อง</h4>
              <ul>
                <li>ขนาดห้อง: (รอ API) ตร.ม.</li>
                <li>ประเภทผู้เข้าพัก: {roomData.max_occupancy} คน</li>
                <li>สถานะ: {roomData.status}</li>
              </ul>
            </div>
            <div className="info-box">
              <h4>สิ่งอำนวยความสะดวก</h4>
              <ul>
                {/* (ข้อมูลนี้ต้องมาจาก API) */}
                <li>ทีวี (ตัวอย่าง)</li>
                <li>แอร์ (ตัวอย่าง)</li>
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
              <strong>(รอ API) เดือน</strong>
            </div>
            <div className="price-item">
              <span>ค่าไฟ:</span>
              <strong>(รอ API) บาท/ยูนิต</strong>
            </div>
            <div className="price-item">
              <span>ค่าน้ำ:</span>
              <strong>(รอ API) บาท/ยูนิต</strong>
            </div>
          </div>

          {/* Owner Card (ใช้ Component) */}
          <OwnerInfoCard ownerData={ownerDataForCard} />
          
          {/* Buttons */}
          <button className="edit-dorm-btn">แก้ไขรายละเอียดหอพัก</button>
          
          {/* vvvv FIX: เพิ่ม onClick vvvv */}
          <button className="book-room-btn" onClick={handleBookNowClick}>
            จองห้องพัก
          </button>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;