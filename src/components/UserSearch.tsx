import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  full_name: string;
}

export default function UserSearch() {
  const [results, setResults] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      const debounce = setTimeout(() => {
        fetch(`/api/users/search?username=${query}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data.users || []);
            setIsSearching(false);
          })
          .catch((err) => {
            console.error(err);
            setIsSearching(false);
          });
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-8 w-[200px] sm:w-[300px]"
        />
        {isSearching && (
          <div className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          <ul className="py-1">
            {results.map((user) => (
              <li key={user.id} className="px-4 py-2 hover:bg-accent cursor-pointer">
                <Link href={"/user/"+user.id}><span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground ml-2">({user.full_name})</span></Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}