import { getInitials, isValidAvatarDataUrl } from '../lib/imageUtils';

interface StudentAvatarProps {
  name: string;
  avatarDataUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StudentAvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const SHAPE_CLASSES: Record<NonNullable<StudentAvatarProps['shape']>, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
};

export function StudentAvatar({
  name,
  avatarDataUrl,
  size = 'md',
  shape = 'circle',
  className = '',
}: StudentAvatarProps) {
  const hasPhoto = isValidAvatarDataUrl(avatarDataUrl);

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-zinc-100 ${SIZE_CLASSES[size]} ${SHAPE_CLASSES[shape]} ${className}`}
    >
      {hasPhoto ? (
        <img
          src={avatarDataUrl}
          alt={name}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#881337] font-display font-bold tracking-tight text-white">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
