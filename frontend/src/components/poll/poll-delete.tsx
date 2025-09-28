/**
 * Poll Delete Component
 * 
 * Confirmation dialog for poll deletion with safety checks.
 * Features:
 * - Confirmation dialog with poll details
 * - Type-to-confirm safety mechanism
 * - Loading states during deletion
 * - Error handling with user feedback
 * - Integration with dashboard polling
 */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  AlertCircle,
  X
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface Poll {
  id: number
  title: string
  total_votes: number
  created_at: string
}

interface PollDeleteProps {
  isOpen: boolean
  onClose: () => void
  poll: Poll
  onDeleteSuccess: () => void
}

export function PollDelete({ isOpen, onClose, poll, onDeleteSuccess }: PollDeleteProps) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expectedText = "DELETE"
  const canDelete = confirmText.trim().toUpperCase() === expectedText

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("")
      setError(null)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!canDelete || isDeleting) return

    try {
      setIsDeleting(true)
      setError(null)

      const response = await apiClient.deletePoll(poll.id)
      
      if (response.error) {
        setError(response.error)
        toast.error("Failed to delete poll", {
          description: response.error
        })
        return
      }

      toast.success("Poll deleted successfully! 🗑️", {
        description: `"${poll.title}" has been permanently deleted.`
      })

      onDeleteSuccess()
      handleClose()
      
    } catch (error) {
      console.error('Failed to delete poll:', error)
      const errorMessage = "Failed to delete poll. Please try again."
      setError(errorMessage)
      toast.error("Delete failed", {
        description: errorMessage
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canDelete && !isDeleting) {
      handleDelete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Poll
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the poll and all associated votes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Poll Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Poll to delete:</h4>
            <p className="font-semibold">{poll.title}</p>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{poll.total_votes} votes</span>
              <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Type <code className="bg-muted px-1 py-0.5 rounded text-red-600 font-mono">{expectedText}</code> to confirm deletion:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Type "${expectedText}" here`}
              className={confirmText && !canDelete ? "border-red-500" : ""}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmText && !canDelete && (
              <p className="text-sm text-red-500 mt-1">
                Please type "{expectedText}" exactly to confirm
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start space-x-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Warning:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• All votes and poll data will be permanently deleted</li>
                <li>• Poll links will no longer work</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Poll
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
