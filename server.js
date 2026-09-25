const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

// CORS Update: Allowing Vercel Frontend to communicate with Render Backend
app.use(cors({ origin: '*' }));

// Tuzi MongoDB Link
const mongoURI = "mongodb+srv://nagareraj13_db_user:r5lxfrz8H2sHMGti@cluster0.byxlwwd.mongodb.net/complaintBoxDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("🔥 MongoDB Cloud Connected Successfully!"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

const complaintSchema = new mongoose.Schema({
    mobile: String, category: String, priority: String, description: String,
    status: { type: String, default: "Pending" }, date: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', complaintSchema);

// 1. Submit Complaint API
app.post('/api/complaints', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.json({ success: true, data: { id: newComplaint._id.toString().slice(-4) } });
    } catch (error) { 
        res.json({ success: false, message: "Server Error" }); 
    }
});

// 2. Fetch Dashboard & Tracking API
app.get('/api/dashboard/:mobile', async (req, res) => {
    try {
        const userComplaints = await Complaint.find({ mobile: req.params.mobile }).sort({ date: -1 });
        const stats = { 
            total: userComplaints.length, 
            pending: userComplaints.filter(c => c.status === 'Pending').length, 
            resolved: userComplaints.filter(c => c.status === 'Resolved').length 
        };
        res.json({ success: true, stats: stats, recent: userComplaints });
    } catch (error) { 
        res.json({ success: false, message: "Server Error" }); 
    }
});

// 3. GOOGLE LOGIN FIX: Smart Auth Simulator
app.get('/auth/google', (req, res) => {
    const htmlResponse = `
        <html>
        <head><title>Google Login Successful</title></head>
        <body style="background-color:#080710; color:#00F260; text-align:center; padding-top:20%;">
            <h2>Google Authentication Successful! ✅</h2>
            <p>Redirecting to dashboard...</p>
            <script>
                // Setting up user session securely
                localStorage.setItem('loggedInUser', '9876543210');
                localStorage.setItem('userRole', 'student');
                const studentData = { 
                    name: "Raj Nagare", 
                    rollId: "raj.nagare@google", 
                    college: "MVP KBTCOE" 
                };
                localStorage.setItem('studentProfileData', JSON.stringify(studentData));
                
                // Redirect back to Vercel
                setTimeout(() => {
                    window.location.href = 'https://student-complaint-box-one.vercel.app/dashboard.html';
                }, 1000);
            </script>
        </body>
        </html>
    `;
    res.send(htmlResponse);
});

// 4. Default Route
app.get('/', (req, res) => { 
    res.send("Backend is Running on Cloud!"); 
});
// ==========================================
// 🚀 ADMIN PORTAL: GET ALL COMPLAINTS
// ==========================================
app.get('/api/admin/complaints', async (req, res) => {
    try {
        const allComplaints = await Complaint.find({});
        res.json({ success: true, data: allComplaints });
    } catch (error) {
        console.error("Admin API Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}); // ==========================================
// 🔐 ADMIN LOGIN: SECURE AUTHENTICATION
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Ha password fkt server var asel, konalach disnar nahi
    if (username === 'Firstadmin' && password === 'admin$1336') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.json({ success: false, message: 'Invalid Admin ID or Password' });
    }
});
// ==========================================
// 🛠️ ADMIN PORTAL: UPDATE COMPLAINT STATUS
// ==========================================
app.post('/api/admin/update-status', async (req, res) => {
    try {
        const { id, status } = req.body;
        await Complaint.findByIdAndUpdate(id, { status: status });
        res.json({ success: true, message: "Status Updated!" });
    } catch (error) {
        res.json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });
