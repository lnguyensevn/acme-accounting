export class AccountingUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountingUserError';
  }
}

export class AccountingTicketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountingTicketError';
  }
}

export class AccountingReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountingReportError';
  }
}
