const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'movies.json'
  
function readMovies() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}

function writeMovies(movies) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}


router.get('/', (req, res) => {
  try {
    const movies = readMovies();
    const { id, title } = req.query;

    if (id) {
      const movie = movies.find(m => m.id === Number(id));
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      return res.json(movie);
    }

    if (title) {
      const filteredMovies = movies.filter(m =>
        m.title.toLowerCase().includes(title.toLowerCase())
      );
      return res.json(filteredMovies);
    }

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/:id', (req, res) => {
  try {
    const movies = readMovies();
    const movie = movies.find(m => m.id === Number(req.params.id));

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/', (req, res) => {
  try {
    const movies = readMovies();
    const { title, description, rating, year, imgURL } = req.body;

    if (!title || rating === undefined || rating === null || rating === '') {
      return res.status(400).json({ error: 'Title and rating are required' });
    }

    const newId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1;

    const newMovie = {
      id: newId,
      title,
      description: description || '',
      rating: Number(rating),
      year: year ? Number(year) : null,
      imgURL: imgURL || ''
    };

    movies.push(newMovie);
    writeMovies(movies);

    res.status(201).json({
      message: 'Movie added successfully',
      movie: newMovie,
      movies: movies
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const movies = readMovies();
    const movieIndex = movies.findIndex(m => m.id === Number(req.params.id));

    if (movieIndex === -1) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const currentMovie = movies[movieIndex];
    const { title, description, rating, year, imgURL } = req.body;

    if (title !== undefined) currentMovie.title = title;
    if (description !== undefined) currentMovie.description = description;
    if (rating !== undefined) currentMovie.rating = Number(rating);
    if (year !== undefined) currentMovie.year = Number(year);
    if (imgURL !== undefined) currentMovie.imgURL = imgURL;

    writeMovies(movies);

    res.json({
      message: 'Movie updated successfully',
      movie: currentMovie,
      movies: movies
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', (req, res) => {
  try {
    const movies = readMovies();
    const movieIndex = movies.findIndex(m => m.id === Number(req.params.id));

    if (movieIndex === -1) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const deletedMovie = movies.splice(movieIndex, 1)[0];
    writeMovies(movies);

    res.json({
      message: 'Movie deleted successfully',
      deletedMovie: deletedMovie,
      movies: movies
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
