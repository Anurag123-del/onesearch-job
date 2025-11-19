'use client';

import { useState, useEffect } from 'react';

type Filters = {
  title: string;
  skills: string[];
  locations: string[];
};

type JobsFiltersProps = {
  onFilterChange: (filters: Filters) => void;
};

export default function JobsFilters({ onFilterChange }: JobsFiltersProps) {
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [locations, setLocations] = useState('');

  useEffect(() => {
    const filters = {
      title,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      locations: locations.split(',').map(l => l.trim()).filter(Boolean),
    };
    onFilterChange(filters);
  }, [title, skills, locations, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4">
        <h2 className="text-xl font-semibold">Filter Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="title-filter" className="block text-sm font-medium text-gray-700">
                    Job Title
                </label>
                <input
                    id="title-filter"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label htmlFor="skills-filter" className="block text-sm font-medium text-gray-700">
                    Skills (comma-separated)
                </label>
                <input
                    id="skills-filter"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., React, Node.js"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <label htmlFor="locations-filter" className="block text-sm font-medium text-gray-700">
                    Locations (comma-separated)
                </label>
                <input
                    id="locations-filter"
                    type="text"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    placeholder="e.g., San Francisco, Remote"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </div>
        </div>
    </div>
  );
}
