import React from 'react';

interface DebugPostDataProps {
  post: any;
}

const DebugPostData: React.FC<DebugPostDataProps> = ({ post }) => {
  return (
    <div className="bg-yellow-100 p-4 rounded-md border border-yellow-300">
      <h3 className="font-bold text-yellow-800 mb-2">Debug Post Data:</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(post, null, 2)}
      </pre>
    </div>
  );
};

export default DebugPostData; 