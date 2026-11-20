export type ItemStatus = "requested" | "approved" | "ordered" | "received"

export interface Item {
  id: string
  name: string
  vendor: string
  quantity: number
  unitPrice: number
  requester: string
  status: ItemStatus
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  ordered: "Ordered",
  received: "Received",
}

export const STATUS_COLOR: Record<ItemStatus, string> = {
  requested: "gray",
  approved: "blue",
  ordered: "orange",
  received: "green",
}

export const ITEMS: Item[] = [
  { id: "1", name: "NEO Brushless Motor V1.1", vendor: "REV Robotics", quantity: 4, unitPrice: 1450, requester: "林怡君", status: "approved" },
  { id: "2", name: "SPARK MAX Motor Controller", vendor: "REV Robotics", quantity: 4, unitPrice: 2900, requester: "林怡君", status: "approved" },
  { id: "3", name: "Through Bore Encoder", vendor: "REV Robotics", quantity: 2, unitPrice: 1580, requester: "Jordan Lee", status: "requested" },
  { id: "4", name: "MAXSwerve Module Kit", vendor: "REV Robotics", quantity: 4, unitPrice: 8700, requester: "Alex Chen", status: "ordered" },
  { id: "5", name: "Falcon 500 Mounting Plate", vendor: "WCP", quantity: 6, unitPrice: 320, requester: "王小明", status: "requested" },
  { id: "6", name: "Hex Shaft 1/2\" × 36\"", vendor: "WCP", quantity: 10, unitPrice: 410, requester: "Sam Rivera", status: "received" },
  { id: "7", name: "Polycarbonate Sheet 1/8\"", vendor: "McMaster-Carr", quantity: 3, unitPrice: 1260, requester: "陳柏翰", status: "approved" },
  { id: "8", name: "Socket Head Screws #10-32 (100)", vendor: "McMaster-Carr", quantity: 5, unitPrice: 290, requester: "王小明", status: "received" },
  { id: "9", name: "Pneumatic Cylinder 3/4\" bore", vendor: "AndyMark", quantity: 2, unitPrice: 1890, requester: "Jordan Lee", status: "requested" },
]

const money = new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 })
export const formatMoney = (amount: number) => money.format(amount)
