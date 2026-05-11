import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Search, Plus, Mail, Phone, Calendar, X, User, BookOpen, Loader2, Pencil, Trash2 } from 'lucide-react';

// --- Predefined courses list ---
const PREDEFINED_COURSES = [
    "Graphic Design",
    "Mobile App Development",
    "Freelancing",
    "Office Management",
    "Social Media Marketing",
    "Flutter App",
    "App Store Optimization",
    "Data Science",
    "Video Editing",
    "Python Programming",
    "SEO",
    "YouTube Automation",
    "Web Development",
    "Shopify Store Creation",
    "Amazon VA",
    "Digital Marketing",
    "Artificial Intelligence",
];

const Students = () => {
    const [showForm, setShowForm] = useState(false);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: '',
        enrollDate: ''
    });

    // --- Custom course state ---
    const [customCourseInput, setCustomCourseInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "students"), orderBy("enrollDate", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(data);
        });
        return () => unsubscribe();
    }, []);

    // --- Handle Delete ---
    const handleDelete = async (id) => {
        if(window.confirm("Are you sure you want to delete this student record?")) {
            try {
                await deleteDoc(doc(db, "students", id));
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    // --- Handle Edit Click ---
    const handleEdit = (student) => {
        setEditingId(student.id);
        setFormData({
            name: student.name,
            email: student.email,
            phone: student.phone,
            course: student.course,
            enrollDate: student.enrollDate
        });
        // Check if saved course is custom (not in predefined list)
        const isCustom = student.course && !PREDEFINED_COURSES.includes(student.course);
        setShowCustomInput(isCustom);
        setCustomCourseInput('');
        setShowForm(true);
    };

    // --- Handle course dropdown change ---
    const handleCourseChange = (e) => {
        const val = e.target.value;
        if (val === '__custom__') {
            setShowCustomInput(true);
            setFormData(prev => ({ ...prev, course: customCourseInput }));
        } else {
            setShowCustomInput(false);
            setCustomCourseInput('');
            setFormData(prev => ({ ...prev, course: val }));
        }
    };

    // --- Handle custom course input ---
    const handleCustomCourseChange = (e) => {
        const val = e.target.value;
        setCustomCourseInput(val);
        setFormData(prev => ({ ...prev, course: val }));
    };

    // --- Handle Submit (Create or Update) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.course.trim()) {
            alert("Please select or enter a course.");
            return;
        }
        try {
            if (editingId) {
                await updateDoc(doc(db, "students", editingId), formData);
                setEditingId(null);
            } else {
                await addDoc(collection(db, "students"), formData);
            }
            setShowForm(false);
            setFormData({ name: '', email: '', phone: '', course: '', enrollDate: '' });
            setCustomCourseInput('');
            setShowCustomInput(false);
        } catch (error) {
            console.error("Error saving student: ", error);
        }
    };

    const filteredStudents = students.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Determine dropdown value for edit mode
    const dropdownValue = showCustomInput
        ? '__custom__'
        : (PREDEFINED_COURSES.includes(formData.course) ? formData.course : '');

    return (
        <div className="students-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                :root {
                    --primary: #002244;
                    --primary-light: #f1f5f9;
                    --accent: #22c55e;
                    --accent-hover: #16a34a;
                    --bg-body: #f8fafc;
                    --text-dark: #0f172a;
                    --text-gray: #64748b;
                    --border: #e2e8f0;
                    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    --danger: #ef4444;
                }
                .students-container { padding: 30px; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; flex-wrap: wrap; gap: 20px; }
                .header-text h2 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin: 0; letter-spacing: -0.02em; }
                .header-text p { color: var(--text-gray); font-size: 14px; margin: 5px 0 0 0; font-weight: 500; }
                .actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                .search-wrapper { position: relative; }
                .search-wrapper input { width: 300px; padding: 10px 12px 10px 40px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); background: white; outline: none; transition: all 0.2s; }
                .search-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0, 34, 68, 0.1); }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-gray); pointer-events: none; }
                .btn-primary { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2); white-space: nowrap; }
                .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
                .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
                .student-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.3s ease; position: relative; display: flex; flex-direction: column; }
                .student-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: #cbd5e1; }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .avatar { width: 52px; height: 52px; background: linear-gradient(135deg, #002244 0%, #003366 100%); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; box-shadow: 0 4px 6px rgba(0, 34, 68, 0.15); flex-shrink: 0; }
                .card-info h3 { font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px 0; }
                .course-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #15803d; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .details { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; flex: 1; }
                .detail-row { display: flex; align-items: center; gap: 12px; color: var(--text-gray); font-size: 14px; word-break: break-all; }
                .detail-row svg { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
                .card-actions { margin-top: 20px; padding-top: 15px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; }
                .icon-btn { background: var(--bg-body); color: var(--text-gray); border: none; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { background: white; box-shadow: var(--shadow-sm); }
                .icon-btn.edit:hover { color: var(--primary); }
                .icon-btn.delete:hover { color: var(--danger); background: #fef2f2; }
                .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-gray); background: white; border-radius: 16px; border: 1px dashed var(--border); }

                /* --- Modal --- */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; padding: 20px; }
                .modal-content { background: white; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-header h3 { font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .input-group { margin-bottom: 16px; }
                .input-group.full-width { grid-column: 1 / -1; }
                .input-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-gray); margin-bottom: 6px; }
                .input-group input, .input-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); outline: none; transition: 0.2s; background: #f8fafc; }
                .input-group input:focus, .input-group select:focus { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0, 34, 68, 0.1); }

                /* --- Custom course input --- */
                .custom-course-wrapper { margin-top: 10px; display: flex; gap: 0; }
                .custom-course-wrapper input { border-radius: 8px 0 0 8px; border-right: none; }
                .custom-course-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,34,68,0.1); z-index: 1; position: relative; }
                .custom-course-hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }

                .close-btn { background: none; border: none; cursor: pointer; color: var(--text-gray); padding: 4px; border-radius: 50%; transition: 0.2s; }
                .close-btn:hover { background: #f1f5f9; color: var(--text-dark); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) { .students-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
                @media (max-width: 768px) {
                    .students-container { padding: 20px; }
                    .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .actions { width: 100%; flex-direction: column; align-items: stretch; }
                    .search-wrapper, .search-wrapper input { width: 100%; }
                    .btn-primary { justify-content: center; }
                }
                @media (max-width: 480px) {
                    .form-grid { grid-template-columns: 1fr; gap: 12px; }
                    .modal-content { padding: 20px; width: 95%; }
                    .students-grid { grid-template-columns: 1fr; gap: 16px; }
                    .card-top { align-items: center; text-align: center; flex-direction: column; gap: 12px; }
                    .card-info { text-align: center; }
                    .details { align-items: center; flex-direction: column; text-align: center; }
                    .detail-row { width: 100%; justify-content: center; text-align: center; }
                }
            `}</style>

            <div className="page-header">
                <div className="header-text">
                    <h2>Student Records</h2>
                    <p>Manage all enrolled students and their details.</p>
                </div>
                <div className="actions">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or course..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', email: '', phone: '', course: '', enrollDate: '' });
                        setCustomCourseInput('');
                        setShowCustomInput(false);
                        setShowForm(true);
                    }}>
                        <Plus size={18} /> Add Student
                    </button>
                </div>
            </div>

            <div className="students-grid">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                        <div key={student.id} className="student-card">
                            <div className="card-top">
                                <div className="avatar">
                                    {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="card-info">
                                    <h3>{student.name}</h3>
                                    <span className="course-badge">
                                        <BookOpen size={12} /> {student.course}
                                    </span>
                                </div>
                            </div>
                            <div className="details">
                                <div className="detail-row"><Mail size={16} /><span>{student.email}</span></div>
                                <div className="detail-row"><Phone size={16} /><span>{student.phone}</span></div>
                                <div className="detail-row"><Calendar size={16} /><span>Joined: {student.enrollDate}</span></div>
                            </div>
                            <div className="card-actions">
                                <button className="icon-btn edit" title="Edit Student" onClick={() => handleEdit(student)}>
                                    <Pencil size={16} />
                                </button>
                                <button className="icon-btn delete" title="Delete Student" onClick={() => handleDelete(student.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <User size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <p>No students found matching your search.</p>
                    </div>
                )}
            </div>

            {/* --- Modal --- */}
            {showForm && (
                <div className="modal-overlay" onClick={(e) => {
                    if(e.target.className === 'modal-overlay') setShowForm(false);
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Student' : 'Add New Student'}</h3>
                            <button className="close-btn" onClick={() => setShowForm(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="e.g. Ahmed Ali" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="student@email.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input type="text" placeholder="+92 300..." required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>

                                {/* --- Course Field --- */}
                                <div className="input-group full-width">
                                    <label>Course</label>
                                    <select value={dropdownValue} onChange={handleCourseChange} required={!showCustomInput}>
                                        <option value="">— Course selecter—</option>
                                        {PREDEFINED_COURSES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                        {/* Divider option (not selectable) */}
                                        <option disabled>─────────────────</option>
                                        <option value="__custom__">✏️ course (Custom Course)</option>
                                    </select>

                                    {/* Custom course input — only shows when "Khud likhein" is selected */}
                                   {showCustomInput && (
        <div style={{ marginTop: '10px' }}>
            <div className="custom-course-wrapper">
                <input
                    type="text"
                    className="form-control"
                    placeholder="course name"
                    value={customCourseInput}
                    onChange={handleCustomCourseChange}
                    autoFocus
                    required
                />
            </div>
            <p className="custom-course-hint" style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                
            </p>
        </div>
    )}
                                </div>

                                <div className="input-group full-width">
                                    <label>Enrollment Date</label>
                                    <input type="date" required value={formData.enrollDate} onChange={(e) => setFormData({...formData, enrollDate: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '10px'}}>
                                {editingId ? 'Update Student Record' : 'Save Student Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;