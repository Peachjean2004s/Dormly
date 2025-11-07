import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DormDetailPage.css'; 
import RoomCard from '../components/RoomCard/RoomCard'; 

// --- (ส่วน Types) ---
interface DormOwner {
  f_name: string;
  l_name: string;
  profile_path: string;
}
interface DormData {
  dorm_id: number;
  dorm_name: string;
  description: string;
  lat: number;
  long: number;
  address: string;
  prov: string;
  dist: string;
  subdist: string;
  avg_score: number;
  likes: number;
  medias: string[];
  tel: string;
  line_id: string;
  owner: DormOwner;
}
interface RoomData {
  room_id: string;
  room_name?: string;
  status: 'ห้องว่าง' | 'ห้องไม่ว่าง' | string;
  room_type_name: string;
  rent_per_month: number;
  imageUrl: string;
}
// --- (จบส่วน Types) ---

// vvvv FIX 3: ขยาย type ของ activeTab vvvv
type ActiveTab = 'details' | 'rooms' | 'booking' | 'facilities' | 'rules' | 'reviews' | 'map' | 'other';

const DormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);

  // --- State สำหรับ UI ---
  const [dormData, setDormData] = useState<DormData | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ตั้งค่าเริ่มต้นให้ activeTab เป็น 'rooms' (ห้องพัก)
  const [activeTab, setActiveTab] = useState<ActiveTab>('rooms');

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Fetch ข้อมูลหอพัก
        const dormPromise = fetch(`http://localhost:3001/api/dorms/${id}`)
          .then(res => res.json());

        // 2. Fetch ข้อมูลห้องพัก
        const roomsPromise = fetch(`http://localhost:3001/api/rooms/dorm/${id}`)
          .then(res => res.json());

        const [dormResult, roomsResult] = await Promise.all([dormPromise, roomsPromise]);

        // 3. ตั้งค่า State ของ Dorm
        if (dormResult.success && dormResult.data) {
          setDormData(dormResult.data);
        } else {
          throw new Error(dormResult.message || 'Dorm not found');
        }

        // 4. ตั้งค่า State ของ Rooms
        if (roomsResult.success && roomsResult.data) {
          setRooms(roomsResult.data);
        } else {
          throw new Error(roomsResult.message || 'Failed to fetch rooms');
        }

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  
  // --- ส่วนจัดการ Loading / Error ---
  if (isLoading) {
    return <div className="loading-container">Loading Dorm Details...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  if (!dormData) {
    return <div className="error-message">Dorm data not available.</div>;
  }

  // --- UI ที่แก้ไขแล้ว ---
  return (
    <div className="dorm-detail-page">
      {/* (Sidebar ซ้ายมาจาก Layout หลัก) */}
      
      {/* ========= 1. ส่วนเนื้อหาหลัก (ตรงกลาง) ========= */}
      <main className="main-content">
        <h2>{dormData.dorm_name}</h2>

        {/* ส่วนรูปภาพหอพัก (Gallery) */}
        <section className="image-gallery">
          
          {/* vvvv FIX 1: เปลี่ยน <img /> เป็น <div> Placeholder vvvv */}
          <div className="main-image">
            [Main Image Placeholder]
          </div>
          {/* ^^^^ สิ้นสุด Fix 1 ^^^^ */}

          <div className="thumbnail-grid">
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail thumbnail-more">ดูรูปภาพเพิ่มเติม</div>
          </div>
        </section>

        {/* vvvv FIX 2: เพิ่มแท็บทั้งหมด (Tabs) vvvv */}
        <nav className="info-tabs">
          <button
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            รายละเอียดหอพัก
          </button>
          <button
            className={activeTab === 'rooms' ? 'active' : ''}
            onClick={() => setActiveTab('rooms')}
          >
            ห้องพัก
          </button>
          <button
            className={activeTab === 'booking' ? 'active' : ''}
            onClick={() => setActiveTab('booking')}
          >
            การจอง
          </button>
          <button
            className={activeTab === 'facilities' ? 'active' : ''}
            onClick={() => setActiveTab('facilities')}
          >
            สิ่งอำนวยความสะดวก
          </button>
          <button
            className={activeTab === 'rules' ? 'active' : ''}
            onClick={() => setActiveTab('rules')}
          >
            ข้อกำหนด/เงื่อนไข
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            รีวิว
          </button>
          <button
            className={activeTab === 'map' ? 'active' : ''}
            onClick={() => setActiveTab('map')}
          >
            แผนที่
          </button>

        </nav>
        {/* ^^^^ สิ้นสุด Fix 2 ^^^^ */}

        {/* ส่วนแสดงผลตามแท็บ (Tab Panel) */}
        <div className="tab-panel">
          {activeTab === 'details' && (
            <div>
              <h4>รายละเอียดหอพัก</h4>
              <p>{dormData.description}</p>
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <section className="room-list-section">
              <h3>ประเภท: ทั้งหมด</h3>
              <div className="room-grid">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <RoomCard key={room.room_id} room={room} />
                  ))
                ) : (
                  <p>ไม่มีห้องพักในหอนี้</p>
                )}
              </div>
            </section>
          )}

          {/* (TODO: เพิ่มเนื้อหาสำหรับแท็บอื่นๆ ที่นี่) */}
          {activeTab === 'facilities' && <div>แสดงสิ่งอำนวยความสะดวก</div>}
          {activeTab === 'reviews' && <div>แสดงรีวิว</div>}
        </div>
      </main>

      {/* ========= 2. ส่วน Sidebar ข้อมูล (ด้านขวา) ========= */}
     <aside className="right-sidebar">
        
        {/* --- Occupancy Status (New UI) --- */}
        <section className="info-section">
          <h4>Occupancy Status</h4>
          <div className="occupancy-grid">
            <div className="occupancy-box">
              <span>จำนวนห้องว่าง</span>
              <strong>{rooms.filter(r => r.status === 'ห้องว่าง').length}</strong>
            </div>
            <div className="occupancy-box">
              <span>จำนวนผู้เข้าพัก</span>
              <strong>N/A</strong>
            </div>
          </div>
        </section>

        {/* --- Owner Info (New UI) --- */}
        <section className="info-section">
          <h4>Owner Information</h4>
          <div className="owner-card-v2">
            <div className="owner-avatar-placeholder-v2">
              {/* (Placeholder) */}
            </div>
            <strong className="owner-name">
              {dormData.owner.f_name} {dormData.owner.l_name}
            </strong>
            <span className="owner-handle">
              @{dormData.line_id} {/* (สมมติว่าใช้ line_id เป็น handle) */}
            </span>
            <div className="owner-rating">
              {'⭐'.repeat(Math.round(dormData.avg_score))}
            </div>

            <div className="owner-details-list">
              <p><strong>ชื่อ:</strong> <span>{dormData.owner.f_name} {dormData.owner.l_name}</span></p>
              <p><strong>เบอร์โทร:</strong> <span>{dormData.tel}</span></p>
              <p><strong>Line:</strong> <span>{dormData.line_id}</span></p>
            </div>
            
            <button className="view-owner-details-btn-v2">ดูข้อมูลเพิ่มเติม</button>
          </div>
        </section>

        {/* --- Booking Actions (New UI) --- */}
        <div className="booking-actions-v2">
          <button 
            className={`heart-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            ❤️
          </button>
          <button className="chat-btn">แชทกับเจ้าของหอ</button>
        </div>
        <button className="book-now-btn-v2">จองหอพัก</button>

      </aside>
      {/* ^^^^ สิ้นสุดส่วน <aside> ที่แทนที่ ^^^^ */}

    </div>
  );
};

export default DormDetailPage;