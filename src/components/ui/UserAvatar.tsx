import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/ui/ui.helpers';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, stringToColor } from '@/lib/ui/ui.helpers';

interface UserAvatarProps {
  name?: string;
  email?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

/**
 * UserAvatar - Avatar de usuário com iniciais e cores consistentes
 */
export function UserAvatar({ name, email, src, size = 'md', className }: UserAvatarProps) {
  const displayName = name || email || 'U';
  const initials = getInitials(displayName);
  const colorClass = stringToColor(displayName);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src ? (
        <Image src={src} alt={displayName} fill className="object-cover" />
      ) : (
        <AvatarFallback className={cn(colorClass, 'text-white font-semibold')}>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
