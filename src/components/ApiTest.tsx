import React, { useEffect, useState } from 'react';

const ApiTest: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://stories-be.onrender.com/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        console.log('API Response:', data);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Test - Posts Data</h2>
      {posts.map((post, index) => (
        <div key={post._id || index} className="border p-4 mb-4 rounded">
          <h3 className="font-bold">Post {index + 1}</h3>
          <p><strong>Title:</strong> {post.title}</p>
          <p><strong>Description:</strong> {post.description}</p>
          <p><strong>Images:</strong> {post.images ? post.images.length : 0} images</p>
          {post.images && post.images.length > 0 && (
            <div className="mt-2">
              <p><strong>First Image URL:</strong> {post.images[0].url}</p>
              <img 
                src={post.images[0].url} 
                alt="Test" 
                className="w-32 h-32 object-cover border"
                onError={(e) => {
                  console.error('Image failed to load:', post.images[0].url);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', post.images[0].url);
                }}
              />
            </div>
          )}
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(post, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default ApiTest; 