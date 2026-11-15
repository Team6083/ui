"use client"

import { Avatar } from "@chakra-ui/react"

const PALETTES = ["blue", "teal", "purple", "orange", "pink", "cyan"] as const

/** The same name always gets the same color, in every app. */
export function avatarPaletteFor(name: string): (typeof PALETTES)[number] {
  const hash = [...name].reduce((h, char) => (h * 31 + (char.codePointAt(0) ?? 0)) >>> 0, 0)
  return PALETTES[hash % PALETTES.length]!
}

export interface MemberAvatarProps extends Omit<Avatar.RootProps, "children"> {
  name: string
  image?: string | null
}

/** A person's avatar: their picture, or their initials on a color picked from their name. */
export function MemberAvatar({ name, image, ...rest }: MemberAvatarProps) {
  return (
    <Avatar.Root colorPalette={avatarPaletteFor(name)} title={name} {...rest}>
      {image && <Avatar.Image src={image} alt="" />}
      <Avatar.Fallback name={name} />
    </Avatar.Root>
  )
}
