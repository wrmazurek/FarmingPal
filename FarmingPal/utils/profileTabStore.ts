let _pending: 'bookings' | 'equipment' | null = null;

export function setPendingProfileTab(tab: 'bookings' | 'equipment') {
  _pending = tab;
}

export function consumePendingProfileTab(): 'bookings' | 'equipment' | null {
  const t = _pending;
  _pending = null;
  return t;
}
