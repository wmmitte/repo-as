interface SkillPillProps {
  name: string;
  isFavorite?: boolean;
}

export default function SkillPill({ name, isFavorite = false }: SkillPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${
        isFavorite
          ? 'bg-gradient-to-r from-warning to-orange-600 text-gray-900'
          : 'bg-primary text-white'
      }`}
    >
      {name}
      {isFavorite && <span className="text-xs">⭐</span>}
    </span>
  );
}
