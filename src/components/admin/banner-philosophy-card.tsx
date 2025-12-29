import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export function BannerPhilosophyCard() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
          <Info className="h-5 w-5" />
          📌 Banner Philosophy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">
            This carousel helps users discover entry paths into the catalog:
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Installation Components → Application</li>
            <li>Passenger Elevator Parts → Elevator Type</li>
            <li>Common Spare Parts → Collection</li>
            <li>Browse All Parts → Category</li>
          </ul>
        </div>
        <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md border border-blue-200">
          <strong>Note:</strong> For category/type/application/collection page banners, 
          edit them in their respective modules under <strong>Visual Identity</strong>.
        </div>
      </CardContent>
    </Card>
  )
}
