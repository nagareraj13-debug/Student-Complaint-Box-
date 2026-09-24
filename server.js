const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

app.post('/api/complaints', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.json({ success: true, data: { id: newComplaint._id.toString().slice(-4) } });
    } catch (error) { res.json({ success: false, message: "Server Error" }); }
});

app.get('/api/dashboard/:mobile', async (req, res) => {
    try {
        const userComplaints = await Complaint.find({ mobile: req.params.mobile }).sort({ date: -1 });
        const stats = { total: userComplaints.length, pending: userComplaints.filter(c => c.status === 'Pending').length, resolved: userComplaints.filter(c => c.status === 'Resolved').length };
        res.json({ success: true, stats: stats, recent: userComplaints });
    } catch (error) { res.json({ success: false, message: "Server Error" }); }
});

app.get('/', (req, res) => { res.send("Backend is Running on Cloud!"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });
