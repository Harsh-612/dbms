'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users } from "lucide-react"
import Post from "@/components/Post"

interface UserData {
  id: string
  username: string
  fullName: string
  avatarUrl: string
  bio: string
  followersCount: number
  followingCount: number
  isFollowing: boolean
  posts: {
    id: string
    content: string
    createdAt: string
    likeCount: number
    commentCount: number
    isLiked: boolean
  }[]
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [params.userId])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${params.userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      setError('Failed to load user profile. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/follow/${params.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to follow user')
      }
      setUserData(prevData => prevData ? { 
        ...prevData, 
        isFollowing: !prevData.isFollowing,
        followersCount: prevData.isFollowing ? prevData.followersCount - 1 : prevData.followersCount + 1
      } : null)
    } catch (err) {
      console.error('Error following user:', err)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to like post')
      }
      const data = await response.json()
      setUserData(prevData => {
        if (!prevData) return null
        return {
          ...prevData,
          posts: prevData.posts.map(post => 
            post.id === postId 
              ? { ...post, likeCount: data.likeCount, isLiked: !post.isLiked } 
              : post
          )
        }
      })
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !userData) {
    return <div>{error || 'User not found'}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center justify-between h-14 px-4 lg:px-6">
          <Link className="flex items-center justify-center" href="/feed">
            <Users className="h-6 w-6" />
            <span className="ml-2 text-2xl font-bold">SocialConnect</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/feed">
              <Button variant="ghost">Feed</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost">Notifications</Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-2xl mx-auto py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userData.avatarUrl || "/placeholder-user.jpg"} alt={`@${userData.username}`} />
                  <AvatarFallback>{userData.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{userData.fullName}</h1>
                  <p className="text-muted-foreground">@{userData.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{userData.bio}</p>
              <div className="flex space-x-4 mb-4">
                <span>{userData.followersCount} followers</span>
                <span>{userData.followingCount} following</span>
              </div>
              <Button onClick={handleFollow}>
                {userData.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </CardContent>
          </Card>
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Posts</h2>
            {userData.posts.map((post) => (
              <Post 
                key={post.id}
                id={post.id}
                content={post.content}
                createdAt={post.createdAt}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                user={userData}
                isLiked={post.isLiked}
                onLike={handleLike}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
