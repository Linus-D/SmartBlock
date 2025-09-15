// src/pages/Explore.tsx
import React, { useEffect, useState } from "react";
import type { User } from "../types/user";
import { useWeb3 } from "../context/Web3Context";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { UserCard } from "../components/social/UserCard";

const Explore: React.FC = () => {
  const { account } = useWeb3();
  const { getAllUsers } = useContract();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (account) fetchUsers();
  }, [account, getAllUsers]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      {users.map((user) => (
        <UserCard key={user.address} user={user} />
      ))}
    </div>
  );
};

export default Explore; // ✅ Default export
