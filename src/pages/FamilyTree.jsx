"use client"

const orgData = {
  id: 1,
  name: "John Smith",
  role: "CEO",
  imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
  children: [
    {
      id: 2,
      name: "Sarah Johnson",
      role: "VP Marketing",
      imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
      children: [
        {
          id: 5,
          name: "Michael Brown",
          role: "Marketing Manager",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [],
        },
        {
          id: 6,
          name: "Emily Davis",
          role: "Content Director",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [],
        },
        {
          id: 7,
          name: "David Wilson",
          role: "Brand Strategist",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [],
        },
      ],
    },
    {
      id: 3,
      name: "James Williams",
      role: "VP Engineering",
      imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
      children: [
        {
          id: 8,
          name: "Lisa Anderson",
          role: "Tech Lead",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [
            {
              id: 11,
              name: "Robert Taylor",
              role: "Senior Developer",
              imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
              children: [],
            },
            {
              id: 12,
              name: "Jennifer Martin",
              role: "UX Designer",
              imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Patricia Moore",
      role: "VP Sales",
      imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
      children: [
        {
          id: 9,
          name: "Richard Clark",
          role: "Sales Manager",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [],
        },
        {
          id: 10,
          name: "Michelle Lee",
          role: "Account Executive",
          imageUrl: "https://v0.dev/placeholder.svg?height=60&width=60",
          children: [],
        },
      ],
    },
  ],
}

const OrgNode = ({ node, isRoot = false }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <div
          className={`flex flex-col items-center rounded-lg bg-white p-3 shadow-md ${isRoot ? "border-2 border-blue-500" : ""}`}
        >
          <img
            src={node.imageUrl || "/placeholder.svg"}
            alt={node.name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{node.name}</h3>
          <p className="text-xs text-gray-500">{node.role}</p>
        </div>

        {node.children?.length > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="relative">
              <div className="absolute left-1/2 h-6 w-px -translate-x-1/2 bg-gray-300"></div>
              <div className="flex items-start justify-center gap-4 pt-6">
                {node.children.map((child, index) => (
                  <div key={child.id} className="relative">
                    {index > 0 && <div className="absolute left-0 right-0 top-0 h-px -translate-y-6 bg-gray-300"></div>}
                    <OrgNode node={child} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function FamilyTree() {
  return (
    <div className="min-h-screen mt-10 overflow-x-auto bg-gray-50 p-4">
      <div className="mx-auto max-w-full py-8">
        <div className="flex justify-center">
          <OrgNode node={orgData} isRoot={true} />
        </div>
      </div>
    </div>
  )
}

