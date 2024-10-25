'use client'

import React from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface UserHoverCardProps {
  children: React.ReactNode
  username: string
  fullName: string
}

export default function UserHoverCard({ children, username, fullName }: UserHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>{fullName[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{fullName}</h4>
            <p className="text-sm text-muted-foreground">@{username}</p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground mr-2">1.2K followers</span>
              <span className="text-xs text-muted-foreground">Following 420</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button className="w-full">Follow</Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}