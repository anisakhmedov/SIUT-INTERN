import mongoose from 'mongoose';

const ShortReportSchema = new mongoose.Schema({
  dayID: mongoose.Schema.Types.ObjectId,
  images: [String],
  title: String,
  description: String,
  date: { type: Date, default: Date.now },
});

const DaySchema = new mongoose.Schema({
  approved: { type: Boolean, default: false },
  dayNumber: { type: String, required: true },
  date: { type: String },
  shortReport: ShortReportSchema,
  comments: [String],
});

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  numberOfStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  location: { type: String, required: true },
  duration: { type: String, required: true },
  tutorID: { type: String },
  plan: { type: String, required: true },
  company: { type: String, required: true },
  progressAll: { type: String, required: true },
  status: { type: String, required: true },
  days: { type: [DaySchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
