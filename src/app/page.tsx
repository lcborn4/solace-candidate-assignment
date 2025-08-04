"use client";

import { useEffect, useState, useCallback } from "react";

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdvocates = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const url = search ? `/api/advocates?search=${encodeURIComponent(search)}` : "/api/advocates";
      const response = await fetch(url);
      const jsonResponse = await response.json();
      setAdvocates(jsonResponse.data);
    } catch (error) {
      console.error("Error fetching advocates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdvocates(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAdvocates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm("");
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input 
          style={{ border: "1px solid black" }} 
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search advocates..."
        />
        <button onClick={handleReset}>Reset Search</button>
      </div>
      <br />
      <br />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>City</th>
              <th>Degree</th>
              <th>Specialties</th>
              <th>Years of Experience</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {advocates.map((advocate, index) => {
              return (
                <tr key={advocate.id || index}>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties.map((s, specialtyIndex) => (
                      <div key={specialtyIndex}>{s}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
