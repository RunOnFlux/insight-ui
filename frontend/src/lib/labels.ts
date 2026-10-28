/** Well-known Flux addresses shown with a friendly label across the explorer. */
export const ADDRESS_LABELS: Record<string, string> = {
  t3c51GjrkUg7pUiS8bzNdTnW2hD25egWUih: 'Flux Foundation Nodes',
  t3ZQQsd8hJNw6UQKYLwfofdL3ntPmgkwofH: 'Flux Foundation Nodes',
  t3XjYMBvwxnXVv9jqg4CgokZ5f7BLCdVhvS: 'Flux Foundation Nodes',
  t3gCppaQdKhCViBA2mtYMphmJmtKY4BbR7d: 'Flux Foundation Nodes',
  t3ZccrRNem6oTcN8kcPmgCh1HopR6zxH1Mq: 'Flux Foundation Nodes',
  t1XWTigDqqBFp4kJGJgH8CpyriGrfV7DEjX: 'Flux Foundation Operational',
  t1eabPBaLE2iyoAM5ZAnAMSbg5dLqSyAX83: 'Flux Foundation Operational',
  t1gZgxSErZTMFG3UTNVKXcSjbNMMYtj6K7q: 'Flux Foundation Mining',
  t3PMbbA5YvHH9F8DSquocGf3aDDvgHzBjHR: 'Flux Listings Locked',
  t1abAp9oZ8SDDA1trwGarPPvKuzicin1JzP: 'Flux Swap Pool Hot',
  t1SHUuYiEdPMZzP41cbXBRWFGCJqcAcxSuy: 'Flux Swap Pool Hot',
  t1cjcLaDHkNcuF8QJUCJVrmDeCZBFH3ZfSt: 'Flux Swap Pool Cold',
  t1ZLpyVr69JLHqdgkG5v2FSisqiTMUFcxGT: 'Flux Swap Pool Cold',
  t3ThbWogDoAjGuS6DEnmN1GWJBRbVjSUK4T: 'Flux Swap Pool Locked',
  t3heoBJT9zGnPBtnbtSBqbNyBSBAHJUZQZ4: 'Flux Swap Pool Locked',
  t3KXyFLuvvdMFVWb65LNiXGFwidrqE2NP9U: 'Flux Swap Pool Locked',
  t1Yum7okNqNjrLRhE7QF7kyGkGP9WVfPX7n: 'Flux Coinbase Pool Hot',
  t1Zj9vUsA4691ykiBmVpm8N9dLEUE58WNSY: 'Flux Coinbase Pool Hot',
  t3c4EfxLoXXSRZCRnPRF3RpjPi9mBzF5yoJ: 'Flux Titan Nodes',
};

export function addressLabel(address: string): string | undefined {
  return ADDRESS_LABELS[address];
}
