import { Status } from '@prisma/client'

export const getDefaultColumnTitle = (status: Status): string => {
  const titles = {
    READY_TO_DEVELOP: "Ready to Development",
    IN_DEVELOPMENT: "In Development",
    CODE_REVIEW: "Ready for Code Review",
    DONE: "Done"
  }
  return titles[status]
}

export const getDefaultColumns = () => {
  return Object.values(Status).map((status, index) => ({
    status,
    title: getDefaultColumnTitle(status),
    order: index
  }))
} 