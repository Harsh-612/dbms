'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"
import Post from "@/components/Post"
import { useAuth } from '@/components/AuthProvider'
import UserSearch from "@/components/UserSearch"
import { cn } from "@/lib/utils"
import { ModeToggle } from '@/components/ui/mode-toggle'

interface PostData {
  id: string
  content: string
  createdAt: string
  likeCount: number
  commentCount: number
  user: {
    id: string
    username: string
    fullName: string
    avatarUrl: string
  }
  isLiked: boolean
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/feed')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError('Failed to load posts. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPostContent }),
      })
      if (!response.ok) {
        throw new Error('Failed to create post')
      }
      const newPost = await response.json()
      setPosts([newPost, ...posts])
      setNewPostContent('')
    } catch (err) {
      setError('Failed to create post. Please try again.')
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
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likeCount: data.likeCount, isLiked: !post.isLiked } 
            : post
        )
      )
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <Link className="flex items-center justify-center" href="/feed">
            <Users className="h-6 w-6 text-primary" />
            <span className="ml-2 text-2xl font-bold text-primary">SocialConnect</span>
          </Link>
          <div className="flex-1 max-w-xl mx-8">
            <UserSearch />
          </div>
          <nav className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=40&width=40"} alt={`@${user?.username}`} />
              <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=48&width=48"} alt={`@${user?.username}`} />
                      <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{user?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <Card className="bg-card text-card-foreground">
              <form onSubmit={handleSubmitPost}>
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=40&width=40"} alt={`@${user?.username}`} />
                      <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <Input 
                      placeholder="What's happening?" 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className={cn(
                        "flex-1 min-h-24 resize-none",
                        "focus-visible:ring-1 focus-visible:ring-ring",
                        "bg-background text-foreground"
                      )}
                    />
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={!newPostContent.trim()}
                    variant="default"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Post
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <div className="space-y-4 mt-6">
              {posts.map((post) => (
                <Post 
                  key={post.id}
                  {...post}
                  onLike={handleLike}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}