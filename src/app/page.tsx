import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, Users } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link className="flex items-center justify-center" href="#">
          <Users className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">SocialConnect</span>
        </Link>
        <nav className="flex gap-4">
          <Link href="/login"><Button variant={"secondary"}>Login</Button></Link>
          <Link href="/signup"><Button>Signup</Button></Link>
          <ModeToggle />
        </nav>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center items-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect with the world
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join SocialConnect and start sharing your moments with friends and family. Discover new connections and stay in touch with the people who matter most.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex justify-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Heart className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Like and React</h3>
                <p className="text-gray-500 dark:text-gray-400">Express yourself with a variety of reactions to posts and comments.</p>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Instant Messaging</h3>
                <p className="text-gray-500 dark:text-gray-400">Stay connected with friends through our real-time messaging system.</p>
              </div>
              <div className="flex flex-col items-center">
                <Share2 className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Easy Sharing</h3>
                <p className="text-gray-500 dark:text-gray-400">Share your favorite moments with just a few clicks.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 SocialConnect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
