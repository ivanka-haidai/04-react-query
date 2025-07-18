import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import toast from 'react-hot-toast';
import Loader from '../Loader/Loader';
import ReactPaginate from 'react-paginate';
import css from './App.module.css'
import { useEffect } from 'react';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const data = await fetchMovies(query, page);
        if (data.results.length === 0) {
          toast.error('No movies found for your request.');
        }
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page]);




  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    setQuery(trimmed);
    setPage(1);

    if (!trimmed) {
      toast.error('Please enter your search query.');
      return;
    }

    setError(false);
    setLoading(true);

    try {
      const data = await fetchMovies(trimmed, 1); 
if (data.results.length === 0) {
  toast.error('No movies found for your request.');
}
setMovies(data.results);
setTotalPages(data.total_pages);
setPage(1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
  if (page >= totalPages) return;

  const nextPage = page + 1;

  setLoading(true);
  setError(false);

  try {
    const data = await fetchMovies(query, nextPage);
    setMovies(prev => [...prev, ...data.results]);
    setPage(nextPage);
  } catch {
    setError(true);
  } finally {
    setLoading(false);
  }
};

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <>
      <SearchBar onSubmit={handleSearch} />

      
      {totalPages > 1 && (
  <ReactPaginate
    pageCount={totalPages}
    pageRangeDisplayed={5}
    marginPagesDisplayed={1}
    onPageChange={({ selected }) => setPage(selected + 1)}
    forcePage={page - 1}
    containerClassName={css.pagination}
    activeClassName={css.active}
    nextLabel="→"
    previousLabel="←"
  />
      )}
      
      {loading && <Loader />}
      {error && <ErrorMessage />}

      {!loading && !error && (
        <MovieGrid movies={movies} onSelect={handleSelectMovie} />
      )}

      
      {!loading && !error && movies.length > 0 && page < totalPages && (
  <button onClick={handleLoadMore}>Load more</button>
)}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </>
  );
}

export default App;