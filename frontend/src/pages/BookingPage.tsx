import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm/BookingForm';
import { DormData, ApiResponse } from '../components/types/types'; 
import './BookingPage.css'; 

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // (ดึง ID หอพักจาก URL)
  
  const [dormData, setDormData] = useState<DormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // (หน้านี้ต้อง fetch ข้อมูลหอพักเอง เพื่อให้มีข้อมูล Room Types)
  useEffect(() => {
    if (!id) return;

    const fetchDormData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dormPromise: Promise<ApiResponse<DormData>> = fetch(`http://localhost:3001/api/dorms/${id}`)
          .then(res => {
            if (!res.ok) throw new Error('Error fetching dorm data');
            return res.json();
          });
        
        const result = await dormPromise;

        if (result.success && result.data) {
          setDormData(result.data);
        } else {
          throw new Error(result.message || 'Dorm not found');
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDormData();
  }, [id]);

  if (isLoading) {
    return <div className="loading-container">Loading booking details...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }
  if (!dormData) {
    return <div className="error-message">Dorm data not found.</div>;
  }

  // (เมื่อโหลดเสร็จ ให้แสดงฟอร์ม โดยส่งข้อมูลหอพักไปให้)
  return (
    <div className="booking-page-container">
      <BookingForm dorm={dormData} />
    </div>
  );
};

export default BookingPage;