import React, { useState } from "react";
import type { UserProfile } from "../../types/contract";

interface UserSearchProps {
  onUserSelect: (user: UserProfile) => void;
  placeholder?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  placeholder = "Search users..."
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implement actual search logic
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchResults.map((user, index) => (
            <div
              key={`${user.username}-${index}`}
              onClick={() => onUserSelect(user)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">{user.bio}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;