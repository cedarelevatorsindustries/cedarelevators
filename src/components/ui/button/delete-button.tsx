import { deleteLineItem } from "@/lib/data/cart"
import { LoaderCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-gray-600 hover:text-gray-900 cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
