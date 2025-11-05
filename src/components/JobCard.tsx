import { JobItem } from '@/types';

export default function JobCard({ job }: { job: JobItem }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-gray-500 text-sm">{job.location}</p>
        </div>
        <a
          href={job.url || ''}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Apply
        </a>
      </div>
      <p className="mt-2 text-gray-700 line-clamp-2">{job.description}</p>
      <div className="mt-2">
        <span className="bg-gray-200 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
          {job.source}
        </span>
      </div>
    </div>
  );
}
