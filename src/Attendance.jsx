import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDocs } from "firebase/firestore";
import { Search, UserCheck, UserX, FileText, Calendar, GraduationCap, Loader2, CheckCircle2, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Use autoTable directly

const AttendancePage = () => {
    const [activeSection, setActiveSection] = useState('students');
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("name", "asc")), (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubTeachers = onSnapshot(query(collection(db, "teachers"), orderBy("name", "asc")), (snapshot) => {
            setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubAttendance = onSnapshot(doc(db, "attendance", selectedDate), (docSnap) => {
            if (docSnap.exists()) {
                setAttendance(docSnap.data());
            } else {
                setAttendance({}); 
            }
            setLoading(false);
        });

        return () => { unsubStudents(); unsubTeachers(); unsubAttendance(); };
    }, [selectedDate]);

    const markAttendance = async (id, status) => {
        const newAttendance = { ...attendance, [id]: status };
        setAttendance(newAttendance);
        try {
            await setDoc(doc(db, "attendance", selectedDate), newAttendance);
        } catch (error) {
            console.error("Error saving attendance:", error);
        }
    };

    // --- Action: Download Professional PDF Report ---
const downloadPDFReport = async () => {
    try {
        const docPDF = new jsPDF();
        const dateObj = new Date();
        const monthPrefix = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        const q = query(collection(db, "attendance"));
        const querySnapshot = await getDocs(q);

        const tableRows = [];
        const reportTitle = activeSection === 'students' 
            ? "Students Attendance Report" 
            : "Instructors Attendance Report";

        querySnapshot.forEach((docSnap) => {
            if (docSnap.id.startsWith(monthPrefix)) {
                const dayData = docSnap.data();
                Object.entries(dayData).forEach(([userId, status]) => {
                    if (activeSection === 'students') {
                        const student = students.find(s => String(s.id) === String(userId));
                        if (student) {
                            tableRows.push([docSnap.id, student.name, student.course || 'N/A', status.toUpperCase()]);
                        }
                    } else {
                        const teacher = teachers.find(t => String(t.id) === String(userId));
                        if (teacher) {
                            tableRows.push([docSnap.id, teacher.name, teacher.specialization || 'N/A', status.toUpperCase()]);
                        }
                    }
                });
            }
        });

        // SAFETY CHECK: If no data exists, stop here to avoid the error
        if (tableRows.length === 0) {
            alert("No attendance records found for this month.");
            return;
        }

        // PDF Header
        docPDF.setFontSize(18);
        docPDF.text(reportTitle, 14, 20);
        docPDF.setFontSize(10);
        docPDF.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        // USING AUTOTABLE DIRECTLY
        autoTable(docPDF, {
            startY: 35,
            head: [['Date', 'Name', activeSection === 'students' ? 'Course' : 'Specialization', 'Status']],
            body: tableRows.sort((a, b) => a[0].localeCompare(b[0])),
            theme: 'grid',
            headStyles: { fillColor: [0, 34, 68] },
        });

        docPDF.save(`${activeSection}_report_${monthPrefix}.pdf`);

    } catch (error) {
        console.error("PDF Error Detail:", error);
        alert("Error generating PDF. Check the console for details.");
    }
};

    const groupedStudents = students.reduce((acc, student) => {
        const course = student.course || "Unassigned";
        if (!acc[course]) acc[course] = [];
        acc[course].push(student);
        return acc;
    }, {});

    const filteredGroups = Object.keys(groupedStudents).reduce((acc, course) => {
        const filtered = groupedStudents[course].filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (filtered.length > 0) acc[course] = filtered;
        return acc;
    }, {});

    return (
        <div className="attendance-container" style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .section-tabs { display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
                .tab { padding: 10px 20px; cursor: pointer; border-radius: 8px; font-weight: 600; transition: 0.3s; color: #64748b; }
                .tab.active { background: #002244; color: white; }
                .course-header { background: #e2e8f0; padding: 10px 15px; border-radius: 8px; margin: 20px 0 10px; color: #002244; font-weight: 700; display: flex; align-items: center; gap: 8px; }
                .attendance-card { background: white; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border: 1px solid #e2e8f0; }
                .btn-status { padding: 8px 14px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; background: white; transition: 0.2s; }
                .btn-present.active { background: #dcfce7; color: #15803d; border-color: #22c55e; }
                .btn-absent.active { background: #fee2e2; color: #b91c1c; border-color: #ef4444; }
                .btn-leave.active { background: #fef9c3; color: #a16207; border-color: #eab308; }
                .date-picker-wrapper { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
            `}</style>

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Daily Attendance</h2>
                    <p style={{ color: '#64748b', margin: '4px 0', fontSize: '14px' }}>Track daily presence and download professional PDF reports.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="date-picker-wrapper">
                        <Clock size={18} color="#64748b" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontWeight: '600', color: '#0f172a' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search name..." 
                            style={{ padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '220px' }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={downloadPDFReport} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '11px 18px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <FileText size={18} /> PDF Report
                    </button>
                </div>
            </div>

            <div className="section-tabs">
                <div className={`tab ${activeSection === 'students' ? 'active' : ''}`} onClick={() => setActiveSection('students')}>Students</div>
                <div className={`tab ${activeSection === 'instructors' ? 'active' : ''}`} onClick={() => setActiveSection('instructors')}>Instructors</div>
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div> : (
                activeSection === 'students' ? (
                    Object.keys(filteredGroups).map(course => (
                        <div key={course}>
                            <div className="course-header"><GraduationCap size={18} /> {course}</div>
                            {filteredGroups[course].map(student => (
                                <div key={student.id} className="attendance-card">
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{student.name}</div>
                                    <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                                        <button className={`btn-status btn-present ${attendance[student.id] === 'present' ? 'active' : ''}`} onClick={() => markAttendance(student.id, 'present')}><UserCheck size={16}/> Present</button>
                                        <button className={`btn-status btn-absent ${attendance[student.id] === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(student.id, 'absent')}><UserX size={16}/> Absent</button>
                                        <button className={`btn-status btn-leave ${attendance[student.id] === 'leave' ? 'active' : ''}`} onClick={() => markAttendance(student.id, 'leave')}><Calendar size={16}/> Leave</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(teacher => (
                        <div key={teacher.id} className="attendance-card">
                            <div>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{teacher.name}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{teacher.specialization}</div>
                            </div>
                            <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                                <button className={`btn-status btn-present ${attendance[teacher.id] === 'present' ? 'active' : ''}`} onClick={() => markAttendance(teacher.id, 'present')}><CheckCircle2 size={16}/> Present</button>
                                <button className={`btn-status btn-absent ${attendance[teacher.id] === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(teacher.id, 'absent')}><UserX size={16}/> Absent</button>
                                <button className={`btn-status btn-leave ${attendance[teacher.id] === 'leave' ? 'active' : ''}`} onClick={() => markAttendance(teacher.id, 'leave')}><Calendar size={16}/> On Leave</button>
                            </div>
                        </div>
                    ))
                )
            )}
        </div>
    );
};

export default AttendancePage;