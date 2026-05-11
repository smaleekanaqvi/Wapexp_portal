import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Search, Plus, Mail, Phone, Calendar, X, User, BookOpen, GraduationCap, Wallet, Loader2, Pencil, Trash2 } from 'lucide-react';

// --- Predefined course list (same as Students) ---
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

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        joiningDate: "",
        monthlySalary: "",
        courses: []
    });

    // --- Course selector state ---
    const [selectedCourseFromList, setSelectedCourseFromList] = useState("");
    const [customCourseInput, setCustomCourseInput] = useState("");

    useEffect(() => {
        const q = query(collection(db, "teachers"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teacherData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeachers(teacherData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching Instructor:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Add course from dropdown ---
    const handleAddFromDropdown = (e) => {
        const val = e.target.value;
        setSelectedCourseFromList(val);
        if (val && !formData.courses.includes(val)) {
            setFormData(prev => ({ ...prev, courses: [...prev.courses, val] }));
        }
        // Reset select back to placeholder
        setTimeout(() => setSelectedCourseFromList(""), 0);
    };

    // --- Add custom course ---
    const handleAddCustomCourse = () => {
        const trimmed = customCourseInput.trim();
        if (trimmed && !formData.courses.includes(trimmed)) {
            setFormData(prev => ({ ...prev, courses: [...prev.courses, trimmed] }));
            setCustomCourseInput("");
        }
    };

    const handleCustomCourseKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddCustomCourse();
        }
    };

    // --- Remove course tag ---
    const handleRemoveCourse = (course) => {
        setFormData(prev => ({ ...prev, courses: prev.courses.filter(c => c !== course) }));
    };

    // --- Handle Delete ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Instructor?")) {
            try {
                await deleteDoc(doc(db, "teachers", id));
            } catch (error) {
                console.error("Error deleting Instructor:", error);
            }
        }
    };

    // --- Handle Edit Click ---
    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            specialization: teacher.specialization,
            joiningDate: teacher.joiningDate,
            monthlySalary: teacher.monthlySalary,
            courses: teacher.courses || []
        });
        setCustomCourseInput("");
        setSelectedCourseFromList("");
        setShowModal(true);
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCourseColor = (course) => {
        const colors = {
            "React": { bg: "#dbeafe", text: "#1d4ed8" },
            "Node.js": { bg: "#dcfce7", text: "#15803d" },
            "MongoDB": { bg: "#ede9fe", text: "#6d28d9" },
            "Express.js": { bg: "#fff7ed", text: "#c2410c" },
            "JavaScript": { bg: "#fef9c3", text: "#a16207" },
            "TypeScript": { bg: "#e0f2fe", text: "#0369a1" },
            "Python": { bg: "#fef3c7", text: "#92400e" },
            "Next.js": { bg: "#f0f9ff", text: "#075985" },
            "Graphic Design": { bg: "#fce7f3", text: "#db2777" },
            "Data Science": { bg: "#ede9fe", text: "#6d28d9" },
            "Web Development": { bg: "#dbeafe", text: "#1d4ed8" },
            "Digital Marketing": { bg: "#fef9c3", text: "#a16207" },
            "SEO": { bg: "#dcfce7", text: "#15803d" },
            "Video Editing": { bg: "#fff7ed", text: "#c2410c" },
            "Flutter App": { bg: "#e0f2fe", text: "#0369a1" },
            "Artificial Intelligence": { bg: "#ede9fe", text: "#6d28d9" },
        };
        return colors[course] || { bg: "#f1f5f9", text: "#475569" };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Handle Submit (Add or Update) ---
    const handleAddTeacher = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.specialization || !formData.joiningDate || !formData.monthlySalary) {
            alert("Please fill all fields.");
            return;
        }
        try {
            if (editingId) {
                await updateDoc(doc(db, "teachers", editingId), {
                    ...formData,
                    monthlySalary: Number(formData.monthlySalary)
                });
                setEditingId(null);
            } else {
                await addDoc(collection(db, "teachers"), {
                    ...formData,
                    monthlySalary: Number(formData.monthlySalary),
                    createdAt: new Date().toISOString()
                });
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving teacher:", error);
            alert("Failed to save teacher.");
        }
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", specialization: "", joiningDate: "", monthlySalary: "", courses: [] });
        setCustomCourseInput("");
        setSelectedCourseFromList("");
        setEditingId(null);
    };

    const handleCancel = () => {
        setShowModal(false);
        resetForm();
    };

    return (
        <div className="teachers-container">
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
                    --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
                    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
                    --danger: #ef4444;
                }
                .teachers-container { padding: 30px; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; flex-wrap: wrap; gap: 20px; }
                .header-text h2 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin: 0; letter-spacing: -0.02em; }
                .header-text p { color: var(--text-gray); font-size: 14px; margin: 5px 0 0 0; font-weight: 500; }
                .actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                .search-wrapper { position: relative; }
                .search-wrapper input { width: 300px; padding: 10px 12px 10px 40px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); background: white; outline: none; transition: all 0.2s; }
                .search-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,34,68,0.1); }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-gray); pointer-events: none; }
                .btn-primary { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(34,197,94,0.2); }
                .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
                .teachers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
                .teacher-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.3s ease; position: relative; display: flex; flex-direction: column; }
                .teacher-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: #cbd5e1; }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .avatar { width: 56px; height: 56px; background: linear-gradient(135deg, #002244 0%, #003366 100%); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; box-shadow: 0 4px 6px rgba(0,34,68,0.15); flex-shrink: 0; }
                .teacher-info h3 { font-size: 18px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px 0; }
                .specialization-text { font-size: 13px; color: var(--text-gray); font-weight: 500; }
                .details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
                .detail-row { display: flex; align-items: center; gap: 12px; color: var(--text-gray); font-size: 14px; }
                .courses-section { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
                .course-badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; }
                .card-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .salary-label { font-size: 13px; color: var(--text-gray); font-weight: 600; }
                .salary-value { font-size: 18px; font-weight: 800; color: var(--text-dark); }
                .card-actions { margin-top: 15px; display: flex; justify-content: flex-end; gap: 10px; padding-top: 15px; border-top: 1px dashed var(--border); }
                .icon-btn { background: var(--bg-body); color: var(--text-gray); border: none; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .icon-btn:hover { background: white; box-shadow: var(--shadow-sm); }
                .icon-btn.edit:hover { color: var(--primary); }
                .icon-btn.delete:hover { color: var(--danger); background: #fef2f2; }

                /* --- Modal --- */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.2s ease-out; padding: 20px; }
                .modal-content { background: white; width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-header h3 { font-size: 20px; font-weight: 700; color: var(--text-dark); margin: 0; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .input-group { margin-bottom: 16px; }
                .input-group.full-width { grid-column: 1 / -1; }
                .input-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-gray); margin-bottom: 6px; }
                .input-group input, .input-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); outline: none; transition: 0.2s; background: #f8fafc; }
                .input-group input:focus, .input-group select:focus { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,34,68,0.1); }

                /* --- Course Section in Modal --- */
                .course-section-label { font-size: 13px; font-weight: 600; color: var(--text-gray); margin-bottom: 8px; display: block; }
                .course-selector-row { display: flex; gap: 8px; margin-bottom: 10px; }
                .course-selector-row select { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); background: #f8fafc; outline: none; cursor: pointer; }
                .course-selector-row select:focus { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,34,68,0.1); }
                .custom-course-row { display: flex; gap: 8px; margin-bottom: 10px; }
                .custom-course-row input { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-dark); background: #f8fafc; outline: none; }
                .custom-course-row input:focus { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,34,68,0.1); }
                .btn-add-course { padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-dark); white-space: nowrap; transition: 0.2s; }
                .btn-add-course:hover { background: var(--primary); color: white; border-color: var(--primary); }
                .course-divider { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
                .course-divider span { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .course-divider hr { flex: 1; border: none; border-top: 1px dashed var(--border); }
                .course-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
                .course-tag-remove { cursor: pointer; opacity: 0.6; margin-left: 4px; font-size: 14px; line-height: 1; }
                .course-tag-remove:hover { opacity: 1; }

                .close-btn { background: none; border: none; cursor: pointer; color: var(--text-gray); padding: 4px; border-radius: 50%; transition: 0.2s; }
                .close-btn:hover { background: #f1f5f9; color: var(--text-dark); }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) { .teachers-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
                @media (max-width: 768px) {
                    .teachers-container { padding: 20px; }
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .actions { width: 100%; justify-content: space-between; }
                    .search-wrapper input { width: 100%; }
                    .teachers-grid { grid-template-columns: 1fr; gap: 16px; }
                    .teacher-card { padding: 20px; }
                }
                @media (max-width: 480px) {
                    .form-grid { grid-template-columns: 1fr; gap: 12px; }
                    .modal-content { padding: 20px; max-height: 95vh; }
                    .card-top { align-items: center; text-align: center; flex-direction: column; gap: 12px; }
                    .teacher-info { text-align: center; }
                    .details { align-items: center; }
                    .detail-row { width: 100%; justify-content: center; }
                }
            `}</style>

            {/* --- Header --- */}
            <div className="page-header">
                <div className="header-text">
                    <h2>Instructor</h2>
                    <p>Manage staff, specialization, and payroll.</p>
                </div>
                <div className="actions">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search name or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}>
                        <Plus size={18} /> Add Instructor
                    </button>
                </div>
            </div>

            {/* --- Grid --- */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: 'white', borderRadius: '16px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: '10px' }}>Loading instructor data...</div>
                </div>
            ) : (
                <div className="teachers-grid">
                    {filteredTeachers.length > 0 ? filteredTeachers.map((t) => (
                        <div key={t.id} className="teacher-card">
                            <div className="card-top">
                                <div className="avatar">
                                    {t.name ? t.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="teacher-info">
                                    <h3>{t.name}</h3>
                                    <span className="specialization-text">{t.specialization}</span>
                                </div>
                            </div>
                            <div className="details">
                                <div className="detail-row"><Mail size={16} /><span>{t.email}</span></div>
                                <div className="detail-row"><Phone size={16} /><span>{t.phone}</span></div>
                                <div className="detail-row"><Calendar size={16} /><span>Joined: {t.joiningDate}</span></div>
                            </div>
                            <div className="courses-section">
                                {t.courses && t.courses.length > 0 ? t.courses.map((course, i) => {
                                    const color = getCourseColor(course);
                                    return (
                                        <span key={i} className="course-badge" style={{ background: color.bg, color: color.text }}>
                                            {course}
                                        </span>
                                    );
                                }) : (
                                    <span style={{ fontSize: '13px', color: '#cbd5e1' }}>No courses assigned</span>
                                )}
                            </div>
                            <div className="card-footer">
                                <span className="salary-label">Monthly Salary</span>
                                <span className="salary-value">RS {t.monthlySalary?.toLocaleString()}</span>
                            </div>
                            <div className="card-actions">
                                <button className="icon-btn edit" title="Edit Instructor" onClick={() => handleEdit(t)}>
                                    <Pencil size={16} />
                                </button>
                                <button className="icon-btn delete" title="Delete Instructor" onClick={() => handleDelete(t.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', color: '#64748b', border: '1px dashed #e2e8f0' }}>
                            No Instructor found.
                        </div>
                    )}
                </div>
            )}

            {/* --- Modal --- */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target.className === 'modal-overlay') handleCancel();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Instructor' : 'Add New Instructor'}</h3>
                            <button className="close-btn" onClick={handleCancel}><X size={24} /></button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleAddTeacher(); }}>
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ali" />
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ali@school.com" />
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+92 300..." />
                                </div>
                                <div className="input-group full-width">
                                    <label>Specialization</label>
                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Web Design" />
                                </div>
                                <div className="input-group">
                                    <label>Joining Date</label>
                                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} />
                                </div>
                                <div className="input-group">
                                    <label>Monthly Salary</label>
                                    <input type="number" name="monthlySalary" value={formData.monthlySalary} onChange={handleInputChange} placeholder="50000" />
                                </div>

                                {/* --- Courses Section --- */}
                                <div className="input-group full-width" style={{ marginBottom: 0 }}>
                                    <label>Courses</label>

                                    {/* Dropdown selector */}
                                    <div className="course-selector-row">
                                        <select value={selectedCourseFromList} onChange={handleAddFromDropdown}>
                                            <option value="">— course selecter —</option>
                                            {PREDEFINED_COURSES.map((c) => (
                                                <option key={c} value={c} disabled={formData.courses.includes(c)}>
                                                    {c}{formData.courses.includes(c) ? ' ✓' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Divider */}
                                    <div className="course-divider">
                                        <hr /><span>course</span><hr />
                                    </div>

                                    {/* Custom course input */}
                                    <div className="custom-course-row">
                                        <input
                                            type="text"
                                            value={customCourseInput}
                                            onChange={(e) => setCustomCourseInput(e.target.value)}
                                            onKeyDown={handleCustomCourseKeyDown}
                                            placeholder="write the course name"
                                        />
                                        <button type="button" className="btn-add-course" onClick={handleAddCustomCourse}>
                                            + Add
                                        </button>
                                    </div>

                                    {/* Selected course tags */}
                                    {formData.courses.length > 0 && (
                                        <div className="course-tags">
                                            {formData.courses.map((course, i) => {
                                                const color = getCourseColor(course);
                                                return (
                                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: color.bg, color: color.text }}>
                                                        {course}
                                                        <span className="course-tag-remove" onClick={() => handleRemoveCourse(course)}>×</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '500' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                                    {editingId ? 'Update Instructor' : 'Save Instructor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;