// Placeholder for skill extraction logic
export function extractSkills(text: string): string[] {
  const skills = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Java',
    'PostgreSQL', 'MongoDB', 'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes'
  ];

  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of skills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}
