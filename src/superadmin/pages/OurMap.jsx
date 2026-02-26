import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, MarkerClustererF } from '@react-google-maps/api';
import { dataService } from '../../services/dataService';
import { MapPin, Navigation, Users, Search, Compass, RefreshCcw } from 'lucide-react';

import { indiaData } from '../../data/indiaData';

const mapContainerStyle = {
    height: '600px',
    width: '100%'
};

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
};

const OurMap = () => {
    // Attempt to use VITE_GOOGLE_MAPS_API_KEY if available, otherwise it runs in development mode
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [allUsers, setAllUsers] = useState([]);
    const [states] = useState(Object.keys(indiaData));
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [adminLocation, setAdminLocation] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [unlocatedUsers, setUnlocatedUsers] = useState([]);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdminInfo, setShowAdminInfo] = useState(false);

    const mapRef = useRef(null);

    const onLoad = useCallback(function callback(map) {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(function callback() {
        mapRef.current = null;
    }, []);

    const fetchUsers = async () => {
        setRefreshing(true);
        try {
            const users = await dataService.getAllUsers();
            setAllUsers(users);
            handleSearch(users);
        } catch {
            console.error("Failed to fetch users");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUsers().then(() => setLoading(false));

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setAdminLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.warn("Admin location access denied")
            );
        }
    }, []);

    useEffect(() => {
        if (selectedState) {
            setCities(indiaData[selectedState] || []);
            setSelectedCity('');
        } else {
            setCities([]);
        }
    }, [selectedState]);

    const attemptGeocode = async (user) => {
        if (!user.city || !user.state) return null;
        try {
            const query = `${user.city}, ${user.state}, India`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch {
            console.warn("Geocoding failed for", user.username);
        }
        return null;
    };

    const handleSearch = async (providedUsers = null) => {
        setLoading(true);
        setSelectedUser(null);
        const usersToFilter = providedUsers || allUsers;
        let filtered = usersToFilter.filter(u => {
            const userRole = u.role?.toUpperCase().replace('_', ' ');
            const targetRole = selectedRole?.toUpperCase().replace('_', ' ');

            const userState = u.state?.toLowerCase();
            const targetState = selectedState?.toLowerCase();

            const userCity = u.city?.toLowerCase();
            const targetCity = selectedCity?.toLowerCase();

            return (!selectedState || userState === targetState) &&
                (!selectedCity || userCity === targetCity) &&
                (!selectedRole || userRole === targetRole);
        });

        const located = [];
        const unlocated = [];

        for (const u of filtered) {
            if (u.latitude && u.longitude) {
                located.push({ ...u, lat: parseFloat(u.latitude), lng: parseFloat(u.longitude), source: 'gps' });
            } else {
                if (filtered.length < 20) {
                    const coords = await attemptGeocode(u);
                    if (coords) {
                        located.push({ ...u, ...coords, source: 'approx' });
                        continue;
                    }
                }
                unlocated.push(u);
            }
        }

        setFilteredUsers(located);
        setUnlocatedUsers(unlocated);

        if (located.length > 0) {
            setMapCenter({ lat: located[0].lat, lng: located[0].lng });
            if (mapRef.current) {
                mapRef.current.panTo({ lat: located[0].lat, lng: located[0].lng });
                mapRef.current.setZoom(5);
            }
        } else if (selectedState) {
            setMapCenter(defaultCenter);
            if (mapRef.current) {
                mapRef.current.panTo(defaultCenter);
                mapRef.current.setZoom(5);
            }
        }
        setLoading(false);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
        const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    const getIconUrl = (role) => {
        const r = role?.toUpperCase().replace('_', ' ');
        switch (r) {
            case 'RETAILER': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            case 'DISTRIBUTOR': return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            case 'SUPER DISTRIBUTOR': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            default: return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-['Montserrat',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-amber-500/50">Network Presence Map</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Geospatial visualization of all regional endpoints</p>
                </div>
                <button onClick={fetchUsers} disabled={refreshing} className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50">
                    <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Syncing...' : 'Refresh Data'}
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Compass size={12} className="text-amber-500" /> Select State</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><MapPin size={12} className="text-amber-500" /> Select City</label>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                        disabled={!selectedState}
                    >
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Users size={12} className="text-amber-500" /> User Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="">All Roles</option>
                        <option value="RETAILER">Retailer</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                        <option value="SUPER DISTRIBUTOR">Super Distributor</option>
                    </select>
                </div>

                <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="bg-[#0d1b2e] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                    <Search size={16} className={loading ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
                    {loading ? 'Locating...' : 'Locate Users'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Users size={14} className="text-amber-500" /> Matches Found ({filteredUsers.length + unlocatedUsers.length})
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {filteredUsers.map((u, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-100 transform transition-transform hover:translate-x-1"
                                    onClick={() => {
                                        const pos = { lat: u.lat, lng: u.lng };
                                        setMapCenter(pos);
                                        setSelectedUser(u);
                                        if (mapRef.current) {
                                            mapRef.current.panTo(pos);
                                            mapRef.current.setZoom(12);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[10px] font-black italic">{u.name?.charAt(0) || 'U'}</div>
                                        <p className="text-[11px] font-black text-slate-800 truncate">{u.name || u.username}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black">
                                        <span className="text-blue-600 uppercase italic">{u.source === 'gps' ? 'Live GPS' : 'Approx City'}</span>
                                        <span className="text-slate-400 italic">{u.city}</span>
                                    </div>
                                </div>
                            ))}

                            {unlocatedUsers.map((u, i) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl opacity-60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-lg bg-slate-400 text-white flex items-center justify-center text-[10px] font-black italic">{u.name?.charAt(0) || 'U'}</div>
                                        <p className="text-[11px] font-black text-slate-800 truncate">{u.name || u.username}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black">
                                        <span className="text-slate-500 uppercase italic">No GPS Recieved</span>
                                        <span className="text-slate-400 italic">{u.city}</span>
                                    </div>
                                </div>
                            ))}

                            {filteredUsers.length === 0 && unlocatedUsers.length === 0 && !loading && (
                                <div className="text-center py-20 text-slate-300 font-black text-[10px] uppercase italic">
                                    No users found in this sector
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] relative">
                    {!isLoaded ? (
                        <div className="flex items-center justify-center h-full w-full bg-slate-50">
                            <RefreshCcw size={32} className="animate-spin text-amber-500 mb-4" />
                        </div>
                    ) : loadError ? (
                        <div className="flex items-center justify-center h-full w-full bg-red-50 text-red-500 font-bold p-8 text-center">
                            Failed to load Google Maps. Please check your internet connection or API Key.
                        </div>
                    ) : (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={5}
                            options={mapOptions}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                        >
                            {/* Administrator Marker */}
                            {adminLocation && (
                                <MarkerF
                                    position={adminLocation}
                                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
                                    onClick={() => setShowAdminInfo(true)}
                                >
                                    {showAdminInfo && (
                                        <InfoWindowF onCloseClick={() => setShowAdminInfo(false)}>
                                            <div className="p-2 min-w-[120px]">
                                                <p className="font-black text-[10px] text-red-500 uppercase tracking-widest">Administrator</p>
                                                <p className="text-xs font-black text-slate-800 mt-1">Your Location</p>
                                            </div>
                                        </InfoWindowF>
                                    )}
                                </MarkerF>
                            )}

                            {/* User Markers with Clustering for Performance */}
                            <MarkerClustererF>
                                {(clusterer) => filteredUsers.map((user, idx) => (
                                    <MarkerF
                                        key={`marker_${idx}`}
                                        position={{ lat: user.lat, lng: user.lng }}
                                        clusterer={clusterer}
                                        icon={{ url: getIconUrl(user.role) }}
                                        onClick={() => setSelectedUser(user)}
                                    />
                                ))}
                            </MarkerClustererF>

                            {selectedUser && (
                                <InfoWindowF
                                    position={{ lat: selectedUser.lat, lng: selectedUser.lng }}
                                    onCloseClick={() => setSelectedUser(null)}
                                >
                                    <div className="p-2 space-y-2 min-w-[200px] bg-white rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase italic">
                                                {selectedUser.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{selectedUser.name || selectedUser.username}</p>
                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{selectedUser.role}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-2">
                                            <div className="flex justify-between text-[10px] font-black">
                                                <span className="text-slate-400">CONTACT:</span>
                                                <span className="text-slate-700">{selectedUser.mobile}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black mt-1">
                                                <span className="text-slate-400">HUB:</span>
                                                <span className="text-slate-700">{selectedUser.city}, {selectedUser.state}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black mt-1">
                                                <span className="text-slate-400">STATUS:</span>
                                                <span className={selectedUser.source === 'gps' ? 'text-green-500' : 'text-blue-500'}>{selectedUser.source === 'gps' ? 'Verified GPS' : 'Approximate'}</span>
                                            </div>
                                        </div>

                                        {adminLocation && (
                                            <div className="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Navigation size={12} className="text-indigo-600" />
                                                    <span className="text-[8px] font-black text-indigo-800 uppercase tracking-tight">DISTANCE</span>
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md">
                                                    {calculateDistance(adminLocation.lat, adminLocation.lng, selectedUser.lat, selectedUser.lng)} KM
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </InfoWindowF>
                            )}
                        </GoogleMap>
                    )}

                    <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-3xl shadow-2xl flex flex-col gap-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-100 pb-2">Map Legend</p>
                        <div className="flex items-center gap-3">
                            <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Admin" className="w-4 h-4" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">You (Admin)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" alt="Retailer" className="w-4 h-4" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Retailer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="Distributor" className="w-4 h-4" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Distributor</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" alt="Super Dist" className="w-4 h-4" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Super Dist</span>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 z-[1000] space-y-2">
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Located Users</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter">{filteredUsers.length}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                                <MapPin size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                    <Compass size={24} />
                </div>
                <div className="max-w-3xl">
                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest underline decoration-amber-500/30 mb-1">Geospatial Intelligence</p>
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">Users are located based on their last active GPS signal. If GPS is unavailable, the system attempts to visualize them at their registered city hub (marked as Approximate). Unlocated users are shown in the sidebar list for tracking.</p>
                </div>
            </div>
        </div>
    );
};

export default OurMap;
