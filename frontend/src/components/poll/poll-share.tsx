"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, Check, Twitter, Facebook, Mail, Link2, QrCode } from "lucide-react"

interface PollShareProps {
  pollId: number
  pollTitle: string
  isOpen: boolean
  onClose: () => void
}

export function PollShare({ pollId, pollTitle, isOpen, onClose }: PollShareProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/poll/${pollId}`
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareOnTwitter = () => {
    const text = `Check out this poll: "${pollTitle}"`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    const subject = `Vote on this poll: ${pollTitle}`
    const body = `Hi!\\n\\nI'd love to get your opinion on this poll:\\n\\n"${pollTitle}"\\n\\nVote here: ${shareUrl}\\n\\nThanks!`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  const generateQRCode = () => {
    // For a real app, you'd use a QR code library like qrcode
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    window.open(qrUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Poll
          </DialogTitle>
          <DialogDescription>
            Share this poll with others to get more responses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Poll Info */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-1">Poll Title</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{pollTitle}</p>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-success">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={shareOnTwitter}
                className="flex items-center gap-2 justify-start"
              >
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={shareOnFacebook}
                className="flex items-center gap-2 justify-start"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex items-center gap-2 justify-start"
              >
                <Mail className="h-4 w-4 text-green-600" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={generateQRCode}
                className="flex items-center gap-2 justify-start"
              >
                <QrCode className="h-4 w-4 text-purple-600" />
                QR Code
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Embed Code
              <Badge variant="secondary" className="text-xs">Pro Feature</Badge>
            </label>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-xs text-muted-foreground">
                {`<iframe src="${shareUrl}?embed=true" width="100%" height="400" frameborder="0"></iframe>`}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Embed this poll directly in your website or blog
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 bg-info/10 rounded-lg border border-info/20">
            <h4 className="text-sm font-medium text-info mb-1">💡 Sharing Tips</h4>
            <ul className="text-xs text-info/80 space-y-1">
              <li>• Share in relevant groups or communities</li>
              <li>• Add context about why their opinion matters</li>
              <li>• Consider timing when your audience is most active</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
