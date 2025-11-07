export function isGuestMode(): boolean {
  return process.env.NEXT_PUBLIC_GUEST_MODE === 'true';
}
