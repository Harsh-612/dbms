'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"
import UserHoverCard from "@/components/userHoverCard"
import Post from "@/components/Post"
import { useAuth } from "@/components/AuthProvider"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    fullName: string
    avatarUrl: string
  }
}

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
  comments: Comment[]
}

export default function PostPage({ params }: { params: { postId: string } }) {
  const [post, setPost] = useState<PostData | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchPost()
  }, [params.postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.postId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }
      const data = await response.json()
      setPost(data)
    } catch (err) {
      setError('Failed to load post. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!post) return
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to like post')
      }
      const data = await response.json()
      setPost(prevPost => 
        prevPost ? { ...prevPost, likeCount: data.likeCount, isLiked: !prevPost.isLiked } : null
      )
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })
      if (!response.ok) {
        throw new Error('Failed to create comment')
      }
      const newCommentData = await response.json()
      setPost(prevPost => {
        if (!prevPost) return null
        return {
          ...prevPost,
          comments: [newCommentData, ...prevPost.comments],
          commentCount: prevPost.commentCount + 1
        }
      })
      setNewComment('')
    } catch (err) {
      console.error('Error creating comment:', err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !post) {
    return <div>{error || 'Post not found'}</div>
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
            <Avatar>
              <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={`@${user?.username}`} />
              <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-2xl mx-auto py-8">
          <Post {...post} onLike={handleLike} />
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Comments</h2>
            <Card>
              <form onSubmit={handleSubmitComment} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={`@${user?.username}`} />
                      <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <Input 
                      placeholder="Write a comment..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1" 
                    />
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button type="submit" disabled={!newComment.trim()}>Post Comment</Button>
                </CardFooter>
              </form>
            </Card>
            {post.comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <UserHoverCard userId={comment.user.id}>
                      <Avatar>
                        <AvatarImage src={comment.user.avatarUrl || "/placeholder-user.jpg"} alt={`@${comment.user.username}`} />
                        <AvatarFallback>{comment.user.fullName?.split("")[0]}</AvatarFallback>
                      </Avatar>
                    </UserHoverCard>
                    <div className="space-y-1">
                      <UserHoverCard userId={comment.user.id}>
                        <Link href={`/user/${comment.user.id}`} className="font-semibold hover:underline">
                          {comment.user.fullName}
                        </Link>
                      </UserHoverCard>
                      <p className="text-sm text-muted-foreground">@{comment.user.username}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
