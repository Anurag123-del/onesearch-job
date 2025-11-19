import { NormalizedJob } from '@/types';

const Badge = ({ text }: { text: string }) => (
  <span className="bg-gray-200 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
    {text}
  </span>
);

export default function JobCard({ job }: { job: NormalizedJob & { score?: number } }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow" data-testid="job-card">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-lg">{job.title}</h2>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-gray-500 text-sm">{job.locations?.join(', ')}</p>
        </div>
        <a
          href={job.apply_url || ''}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Apply
        </a>
      </div>
      <p className="mt-2 text-gray-700 line-clamp-3">{job.description_text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge text={job.source} />
        {job.remote && <Badge text="Remote" />}
        {job.experience_min && job.experience_max && (
          <Badge text={`${job.experience_min}-${job.experience_max} yrs`} />
        )}
      </div>
    </div>
  );
}
