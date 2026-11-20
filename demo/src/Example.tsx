import { Box, Button, Code, Collapsible, Heading, Stack, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"
import { LuCode } from "react-icons/lu"

export interface ExampleProps {
  title: ReactNode
  description?: ReactNode
  /** The usage to show under "Code"; keep it to what an app would write. */
  code?: string
  children: ReactNode
}

/** One component on show: what it is for, the live thing, and the code behind it. */
export function Example({ title, description, code, children }: ExampleProps) {
  return (
    <Stack as="section" gap="3" mb="10">
      <Stack gap="1">
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        {description && <Text color="fg.muted">{description}</Text>}
      </Stack>
      <Box borderWidth="1px" rounded="l3" p={{ base: "3", md: "5" }} bg="bg">
        {children}
      </Box>
      {code && (
        <Collapsible.Root>
          <Collapsible.Trigger asChild>
            <Button size="xs" variant="ghost" alignSelf="flex-start">
              <LuCode />
              Code
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Code as="pre" display="block" whiteSpace="pre" overflowX="auto" p="4" rounded="l2" textStyle="sm" mt="2">
              {code.trim()}
            </Code>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Stack>
  )
}
