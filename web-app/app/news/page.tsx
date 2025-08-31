'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import { useYear } from '@/contexts/YearContext';
import { getYearStyles } from '@/utils/gradients';

// Client-side data fetching for news
async function getNews(limit: number = 20) {
  try {
    const response = await fetch(`/api/news?limit=${limit}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('⚠️ Could not fetch news, using fallback');
    return {
      articles: [
        {
          id: 1,
          title: 'IPL 2025: Tournament in Full Swing',
          summary: 'The IPL 2025 season continues with exciting matches, outstanding performances, and thrilling encounters between the best cricket teams.',
          link: 'https://www.iplt20.com/news',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Tournament',
          extracted: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Player Performances: Stars Shine Bright',
          summary: 'Amazing individual performances continue to define the IPL 2025 season with batsmen and bowlers showcasing exceptional skills.',
          link: 'https://www.iplt20.com/news',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Players',
          extracted: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Team Updates: Squad Changes and Strategies',
          summary: 'Teams continue to make strategic decisions with squad rotations and tactical changes as the tournament progresses.',
          link: 'https://www.iplt20.com/news',
          image: '',
          publishedDate: new Date().toISOString().split('T')[0],
          category: 'Teams',
          extracted: new Date().toISOString()
        }
      ],
      totalArticles: 3,
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    };
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Recently';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    'News': 'bg-blue-100 text-blue-800',
    'Tournament Update': 'bg-green-100 text-green-800',
    'Tournament': 'bg-green-100 text-green-800',
    'Players': 'bg-purple-100 text-purple-800',
    'Teams': 'bg-orange-100 text-orange-800',
    'Standings': 'bg-yellow-100 text-yellow-800',
    'Fixtures': 'bg-indigo-100 text-indigo-800',
    'Live Updates': 'bg-red-100 text-red-800',
    'General': 'bg-gray-100 text-gray-800'
  };
  
  return categoryColors[category] || 'bg-gray-100 text-gray-800';
}

export default function NewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { selectedYear } = useYear();

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadData = async () => {
        setLoading(true);
        const newsData = await getNews(20);
        setData(newsData);
        setLoading(false);
      };
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const yearStyles = getYearStyles(selectedYear);
  
  // Filter articles by category
  const filteredArticles = data?.articles?.filter((article: any) => 
    selectedCategory === 'All' || article.category === selectedCategory
  ) || [];

  // Get unique categories
  const categories = data?.articles ? 
    ['All', ...Array.from(new Set(data.articles.map((article: any) => article.category)))] : 
    ['All'];
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${yearStyles.gradient}`}>
      <TopNav />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📰 IPL News & Updates
            </h1>
            <p className="text-lg text-gray-600">
              Latest news, match reports, and updates from the IPL
            </p>
            
            {data?.lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </header>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? `${yearStyles.primaryBg} text-white`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* News Articles */}
          <div className="space-y-6">
            {loading || !data ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${yearStyles.spinnerBorder} mx-auto`}></div>
                  <p className="mt-4 text-gray-600">Loading latest news...</p>
                </div>
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article: any) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {article.image && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      {article.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.summary}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedDate)}
                        </span>
                        
                        {article.link && (
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs font-medium ${yearStyles.primaryText} hover:underline`}
                          >
                            Read more →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  {selectedCategory !== 'All' 
                    ? `No articles found in the "${selectedCategory}" category.`
                    : 'No news articles available at the moment.'
                  }
                </p>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`mt-4 ${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-4 py-2 rounded-lg font-medium transition duration-300`}
                  >
                    View All Articles
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Statistics */}
          {data && (
            <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{data.totalArticles}</div>
                  <div className="text-sm text-gray-600">Total Articles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{categories.length - 1}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{filteredArticles.length}</div>
                  <div className="text-sm text-gray-600">Filtered Results</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/news"
              className={`${yearStyles.secondaryBg} ${yearStyles.secondaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              📊 View Raw API Data
            </a>
            <button
              onClick={() => window.location.reload()}
              className={`${yearStyles.primaryBg} ${yearStyles.primaryBgHover} text-white px-6 py-3 rounded-lg font-medium transition duration-300 text-center`}
            >
              🔄 Refresh News
            </button>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500">
              News content sourced from IPL official website
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}