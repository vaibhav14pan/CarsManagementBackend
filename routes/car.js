const express = require('express');
const router = express.Router();
const upload = require('../aws-s3-upload');
const auth = require('../middleware/auth');
const Car = require('../models/Car');

// Create car
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const images = req.files.map(file => file.location); // S3 URL of the image

    const car = new Car({
      title,
      description,
      images,
      tags: JSON.parse(tags),
      userId: req.user._id
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all cars
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single car
router.get('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update car
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const update = {
      title,
      description,
      tags: JSON.parse(tags),
      updatedAt: Date.now()
    };

    if (req.files?.length) {
      update.images = req.files.map(file => file.location); // Use S3 URLs

      // Get old car to delete old images
      const oldCar = await Car.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (oldCar) {
        // Optionally, delete old images from S3 if needed
      }
    }

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete car
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Optionally, delete associated images from S3 if needed

    await car.deleteOne();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
