"use client"

import { FileText, Download, Image as ImageIcon } from "lucide-react"

interface Resource {
  type: "brochure" | "cad" | "ga-drawing" | "manual" | "certificate"
  title: string
  fileSize: string
  downloadUrl: string
}

interface ResourcesSectionProps {
  resources: Resource[]
}

export default function ResourcesSection({ resources }: ResourcesSectionProps) {
  if (resources.length === 0) return null

  const getIcon = (type: Resource["type"]) => {
    switch (type) {
      case "brochure":
        return FileText
      case "cad":
        return ImageIcon
      case "ga-drawing":
        return ImageIcon
      default:
        return FileText
    }
  }

  const getLabel = (type: Resource["type"]) => {
    switch (type) {
      case "brochure":
        return "Product Brochure"
      case "cad":
        return "CAD Drawing"
      case "ga-drawing":
        return "GA Drawing"
      case "manual":
        return "Installation Manual"
      case "certificate":
        return "Certificate"
      default:
        return "Document"
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Downloads & Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => {
          const Icon = getIcon(resource.type)
          
          return (
            <a
              key={index}
              href={resource.downloadUrl}
              download
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {getLabel(resource.type)} • {resource.fileSize}
                </p>
              </div>
              
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
