import { Team } from '@/lib/types';

interface YearStyles {
  [key: string]: string;
}

export default function TeamCard({ team, yearStyles }: { team: Team, yearStyles: YearStyles }) {
  return (
    <div
      key={team.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      {/* Team Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {team.image && (
              <img
                src={team.image}
                alt={team.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-blue-600"
              style={{ display: team.image ? 'none' : 'flex' }}
            >
              {team.shortName ? team.shortName.substring(0, 3) : 'T'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.shortName}</p>
            </div>
          </div>

          {/* Info Icon */}
          <div className="text-right">
            <div className="text-2xl mb-1">🏏</div>
            <div className="text-xs text-gray-500">
              IPL Team
            </div>
          </div>
        </div>

        {/* Team Championships */}
        {team.championships && team.totalTitles > 0 ? (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="text-yellow-500 text-lg mr-2">🏆</div>
              <div className="text-sm font-medium text-gray-700">
                IPL Champion ({team.totalTitles} {team.totalTitles === 1 ? 'title' : 'titles'})
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Championship Years:</p>
              <p className="mt-1 text-gray-800">{team.championships}</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="text-gray-400 text-lg mr-2">🏏</div>
              <div className="text-sm font-medium text-gray-600">
                IPL Team
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>No IPL championships yet</p>
            </div>
          </div>
        )}

      </div>

      {/* Action Button */}
      <div className="p-4 bg-gray-50">
        <a
          href={team.link || 'https://www.iplt20.com/teams'}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full ${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white py-2 px-4 rounded-lg font-medium transition duration-300 text-center block`}
        >
          View Team Details →
        </a>
      </div>
    </div>
  );
}
