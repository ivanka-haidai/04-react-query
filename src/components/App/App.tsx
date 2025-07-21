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
import { useQuery } from '@tanstack/react-query';
import css from './App.module.css';

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query, // only fetch if query exists
    placeholderData: (prev) => prev,
  });

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      toast.error('Please enter your search query.');
      return;
    }
    setQuery(trimmed);
    setPage(1);
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

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}

      {isSuccess && data && (
        <>
          {data.total_pages > 1 && (
            <ReactPaginate
              pageCount={data.total_pages}
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

          <MovieGrid movies={data.results} onSelect={handleSelectMovie} />
        </>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </>
  );
}

export default App;