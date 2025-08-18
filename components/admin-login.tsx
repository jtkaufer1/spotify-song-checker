"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function AdminLogin() {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Hardcoded credentials as requested
    if (username === "admin" && password === "admin123") {
      // Set authentication state in session storage
      sessionStorage.setItem("adminAuthenticated", "true")

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      })
      setOpen(false)
      setUsername("")
      setPassword("")
      router.push("/admin")
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Admin Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
          <DialogDescription>Enter your credentials to access the admin dashboard</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <LogIn className="h-4 w-4 mr-2" />
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground text-center mt-4">Demo credentials: admin / admin123</div>
      </DialogContent>
    </Dialog>
  )
}
