import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";
import { Search, Plus, Trash2, Wallet, X, Calendar, CheckCircle, Banknote } from 'lucide-react';

const Fees = () => {
    const [showForm, setShowForm] = useState(false);
    const [feesList, setFeesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        studentName: '', 
        course: '', 
        totalFee: '', 
        paidAmount: '', 
        installment2Date: '', 
        installment2Amount: '', // New Field
        installment3Date: '',
        installment3Amount: ''  // New Field
    });

    useEffect(() => {
        const q = query(collection(db, "fees"), orderBy("studentName", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setFeesList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);

    const handleReceiveFee = async (record) => {
        const amountStr = prompt(`Enter amount received from ${record.studentName}:`);
        
        if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const amountReceived = Number(amountStr);
        const newPaidAmount = Number(record.paidAmount) + amountReceived;
        const newRemaining = Number(record.totalFee) - newPaidAmount;
        const newStatus = newRemaining <= 0 ? 'Completed' : 'Ongoing';

        try {
            const feeDocRef = doc(db, "fees", record.id);
            await updateDoc(feeDocRef, {
                paidAmount: newPaidAmount,
                remaining: newRemaining,
                status: newStatus
            });

            await addDoc(collection(db, "payments"), {
                name: record.studentName,
                amount: amountReceived,
                date: new Date().toLocaleDateString(),
                status: 'Completed'
            });

            alert("Fee received and records updated!");
        } catch (error) {
            console.error("Error updating fee:", error);
            alert("Something went wrong!");
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        const remaining = Number(formData.totalFee) - Number(formData.paidAmount);
        const status = remaining <= 0 ? 'Completed' : 'Ongoing';

        await addDoc(collection(db, "fees"), {
            ...formData,
            remaining,
            status,
            dateAdded: new Date().toISOString()
        });

        await addDoc(collection(db, "payments"), {
            name: formData.studentName,
            amount: formData.paidAmount,
            date: new Date().toLocaleDateString(),
            status: 'Completed'
        });

        setFormData({ 
            studentName: '', course: '', totalFee: '', paidAmount: '', 
            installment2Date: '', installment2Amount: '', 
            installment3Date: '', installment3Amount: '' 
        });
        setShowForm(false);
    };

    const deleteRecord = async (id) => {
        if(window.confirm("Are you sure you want to delete this record?")) {
            try {
                await deleteDoc(doc(db, "fees", id));
            } catch (error) {
                console.error("Error deleting fee:", error);
            }
        }
    };

    const filteredFees = feesList.filter(f => 
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fees-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                :root {
                    --primary: #002244;
                    --primary-light: #f1f5f9;
                    --accent: #22c55e;
                    --accent-hover: #16a34a;
                    --bg-body: #f8fafc;
                    --text-dark: #0f172a;
                    --text-gray: #64748b;
                    --border: #e2e8f0;
                    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .fees-container { padding: 30px; background: var(--bg-body); min-height: 100vh; font-family: 'Inter', sans-serif; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; flex-wrap: wrap; gap: 20px; }
                .header-text h2 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin: 0; }
                .header-actions { display: flex; gap: 12px; align-items: center; }
                .search-wrapper { position: relative; }
                .search-wrapper input { width: 300px; padding: 10px 12px 10px 40px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-gray); }
                .btn-primary { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .btn-danger { background: #fee2e2; color: #ef4444; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
                .btn-action { background: #ecfdf5; color: #059669; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
                .form-card { background: white; padding: 30px; border-radius: 16px; box-shadow: var(--shadow); border: 1px solid var(--border); margin-bottom: 30px; }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; }
                .input-group label { font-size: 13px; font-weight: 600; color: var(--text-gray); }
                .input-group input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: #f8fafc; }
                .installment-box { grid-column: 1 / -1; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed var(--border); }
                .table-container { background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th { padding: 16px 20px; text-align: left; font-size: 12px; color: var(--text-gray); font-weight: 700; background: #f8fafc; }
                td { padding: 18px 20px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
                .status-completed { background: #dcfce7; color: #15803d; }
                .status-ongoing { background: #fef9c3; color: #a16207; }
                .amount-val { font-weight: 700; }
                .amount-green { color: var(--accent); }
                .amount-red { color: #ef4444; }
            `}</style>

            <div className="page-header">
                <div className="header-text">
                    <h2>Fee Management</h2>
                    <p>Track payments and scheduled installments.</p>
                </div>
                <div className="header-actions">
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Close' : 'New Record'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="form-card">
                    <form onSubmit={handleAddRecord}>
                        <div className="form-grid">
                            <div className="input-group"><label>Student Name</label><input type="text" required value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} /></div>
                            <div className="input-group"><label>Course</label><input type="text" required value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} /></div>
                            <div className="input-group"><label>Total Fee</label><input type="number" required value={formData.totalFee} onChange={(e) => setFormData({...formData, totalFee: e.target.value})} /></div>
                            <div className="input-group"><label>Paid Amount</label><input type="number" required value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: e.target.value})} /></div>
                            
                            <div className="installment-box">
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                    <div className="input-group">
                                        <label>2nd Installment Date</label>
                                        <input type="date" value={formData.installment2Date} onChange={(e) => setFormData({...formData, installment2Date: e.target.value})} />
                                    </div>
                                    <div className="input-group">
                                        <label>2nd Installment Amount</label>
                                        <input type="number" placeholder="RS" value={formData.installment2Amount} onChange={(e) => setFormData({...formData, installment2Amount: e.target.value})} />
                                    </div>
                                    <div className="input-group">
                                        <label>3rd Installment Date</label>
                                        <input type="date" value={formData.installment3Date} onChange={(e) => setFormData({...formData, installment3Date: e.target.value})} />
                                    </div>
                                    <div className="input-group">
                                        <label>3rd Installment Amount</label>
                                        <input type="number" placeholder="RS" value={formData.installment3Amount} onChange={(e) => setFormData({...formData, installment3Amount: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{textAlign: 'right'}}><button type="submit" className="btn-primary"><CheckCircle size={18}/> Save Record</button></div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Total Fee</th>
                            <th>Paid</th>
                            <th>Remaining</th>
                            <th>Scheduled Installments</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFees.map(f => (
                            <tr key={f.id}>
                                <td><div style={{fontWeight: '600'}}>{f.studentName}</div><small>{f.course}</small></td>
                                <td><span className="amount-val">RS {f.totalFee}</span></td>
                                <td className="amount-green"><span className="amount-val">RS {f.paidAmount}</span></td>
                                <td className="amount-red"><span className="amount-val">RS {f.remaining}</span></td>
                                <td style={{fontSize: '12px'}}>
                                    {f.installment2Date && <div>📅 {f.installment2Date} (RS {f.installment2Amount || 0})</div>}
                                    {f.installment3Date && <div>📅 {f.installment3Date} (RS {f.installment3Amount || 0})</div>}
                                </td>
                                <td><span className={`status-badge ${f.status === 'Completed' ? 'status-completed' : 'status-ongoing'}`}>{f.status}</span></td>
                                <td>
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        <button className="btn-action" onClick={() => handleReceiveFee(f)}><Wallet size={14} /></button>
                                        <button className="btn-danger" onClick={() => deleteRecord(f.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Fees;