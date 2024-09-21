// src/components/Dashboard.js
"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "@/styles/search.scss";
import { ClerkLoading, useUser } from "@clerk/nextjs";

const DashboardWrapper = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  color: var(--text-color); /* Adapts based on theme */
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  margin-top: 30px;
`;

const Label = styled.label`
  font-size: 1.2rem;
  color: var(--label-color); /* Adapts based on theme */
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  color: black;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: fit-content;
  margin: 0 auto;
  display: block;
`;

const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

import axios from "axios";
import * as cheerio from "cheerio";

interface Movie {
  movieTitle: string;
  fullUrl: string;
  type: string;
}

const Dashboard = () => {
  const [preference, setPreference] = useState("horror comedy");
  const [movieTitle, setMovieTitle] = useState("");
  const [movieResult, setMovieResult] = useState<Movie []| null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [toggleMovie, setToggleMovie] = useState(false);
  const { user } = useUser();
  const baseUrl = "https://myflixerz.to";

  const fetchMovie = async (movieName: string, type: string) => {
    
    const response = await fetch(
      `/api/${type}?movieName=${encodeURIComponent(movieName)}`,
    );
    if (response.ok) {
      const data = await response.json();

      try {
        const $ = cheerio.load(data);

        const movies = $(".flw-item");
        if (movies.length === 0) {
          console.log("No movies found.");
          return;
        }

        const movieToFilter: { movieTitle: string; fullUrl: string }[] = [];

        if (movies.length > 0) {
          movies.each((index, element) => {
            const linkTag = $(element).find("a.film-poster-ahref");
            const movieTitleTag = $(element).find(".film-name a");

            if (linkTag.length > 0) {
              const href = linkTag.attr("href");
              const fullUrl = `${baseUrl}${href}`;
              const movieTitle = movieTitleTag.text().trim(); // Get the movie name
              movieToFilter.push({ movieTitle, fullUrl });
            }
          });
        } else {
          console.log("No movies found.");
        }

    
        return movieToFilter;
      } catch (error) {
        // console.error("Error:", error);
      }
      // Process the data to extract the link as needed
      // Example: setMovieUrl(data.link);
    } else {
      console.error("Error fetching movie data");
    }
  };

  const processMovies = (movies: any) => {
    console.log(movies[0].fullUrl.split("/")[3]);
    return movies.map((m: any) => ({
        ...m,
        type: m.fullUrl.split("/")[3] === "tv" ? "show" : "movie"
    }));
}

  const filterMovies = async (
    prompt: string,
    movies: { movieTitle: string; fullUrl: string }[],
  ) => {
    const response = await fetch(`/api/filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, movies }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Error filtering movies");
    }
  };

  const handlePreferenceSearch = async () => {
    // const type = toggleMovie ? 'Make sure it is a movie' : 'Make sure it is a show';
    setMovieResult(null);
    let prompt = `Generate a recommendation the preference: ${preference}`;
    prompt = toggleMovie
      ? prompt + " and make sure it is a movie"
      : prompt + " and make sure it is a show";

    const response = await fetch(`/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set the content type to text/plain if you're sending a raw string
      },
      body: JSON.stringify({ prompt }), // Directly use the string as the body
    });


    if (response.ok) {
      const title = await response.json();
      const movies = await fetchMovie(title, "flixersearch");
      if (movies) {
        const filteredMovie = await filterMovies(title, movies);
        setMovieResult(processMovies(filteredMovie));
      }
    }
  };

  const handleTitleSearch = async () => {
    const type = toggleMovie ? 'movie' : 'a show';
    setMovieResult(null);
    let prompt = `is there a ${type} that called: ${movieTitle}`;
   
    prompt = toggleMovie
      ? prompt + " and make sure it is a movie"
      : prompt + " and make sure it is a show";

    prompt = prompt + ". If this media doesn't exist, return a media that is the most similar to this title.";

    const response = await fetch(`/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set the content type to text/plain if you're sending a raw string
      },
      body: JSON.stringify({ prompt }), // Directly use the string as the body
    });


    if (response.ok) {
      const title = await response.json();
      const movies = await fetchMovie(title, "flixersearch");
      if (movies) {
        const filteredMovie = await filterMovies(title, movies);
        setMovieResult(processMovies(filteredMovie));
      }
    }
    
  };





  useEffect(() => {
    setPageLoading(false);
  }, []);

  if (pageLoading) {
    return <div>Loading...</div>;
  }



  return (
    <DashboardWrapper>
      <h1>{user?.firstName}'s Dashboard</h1>
      <InputWrapper>
        <h4>Find a Movie by Preference</h4>
        <Input
          className="search"
          type="text"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          placeholder="Enter genre, mood, actor, or a general theme/criteria of what you're looking for!"
        />
        <Button
          onClick={handlePreferenceSearch}
          className="btn btn-outline-primary btn-sm hidden lg:inline-block"
        >
          Get Recommendation
        </Button>
      </InputWrapper>

      <InputWrapper>
        <h4>Find a Movie by Title</h4>
        <Input
          type="text"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          placeholder="Enter movie title!"
        />
        <Button
          onClick={handleTitleSearch}
          className="btn btn-outline-primary btn-sm hidden lg:inline-block"
        >
          Find Movie
        </Button>
      </InputWrapper>

      {movieResult && (
        <ResultWrapper>
          {movieResult.map((movie: any, index: number) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </ResultWrapper>
      )}
    </DashboardWrapper>
  );
};

export default Dashboard;

// src/components/MovieCard.js

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--card-bg);
  color: var(--card-text);
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin: 0;
`;

const Description = styled.p`
  font-size: 1rem;
  text-align: center;
`;

const LinkButton = styled.a`
  padding: 10px 20px;
  background-color: var(--btn-bg);
  color: var(--btn-text);
  font-size: 1rem;
  border-radius: 5px;
  margin-top: 15px;
  text-decoration: none;

  &:hover {
    background-color: var(--btn-hover-bg);
  }
`;

const MovieCard = ({ movie }) => {
  return (
    <Card>
      <Title>{movie.movieTitle}</Title>
      <Description>{movie.type}</Description>
      <LinkButton href={movie.fullUrl} target="_blank">
        Watch Now
      </LinkButton>
    </Card>
  );
};
