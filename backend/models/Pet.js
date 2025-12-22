const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    petCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      enum: ['dog', 'cat', 'other'],
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Đực', 'Cái'],
    },
    size: {
      type: String,
      enum: ['Nhỏ', 'Vừa', 'Lớn'],
      default: 'Vừa',
    },
    color: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    vaccinated: {
      type: Boolean,
      default: false,
    },
    sterilized: {
      type: Boolean,
      default: false,
    },
    adoptionStatus: {
      type: String,
      enum: ['available', 'pending', 'adopted'],
      default: 'available',
    },
    adoptionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    rescueDate: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
    model3D: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;