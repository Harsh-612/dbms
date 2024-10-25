import { useState } from 'react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react"
import UserHoverCard from "./userHoverCard"

interface PostProps {
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
  onLike: (postId: string) => Promise<void>
}

export default function Post({ id, content, createdAt, likeCount, commentCount, user, isLiked, onLike }: PostProps) {
  const [isLikedState, setIsLikedState] = useState(isLiked)
  const [likeCountState, setLikeCountState] = useState(likeCount)

  const handleLike = async () => {
    try {
      await onLike(id)
      setIsLikedState(!isLikedState)
      setLikeCountState(prevCount => isLikedState ? prevCount - 1 : prevCount + 1)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  // Fallback values for user properties
  const fallbackUsername = 'unknown'
  const fallbackFullName = 'Unknown User'
  const fallbackAvatarUrl = "/placeholder-user.jpg"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <UserHoverCard userId={user?.id || ''}>
            <Avatar>
              <AvatarImage src={user?.avatarUrl || fallbackAvatarUrl} alt={`@${user?.username || fallbackUsername}`} />
              <AvatarFallback>{(user?.fullName || fallbackFullName)[0]}</AvatarFallback>
            </Avatar>
          </UserHoverCard>
          <div className="space-y-1">
            <UserHoverCard userId={user?.id || ''}>
              <Link href={`/user/${user?.id || ''}`} className="font-semibold hover:underline">
                {user?.fullName || fallbackFullName}
              </Link>
            </UserHoverCard>
            <p className="text-sm text-muted-foreground">@{user?.username || fallbackUsername}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link href={`/post/${id}`}>
          <p>{content}</p>
        </Link>
      </CardContent>
      <CardFooter>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={`h-4 w-4 ${isLikedState ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="ml-2">{likeCountState}</span>
          </Button>
          <Link href={`/post/${id}`}>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-4 w-4" />
              <span className="ml-2">{commentCount}</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Repeat2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}