import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  url: { type: String },
  label: { type: String },
  palette: { type: [String], default: [] },
  uploadedAt: { type: Date, default: Date.now },
});

const DaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date },
  short: { type: String },
  description: { type: String },
  photos: { type: [PhotoSchema], default: [] },
});

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  studentId: { type: String },
  enrolledAt: { type: Date, default: Date.now },
});

const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  role: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const InternshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  start: { type: Date },
  end: { type: Date },
  status: { type: String, enum: ['Active','Completed','Upcoming'], default: 'Upcoming' },
  role: { type: String, enum: ['Intern','Mentor','HR'], default: 'Intern' },
  description: { type: String },
  tutor: { type: String },
  approved: { type: Boolean, default: false },
  days: { type: [DaySchema], default: [] },
  students: { type: [StudentSchema], default: [] },
  comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Internship || mongoose.model('Internship', InternshipSchema);
