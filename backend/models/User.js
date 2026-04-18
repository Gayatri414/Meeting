import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, default: null },   // null for Google-only users
    name:        { type: String, default: '' },
    picture:     { type: String, default: '' },     // Google profile picture
    googleId:    { type: String, default: null, index: true },
    authProvider:{ type: String, enum: ['local', 'google'], default: 'local' },
    notionToken: { type: String, default: '' },
    notionDbId:  { type: String, default: '' }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
