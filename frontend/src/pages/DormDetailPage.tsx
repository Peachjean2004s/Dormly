import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DormDetailPage.css'; 
import RoomCard from '../components/RoomCard/RoomCard'; 
import BookingForm from '../components/BookingForm/BookingForm'; 

// --- 1. INTERFACES (Types) ---
import {
  DormData,
  RoomData,
  ActiveTab,
  ApiResponse
} from '../components/types/types'; 


// --- 2. COMPONENT ---

const DormDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // (สำหรับย้ายหน้า)

  // --- State สำหรับเก็บข้อมูล ---
  const [dormData, setDormData] = useState<DormData | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  
  // --- State สำหรับ UI ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('rooms'); 
  const [isLiked, setIsLiked] = useState(false); // (สำหรับปุ่มหัวใจ)
  const [showUnavailableModal, setShowUnavailableModal] = useState(false); // (สำหรับ Pop-up)

  
  // --- 3. DATA FETCHING ---

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        
        // vvvv FIX: ระบุ Type ของ Promise ตรงนี้ vvvv
        const dormPromise: Promise<ApiResponse<DormData>> = fetch(`http://localhost:3001/api/dorms/${id}`)
          .then(res => {
            if (!res.ok) throw new Error('Error fetching dorm');
            // (ตอนนี้ TS รู้ Type แล้ว ไม่ต้อง cast 'as' ตรงนี้)
            return res.json();
          });

        // vvvv FIX: ระบุ Type ของ Promise ตรงนี้ vvvv
        const roomsPromise: Promise<ApiResponse<RoomData[]>> = fetch(`http://localhost:3001/api/rooms/dorm/${id}`)
          .then(res => {
            if (!res.ok) throw new Error('Error fetching rooms');
            // (ตอนนี้ TS รู้ Type แล้ว ไม่ต้อง cast 'as' ตรงนี้)
            return res.json();
          });
        // ^^^^ สิ้นสุด FIX ^^^^
        
        // (ตอนนี้ TS จะไม่สับสนตอนรัน Promise.all)
        const [dormResult, roomsResult] = await Promise.all([dormPromise, roomsPromise]);

        // 3. จัดการข้อมูล Dorm
        if (dormResult.success && dormResult.data) {
          setDormData(dormResult.data);
        } else {
          throw new Error(dormResult.message || 'Dorm not found');
        }

        // 4. จัดการข้อมูล Rooms
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

  
  // --- 4. LOADING & ERROR STATES ---

  if (isLoading) {
    return <div className="loading-container">Loading Dorm Details...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  if (!dormData) {
    return <div className="error-message">Dorm data not available.</div>;
  }

  // --- 5. Helper Functions & Variables ---

  // (FIX: แปลง avg_score (String) เป็น Number)
  const avgScoreNumber = Number(dormData.avg_score);
  
  // (FIX: คำนวณค่า Occupancy)
  const availableRooms = rooms.filter(r => r.status === 'ห้องว่าง').length;
  const occupiedRooms = rooms.filter(r => r.status === 'ห้องไม่ว่าง').length;

  // (FIX: ฟังก์ชันสำหรับคลิก RoomCard)
  const handleRoomClick = (room: RoomData) => {
    if (room.status === 'ห้องว่าง') {
      // ถ้า "ว่าง" ให้ไปหน้า Room Detail
      navigate(`/rooms/${room.room_id}`);
    } else {
      // ถ้า "ไม่ว่าง" ให้เปิด Pop-up
      setShowUnavailableModal(true);
    }
  };
  

  // --- 6. JSX (UI RENDER) ---
  
  return (
    <div className="dorm-detail-page">
      
      {/* (Sidebar ซ้ายมาจาก Layout หลัก) */}
      
      {/* ========= 1. ส่วนเนื้อหาหลัก (ตรงกลาง) ========= */}
      <main className="main-content">
        <h2>{dormData.dorm_name}</h2>

        {/* --- Gallery (ใช้ Placeholder) --- */}
        <section className="image-gallery">
          <div className="main-image">
            [Main Image Placeholder]
          </div>
          <div className="thumbnail-grid">
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail">[Image]</div>
            <div className="thumbnail thumbnail-more">ดูรูปภาพเพิ่มเติม</div>
          </div>
        </section>

        {/* --- Tab Bar --- */}
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

        {/* --- Tab Panel (แสดงเนื้อหาตาม activeTab) --- */}
        <div className="tab-panel">
          
          {activeTab === 'details' && (
            <div>
              <h4>รายละเอียดหอพัก</h4>
              <p>{dormData.description || "ไม่มีคำอธิบาย"}</p>
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <section className="room-list-section">
              <h3>ประเภท: ทั้งหมด</h3>
              <div className="room-grid">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <RoomCard 
                      key={room.room_id} 
                      room={room}
                      onViewDetails={handleRoomClick} // (ส่งฟังก์ชันใหม่)
                    />
                  ))
                ) : (
                  <p>ไม่มีห้องพักในหอนี้</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'facilities' && (
            <div className="facilities-list">
              <h4>สิ่งอำนวยความสะดวก</h4>
              {dormData.facilities && dormData.facilities.length > 0 ? (
                <ul>
                  {dormData.facilities.map((facility, index) => (
                    <li key={index}>✅ {facility}</li>
                  ))}
                </ul>
              ) : (
                <p>ไม่มีข้อมูลสิ่งอำนวยความสะดวก</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-list">
              <h4>รีวิว</h4>
              {dormData.reviews && dormData.reviews.length > 0 ? (
                dormData.reviews.map((review) => (
                  <div key={review.review_id} className="review-item">
                    <div className="review-user">
                      <div className="review-avatar-placeholder"></div>
                      <strong>{review.user.f_name} {review.user.l_name}</strong>
                    </div>
                    <div className="review-content">
                      <span className="review-score">
                        {'⭐'.repeat(review.score)}
                      </span>
                      <p>{review.content}</p>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>ยังไม่มีรีวิวสำหรับหอพักนี้</p>
              )}
            </div>
          )}
          
          {/* vvvv FIX: แสดง BookingForm เมื่อแท็บ "การจอง" ถูกเลือก vvvv */}
          {activeTab === 'booking' && (
            <BookingForm dorm={dormData} />
          )}

          {activeTab === 'rules' && <div><h4>ข้อกำหนด</h4><p>เนื้อหาข้อกำหนด...</p></div>}
          {activeTab === 'map' && <div><h4>แผนที่</h4><p>Lat: {dormData.lat}, Long: {dormData.long}</p></div>}
          
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
              <strong>{availableRooms}</strong>
            </div>
            <div className="occupancy-box">
              <span>จำนวนผู้เข้าพัก</span>
              <strong>{occupiedRooms}</strong>
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
              {dormData.owner?.f_name} {dormData.owner?.l_name}
            </strong>
            <span className="owner-handle">
              @{dormData.line_id}
            </span>
            
            <div className="owner-rating">
              {'⭐'.repeat(Math.round(avgScoreNumber))}
              <span> {avgScoreNumber.toFixed(1)} ({dormData.reviews?.length || 0} รีวิว)</span>
            </div>

            <div className="owner-details-list">
              <p><strong>ชื่อ:</strong> <span>{dormData.owner?.f_name} {dormData.owner?.l_name}</span></p>
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
        
        {/* vvvv FIX: ปุ่มนี้จะสลับไปที่แท็บ "การจอง" vvvv */}
        <button 
          className="book-now-btn-v2"
          onClick={() => setActiveTab('booking')}
        >
          จองหอพัก
        </button>

      </aside>

      {/* --- Modal (Pop-up) --- */}
      {showUnavailableModal && (
        <div className="modal-backdrop" onClick={() => setShowUnavailableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ห้องพักนี้ไม่ว่าง</h3>
            <p>ขออภัย ห้องพักที่คุณเลือกถูกจองแล้ว หรือยังไม่พร้อมให้บริการในขณะนี้</p>
            <button 
              className="modal-close-btn"
              onClick={() => setShowUnavailableModal(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DormDetailPage;