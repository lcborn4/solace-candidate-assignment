"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [expandedSpecialties, setExpandedSpecialties] = useState(new Set());

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e) => {
    const searchTerm = e.target.value;

    document.getElementById("search-term").innerHTML = searchTerm;

    console.log("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.includes(searchTerm) ||
        advocate.lastName.includes(searchTerm) ||
        advocate.city.includes(searchTerm) ||
        advocate.degree.includes(searchTerm) ||
        advocate.specialties.includes(searchTerm) ||
        advocate.yearsOfExperience.includes(searchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log(advocates);
    setFilteredAdvocates(advocates);
  };

  const toggleSpecialties = (advocateId) => {
    setExpandedSpecialties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(advocateId)) {
        newSet.delete(advocateId);
      } else {
        newSet.add(advocateId);
      }
      return newSet;
    });
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input style={{ border: "1px solid black" }} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate, index) => {
            const isExpanded = expandedSpecialties.has(advocate.id || index);
            const displaySpecialties = isExpanded 
              ? advocate.specialties 
              : advocate.specialties.slice(0, 3);
            
            return (
              <tr key={advocate.id || index}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {displaySpecialties.map((specialty, specialtyIndex) => (
                    <div key={specialtyIndex}>{specialty}</div>
                  ))}
                  {advocate.specialties.length > 3 && !isExpanded && (
                    <button 
                      onClick={() => toggleSpecialties(advocate.id || index)}
                      style={{ 
                        background: '#f3f4f6', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      +{advocate.specialties.length - 3} more
                    </button>
                  )}
                  {isExpanded && (
                    <button 
                      onClick={() => toggleSpecialties(advocate.id || index)}
                      style={{ 
                        background: '#f3f4f6', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Show less
                    </button>
                  )}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
