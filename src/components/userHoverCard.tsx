'use client'

import React, { useState, useEffect } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface UserHoverCardProps {
  userId: string
  children: React.ReactNode
}

interface UserData {
  id: string
  username: string
  fullName: string
  avatarUrl: string
  bio: string
  followersCount: number
  isFollowing: boolean
}

export default function UserHoverCard({ userId, children }: UserHoverCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/hover`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followedId: userId }),
      })
      if (!response.ok) {
        throw new Error('Failed to follow user')
      }
      setUserData(prevData => prevData ? { ...prevData, isFollowing: !prevData.isFollowing } : null)
    } catch (err) {
      console.error('Error following user:', err)
    }
  }

  return (
    
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        {userData && (
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src={userData.avatarUrl || "/placeholder-user.jpg"} />
              <AvatarFallback>{userData.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{userData.fullName}</h4>
              <p className="text-sm">@{userData.username}</p>
              <p className="text-sm text-muted-foreground">{userData.bio}</p>
              <div className="flex items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  {userData.followersCount} followers
                </span>
              </div>
            </div>
          </div>
        )}
        {userData && (
          <div className="flex items-center justify-between pt-4">
            <Link href={`/user/${userData.id}`}>
              <Button variant="outline">View Profile</Button>
            </Link>
            <Button onClick={handleFollow}>
              {userData.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}