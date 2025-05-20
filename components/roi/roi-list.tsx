"use client"

import { useState } from "react"
import type { RoiData } from "@/types/roi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Eye, EyeOff, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoiListProps {
  roiList: RoiData[]
  selectedRoi: RoiData | null
  onSelect: (roi: RoiData) => void
  onDelete: (roiId: string) => void
}

export default function RoiList({ roiList, selectedRoi, onSelect, onDelete }: RoiListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roiToDelete, setRoiToDelete] = useState<string | null>(null)

  // Filter ROIs based on search query
  const filteredRois = roiList.filter(
    (roi) =>
      roi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roi.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Toggle ROI enabled state
  const toggleRoiEnabled = (roi: RoiData) => {
    onSelect({
      ...roi,
      enabled: !roi.enabled,
    })
  }

  // Confirm ROI deletion
  const confirmDelete = (roiId: string) => {
    setRoiToDelete(roiId)
    setDeleteDialogOpen(true)
  }

  // Handle ROI deletion
  const handleDelete = () => {
    if (roiToDelete) {
      onDelete(roiToDelete)
      setRoiToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="관심영역 검색..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredRois.length > 0 ? (
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {filteredRois.map((roi) => (
              <div key={roi.id} className="group">
                <div
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedRoi?.id === roi.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelect(roi)}
                >
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: roi.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium truncate">{roi.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {roi.type === "rectangle" ? "사각형" : "다각형"}
                      </span>
                    </div>
                    {roi.description && <p className="text-xs text-muted-foreground truncate">{roi.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRoiEnabled(roi)
                      }}
                    >
                      {roi.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(roi.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator className="my-1" />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">관심영역이 없습니다.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery ? "검색 결과가 없습니다." : "새 관심영역을 추가하세요."}
          </p>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>관심영역 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 관심영역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
