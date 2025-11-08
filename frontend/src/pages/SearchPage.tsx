import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Dorm {
    dorm_id: number;
    dorm_name: string;
    address: string;
    rating: number;
    review_count: number;
    price_min: number;
    price_max: number;
    available_rooms: number;
    cover_image: string;
    distance?: number;
    facilities: {
        facility_id: number;
        facility_name: string;
    }[];
    latitude: number;
    longitude: number;
}

interface RawDorm {
    id?: number;
    dorm_id?: number;
    name?: string;
    dorm_name?: string;
    location?: string;
    address?: string;
    rating?: number;
    avg_score?: number;
    reviews?: number;
    review_count?: number;
    likes?: number;
    price?: number;
    price_min?: number;
    price_max?: number;
    min_price?: number;
    available?: boolean;
    available_rooms?: number;
    imageUrl?: string;
    cover_image?: string;
    medias?: string[];
    distance?: number;
    facilities?: Array<{ facility_id?: number; facility_name?: string; id?: number; name?: string; } | string>;
    lat?: number;
    latitude?: number;
    lng?: number;
    longitude?: number;
}

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [dorms, setDorms] = useState<Dorm[]>([]);
    const [filteredDorms, setFilteredDorms] = useState<Dorm[]>([]);
    const [loading, setLoading] = useState(false);

    const [priceRange, setPriceRange] = useState('all');
    const [distance, setDistance] = useState('all');
    const [facilities, setFacilities] = useState<string[]>([]);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
    
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerInstanceRef = useRef<google.maps.Marker | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const facilityOptions = [
        'WiFi', 'Air Conditioning', 'Parking', 'Security Camera', 'Laundry Service', 'Fitness Center', 
        'Swimming Pool', '24/7 Security Guard', 'Elevator', 'Key Card Access', 'Common Area', 'Refrigerator', 
        'Water Heater', 'Microwave', 'Study Room', 'Vending Machine', 'Bike Parking', 'Pet Friendly', 
        'Convenience Store', 'Restaurant/Cafe'
    ];

    // โหลด Google Maps Script
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAV8qhrif05CaOVoYBZQC4WOdA4FAcxx84&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setMapLoaded(true);
            };
            document.head.appendChild(script);
        } else {
            setMapLoaded(true);
        }
    }, []);

    // สร้างแผนที่เมื่อโหลดเสร็จ
    useEffect(() => {
        if (mapLoaded) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
                markerInstanceRef.current = null;
            }

            setTimeout(() => {
                const mapElement = document.getElementById("google-map");
                if (!mapElement || !window.google) return;

                const defaultLocation = { lat: 13.7563, lng: 100.5018 }; // Bangkok

                const map = new window.google.maps.Map(mapElement, {
                    center: coordinates || defaultLocation,
                    zoom: coordinates ? 15 : 12,
                });

                mapInstanceRef.current = map;

                // Setup Search Box
                const input = document.getElementById("map-search-input") as HTMLInputElement;
                if (input) {
                    const searchBox = new window.google.maps.places.SearchBox(input);
                    searchBoxRef.current = searchBox;

                    map.addListener("bounds_changed", () => {
                        searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
                    });

                    searchBox.addListener("places_changed", () => {
                        const places = searchBox.getPlaces();
                        if (!places || places.length === 0) return;
                        const place = places[0];
                        if (!place.geometry || !place.geometry.location) return;

                        const newCoords = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        };
                        setCoordinates(newCoords);

                        if (place.geometry.viewport) {
                            map.fitBounds(place.geometry.viewport);
                        } else {
                            map.setCenter(place.geometry.location);
                            map.setZoom(15);
                        }

                        if (markerInstanceRef.current) {
                            markerInstanceRef.current.setPosition(newCoords);
                        } else {
                            const marker = new window.google.maps.Marker({
                                position: newCoords,
                                map: map,
                                draggable: true,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                }
                            });
                            markerInstanceRef.current = marker;
                            marker.addListener("dragend", () => {
                                const pos = marker.getPosition();
                                if (pos) {
                                    setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                                }
                            });
                        }
                    });
                }

                // If coordinates exist, create marker
                if (coordinates) {
                    const marker = new window.google.maps.Marker({
                        position: coordinates,
                        map: map,
                        draggable: true,
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }
                    });
                    markerInstanceRef.current = marker;

                    marker.addListener("dragend", () => {
                        const pos = marker.getPosition();
                        if (pos) {
                            setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                        }
                    });
                }

                // Click on map to place marker
                map.addListener("click", (e: any) => {
                    const latLng = e.latLng;
                    if (latLng) {
                        const newCoords = { lat: latLng.lat(), lng: latLng.lng() };
                        setCoordinates(newCoords);

                        if (markerInstanceRef.current) {
                            markerInstanceRef.current.setPosition(newCoords);
                        } else {
                            const marker = new window.google.maps.Marker({
                                position: newCoords,
                                map: map,
                                draggable: true,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                }
                            });
                            markerInstanceRef.current = marker;

                            marker.addListener("dragend", () => {
                                const pos = marker.getPosition();
                                if (pos) {
                                    setCoordinates({ lat: pos.lat(), lng: pos.lng() });
                                }
                            });
                        }
                    }
                });
            }, 100);
        }
    }, [mapLoaded]);

    // คำนวณระยะทางระหว่างสองจุด (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // รัศมีโลกเป็นกิโลเมตร
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // สร้างข้อมูล mock 150 หอ
    const createMockDorms = useCallback((): Dorm[] => {
        return Array.from({ length: 150 }, (_, i) => {
            const lat = 13.7563 + (Math.random() - 0.5) * 0.2;
            const lng = 100.5018 + (Math.random() - 0.5) * 0.2;
            
            return {
                dorm_id: i + 1,
                dorm_name: `หอพัก ${i + 1}`,
                address: `สถานที่ตั้ง ${i + 1}`,
                rating: parseFloat((8.0 + Math.random() * 2).toFixed(1)),
                review_count: Math.floor(1000 + Math.random() * 25000),
                price_min: Math.floor((3000 + Math.random() * 9000) / 500) * 500,
                price_max: Math.floor((3000 + Math.random() * 9000) / 500) * 500,
                available_rooms: Math.floor(Math.random() * 5) + 1,
                latitude: lat,
                longitude: lng,
                distance: 0,
                cover_image: '',
                facilities: facilityOptions.slice(0, Math.floor(Math.random() * 6) + 3).map((name, index) => ({
                    facility_id: index + 1,
                    facility_name: name
                }))
            };
        });
    }, []);

    const fetchDorms = useCallback(async () => {
        try {
            setLoading(true);
            
            // สร้าง request body แทน query params
            const requestBody: any = {
                limit: 150
            };

            // เพิ่ม search query ถ้ามี
            if (searchQuery.trim()) {
                requestBody.search = searchQuery;
            }

            // เพิ่ม coordinates ถ้ามี
            if (coordinates) {
                requestBody.lat = coordinates.lat;
                requestBody.lng = coordinates.lng;
            }

            // เพิ่ม price range ถ้ามี
            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(Number);
                requestBody.priceMin = min;
                requestBody.priceMax = max;
            }

            // เพิ่ม distance ถ้ามี
            if (distance !== 'all' && coordinates) {
                requestBody.radiusKm = parseFloat(distance);
            }

            // เพิ่ม facilities ถ้ามี
            if (facilities.length > 0) {
                requestBody.facilities = facilities;
            }

            console.log('🔍 Request Body:', requestBody);
            
            // ใช้ POST method แทน GET
            const response = await fetch('http://localhost:3001/api/dorms/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Raw API Response:', result);
            
            // ตรวจสอบโครงสร้างข้อมูล
            let data = [];
            if (result.success && Array.isArray(result.data)) {
                data = result.data;
                console.log('📦 Data from result.data:', data.length, 'items');
            } else if (Array.isArray(result)) {
                data = result;
                console.log('📦 Data is array:', data.length, 'items');
            }

            if (data.length > 0) {
                console.log('📦 First item structure:', data[0]);
                console.log('📦 First item keys:', Object.keys(data[0]));
            }
            
            const formattedDorms = data.map((dorm: RawDorm) => {
                const formatted = {
                    dorm_id: dorm.dorm_id || dorm.id || 0,
                    dorm_name: dorm.dorm_name || dorm.name || 'ไม่ระบุชื่อ',
                    address: dorm.address || dorm.location || 'ไม่ระบุที่อยู่',
                    rating: dorm.rating || dorm.avg_score || 0,
                    review_count: dorm.review_count || dorm.reviews || dorm.likes || 0,
                    price_min: dorm.price_min || dorm.min_price || dorm.price || 0,
                    price_max: dorm.price_max || dorm.price || 0,
                    available_rooms: dorm.available_rooms || (dorm.available ? 1 : 0),
                    cover_image: dorm.cover_image || dorm.imageUrl || (dorm.medias && dorm.medias[0]) || '',
                    distance: dorm.distance || 0,
                    facilities: dorm.facilities ? (
                        Array.isArray(dorm.facilities) ? dorm.facilities.map(f => {
                            if (typeof f === 'string') {
                                return {
                                    facility_id: 0,
                                    facility_name: f
                                };
                            }
                            return {
                                facility_id: f.facility_id || f.id || 0,
                                facility_name: f.facility_name || f.name || 'Unknown'
                            };
                        }) : []
                    ) : [],
                    latitude: dorm.latitude || dorm.lat || 0,
                    longitude: dorm.longitude || dorm.lng || 0
                };
                
                return formatted;
            });
            
            console.log('✅ Total formatted dorms:', formattedDorms.length);
            console.log('✅ Sample formatted dorm:', formattedDorms[0]);
            
            setDorms(formattedDorms);
        } catch (error) {
            console.error('❌ Error fetching dorms:', error);
            console.log('⚠️ Using mock data as fallback');
            const mockData = createMockDorms();
            console.log('⚠️ Mock data count:', mockData.length);
            setDorms(mockData);
        } finally {
            setLoading(false);
        }
    }, [createMockDorms, searchQuery, coordinates, priceRange, distance, facilities]);

    const applyFilters = useCallback(() => {
        console.log('🔧 Applying filters...');
        console.log('🔧 Current dorms count:', dorms.length);
        
        let filtered = [...dorms];

        // คำนวณระยะทางจากตำแหน่งผู้ใช้ (ถ้ามี)
        if (coordinates) {
            filtered = filtered.map(dorm => ({
                ...dorm,
                distance: dorm.latitude && dorm.longitude 
                    ? calculateDistance(coordinates.lat, coordinates.lng, dorm.latitude, dorm.longitude)
                    : 999
            }));
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(dorm => 
                dorm.dorm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dorm.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
            console.log('🔧 After search filter:', filtered.length);
        }

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            filtered = filtered.filter(dorm => dorm.price_min >= min && dorm.price_max <= max);
            console.log('🔧 After price filter:', filtered.length);
        }

        if (distance !== 'all' && coordinates) {
            const maxDistance = parseFloat(distance);
            filtered = filtered.filter(dorm => (dorm.distance || 999) <= maxDistance);
            console.log('🔧 After distance filter:', filtered.length);
        }

        if (facilities.length > 0) {
            filtered = filtered.filter(dorm =>
                facilities.every(facility => 
                    dorm.facilities?.some(f => f.facility_name === facility)
                )
            );
            console.log('🔧 After facilities filter:', filtered.length);
        }

        // เรียงตามระยะทาง (ถ้ามีตำแหน่งผู้ใช้)
        if (coordinates) {
            filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }

        // จำกัดผลลัพธ์สูงสุด 150 หอ
        const finalFiltered = filtered.slice(0, 150);
        console.log('✅ Final filtered dorms:', finalFiltered.length);
        
        setFilteredDorms(finalFiltered);
    }, [dorms, searchQuery, priceRange, distance, facilities, coordinates]);

    useEffect(() => {
        console.log('🚀 Fetching dorms...');
        fetchDorms();
    }, [fetchDorms]);

    useEffect(() => {
        console.log('🔄 Dorms state updated:', dorms.length, 'dorms');
        applyFilters();
    }, [applyFilters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDorms();
    };

    const toggleFacility = (facility: string) => {
        setFacilities(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        );
    };

    const clearUserMarker = () => {
        if (markerInstanceRef.current) {
            markerInstanceRef.current.setMap(null);
            markerInstanceRef.current = null;
            setCoordinates(null);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Google Maps */}
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg bg-white p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">📍 เลือกตำแหน่งของคุณ</h2>
                
                <div className="mb-3">
                    <input
                        id="map-search-input"
                        type="text"
                        placeholder="🔍 ค้นหาสถานที่ เช่น ชื่อหอพัก ถนน หรือชื่อสถานที่"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-red-500"
                    />
                </div>

                <div
                    id="google-map"
                    className="w-full h-96 bg-gray-200 rounded-lg border-2 border-gray-300"
                    style={{ minHeight: "400px" }}
                >
                    {!mapLoaded && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">กำลังโหลดแผนที่...</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                        💡 ค้นหาสถานที่ด้วยช่องค้นหาด้านบน หรือคลิกบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อปรับตำแหน่ง
                    </p>
                    {coordinates && (
                        <button
                            onClick={clearUserMarker}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center gap-2 ml-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            ล้างหมุด
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="search"
                        className="w-full px-6 py-4 rounded-full bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม: ราคา</label>
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="0-5000">0 - 5,000 บาท</option>
                        <option value="5000-8000">5,000 - 8,000 บาท</option>
                        <option value="8000-10000">8,000 - 10,000 บาท</option>
                        <option value="10000-20000">10,000 - 20,000 บาท</option>
                        <option value="20000-999999">20,000+ บาท</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        เรียงตาม: ระยะทาง {coordinates && '(จากตำแหน่งที่ปักหมุด)'}
                    </label>
                    <select
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                        disabled={!coordinates}
                    >
                        <option value="all">{coordinates ? 'ทั้งหมด' : 'ปักหมุดเพื่อใช้งาน'}</option>
                        <option value="1">&lt; 1 km</option>
                        <option value="2">&lt; 2 km</option>
                        <option value="3">&lt; 3 km</option>
                        <option value="5">&lt; 5 km</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม: สิ่งอำนวยความสะดวก</label>
                    <div className="relative">
                        <button
                            type="button"
                            className="w-full px-4 py-3 rounded-lg bg-gray-200 text-left focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
                            onClick={(e) => {
                                const dropdown = e.currentTarget.nextElementSibling;
                                dropdown?.classList.toggle('hidden');
                            }}
                        >
                            <span>{facilities.length > 0 ? `เลือกแล้ว ${facilities.length} รายการ` : 'เลือกสิ่งอำนวยความสะดวก'}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="hidden absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {facilityOptions.map((facility) => (
                                <label key={facility} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={facilities.includes(facility)}
                                        onChange={() => toggleFacility(facility)}
                                        className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm">{facility}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {facilities.map((facility) => (
                        <span key={facility} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {facility}
                            <button onClick={() => toggleFacility(facility)} className="hover:bg-purple-200 rounded-full p-0.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="text-xl text-gray-600">กำลังค้นหา...</div>
                </div>
            ) : filteredDorms.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-xl text-gray-600 mb-2">ไม่พบหอพักที่ตรงกับเงื่อนไข</div>
                    <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือปรับ filter</p>
                </div>
            ) : (
                <>
                    <div className="mb-4 text-gray-600">
                        พบ {filteredDorms.length} หอพัก {filteredDorms.length >= 150 && '(แสดงสูงสุด 150 หอ)'}
                        {coordinates && ' - เรียงตามระยะทางจากตำแหน่งที่ปักหมุด'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {filteredDorms.map((dorm) => (
                            <DormCard key={dorm.dorm_id} dorm={dorm} showDistance={!!coordinates} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

interface DormCardProps {
    dorm: Dorm;
    showDistance?: boolean;
}

function DormCard({ dorm, showDistance }: DormCardProps) {
    const navigate = useNavigate();

    // แปลง rating เป็น number ให้แน่ใจ
    const ratingValue = Number(dorm.rating) || 0;

    return (
        <div
            onClick={() => navigate(`/dorm/${dorm.dorm_id}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:scale-[1.02]"
        >
            <div className="w-full h-48 bg-gray-300 rounded-t-2xl overflow-hidden">
                {dorm.cover_image ? (
                    <img 
                        src={dorm.cover_image} 
                        alt={dorm.dorm_name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/384x192/e5e7eb/6b7280?text=No+Image';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                        ไม่มีรูปภาพ
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-base mb-1 truncate" title={dorm.dorm_name}>
                    {dorm.dorm_name}
                </h3>

                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 text-sm truncate mr-2" title={dorm.address}>
                        {dorm.address}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`w-2 h-2 rounded-full ${dorm.available_rooms > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-gray-600 font-medium">
                            {dorm.available_rooms > 0 ? 'ว่าง' : 'เต็ม'}
                        </span>
                    </div>
                </div>

                {showDistance && dorm.distance !== undefined && dorm.distance < 999 && (
                    <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {dorm.distance.toFixed(2)} km
                        </span>
                    </div>
                )}

                {dorm.facilities && dorm.facilities.length > 0 && (
                    <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                            {dorm.facilities.slice(0, 3).map((facility, index) => (
                                <span
                                    key={`${facility.facility_id}-${index}`}
                                    className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-600"
                                >
                                    {facility.facility_name}
                                </span>
                            ))}
                            {dorm.facilities.length > 3 && (
                                <span className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-600">
                                    +{dorm.facilities.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(ratingValue / 2) ? 'fill-current' : 'fill-gray-300'}`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-gray-700">
                            {ratingValue.toFixed(1)} ({Number(dorm.review_count).toLocaleString()})
                        </span>
                    </div>
                    <p className="font-bold text-base">
                        {Number(dorm.price_min).toLocaleString()}/เดือน
                    </p>
                </div>
            </div>
        </div>
    );
}